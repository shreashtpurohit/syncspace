
import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.js";
import { AppError } from "../errors/AppError.js";
import { ACCESS_TOKEN_COOKIE } from "../utils/authCookies.js";

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  try {
    const cookieToken = req.cookies?.[ACCESS_TOKEN_COOKIE];
    const authorization = req.headers.authorization;

    const bearerToken =
      authorization?.startsWith("Bearer ")
        ? authorization.slice(7).trim()
        : undefined;

    const token =
      typeof cookieToken === "string" && cookieToken
        ? cookieToken
        : bearerToken;

    if (!token) {
      throw new AppError("Authentication required", 401);
    }

    const payload = verifyAccessToken(token);

    req.user = {
      id: payload.sub,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }

    next(new AppError("Invalid or expired token", 401));
  }
};
