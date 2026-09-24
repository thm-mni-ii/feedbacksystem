import { AuthConfig } from "angular-oauth2-oidc";

export const authCodeFlowConfig: AuthConfig = {
  issuer:
    typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:8080",
  redirectUri:
    (typeof window !== "undefined" ? window.location.origin : "") +
    "/oauth2/callback",
  clientId: "fbs-test-client",
  responseType: "code",
  scope: "openid profile",
  showDebugInformation: false,
  requireHttps: false,
};
