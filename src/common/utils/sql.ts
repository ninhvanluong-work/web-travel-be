/**
 * Escape các ký tự đặc biệt của LIKE/ILIKE (`\`, `%`, `_`) trong input người dùng,
 * để chúng được so khớp như ký tự thường thay vì wildcard.
 * Postgres mặc định dùng `\` làm escape character cho LIKE.
 */
export const escapeLike = (value: string): string =>
  value.replace(/[\\%_]/g, '\\$&');
