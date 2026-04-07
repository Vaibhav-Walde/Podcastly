import express, { Request, Response } from "express";
import multer from "multer";
import { authMiddleware } from "../middlewares";
import { prismaClient } from "@repo/db/prisma";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

interface authRequest extends Request {
  userId?: string;
}
const router = express.Router();
const upload = multer();

function getSupabase() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
}

// Upload each chunk
router.post("/chunks", upload.single("chunk"), authMiddleware, async (req: authRequest, res: Response) => {
  const file = req.file;
  const { chunkIndex, sessionName, userType } = req.body;
  try {
    if (!file) {
      res.status(400).json({ msg: "File empty" });
      return;
    }
    const supabase = getSupabase();
    const chunkPath = `chunks/${sessionName}-${userType}/${chunkIndex}.webm`;
    const { error } = await supabase.storage.from("recordings").upload(chunkPath, file.buffer, {
      contentType: "video/webm",
      upsert: true,
    });
    if (error) throw error;
    res.status(200).json({ msg: "Chunk uploaded!", chunkIndex });
  } catch (error) {
    res.status(400).json({ msg: String(error) });
  }
});

// Merge and upload — now returns the final URL synchronously
router.post("/merge-upload-s3", authMiddleware, async (req: authRequest, res: Response) => {
  const userId = Number(req.userId);
  const { sessionName, userType, sessionId } = req.body;
  const numericSessionId = Number(sessionId);

  try {
    const supabase = getSupabase();
    const folderPath = `chunks/${sessionName}-${userType}`;

    // List all chunks
    const { data: files, error: listError } = await supabase.storage.from("recordings").list(folderPath);
    if (listError || !files || files.length === 0) {
      res.status(400).json({ msg: "No chunks found to merge" });
      return;
    }

    const sorted = files
      .filter((f) => f.name.endsWith(".webm"))
      .sort((a, b) => parseInt(a.name) - parseInt(b.name));

    // Download and merge all chunks into one buffer
    const buffers: Buffer[] = [];
    for (const f of sorted) {
      const { data, error } = await supabase.storage.from("recordings").download(`${folderPath}/${f.name}`);
      if (error || !data) continue;
      buffers.push(Buffer.from(await data.arrayBuffer()));
    }

    if (buffers.length === 0) {
      res.status(400).json({ msg: "No valid chunks to merge" });
      return;
    }

    const merged = Buffer.concat(buffers);
    const finalPath = `final/${sessionName}-${userType}-${Date.now()}.webm`;

    const { error: uploadError } = await supabase.storage
      .from("recordings")
      .upload(finalPath, merged, { contentType: "video/webm", upsert: true });
    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from("recordings").getPublicUrl(finalPath);

    // Save to DB
    await prismaClient.tracks.create({
      data: { userId, trackName: `${sessionName}-${userType}`, s3Url: publicUrl, sessionId: numericSessionId },
    });

    // Return the URL to the client so recordings work
    res.status(200).json({ msg: "Recording merged and saved!", url: publicUrl });
  } catch (err) {
    console.error("Merge error:", err);
    res.status(500).json({ msg: "Failed to merge recording", error: String(err) });
  }
});

// Get session recordings
router.get("/get-session-videos/:sessionId", async (req: Request, res: Response) => {
  const sessionId = Number(req.params.sessionId);
  try {
    const recordings = await prismaClient.tracks.findMany({ where: { sessionId } });
    res.status(200).json({ recordings });
  } catch (error) {
    res.status(400).json({ error: String(error) });
  }
});

export default router;
