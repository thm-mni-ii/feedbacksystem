import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedUser {
  username: string;
  id: number;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Platzhalter-Auth-Middleware für v2.
 *
 * Übernimmt bewusst 1:1 das Verhalten der bestehenden v1-Middleware
 * (api/backend/src/authenticateToken.ts), damit Endpoints von Anfang an
 * geschützt sind. Wird ersetzt, sobald die eigene Auth-Domain für v2 gebaut
 * wird (siehe Plan: v2-course-auth-domain).
 */
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = decoded as AuthenticatedUser;
    next();
  });
};
