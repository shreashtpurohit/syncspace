
import jwt, { type SignOptions, type JwtPayload } from "jsonwebtoken";
import { env } from "../config/env.js";

export interface AuthTokenPayload extends JwtPayload {
  sub: string;
}

export const generateAccessToken = (userId: string): string => {
  const options: SignOptions = {
    subject: userId,
    expiresIn: (env.JWT_EXPIRES_IN ?? "1h") as NonNullable<
      SignOptions["expiresIn"]
    >,
  };

  return jwt.sign({}, env.JWT_SECRET, options);
};

export const verifyAccessToken = (token: string): AuthTokenPayload => {
  const decoded = jwt.verify(token, env.JWT_SECRET);

  if (typeof decoded === "string" || typeof decoded.sub !== "string") {
    throw new Error("Invalid token payload");
  }

  return decoded as AuthTokenPayload;
};
