
import type { Request, Response, NextFunction } from "express";
import { env } from "../config/env.js";
import { AppError } from "../errors/AppError.js";
import { resolveOAuthIdentity } from "../services/oauthIdentityService.js";
import { createOAuthAuthResult } from "../services/authService.js";
import { verifyGoogleOAuthCallback } from "../services/googleOAuthService.js";
import { setAuthCookies } from "../utils/authCookies.js";
import { clearOAuthTransaction } from "../utils/oauthcookies.js";

export const googleOAuthCallbackController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const state = req.cookies?.syncspace_google_oauth_state;
    const codeVerifier = req.cookies?.syncspace_google_oauth_verifier;
    const nonce = req.cookies?.syncspace_google_oauth_nonce;

    if (
      typeof state !== "string" ||
      typeof codeVerifier !== "string" ||
      typeof nonce !== "string"
    ) {
      throw new AppError("Google OAuth transaction is invalid or expired.", 400);
    }

    const callbackUrl = new URL(env.GOOGLE_CALLBACK_URL);
    const queryIndex = req.originalUrl.indexOf("?");

    if (queryIndex === -1) {
      throw new AppError("Google OAuth callback parameters are missing.", 400);
    }

    callbackUrl.search = req.originalUrl.slice(queryIndex);

    const identity = await verifyGoogleOAuthCallback({
      callbackUrl,
      state,
      codeVerifier,
      nonce,
    });

    const user = await resolveOAuthIdentity({
      provider: "google",
      ...identity,
    });

    const result = await createOAuthAuthResult(user);
    clearOAuthTransaction(res, "google");
    setAuthCookies(res, result.accessToken, result.refreshToken);

    return res.redirect(`${env.APP_ORIGIN}/dashboard`);
  } catch (error) {
    clearOAuthTransaction(res, "google");
    return next(error);
  }
};

