
import type { Request, Response, NextFunction } from "express";
import { env } from "../config/env.js";
import { AppError } from "../errors/AppError.js";
import { linkOAuthIdentity } from "../services/oauthAccountLinkService.js";
import { verifyGoogleOAuthCallback } from "../services/googleOAuthService.js";
import { clearOAuthTransaction } from "../utils/oauthcookies.js";

export const googleOAuthLinkCallbackController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const state = req.cookies?.syncspace_google_link_oauth_state;
    const codeVerifier = req.cookies?.syncspace_google_link_oauth_verifier;
    const nonce = req.cookies?.syncspace_google_link_oauth_nonce;

    if (
      typeof state !== "string" ||
      typeof codeVerifier !== "string" ||
      typeof nonce !== "string"
    ) {
      throw new AppError(
        "Google account-linking transaction is invalid or expired.",
        400,
      );
    }

    const callbackUrl = new URL(env.GOOGLE_LINK_CALLBACK_URL);
    const queryIndex = req.originalUrl.indexOf("?");

    if (queryIndex === -1) {
      throw new AppError(
        "Google callback parameters are missing.",
        400,
      );
    }

    callbackUrl.search = req.originalUrl.slice(queryIndex);

    const identity = await verifyGoogleOAuthCallback({
      callbackUrl,
      state,
      codeVerifier,
      nonce,
    });

    await linkOAuthIdentity({
      userId: req.user.id,
      provider: "google",
      ...identity,
    });

    clearOAuthTransaction(res, "google", "link");

    return res.redirect(
      `${env.APP_ORIGIN}/settings?google=linked`,
    );
  } catch (error) {
    clearOAuthTransaction(res, "google", "link");
    return next(error);
  }
};
