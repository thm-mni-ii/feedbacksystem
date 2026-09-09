import { AuthConfig } from "angular-oauth2-oidc";

export const authCodeFlowConfig: AuthConfig = {
  issuer: "http://localhost:8080",
  redirectUri: window.location.origin + "/oauth2/callback",
  clientId: "fbs-test-client",
  responseType: "code",
  scope: "openid profile",
  showDebugInformation: true,
  requireHttps: false, // Set to true in production
};
