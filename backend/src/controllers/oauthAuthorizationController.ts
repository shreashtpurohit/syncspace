
import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError.js";
import { createOAuthAuthorizationUrl } from "../services/oauthAuthorizationService.js";
import type { OAuthProvider } from "../config/oauth.js";

export const startOAuthController = (provider: OAuthProvider) => {
  return async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const authorizationUrl = await createOAuthAuthorizationUrl(
        provider,
        res,
      );

      return res.redirect(authorizationUrl.toString());
    } catch (error) {
      if (provider === "google" || provider === "github") {
        return next(error);
      }

      return next(new AppError("Unsupported OAuth provider.", 400));
    }
  };
};
