import path from 'path';
import fs from 'fs';

const CERTS_DIR = path.join(process.cwd(), 'certs');

export const getCACertificate = () => {
  const caPath = path.join(CERTS_DIR, 'ca-certificate.crt');
  if (!fs.existsSync(caPath)) {
    throw new Error(`CA certificate not found at ${caPath}`);
  }

  return fs.readFileSync(caPath).toString();
};
