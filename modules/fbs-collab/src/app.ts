import { Hocuspocus, onAuthenticatePayload } from "@hocuspocus/server";
import * as jose from "jose";

const FBS_ROOT_URL = process.env.FBS_ROOT_URL ?? "https://feedback.mni.thm.de";
const JWKS_URI =
  process.env.OIDC_JWK_SET_URI ?? "http://identity-service:8080/oauth2/jwks";
const OIDC_ISSUER = process.env.OIDC_ISSUER ?? "http://localhost:8080";

const JWKS = jose.createRemoteJWKSet(new URL(JWKS_URI));

const server = new Hocuspocus({
  port: 1234,
  async onAuthenticate(data: onAuthenticatePayload): Promise<any> {
    try {
      let userId: string | number | undefined;
      try {
        const { payload } = await jose.jwtVerify(data.token, JWKS, {
          issuer: OIDC_ISSUER,
        });
        userId = payload.sub ?? (payload.id as any);
      } catch (jwtErr) {
        try {
          const payload = jose.decodeJwt(data.token);
          userId = payload.sub ?? (payload.id as any);
        } catch (e) {
          throw new Error("Unauthorized");
        }
      }
      if (!userId) throw new Error("Unauthorized");
      const resp = await fetch(`${FBS_ROOT_URL}/api/v1/users/${userId}/groups`, {
        headers: { Authorization: `Bearer ${data.token}` },
      });
      if (resp.status !== 200) throw new Error("Unauthorized");
      const body = await resp.json();
      const ok = Boolean(
        body.find(({ id }: { id: string }) => id.toString() === data.documentName)
      );
      if (!ok) throw new Error("Forbidden");
      return { user: { id: userId } };
    } catch (e) {
      console.log(e);
      throw e;
    }
  },
});

server.listen();
