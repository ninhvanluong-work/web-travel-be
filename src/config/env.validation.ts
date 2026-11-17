import * as Joi from 'joi';

/**
 * Validate biến môi trường lúc khởi động (ConfigModule.validationSchema).
 *
 * LƯU Ý: ConfigService.get() ưu tiên đọc giá trị ĐÃ QUA Joi, nên schema này
 * cố ý chỉ dùng Joi.string() + pattern, KHÔNG dùng number()/boolean()/default()
 * để giá trị trả về giữ nguyên kiểu string như khi chưa có validate
 * (vd code đang so sánh get('USE_CERT') === 'true').
 */

// string bắt buộc, không được rỗng
const required = () => Joi.string().required();
// string tuỳ chọn, cho phép để trống (vd TELEGRAM_BOT_TOKEN=)
const optional = () => Joi.string().allow('');
// URL http(s), dùng để nối chuỗi `${base}/...`
const httpUrl = () => Joi.string().uri({ scheme: ['http', 'https'] });

const BOOLEAN_STRING = /^(true|false)$/;
const INTEGER_STRING = /^\d+$/;

export const envValidationSchema = Joi.object({
  // app
  ENV: optional(),
  PORT: Joi.string().pattern(INTEGER_STRING),

  // postgres
  POSTGRES_CONN: required(),
  POSTGRES_SCHEMA: required(),
  USE_CERT: Joi.string().pattern(BOOLEAN_STRING),
  // chỉ bắt buộc khi chạy local có cert (xem src/common/utils/security.ts),
  // trên fly.io cert được mount từ secret nên không bắt buộc
  CA_CERT_BASE64: optional(),
  LOGGING: Joi.string().pattern(BOOLEAN_STRING),

  // bunny
  BUNNY_API_KEY: required(),
  BUNNY_READONLY_API_KEY: required(),
  BUNNY_LIBRARY_ID: required(),
  BUNNY_STORAGE_ZONE: required(),
  BUNNY_STORAGE_ACCESS_KEY: required(),

  // file server
  FILE_SERVER_URI: httpUrl().required(),
  STREAM_SERVER_URI: httpUrl().required(),

  // embedding
  EMBEDDING_API_URL: httpUrl().required(),

  // telegram notification
  TELEGRAM_BOT_TOKEN: optional(),
  TELEGRAM_CHAT_ID: optional(),

  // auth
  BCRYPT_SALT_ROUNDS: Joi.string().pattern(INTEGER_STRING),
  JWT_SECRET: required(),
  JWT_EXPIRES_IN: Joi.string(),

  // frontend
  FRONTEND_URL: httpUrl().required(),

  // mail
  SMPT_USER: required(),
  SMPT_APP_PASSWORD: required(),
  SMPT_HOST: Joi.string(),
  SMPT_PORT: Joi.string().pattern(INTEGER_STRING),

  // paypal
  PAYPAL_CLIENT_ID: required(),
  PAYPAL_CLIENT_SECRET: required(),
  // chỉ dùng để verify webhook PayPal; tạm thời không bắt buộc ở mọi môi trường
  // (chưa chốt môi trường nào cần đăng ký webhook)
  PAYPAL_WEBHOOK_ID: optional(),
  PAYPAL_MODE: Joi.string().valid('sandbox', 'live'),
  PAYPAL_CURRENCY: Joi.string(),

  // vnpay
  VNPAY_TMN_CODE: required(),
  VNPAY_HASH_SECRET: required(),
  VNPAY_URL: httpUrl().required(),
  VNPAY_API_URL: httpUrl().required(),
  VNPAY_RETURN_URL: httpUrl().required(),
});
