
import * as oidc from "openid-client";
import type { Response } from "express";
import { env } from "../config/env.js";
import type { OAuthProvider } from "../config/oauth.js";
import { createOAuthTransaction } from "../utils/oauthcookies.js";
import {
  getGoogleOAuthConfiguration,
  getGitHubOAuthConfiguration,
} from "./oauthProviderService.js";

export async function createOAuthAuthorizationUrl(
  provider: OAuthProvider,
  response: Response,
): Promise<URL> {
  const transaction = await createOAuthTransaction(response, provider);

  const configuration =
    provider === "google"
      ? await getGoogleOAuthConfiguration()
      : await getGitHubOAuthConfiguration();

  const providerConfig = {
    google: {
      callbackUrl: env.GOOGLE_CALLBACK_URL,
      scope: "openid email profile",
    },
    github: {
      callbackUrl: env.GITHUB_CALLBACK_URL,
      scope: "read:user user:email",
    },
  }[provider];

  const parameters: Record<string, string> = {
    redirect_uri: providerConfig.callbackUrl,
    scope: providerConfig.scope,
    state: transaction.state,
    code_challenge: transaction.codeChallenge,
    code_challenge_method: "S256",
  };

  if (transaction.nonce) {
    parameters.nonce = transaction.nonce;
  }

  return oidc.buildAuthorizationUrl(configuration, parameters);
}
