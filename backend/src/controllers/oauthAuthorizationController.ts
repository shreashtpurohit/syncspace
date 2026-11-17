
import type { Request, Response, NextFunction } from "express";
import { createOAuthAuthorizationUrl } from "../services/oauthAuthorizationService.js";
import type { OAuthProvider } from "../config/oauth.js";
import type { OAuthFlow } from "../utils/oauthcookies.js";

export const startOAuthController = (
  provider: OAuthProvider,
  flow: OAuthFlow = "login",
) => {
  return async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const authorizationUrl = await createOAuthAuthorizationUrl(
        provider,
        res,
        flow,
      );

      return res.redirect(authorizationUrl.toString());
    } catch (error) {
      return next(error);
    }
  };
};
