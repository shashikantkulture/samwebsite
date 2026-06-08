import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "sam_ren_jwt_secret_key_2026";

// Hash password using bcryptjs
export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

// Compare password with hash using bcryptjs
export function comparePassword(password: string, hash: string): boolean {
  try {
    return bcrypt.compareSync(password, hash);
  } catch (e) {
    return false;
  }
}

// Generate signed JWT token
export function generateSessionToken(payload: { email: string; name: string; role: string; id?: string }): string {
  return jwt.sign(
    {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    },
    SECRET,
    { expiresIn: "30d" }
  );
}

// Verify JWT token and return payload
export function verifySessionToken(token: string): { email: string; name: string; role: string; id?: string } | null {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, SECRET) as any;
    return {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
    };
  } catch (e) {
    return null;
  }
}
