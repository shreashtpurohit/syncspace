
import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.js";
import { AppError } from "../errors/AppError.js";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE,
  setAuthCookies, } from "../utils/authCookies.js";
import {
  refreshAuthSession,
} from "../services/authService.js";


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
export const authenticateWithRefresh = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const cookieToken = req.cookies?.[ACCESS_TOKEN_COOKIE];

  if (typeof cookieToken === "string" && cookieToken) {
    try {
      const payload = verifyAccessToken(cookieToken);

      req.user = { id: payload.sub };
      next();
      return;
    } catch {
      // Access token may have expired. Try the refresh session.
    }
  }

  try {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];

    if (typeof refreshToken !== "string" || !refreshToken) {
      throw new AppError("Authentication required", 401);
    }

    const result = await refreshAuthSession(refreshToken);

    setAuthCookies(res, result.accessToken, result.refreshToken);

    req.user = { id: result.user.id };

    next();
  } catch (error) {
    next(error);
  }
};