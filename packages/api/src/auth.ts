import { createMiddleware } from "hono/factory";
import { jwtVerify, SignJWT } from "jose";
import type { Context } from "hono";
import type { Role } from "@call-pat/shared";

const alg = "HS256";

function getSecret(): Uint8Array {
  const s = process.env.DEMO_JWT_SECRET ?? "dev-only-change-me-call-pat-prototype";
  return new TextEncoder().encode(s);
}

export type AuthUser = {
  sub: string;
  role: Role;
  displayName: string;
};

export async function signToken(user: {
  id: string;
  role: Role;
  displayName: string;
}): Promise<string> {
  return new SignJWT({ role: user.role, displayName: user.displayName })
    .setProtectedHeader({ alg })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: [alg],
    });
    const sub = payload.sub;
    const role = payload.role as Role | undefined;
    const displayName = payload.displayName as string | undefined;
    if (!sub || !role || !displayName) return null;
    if (role !== "employee" && role !== "dispatcher" && role !== "admin") {
      return null;
    }
    return { sub, role, displayName };
  } catch {
    return null;
  }
}

export function getBearerToken(c: Context): string | null {
  const h = c.req.header("Authorization");
  if (!h?.startsWith("Bearer ")) return null;
  return h.slice("Bearer ".length).trim() || null;
}

export const authMiddleware = createMiddleware<{
  Variables: { user: AuthUser };
}>(async (c, next) => {
  const token = getBearerToken(c);
  if (!token) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const user = await verifyToken(token);
  if (!user) {
    return c.json({ error: "Invalid token" }, 401);
  }
  c.set("user", user);
  await next();
});

export function requireRole(...roles: Role[]) {
  return createMiddleware<{
    Variables: { user: AuthUser };
  }>(async (c, next) => {
    const user = c.get("user");
    if (!roles.includes(user.role)) {
      return c.json({ error: "Forbidden" }, 403);
    }
    await next();
  });
}
