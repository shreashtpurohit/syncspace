
import * as oidc from "openid-client";
import { AppError } from "../errors/AppError.js";
import { getGoogleOAuthConfiguration } from "./oauthProviderService.js";

interface GoogleOAuthCallbackInput {
  callbackUrl: URL;
  state?: string;
  codeVerifier?: string;
  nonce?: string;
}

export interface GoogleOAuthIdentity {
  providerUserId: string;
  email: string;
  emailVerified: boolean;
  name: string;
}

export async function verifyGoogleOAuthCallback(
  input: GoogleOAuthCallbackInput,
): Promise<GoogleOAuthIdentity> {
  if (!input.state || !input.codeVerifier || !input.nonce) {
    throw new AppError("Google OAuth transaction is invalid or expired.", 400);
  }

  const configuration = await getGoogleOAuthConfiguration();

  const tokens = await oidc.authorizationCodeGrant(
    configuration,
    input.callbackUrl,
    {
      expectedState: input.state,
      pkceCodeVerifier: input.codeVerifier,
      expectedNonce: input.nonce,
      idTokenExpected: true,
    },
  );

  const claims = tokens.claims();

  if (
    !claims ||
    typeof claims.sub !== "string" ||
    typeof claims.email !== "string" ||
    typeof claims.name !== "string"
  ) {
    throw new AppError("Google did not return a valid user identity.", 401);
  }

  if (claims.email_verified !== true) {
    throw new AppError("A verified Google email address is required.", 403);
  }

  return {
    providerUserId: claims.sub,
    email: claims.email.trim().toLowerCase(),
    emailVerified: true,
    name: claims.name.trim(),
  };
}
