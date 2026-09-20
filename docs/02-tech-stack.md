# 02 — Tech Stack

[🏠 Về trang chủ](./README.md)

## 2.1 Runtime & Framework

| Công nghệ | Phiên bản | Vai trò |
|-----------|-----------|---------|
| **Node.js** | 22.13.1 | JavaScript runtime |
| **NestJS** | ^11.0 | Backend framework (MVC + DI) |
| **TypeScript** | ^5.7 | Ngôn ngữ phát triển chính |
| **Yarn** | 1.22.22 | Package manager |

## 2.2 Database & ORM

| Công nghệ | Phiên bản | Vai trò |
|-----------|-----------|---------|
| **PostgreSQL** | latest (Docker: ankane/pgvector) | Cơ sở dữ liệu chính |
| **pgvector** | extension | Lưu trữ và tìm kiếm vector AI embedding |
| **TypeORM** | ^0.3.28 | ORM — migration, repository pattern |
| **pg** | ^8.18 | PostgreSQL Node driver |
| **pgvector (npm)** | ^0.2.1 | Helper serialize pgvector ↔ JS array |

## 2.3 Storage & Media

| Công nghệ | Vai trò |
|-----------|---------|
| **BunnyCDN Storage Zone** | Lưu trữ file ảnh (CDN-backed) |
| **BunnyCDN Video Library** | Stream video (HLS), quản lý video |
| **@bunny.net/storage-sdk** | SDK upload file lên Bunny Storage |
| **FFmpeg** | Tạo video preview 5 giây, cài trong Docker |
| **Multer** | Middleware xử lý multipart/form-data upload |

## 2.4 Auth & Payment

| Công nghệ | Vai trò |
|-----------|---------|
| **@nestjs/jwt** | Sinh/verify JWT access + refresh token |
| **bcrypt** | Hash mật khẩu user |
| **PayPal REST API** (raw HTTP qua `@nestjs/axios`) | Cổng thanh toán PayPal (order/capture/webhook) |
| **vnpay** (npm) | Xây URL thanh toán + verify callback VNPay (SHA512 HMAC) |
| **@nestjs-modules/mailer** | Gửi mail thông báo booking cho supplier (SMTP Gmail) |

## 2.5 HTTP & API

| Công nghệ | Phiên bản | Vai trò |
|-----------|-----------|---------|
| **@nestjs/swagger** | ^11.2 | Tự động sinh Swagger UI (path: `/docs`) |
| **@nestjs/axios** | ^4.0 | HTTP client (gọi AI Embedding service) |
| **class-validator** | ^0.14 | Validate request DTO |
| **class-transformer** | ^0.5 | Transform request body |
| **body-parser** | ^2.2 | Parse JSON body, giữ raw body cho webhook |

## 2.6 Scheduled Tasks

| Công nghệ | Vai trò |
|-----------|---------|
| **@nestjs/schedule** | Cron job — daily search stat recompute + daily embedding backfill |

## 2.7 Utilities

| Công nghệ | Vai trò |
|-----------|---------|
| **crypto** (built-in) | Sinh signature upload video cho BunnyCDN, xác thực HMAC webhook |
| **rxjs** | Reactive extensions (NestJS core dep) |

## 2.8 DevOps & Infrastructure

| Công nghệ | Vai trò |
|-----------|---------|
| **Docker** | Container hoá ứng dụng |
| **docker-compose** | Chạy PostgreSQL local |
| **Fly.io** | Cloud hosting (region: `hkg` — Hong Kong) |
| **@flydotio/dockerfile** | Generate Dockerfile chuẩn Fly.io |

## 2.9 Development Tools

| Công nghệ | Vai trò |
|-----------|---------|
| **ESLint** + **Prettier** | Linting & formatting |
| **Jest** | Unit & E2E testing |
| **ts-jest** | TypeScript support cho Jest |
| **ts-node** | Chạy TypeScript trực tiếp (CLI tools) |
| **tsconfig-paths** | Hỗ trợ path alias `src/...` |
| **cross-env** | Cross-platform env vars trong npm scripts |

---

## 2.10 Kiến trúc tổng thể theo layer

```
┌────────────────────────────────────────────┐
│              Presentation Layer            │
│   Controllers → Swagger (auto-generated)   │
├────────────────────────────────────────────┤
│         Guard Layer (per-route, KHÔNG global) │
│   UserGuard / OptionalUserGuard (JWT)      │
├────────────────────────────────────────────┤
│               Business Layer              │
│         Services (injectable DI)           │
├────────────────────────────────────────────┤
│              Data Access Layer            │
│   TypeORM Repositories → PostgreSQL       │
├────────────────────────────────────────────┤
│             Infrastructure Layer          │
│  BunnyCDN SDK | Axios (AI) | FFmpeg |     │
│  PayPal/VNPay API | SMTP Mailer           │
└────────────────────────────────────────────┘
```

---
[← Trang trước](./01-overview.md) | [Trang sau →](./03-architecture.md)
