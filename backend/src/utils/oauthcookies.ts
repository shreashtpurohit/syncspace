
import type { Response } from "express";
import * as oidc from "openid-client";
import { env } from "../config/env.js";
import type { OAuthProvider } from "../config/oauth.js";

const TRANSACTION_MAX_AGE = 10 * 60 * 1000;

function getCookieOptions() {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/auth",
    maxAge: TRANSACTION_MAX_AGE,
  };
}

function getCookieNames(provider: OAuthProvider) {
  return {
    state: `syncspace_${provider}_oauth_state`,
    verifier: `syncspace_${provider}_oauth_verifier`,
    nonce: `syncspace_${provider}_oauth_nonce`,
  };
}

export async function createOAuthTransaction(
  response: Response,
  provider: OAuthProvider,
) {
  const state = oidc.randomState();
  const codeVerifier = oidc.randomPKCECodeVerifier();
  const codeChallenge =
    await oidc.calculatePKCECodeChallenge(codeVerifier);

  const nonce = provider === "google" ? oidc.randomNonce() : undefined;

  const cookieNames = getCookieNames(provider);
  const options = getCookieOptions();

  response.cookie(cookieNames.state, state, options);
  response.cookie(cookieNames.verifier, codeVerifier, options);

  if (nonce) {
    response.cookie(cookieNames.nonce, nonce, options);
  }

  return {
    state,
    codeVerifier,
    codeChallenge,
    nonce,
  };
}

export function clearOAuthTransaction(
  response: Response,
  provider: OAuthProvider,
) {
  const cookieNames = getCookieNames(provider);

  const options = {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/auth",
  };

  response.clearCookie(cookieNames.state, options);
  response.clearCookie(cookieNames.verifier, options);
  response.clearCookie(cookieNames.nonce, options);
}
