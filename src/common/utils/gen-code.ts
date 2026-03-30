export function generateRandomCode(length = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars[randomIndex];
  }

  return result;
}

export function generateRandomString(length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }

  return result;
}

export function generateSlug(name: string): string {
  const random = generateRandomString(4);

  const slug = name
    .toLowerCase()
    .normalize('NFD') // tách dấu tiếng Việt
    .replace(/[\u0300-\u036f]/g, '') // xoá dấu
    .replace(/đ/g, 'd') // xử lý riêng chữ đ
    .replace(/[^a-z0-9\s-]/g, '') // bỏ ký tự đặc biệt
    .trim()
    .replace(/\s+/g, '-') // space -> -
    .replace(/-+/g, '-'); // gộp nhiều dấu -

  return `${slug}-${random}`;
}
