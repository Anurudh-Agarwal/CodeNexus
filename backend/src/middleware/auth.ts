import { NextFunction, Request, Response } from "express";
import { supabase } from "../lib/supabase";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
    }
  }
}

const SESSION_COOKIE = "codenexus_session";

function getSessionToken(req: Request): string | null {
  const cookieHeader = req.headers.cookie;
  const cookieToken = cookieHeader
    ?.split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${SESSION_COOKIE}=`))
    ?.slice(SESSION_COOKIE.length + 1);

  if (cookieToken) return decodeURIComponent(cookieToken);

  const authorization = req.headers.authorization;
  if (authorization?.startsWith("Bearer ")) {
    return authorization.slice("Bearer ".length);
  }

  return null;
}

export function setSessionCookie(res: Response, token: string): void {
  const secure = process.env.NODE_ENV === "production";
  const attributes = [
    `${SESSION_COOKIE}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    `SameSite=${secure ? "None" : "Lax"}`,
    "Max-Age=3600",
  ];

  if (secure) attributes.push("Secure");
  res.setHeader("Set-Cookie", attributes.join("; "));
}

export function clearSessionCookie(res: Response): void {
  const secure = process.env.NODE_ENV === "production";
  const attributes = [
    `${SESSION_COOKIE}=`,
    "Path=/",
    "HttpOnly",
    `SameSite=${secure ? "None" : "Lax"}`,
    "Max-Age=0",
  ];

  if (secure) attributes.push("Secure");
  res.setHeader("Set-Cookie", attributes.join("; "));
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const token = getSessionToken(req);
  if (!token) {
    res.status(401).json({ success: false, error: "Authentication required" });
    return;
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    res
      .status(401)
      .json({ success: false, error: "Invalid or expired session" });
    return;
  }

  req.user = { id: data.user.id };
  next();
}
