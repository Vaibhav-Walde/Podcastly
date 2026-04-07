import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

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
  const secret = process.env.JWT_SECRET || "";

  if (!secret) {
    res.status(500).json({ msg: "Server configuration error" });
    return;
  }

  try {
    const decoded = jwt.verify(token, secret) as { userId: string };
    req.userId = String(decoded.userId);
    next();
  } catch (error) {
    res.status(401).json({ msg: "Unauthorized: Invalid or expired token" });
  }
}
