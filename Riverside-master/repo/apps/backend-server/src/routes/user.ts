import bcrypt from 'bcrypt';
import express from "express";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { SignInSchema, SignUpSchema } from "@repo/common/validation";
import { prismaClient } from "@repo/db/prisma";
import dotenv from "dotenv";
import { authMiddleware } from "../middlewares";
const router = express.Router();
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "";

interface authRequest extends Request {
  userId?: string;
}

// signup route
router.post("/signup", async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const { success } = SignUpSchema.safeParse({ name, email, password });
  if (!success) {
    res.status(400).json({ msg: "Invalid Format!" });
    return;
  }

  try {
    const checkExistingUser = await prismaClient.user.findFirst({
      where: { email },
    });

    if (checkExistingUser) {
      res.status(409).json({ msg: "User Already Exists!" });
      return;
    }

    await prismaClient.user.create({
      data: { name, email, password: await bcrypt.hash(password, 10) },
    });

    res.status(200).json({ msg: "User SignUp Successfully!" });
    return;
  } catch (error) {
    res.status(400).json({ msg: "Signup Failed!", error: String(error) });
  }
});

// signin route
router.post("/signin", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const { success } = SignInSchema.safeParse({ email, password });

  if (!success) {
    res.status(400).json({ msg: "Invalid Input Format!" });
    return;
  }

  try {
    const user = await prismaClient.user.findFirst({
      where: { email },
    });

    if (!user) {
      res.status(400).json({ msg: "User Not Exists!" });
      return;
    }

    if (!(await bcrypt.compare(password, user.password))) {
      res.status(400).json({ msg: "Invalid Credentials!" });
      return;
    }

    const userId = user.id;
    const token = jwt.sign({ userId }, JWT_SECRET);
    res.status(200).json({ msg: "Successful SignIn!", token });
    return;
  } catch (error) {
    res.status(400).json({ msg: "SignIn Failed!", error: String(error) });
  }
});

export default router;