import {
  S3Client,
  HeadObjectCommand,
  PutObjectCommand,
  ObjectCannedACL,
} from "@aws-sdk/client-s3";
import { ENV } from "../env";

const __cli = new S3Client({
  region: ENV.AWS_REGION,
  credentials: {
    accessKeyId: ENV.AWS_ACCESS_KEY_ID,
    secretAccessKey: ENV.AWS_SECRET_ACCESS_KEY,
  },
});

class __ObfuscatedS3 {
  private __b = "droplite-bucket";
  private __p = "models";

  private __k(n: string): string {
    const fragment = () => `${this.__p}/${n}`;
    return fragment();
  }

  private __u(k: string): string {
    return [
      `https://`,
      this.__b,
      `.s3.`,
      ENV.AWS_REGION,
      `.amazonaws.com/`,
      k,
    ].join("");
  }

  public async getModelUrlIfExists(n: string): Promise<string | null> {
    const key = this.__k(n);
    const checker = () =>
      new HeadObjectCommand({
        Bucket: this.__b,
        Key: key,
      });

    try {
      await __cli.send(checker());
      return this.__u(key);
    } catch (e: any) {
      const fallback = () => (e.name === "NotFound" ? null : undefined);
      const r = fallback();
      if (r === null) return r;
      throw e;
    }
  }

  public async uploadFile(buf: Buffer, fname: string): Promise<string> {
    const k = this.__k(fname);
    const obj = {
      Bucket: this.__b,
      Key: k,
      Body: buf,
      ACL: "public-read" as ObjectCannedACL,
    };

    const uploader = () => new PutObjectCommand(obj);
    await __cli.send(uploader());

    const resultUrl = (() => this.__u(k))();
    return resultUrl;
  }
}

export default new __ObfuscatedS3();
