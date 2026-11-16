
import * as oidc from "openid-client";
import { getOAuthProviderConfig } from "../config/oauth.js";

let googleConfigurationPromise:
  | Promise<oidc.Configuration>
  | undefined;

export function getGoogleOAuthConfiguration(): Promise<oidc.Configuration> {
  if (!googleConfigurationPromise) {
    googleConfigurationPromise = (async () => {
      const provider = getOAuthProviderConfig("google");

      return oidc.discovery(
        new URL("https://accounts.google.com"),
        provider.clientId,
        provider.clientSecret,
      );
    })().catch((error: unknown) => {
      googleConfigurationPromise = undefined;
      throw error;
    });
  }

  return googleConfigurationPromise;
}
