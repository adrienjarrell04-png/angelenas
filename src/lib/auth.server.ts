import { getRequest, setResponseHeader } from "@tanstack/react-start/server";
import { query } from "./db";

export async function getUser() {
  const req = getRequest();
  if (!req) return null;
  
  const cookie = req.headers.get("Cookie");
  if (!cookie) return null;
  
  const match = cookie.match(/session=([^;]+)/);
  if (!match) return null;
  
  const userId = match[1];
  const users = await query<any>(`SELECT id, email, full_name, is_verified, bio, zip_code FROM users WHERE id = '${userId}'`);
  return users[0] || null;
}

export async function login(email: string, password: string) {
  const users = await query<any>(`SELECT * FROM users WHERE email = '${email.replace(/'/g, "''")}'`);
  if (users.length === 0) {
    throw new Error("Invalid email or password");
  }

  const user = users[0];
  const isMatch = await Bun.password.verify(password, user.password_hash);
  
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  // Set session cookie
  setResponseHeader("Set-Cookie", `session=${user.id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000`);

  return { success: true, user: { id: user.id, fullName: user.full_name } };
}

export function logout() {
  setResponseHeader("Set-Cookie", "session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0");
}
