# 08 — Biến Môi trường (Environment Variables)

[🏠 Về trang chủ](./README.md)

## 8.1 Tổng quan

File cấu hình: `.env` (root project)  
Load bởi: `@nestjs/config` với `ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true })`

---

## 8.2 Danh sách biến môi trường

### Database

| Biến | Bắt buộc | Mô tả | Ví dụ |
|------|----------|-------|-------|
| `POSTGRES_CONN` | ✅ | postgres connection | `postgres://user:password@host:5432/dbname` |
| `POSTGRES_SCHEMA` | ✅ | postgres schema | `public` |
| `USE_CERT` | ❌ | Bật kết nối db, dùng file `ca-certificate.crt` | `true` |
| `LOGGING` | ❌ | logging sql chạy | `true` |

> Production thường dùng connection string dạng:
> ```
> postgres://user:password@host:5432/dbname?sslmode=require
> ```

#### Cấu hình Database từ DigitalOcean

**Bước 1: Tạo PostgreSQL Cluster trên DigitalOcean**
1. Đăng nhập vào [DigitalOcean Console](https://cloud.digitalocean.com)
2. Chọn **Databases** → **Create Database** → Chọn **PostgreSQL**
3. Cấu hình:
   - **Engine**: PostgreSQL (phiên bản ≥ 13)
   - **Node plan**: Chọn theo nhu cầu (tối thiểu `$15/tháng`)
   - **Region**: Chọn khu vực gần người dùng (VN → Singapore)
   - **Cluster name**: `web-travel-db` (hoặc tên khác)
4. Chờ cluster khởi tạo (5-10 phút)

**Bước 2: Lấy Connection String**
1. Sau khi cluster khởi tạo xong, click vào cluster
2. Tab **Connection** → Chọn **Connection Parameters**
3. Copy **Connection String** (dạng):
   ```
   postgresql://doadmin:password@db-host:25060/defaultdb?sslmode=require
   ```

**Bước 3: Tạo Database riêng (Optional)**
1. Tab **Databases** → **Create Database**
2. Đặt tên: `web_travel` (nếu cần riêng khỏi `defaultdb`)
3. Lấy connection string mới:
   ```
   postgresql://doadmin:password@db-host:25060/web_travel?sslmode=require
   ```

**Bước 4: Cấu hình biến môi trường**
```bash
# .env file
POSTGRES_CONN="postgresql://doadmin:your_password@db-xxx-do-user-xxxxx.c.db.ondigitalocean.com:25060/web_travel?sslmode=require"
POSTGRES_SCHEMA="public"
USE_CERT="true"  # DigitalOcean dùng SSL bắt buộc
LOGGING="false"  # Tắt logging trên production
```

**Bước 5: Download CA Certificate (nếu cần)**
- Tab **Connection** → **SSL/TLS Connection** → **Download CA Certificate**
- Lưu vào `certs/ca-certificate.crt`
- Set `USE_CERT=true` trong `.env`

**Lưu ý:**
- ✅ DigitalOcean **bắt buộc SSL connection** (`sslmode=require`)
- ✅ Port mặc định: `25060` (không phải 5432)
- ✅ Tự động backup hàng ngày (lưu trữ 7 ngày gần nhất)
- ✅ Có thể kích hoạt connection pooling nếu cần optimize connection

### Server

| Biến | Bắt buộc | Mô tả | Mặc định |
|------|----------|-------|---------|
| `PORT` | ❌ | Port lắng nghe | `3000` |

### BunnyCDN — Video Library

| Biến | Bắt buộc | Mô tả |
|------|----------|-------|
| `BUNNY_API_KEY` | ✅ | API key từ BunnyCDN dashboard |
| `BUNNY_LIBRARY_ID` | ✅ | ID của Video Library trên BunnyCDN |

> Dùng để: tạo video slot, sinh upload signature.

#### Hướng dẫn setup BunnyCDN Video Library

**Bước 1: Đăng ký tài khoản BunnyCDN**
1. Truy cập [BunnyCDN.com](https://bunnycdn.com)
2. Click **Sign Up** → Điền thông tin cơ bản
3. Xác minh email và hoàn tất đăng ký
4. Đăng nhập vào [Dashboard BunnyCDN](https://dash.bunnycdn.com)

**Bước 2: Tạo Video Library**
1. Trong Dashboard, chọn **Video Library** (menu bên trái)
2. Click **Create New Library**
3. Điền thông tin:
   - **Name**: `web-travel-videos` (hoặc tên khác)
   - **Region**: Chọn khu vực gần người dùng (VN → Singapore hoặc Tokyo)
4. Click **Create** → Chờ hoàn tất (1-2 phút)

**Bước 3: Lấy Library ID**
1. Sau khi tạo xong, vào **Video Library** → Chọn library vừa tạo
2. Tab **Settings** → Kéo xuống tìm **Library ID**
3. Copy giá trị → Lưu vào `BUNNY_LIBRARY_ID`
   ```
   Ví dụ: BUNNY_LIBRARY_ID="12345"
   ```

**Bước 4: Tạo & Lấy API Key**
1. Vào **Account Settings** (icon bánh răng, góc trên phải)
2. Chọn **API Keys** (menu bên trái)
3. Click **Create New API Key**
4. Cấu hình:
   - **Name**: `web-travel-api` (hoặc tên khác)
   - **Access Type**: Chọn `Full Access` (hoặc `Video Library` nếu muốn giới hạn)
5. Click **Create**
6. Copy **API Key** → Lưu vào `BUNNY_API_KEY`
   ```
   Ví dụ: BUNNY_API_KEY="abcd1234efgh5678ijkl9012..."
   ```

**Bước 5: Cấu hình biến môi trường**
```bash
# .env file
BUNNY_API_KEY="your-api-key-here"
BUNNY_LIBRARY_ID="12345"
```

**Bước 6: Test kết nối (Optional)**
```bash
# Gọi BunnyCDN API để kiểm tra
curl -H "AccessKey: $BUNNY_API_KEY" \
  "https://api.bunnycdn.com/videolibrary/$BUNNY_LIBRARY_ID"
```
Nếu trả về JSON → kết nối thành công ✅

**Lưu ý quan trọng:**
- ✅ API Key được lưu trữ **an toàn**, không bao giờ commit lên Git
- ✅ Kiểm tra quota video (giới hạn upload GB/tháng)
- ✅ Thiết lập **Security** → **Allowed Referrers** để giới hạn domain upload (nếu cần)
- ✅ Có thể tạo múc API Key cho các môi trường khác nhau (dev, staging, prod)
- ⚠️ Nếu bị lộ API Key, **xoá ngay** trong dashboard và tạo key mới

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

Tham khảo `.env.example`

## 8.4 Fly.io Secrets

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

## 8.5 Lưu ý bảo mật

- ❌ **Không** commit file `.env` lên Git (đã trong `.gitignore`)
- ❌ **Không** log ra console giá trị secret
- ✅ Dùng `ConfigService.get<string>('VAR_NAME')` — không dùng `process.env` trực tiếp
- ✅ Fly.io secrets được mã hoá at-rest
- ✅ Chỉ expose các port cần thiết (3000)

---
[← Trang trước](./07-deploy.md) | [Trang sau →](./09-development.md)
