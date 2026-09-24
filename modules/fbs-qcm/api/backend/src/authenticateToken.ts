import { NextFunction, Response, Request } from "express";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

const jwksUri =
  process.env.OIDC_JWK_SET_URI || "http://identity-service:8080/oauth2/jwks";
const issuer = process.env.OIDC_ISSUER || "http://localhost:8080";

const client = jwksClient({
  jwksUri: jwksUri,
  cache: true,
  rateLimit: true,
});

function getKey(header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) {
  if (header.kid) {
    client.getSigningKey(header.kid, (err, key) => {
      if (err) {
        return callback(err);
      }
      const signingKey = key?.getPublicKey();
      callback(null, signingKey);
    });
  } else if (process.env.JWT_SECRET) {
    callback(null, process.env.JWT_SECRET);
  } else {
    callback(new Error("No kid in token header and no JWT_SECRET set"));
  }
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) {
    console.log("no token");
    return res.sendStatus(401);
  }

  jwt.verify(
    token,
    getKey,
    { algorithms: ["RS256", "HS256"] },
    (err: any, user: any) => {
      if (err) {
        if (process.env.JWT_SECRET) {
          jwt.verify(
            token,
            process.env.JWT_SECRET as string,
            (legacyErr: any, legacyUser: any) => {
              if (legacyErr) {
                console.log("JWT verification failed:", err);
                return res.sendStatus(403);
              }
              (req as any).user = legacyUser;
              next();
            }
          );
          return;
        }
        console.log("JWT verification failed:", err);
        return res.sendStatus(403);
      }
      (req as any).user = user;
      next();
    }
  );
};
