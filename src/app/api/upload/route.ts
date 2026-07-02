import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".gif"];
const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

function hmac(key: string | Buffer, string: string): Buffer {
  return crypto.createHmac("sha256", key).update(string).digest();
}

async function uploadToR2(fileBuffer: Buffer, filename: string, contentType: string): Promise<string> {
  const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;
  const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName || !publicUrl) {
    throw new Error("Missing Cloudflare R2 configuration environment variables");
  }

  const region = "us-east-1";
  const hashedPayload = crypto.createHash("sha256").update(fileBuffer).digest("hex");
  
  const amzDate = new Date().toISOString().replace(/[:-]/g, "").split(".")[0] + "Z";
  const dateScope = amzDate.substring(0, 8);
  const host = `${accountId}.r2.cloudflarestorage.com`;
  
  const canonicalUri = `/${bucketName}/${filename}`;
  const canonicalQueryString = "";
  
  const canonicalHeaders = `content-type:${contentType}\nhost:${host}\nx-amz-content-sha256:${hashedPayload}\nx-amz-date:${amzDate}\n`;
  const signedHeaders = "content-type;host;x-amz-content-sha256;x-amz-date";
  
  const canonicalRequest = `PUT\n${canonicalUri}\n${canonicalQueryString}\n${canonicalHeaders}\n${signedHeaders}\n${hashedPayload}`;
  const canonicalRequestHash = crypto.createHash("sha256").update(canonicalRequest).digest("hex");
  
  const credentialScope = `${dateScope}/${region}/s3/aws4_request`;
  const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${canonicalRequestHash}`;
  
  const kDate = hmac("AWS4" + secretAccessKey, dateScope);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, "s3");
  const kSigning = hmac(kService, "aws4_request");
  
  const signature = crypto.createHmac("sha256", kSigning).update(stringToSign).digest("hex");
  const authorization = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const url = `https://${host}/${bucketName}/${filename}`;
  
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "host": host,
      "content-type": contentType,
      "x-amz-content-sha256": hashedPayload,
      "x-amz-date": amzDate,
      "authorization": authorization,
    },
    body: new Uint8Array(fileBuffer),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`R2 upload failed: ${res.statusText}. Details: ${errorText}`);
  }

  const baseUrl = publicUrl.replace(/\/$/, "");
  return `${baseUrl}/${filename}`;
}

async function uploadToCloudinary(fileBuffer: Buffer, ext: string): Promise<string> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Missing Cloudinary configuration env variables");
  }

  const timestamp = Math.round(new Date().getTime() / 1000);
  const paramsToSign = `timestamp=${timestamp}`;
  const signature = crypto
    .createHash("sha1")
    .update(paramsToSign + apiSecret)
    .digest("hex");

  const formData = new FormData();
  const fileBlob = new Blob([new Uint8Array(fileBuffer)]);
  formData.append("file", fileBlob, `upload${ext}`);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp.toString());
  formData.append("signature", signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (data.error) {
    throw new Error(data.error.message);
  }
  return data.secure_url;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json({ error: "Only image files (.png, .jpg, .jpeg, .webp, .gif) are allowed" }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Only images are allowed" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Generate unique name
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const filename = `${timestamp}-${randomStr}${ext}`;

    // 1. Check if Cloudflare R2 is configured
    const isR2Configured =
      !!process.env.CLOUDFLARE_R2_ACCOUNT_ID &&
      !!process.env.CLOUDFLARE_R2_ACCESS_KEY_ID &&
      !!process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY &&
      !!process.env.CLOUDFLARE_R2_BUCKET_NAME &&
      !!process.env.CLOUDFLARE_R2_PUBLIC_URL;

    if (isR2Configured) {
      const r2Url = await uploadToR2(buffer, filename, file.type);
      return NextResponse.json({ success: true, url: r2Url });
    }

    // 2. Check if Cloudinary is configured
    const isCloudinaryConfigured = 
      !!process.env.CLOUDINARY_CLOUD_NAME && 
      !!process.env.CLOUDINARY_API_KEY && 
      !!process.env.CLOUDINARY_API_SECRET;

    if (isCloudinaryConfigured) {
      const cloudUrl = await uploadToCloudinary(buffer, ext);
      return NextResponse.json({ success: true, url: cloudUrl });
    }

    // 3. Fallback: Local disk storage
    const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);

    const fileUrl = `/uploads/products/${filename}`;
    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error: any) {
    console.error("Upload handler error:", error);
    return NextResponse.json({ error: "Upload failed: " + error.message }, { status: 500 });
  }
}
