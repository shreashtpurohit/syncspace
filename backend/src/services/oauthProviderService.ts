
import * as oidc from "openid-client";
import { getOAuthProviderConfig } from "../config/oauth.js";

let googleConfigurationPromise:
  | Promise<oidc.Configuration>
  | undefined;

let githubConfigurationPromise:
  | Promise<oidc.Configuration>
  | undefined;

export function getGoogleOAuthConfiguration(): Promise<oidc.Configuration> {
  if (!googleConfigurationPromise) {
    const provider = getOAuthProviderConfig("google");

    googleConfigurationPromise = oidc.discovery(
      new URL("https://accounts.google.com"),
      provider.clientId,
      provider.clientSecret,
    ).catch((error: unknown) => {
      googleConfigurationPromise = undefined;
      throw error;
    });
  }

  return googleConfigurationPromise;
}

export function getGitHubOAuthConfiguration(): Promise<oidc.Configuration> {
  if (!githubConfigurationPromise) {
    const provider = getOAuthProviderConfig("github");

    githubConfigurationPromise = Promise.resolve(
      new oidc.Configuration(
        {
          issuer: "https://github.com",
          authorization_endpoint: "https://github.com/login/oauth/authorize",
          token_endpoint: "https://github.com/login/oauth/access_token",
        },
        provider.clientId,
        {
          token_endpoint_auth_method: "client_secret_post",
        },
        oidc.ClientSecretPost(provider.clientSecret),
      ),
    ).catch((error: unknown) => {
      githubConfigurationPromise = undefined;
      throw error;
    });
  }

  return githubConfigurationPromise;
}
