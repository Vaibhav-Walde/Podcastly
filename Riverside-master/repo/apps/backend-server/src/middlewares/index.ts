import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

interface authRequest extends Request {
  userId?: string;
}

export async function authMiddleware(req: authRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ msg: "Unauthorized: Missing or invalid authorization header" });
    return;
  }

  const token = authHeader.split(" ")[1];

  if (!JWT_SECRET) {
    res.status(500).json({ msg: "Server configuration error: JWT secret not set" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.userId = String(decoded.userId);
    next();
  } catch (error) {
    res.status(401).json({ msg: "Unauthorized: Invalid or expired token" });
  }
}