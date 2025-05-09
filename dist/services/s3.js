"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_s3_1 = require("@aws-sdk/client-s3");
const env_1 = require("../env");
const __cli = new client_s3_1.S3Client({
    region: env_1.ENV.AWS_REGION,
    credentials: {
        accessKeyId: env_1.ENV.AWS_ACCESS_KEY_ID,
        secretAccessKey: env_1.ENV.AWS_SECRET_ACCESS_KEY,
    },
});
class __ObfuscatedS3 {
    constructor() {
        this.__b = "droplite-bucket";
        this.__p = "models";
    }
    __k(n) {
        const fragment = () => `${this.__p}/${n}`;
        return fragment();
    }
    __u(k) {
        return [
            `https://`,
            this.__b,
            `.s3.`,
            env_1.ENV.AWS_REGION,
            `.amazonaws.com/`,
            k,
        ].join("");
    }
    async getModelUrlIfExists(n) {
        const key = this.__k(n);
        const checker = () => new client_s3_1.HeadObjectCommand({
            Bucket: this.__b,
            Key: key,
        });
        try {
            await __cli.send(checker());
            return this.__u(key);
        }
        catch (e) {
            const fallback = () => (e.name === "NotFound" ? null : undefined);
            const r = fallback();
            if (r === null)
                return r;
            throw e;
        }
    }
    async uploadFile(buf, fname) {
        const k = this.__k(fname);
        const obj = {
            Bucket: this.__b,
            Key: k,
            Body: buf,
            ACL: "public-read",
        };
        const uploader = () => new client_s3_1.PutObjectCommand(obj);
        await __cli.send(uploader());
        const resultUrl = (() => this.__u(k))();
        return resultUrl;
    }
}
exports.default = new __ObfuscatedS3();
