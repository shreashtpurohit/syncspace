
import { useEffect, useState } from "react";
import {
  getLinkedOAuthAccounts,
  type LinkedOAuthAccount,
} from "../services/oauthAccountService";
import "./account-settings-page.css";

export default function AccountSettingsPage() {
  const [accounts, setAccounts] = useState<LinkedOAuthAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const linkedAccounts = await getLinkedOAuthAccounts();
        setAccounts(linkedAccounts);
      } catch {
        setError("Unable to load connected accounts. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadAccounts();
  }, []);

  const googleAccount = accounts.find(
    (account) => account.provider === "google",
  );

  const handleGoogleLink = () => {
    window.location.assign("/auth/google/link");
  };

  return (
    <div className="account-settings-page">
      <div className="account-settings-heading">
        <div>
          <span className="account-settings-eyebrow">PREFERENCES</span>
          <h1>Account settings</h1>
          <p>Manage your account and connected sign-in methods.</p>
        </div>
      </div>

      <section className="account-settings-section">
        <div className="account-settings-section-heading">
          <div>
            <h2>Connected accounts</h2>
            <p>Manage the services you use to sign in to SyncSpace.</p>
          </div>
        </div>

        {isLoading ? (
          <p className="account-settings-message">
            Loading connected accounts...
          </p>
        ) : error ? (
          <p className="account-settings-error">{error}</p>
        ) : (
          <div className="connected-account-card">
            <div className="connected-account-info">
              <div className="connected-account-icon">G</div>

              <div>
                <h3>Google</h3>
                <p>
                  {googleAccount
                    ? googleAccount.email
                    : "Sign in using your Google account"}
                </p>
              </div>
            </div>

            {googleAccount ? (
              <span className="connected-account-status">
                Connected
              </span>
            ) : (
              <button
                type="button"
                className="connect-account-button"
                onClick={handleGoogleLink}
              >
                Connect Google
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
