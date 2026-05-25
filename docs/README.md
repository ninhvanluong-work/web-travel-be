# 📚 Web Travel Backend — Documentation Index

> Tài liệu kỹ thuật chính thức của hệ thống **Web Travel Backend** (NestJS REST API).

---

## Mục lục

| # | File | Nội dung |
|---|------|----------|
| 1 | [01-overview.md](./01-overview.md) | Tổng quan hệ thống, mục tiêu, kiến trúc tổng thể |
| 2 | [02-tech-stack.md](./02-tech-stack.md) | Tech stack, thư viện, công nghệ sử dụng |
| 3 | [03-architecture.md](./03-architecture.md) | Kiến trúc module, luồng dữ liệu, sơ đồ hệ thống |
| 4 | [04-database.md](./04-database.md) | Thiết kế CSDL — bảng, cột, quan hệ, ERD |
| 5 | [05-api-reference.md](./05-api-reference.md) | Tham chiếu API — endpoint, request/response |
| 6 | [06-business-logic.md](./06-business-logic.md) | Đặc tả logic nghiệp vụ từng module |
| 7 | [07-deploy.md](./07-deploy.md) | Hướng dẫn deploy — Docker, Fly.io |
| 8 | [08-environment.md](./08-environment.md) | Biến môi trường, cấu hình hệ thống |
| 9 | [09-development.md](./09-development.md) | Hướng dẫn phát triển, migrations, convention |

---

## Quick Start

```bash
# Cài dependencies
yarn install

# Chạy database local
docker-compose up -d

# Chạy migration
yarn migration:run

# Start development server
yarn start:dev
```

API Documentation (Swagger): `http://localhost:3000/docs`

---

> **Standard theo**: [Divio Documentation System](https://documentation.divio.com/) + [Google Developer Docs Style Guide](https://developers.google.com/style)
