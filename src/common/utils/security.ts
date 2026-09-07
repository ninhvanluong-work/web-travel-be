import path from 'path';
import fs from 'fs';
import * as dotenv from 'dotenv';
import { ENV_ENUM } from 'src/types/common.dto';

dotenv.config({
  path: '.env',
});

const CERTS_DIR = path.join(process.cwd(), 'certs');
const CA_CERT_BASE64 = process.env.CA_CERT_BASE64;
const ENV = process.env.ENV;

export const getCACertificate = () => {
  const caPath = path.join(CERTS_DIR, 'ca-certificate.crt');

  // chỉ check trên local, deploy trên fly.io thì đã định nghĩa trong fly.toml rồi nên không cần check
  if (CA_CERT_BASE64 && ENV == ENV_ENUM.LOCAL) {
    //chưa có folder certs thì tạo mới
    if (!fs.existsSync(CERTS_DIR)) {
      fs.mkdirSync(CERTS_DIR, { recursive: true });
    }

    //decode base64
    const certBuffer = Buffer.from(CA_CERT_BASE64, 'base64');

    fs.writeFileSync(caPath, certBuffer);
  }

  if (!fs.existsSync(caPath)) {
    throw new Error(`CA certificate not found at ${caPath}`);
  }

  return fs.readFileSync(caPath).toString();
};
