import dotenv from "dotenv";

dotenv.config();

export const ENV = {
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || "",
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || "",
  AWS_REGION: process.env.AWS_REGION || "us-east-1",
  AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME || "",

  PORT: process.env.PORT || 3000,
};
