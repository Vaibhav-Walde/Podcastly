import express, { Request, Response } from "express";
import { authMiddleware } from "../middlewares";
import { prismaClient } from "@repo/db/prisma";
import { v4 as uuidv4 } from "uuid";
const router = express.Router();

interface authRequest extends Request {
  userId?: number;
}

router.post("/create-session", authMiddleware, async (req: authRequest, res: Response) => {
  const sessionName = req.body.sessionName;
  const userId = Number(req.userId);

  try {
    const sessionCode = uuidv4();
    // Append a short UUID fragment to sessionName to avoid the @unique constraint conflict
    const uniqueSessionName = `${sessionName}_${sessionCode.slice(0, 8)}`;
    const session = await prismaClient.sessions.create({
      data: { sessionName: uniqueSessionName, userId, sessionCode },
    });

    res.status(200).json({ sessionid: session.id, sessionCode });
    return;
  } catch (error) {
    res.status(400).json({ msg: String(error) });
    return;
  }
});

router.post("/joinSession", authMiddleware, async (req: authRequest, res: Response) => {
  const sessionCode = req.body.sessionCode;
  const userId = Number(req.userId);

  try {
    const session = await prismaClient.sessions.findUnique({
      where: { sessionCode },
    });
    if (!session) {
      res.status(400).json({ msg: "Session Not Exists!" });
      return;
    }
    const joinSession = await prismaClient.joinSession.create({
      data: { userId, sessionId: session.id },
    });
    if (!joinSession) {
      res.status(400).json({ msg: "Session Not Created At DB!" });
      return;
    }
    res.status(200).json({ msg: "Join Session Success!", sessionId: session.id });
    return;
  } catch (error) {
    res.status(400).json({ msg: String(error) });
    return;
  }
});

// Get particular session
router.get("/get-session/:id", authMiddleware, async (req: authRequest, res: Response) => {
  const sessionCode = req.params.id;

  try {
    const session = await prismaClient.sessions.findFirst({
      where: { sessionCode },
      select: {
        tracks: {
          select: { id: true, userId: true, sessionId: true, trackName: true, s3Url: true },
        },
      },
    });
    res.status(200).json({ session });
    return;
  } catch (error) {
    res.status(400).json({ msg: String(error) });
    return;
  }
});

// All sessions for dashboard
router.get("/get-all-sessions", authMiddleware, async (req: authRequest, res: Response) => {
  const userId = Number(req.userId);
  try {
    const sessions = await prismaClient.sessions.findMany({ where: { userId } });
    res.status(200).json({ sessions });
    return;
  } catch (error) {
    res.status(400).json({ msg: String(error) });
  }
});

export default router;