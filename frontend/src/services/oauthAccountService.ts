
import { apiRequest } from "../lib/api";

export type OAuthProvider = "google" | "github";

export interface LinkedOAuthAccount {
  provider: OAuthProvider;
  email: string | null;
  email_verified: boolean;
  created_at: string;
}

interface LinkedOAuthAccountsResponse {
  accounts: LinkedOAuthAccount[];
}

export const getLinkedOAuthAccounts = async (): Promise<
  LinkedOAuthAccount[]
> => {
  const response = await apiRequest<LinkedOAuthAccountsResponse>(
    "/auth/accounts",
  );

  return response.accounts;
};
