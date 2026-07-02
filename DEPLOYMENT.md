# Deploying Next.js to Hostinger Node.js Hosting

This guide details how to deploy your Next.js store to Hostinger's Node.js hosting plan, handle databases/file storage securely without 3rd-party dependencies, and avoid data loss during code updates.

---

## 1. Important Directory & Database Persistence

Since we are keeping data local to your Hostinger plan (zero 3rd-party services), the app stores data in:
1. **Database**: `db.json` (in the project root directory).
2. **Uploaded Media**: `public/uploads/` (directory for uploaded product/banner images).

> [!CAUTION]
> **PREVENTING DATA LOSS ON RE-DEPLOYMENT**
> When you pull new git commits or upload zip files to update your website, **DO NOT OVERWRITE OR DELETE** the `db.json` file and the `public/uploads/` folder on the server.
> - **If using FTP (e.g. FileZilla)**: Add `db.json` and `public/uploads/` to your FTP client's transfer ignore filter.
> - **If using Git/SSH**: Ensure `db.json` and `public/uploads/` are added to your local `.gitignore` so they are not overwritten, or back them up before performing a hard reset/pull.

---

## 2. Hostinger HPanel Configuration

Log in to your Hostinger account and navigate to **Websites > Manage > Node.js Dashboard**:

1. **Create Node.js Application**:
   - **Node.js Version**: Select **Node.js 18** or **Node.js 20** (recommended).
   - **Application Directory**: Set this to your project root folder (e.g. `public_html` or a custom subfolder).
   - **Application Domain**: Select your website domain.
   - **Application URL**: Select the subpath or root (e.g. `/` or `yourdomain.com`).
   - **Entry File**: Set this to **`server.js`** (This file bootstraps Next.js in production).
   - **Environment Variables**: Add these key-values:
     - `NODE_ENV` = `production`
     - `SESSION_SECRET` = `choose_a_long_random_alphanumeric_string_for_security`
     - `DATABASE_URL` = `mysql://your_db_user:your_db_password@localhost:3306/your_db_name` (For MySQL Database)
     - `CLOUDINARY_CLOUD_NAME` = `your_cloudinary_cloud_name` (Optional Cloudinary option)
     - `CLOUDINARY_API_KEY` = `your_cloudinary_api_key`
     - `CLOUDINARY_API_SECRET` = `your_cloudinary_api_secret`
     - `CLOUDFLARE_R2_ACCOUNT_ID` = `your_cloudflare_r2_account_id` (For Cloudflare R2 Image Uploads)
     - `CLOUDFLARE_R2_ACCESS_KEY_ID` = `your_cloudflare_r2_access_key_id`
     - `CLOUDFLARE_R2_SECRET_ACCESS_KEY` = `your_cloudflare_r2_secret_access_key`
     - `CLOUDFLARE_R2_BUCKET_NAME` = `your_cloudflare_r2_bucket_name`
     - `CLOUDFLARE_R2_PUBLIC_URL` = `https://your_r2_public_url.r2.dev` (Or your custom domain pointing to R2)

2. **Upload Your Code**:
   - Zip your project files **excluding** `node_modules` and `.next`.
   - Upload the zip to the Application Directory via Hostinger's File Manager and extract it.

3. **Install Dependencies & Build**:
   - Go to your Hostinger Node.js Dashboard.
   - Click **NPM Install** to install packages on the server.
   - Click **Run Script** or use SSH to build the production package:
     ```bash
     npm run build
     ```
     *(Alternative: Run `npm run build` locally on your computer, then upload the generated `.next/` directory directly to Hostinger. This is highly recommended if your Hostinger plan encounters memory limits during builds).*

4. **Start the Server**:
   - In the Node.js dashboard, click **Start** or **Restart** to spawn the node application.
   - The dashboard runs the application via PM2 using your `server.js` file and links it to port 80/443 automatically.

---

## 3. Secure Default Credentials

On first boot, the database is auto-seeded with two secure test accounts. You can sign in using these on the `/account` page:

* **Administrator Account**:
  - **Email**: `admin@sam.com`
  - **Password**: `admin123`
  - *Provides access to the `/admin` CMS dashboard to upload images, change products, and update homepage layouts.*

* **Customer Account**:
  - **Email**: `customer@sam.com`
  - **Password**: `customer123`
  - *Provides access to orders tracking and loyalty points.*

* **Custom Accounts**:
  - Users can create new custom accounts using the **Sign Up** toggle on the `/account` screen.
