# 07 — Hướng dẫn Deploy

## 7.1 Môi trường

| Môi trường | Mô tả | URL |
|------------|-------|-----|
| **Local** | Development trên máy cá nhân | `http://localhost:3000` |
| **Production** | Fly.io (Hong Kong region) | `https://web-travel-be.fly.dev` |

---

## 7.2 Local Development

### Yêu cầu hệ thống
- Node.js >= 22.x
- Yarn >= 1.22
- Docker & Docker Compose
- (Optional) FFmpeg (nếu cần tính năng video preview)

### Bước 1: Clone & install
```bash
git clone https://github.com/ninhvanluong-work/web-travel-be.git
cd web-travel-be
yarn install
```

### Bước 2: Tạo file `.env`
```bash
cp .env.example .env
# Điền các giá trị cần thiết (xem docs/08-environment.md)
```

### Bước 3: Khởi động PostgreSQL local
```bash
docker-compose up -d
# PostgreSQL chạy tại: localhost:5555
# User: admin | Password: admin | DB: defaultdb
```

### Bước 4: Chạy database migrations
```bash
yarn migration:run
```

### Bước 5: Start server
```bash
yarn start:dev   # Development với hot reload
# hoặc
yarn start       # Production build
```

### Swagger UI
Truy cập: `http://localhost:3000/docs`

---

## 7.3 Docker Build

### Build image
```bash
docker build -t web-travel-be .
```

### Chạy container
```bash
docker run -p 3000:3000 \
  --env-file .env \
  web-travel-be
```

### Dockerfile — Multi-stage Build

```
Stage 1 (build):
  - Base: node:22.13.1-slim
  - Install build tools (build-essential, python, pkg-config)
  - yarn install --frozen-lockfile (bao gồm devDeps)
  - yarn build → dist/

Stage 2 (production):
  - Base: node:22.13.1-slim
  - Install ffmpeg (cho video preview feature)
  - Copy toàn bộ /app từ build stage
  - EXPOSE 3000
  - CMD: yarn start (chạy dist/main.js)
```

**Lưu ý**: Image production có `ffmpeg` pre-installed.

---

## 7.4 Fly.io Deployment

### Cài Fly CLI
```bash
# macOS/Linux
curl -L https://fly.io/install.sh | sh

# Windows
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

### Login
```bash
fly auth login
```

### Deploy lần đầu
```bash
fly launch
# Fly.io sẽ đọc fly.toml và tự detect NestJS
```

### Deploy update
```bash
fly deploy
```

### Cấu hình Fly.io (`fly.toml`)

```toml
app = 'web-travel-be'
primary_region = 'hkg'      # Hong Kong

[http_service]
  internal_port = 3000
  force_https = true          # Auto redirect HTTP → HTTPS
  auto_stop_machines = 'stop' # Tắt khi không có traffic
  auto_start_machines = true  # Tự khởi động khi có request
  min_machines_running = 1    # Luôn giữ 1 machine chạy

[[vm]]
  memory = '1gb'
  cpu_kind = 'shared'
  cpus = 1
```

### Quản lý Secrets (Env Vars)
```bash
# Set trực tiếp trên fly
https://fly.io/apps/web-travel-be/secrets
# Set bằng terminal
# Set secret
fly secrets set DATABASE_URL="postgres://..."
fly secrets set BUNNY_API_KEY="your-key"

# Xem danh sách secrets (không hiện value)
fly secrets list

# Import từ file .env
fly secrets import < .env
```

### Database Production

Fly.io không host PostgreSQL trong project này. Database production được kết nối qua:
- **Managed PostgreSQL** (ví dụ: Supabase, Neon, Railway, hoặc Fly Postgres)
- Cần có SSL certificate (`certs/ca-certificate.crt`)
- Connection string trong `DATABASE_URL` env var

### Xem Logs
```bash
fly logs                    # Real-time logs
fly logs --tail 100         # 100 dòng gần nhất
```

### SSH vào container
```bash
fly ssh console
```

### Monitoring
```bash
fly status                  # Trạng thái app
fly vm status               # Trạng thái VM
```

---

## 7.5 Database Migration trên Production

```bash
# SSH vào Fly machine
fly ssh console

# Trong container
cd /app
yarn migration:run
```

Hoặc dùng Fly Run:
```bash
fly ssh console -C "cd /app && yarn migration:run"
```

---

## 7.6 CI/CD (Khuyến nghị)

Chưa có CI/CD pipeline. Khuyến nghị setup:

```yaml
# .github/workflows/deploy.yml
name: Deploy to Fly.io

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --remote-only
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

---

## 7.7 Checklist Deploy Production

- [ ] Tất cả secrets đã được set trên Fly.io
- [ ] `DATABASE_URL` trỏ đến production DB
- [ ] SSL certificate (`ca-certificate.crt`) đã được cấu hình
- [ ] Migrations đã chạy trên production DB
- [ ] BunnyCDN Storage Zone và Video Library đã tạo
- [ ] `BUNNY_API_KEY`, `BUNNY_LIBRARY_ID`, `BUNNY_STORAGE_ZONE` đã set
- [ ] `EMBEDDING_API_URL` trỏ đến AI service đang chạy
- [ ] Webhook URL đã được đăng ký trên BunnyCDN dashboard
- [ ] Swagger UI accessible tại `/docs`
- [ ] Health check endpoint `/` trả về 200
