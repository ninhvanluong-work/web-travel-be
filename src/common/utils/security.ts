import path from 'path';
import fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config({
  path: '.env',
});

const CERTS_DIR = path.join(process.cwd(), 'certs');
const CA_CERT_BASE64 = process.env.CA_CERT_BASE64;

export const getCACertificate = () => {
  const caPath = path.join(CERTS_DIR, 'ca-certificate.crt');

  if (CA_CERT_BASE64) {
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
