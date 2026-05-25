# 08 — Biến Môi trường (Environment Variables)

## 8.1 Tổng quan

File cấu hình: `.env` (root project)  
Load bởi: `@nestjs/config` với `ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true })`

---

## 8.2 Danh sách biến môi trường

### Database

| Biến | Bắt buộc | Mô tả | Ví dụ |
|------|----------|-------|-------|
| `DATABASE_URL` | ✅ | Connection string PostgreSQL | `postgres://admin:admin@localhost:5555/defaultdb` |
| `DATABASE_SSL` | ❌ | Bật SSL cho DB (production) | `true` |

> Production thường dùng connection string dạng:
> ```
> postgres://user:password@host:5432/dbname?sslmode=require
> ```

### Server

| Biến | Bắt buộc | Mô tả | Mặc định |
|------|----------|-------|---------|
| `PORT` | ❌ | Port lắng nghe | `3000` |
| `NODE_ENV` | ❌ | Môi trường | `development` |

### BunnyCDN — Video Library

| Biến | Bắt buộc | Mô tả |
|------|----------|-------|
| `BUNNY_API_KEY` | ✅ | API key từ BunnyCDN dashboard |
| `BUNNY_LIBRARY_ID` | ✅ | ID của Video Library trên BunnyCDN |

> Dùng để: tạo video slot, sinh upload signature.

### BunnyCDN — Storage Zone

| Biến | Bắt buộc | Mô tả |
|------|----------|-------|
| `BUNNY_STORAGE_ZONE` | ✅ | Tên Storage Zone |
| `BUNNY_STORAGE_ACCESS_KEY` | ✅ | Access key của Storage Zone |
| `FILE_SERVER_URI` | ✅ | Base URL của CDN để tạo public URL |

> Ví dụ `FILE_SERVER_URI`: `https://cdn.example.b-cdn.net`  
> URL file: `{FILE_SERVER_URI}/img/2026/05/wt_xxx.jpg`

### AI Embedding Service

| Biến | Bắt buộc | Mô tả | Ví dụ |
|------|----------|-------|-------|
| `EMBEDDING_API_URL` | ✅ | Base URL của AI Embedding microservice | `http://localhost:8000` |

> Service này có 2 endpoints được gọi:
> - `POST /embedding` — embedding từ text đơn
> - `POST /embedding/video` — embedding từ context video + product + destination

---

## 8.3 File `.env` mẫu

```env
# =====================
# Server
# =====================
PORT=3000
NODE_ENV=development

# =====================
# Database
# =====================
DATABASE_URL=postgres://admin:admin@localhost:5555/defaultdb
# DATABASE_SSL=true  # Uncomment for production with SSL

# =====================
# BunnyCDN — Video
# =====================
BUNNY_API_KEY=your-bunny-api-key
BUNNY_LIBRARY_ID=123456

# =====================
# BunnyCDN — Storage
# =====================
BUNNY_STORAGE_ZONE=your-storage-zone-name
BUNNY_STORAGE_ACCESS_KEY=your-storage-access-key
FILE_SERVER_URI=https://your-cdn.b-cdn.net

# =====================
# AI Embedding
# =====================
EMBEDDING_API_URL=http://localhost:8000
```

---

## 8.4 SSL Database (Production)

Khi kết nối đến managed PostgreSQL yêu cầu SSL:

1. File certificate: `certs/ca-certificate.crt` (đã có trong repo)
2. Cấu hình trong `database.module.ts`:
```typescript
ssl: {
  rejectUnauthorized: true,
  ca: fs.readFileSync('certs/ca-certificate.crt').toString(),
}
```

---

## 8.5 Fly.io Secrets

Trên production (Fly.io), biến môi trường được quản lý qua Secrets:

```bash
fly secrets set DATABASE_URL="postgres://..."
fly secrets set BUNNY_API_KEY="..."
fly secrets set BUNNY_LIBRARY_ID="..."
fly secrets set BUNNY_STORAGE_ZONE="..."
fly secrets set BUNNY_STORAGE_ACCESS_KEY="..."
fly secrets set FILE_SERVER_URI="..."
fly secrets set EMBEDDING_API_URL="..."
```

---

## 8.6 Lưu ý bảo mật

- ❌ **Không** commit file `.env` lên Git (đã trong `.gitignore`)
- ❌ **Không** log ra console giá trị secret
- ✅ Dùng `ConfigService.get<string>('VAR_NAME')` — không dùng `process.env` trực tiếp
- ✅ Fly.io secrets được mã hoá at-rest
- ✅ Chỉ expose các port cần thiết (3000)
