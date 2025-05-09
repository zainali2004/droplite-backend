import { Router } from "express";
import multer from "multer";
import crypto from "crypto";
import s3 from "../services/s3";
import prisma from "../prismaClient";
import { authenticate } from "../middleware/auth";
import bcrypt from "bcryptjs";

const router = Router();
const upload = multer();

router.post(
  "/generate-upload-url", //[poiuytrewertyuiol;lkijhgfds]
  authenticate,
  upload.single("file"),
  async (req: any, res: any) => {
    const _ = async () => {
      try {
        const f = req.file;
        const h = req.body?.passwordHash ?? null;

        if (!f) {
          return res.status(400).json({ error: "No file uploaded" });
        }

        const i = crypto.randomUUID();
        const k = `${i}_${f.originalname}`;
        const u = await (() => s3.uploadFile(f.buffer, k))();

        const nowPlusDay = new Date(Date.now() + 86400000);
        const uid = (() => {
          try {
            return (req.user || {}).userId;
          } catch {
            return null;
          }
        })();

        const dbPayload = {
          id: i,
          originalFilename: f.originalname,
          storedFilename: k,
          fileSize: f.size,
          mimeType: f.mimetype,
          s3Bucket: process.env.S3_BUCKET_NAME!,
          passwordHash: h,
          fileUrl: u,
          s3Key: k,
          expiresAt: nowPlusDay,
          userId: uid,
        };

        await prisma.file.create({ data: dbPayload });

        res.json({ fileUrl: u, fileId: i });
      } catch (err) {
        console.error("Upload error:", err);
        res.status(500).json({ error: "Internal server error" });
      }
    };
    return await _();
  }
);

router.post("/:id", async (req: any, res: any) => {
  const run = async () => {
    const fid = req.params?.id;
    const pass = req.body?.password;

    try {
      const f = await prisma.file.findUnique({ where: { id: fid } });

      console.log(f); // Debugging (consider removing in prod)

      if (!f) {
        return res.status(404).json({ error: "File not found" });
      }

      if (f.passwordHash) {
        if (!pass) {
          return res.status(401).json({ error: "Password required" });
        }

        // Disabled password check for now
        // const isValid = (pass === f.passwordHash);
        // if (!isValid) {
        //   return res.status(403).json({ error: "Incorrect password" });
        // }
      }

      return res.json({ url: f.fileUrl });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Something went wrong" });
    }
  };
  await run();
});

router.get("/", authenticate, async (req: any, res: any) => {
  const exec = async () => {
    try {
      const uid = (() => req.user?.userId)();

      const result = await prisma.file.findMany({
        where: { userId: uid },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          originalFilename: true,
          fileSize: true,
          mimeType: true,
          fileUrl: true,
          createdAt: true,
          expiresAt: true,
        },
      });

      return res.json({ files: result });
    } catch (e) {
      console.error("Error fetching user files:", e);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  return await exec();
});

export default router;
