import express, { NextFunction, Response, Request } from "express";
import jwt from "jsonwebtoken";

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  console.log(next);
  console.log(authHeader);
  console.log("----------------------------------------------");
  console.log(req.headers);
  console.log("----------------------------------------------");

  console.log(authHeader && authHeader.split(" "));
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) {
    console.log("no token");
    return res.sendStatus(401);
  }
  jwt.verify(token, process.env.JWT_SECRET as string, (err: any, user: any) => {
    if (err) {
      console.log(req);
      console.log(err);
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
};
