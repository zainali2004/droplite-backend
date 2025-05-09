import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth";
import fileRoutes from "./routes/file";

dotenv.config();

const app = express();
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/file", fileRoutes);

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
