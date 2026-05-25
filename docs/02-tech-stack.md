# 02 — Tech Stack

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

## 2.4 HTTP & API

| Công nghệ | Phiên bản | Vai trò |
|-----------|-----------|---------|
| **@nestjs/swagger** | ^11.2 | Tự động sinh Swagger UI (path: `/docs`) |
| **@nestjs/axios** | ^4.0 | HTTP client (gọi AI Embedding service) |
| **class-validator** | ^0.14 | Validate request DTO |
| **class-transformer** | ^0.5 | Transform request body |
| **body-parser** | ^2.2 | Parse JSON body, giữ raw body cho webhook |

## 2.5 Scheduled Tasks

| Công nghệ | Vai trò |
|-----------|---------|
| **@nestjs/schedule** | Cron job — reset monthly search stats |

## 2.6 Utilities

| Công nghệ | Vai trò |
|-----------|---------|
| **crypto** (built-in) | Sinh signature upload video cho BunnyCDN |
| **rxjs** | Reactive extensions (NestJS core dep) |

## 2.7 DevOps & Infrastructure

| Công nghệ | Vai trò |
|-----------|---------|
| **Docker** | Container hoá ứng dụng |
| **docker-compose** | Chạy PostgreSQL local |
| **Fly.io** | Cloud hosting (region: `hkg` — Hong Kong) |
| **@flydotio/dockerfile** | Generate Dockerfile chuẩn Fly.io |

## 2.8 Development Tools

| Công nghệ | Vai trò |
|-----------|---------|
| **ESLint** + **Prettier** | Linting & formatting |
| **Jest** | Unit & E2E testing |
| **ts-jest** | TypeScript support cho Jest |
| **ts-node** | Chạy TypeScript trực tiếp (CLI tools) |
| **tsconfig-paths** | Hỗ trợ path alias `src/...` |
| **cross-env** | Cross-platform env vars trong npm scripts |

---

## 2.9 Kiến trúc tổng thể theo layer

```
┌────────────────────────────────────────────┐
│              Presentation Layer            │
│   Controllers → Swagger (auto-generated)   │
├────────────────────────────────────────────┤
│               Business Layer              │
│         Services (injectable DI)           │
├────────────────────────────────────────────┤
│              Data Access Layer            │
│   TypeORM Repositories → PostgreSQL       │
├────────────────────────────────────────────┤
│             Infrastructure Layer          │
│  BunnyCDN SDK | Axios (AI) | FFmpeg       │
└────────────────────────────────────────────┘
```
