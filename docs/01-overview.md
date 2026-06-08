# 01 — Tổng quan hệ thống (System Overview)

[🏠 Về trang chủ](./README.md)

## 1.1 Giới thiệu

**Web Travel Backend** là REST API phục vụ nền tảng du lịch trực tuyến, cung cấp:

- Quản lý **sản phẩm du lịch** (tour, gói nghỉ dưỡng)
- Quản lý **nhà cung cấp** (supplier), **điểm đến** (destination), **hướng dẫn viên** (tour guide)
- Hệ thống **đặt tour** (booking) và **đánh giá** (review)
- Phát video ngắn (short-form video) gắn với sản phẩm, tích hợp **BunnyCDN**
- **AI Embedding** để hỗ trợ tìm kiếm semantic
- **Hệ thống tìm kiếm** với gợi ý (suggestions) và thống kê hot search

---

## 1.2 Bối cảnh hệ thống (Context Diagram)

```
┌───────────────────────────────────────────────────────┐
│                   Client Applications                 │
│         (Web Frontend / Mobile App / Admin Panel)     │
└───────────────────────┬───────────────────────────────┘
                        │ HTTPS REST API
                        ▼
┌───────────────────────────────────────────────────────┐
│              Web Travel Backend (NestJS)              │
│                   Port: 3000                          │
│                                                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐ │
│  │ Product  │ │  Video   │ │Searching │ │Booking  │ │
│  │ Module   │ │  Module  │ │ Module   │ │ Module  │ │
│  └──────────┘ └──────────┘ └──────────┘ └─────────┘ │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐ │
│  │ Upload   │ │Embedding │ │ Webhook  │ │  Task   │ │
│  │ Module   │ │ Module   │ │ Module   │ │(Cron)   │ │
│  └──────────┘ └──────────┘ └──────────┘ └─────────┘ │
└───────┬───────────────┬──────────────┬────────────────┘
        │               │              │
        ▼               ▼              ▼
┌──────────────┐ ┌─────────────┐ ┌──────────────────┐
│  PostgreSQL  │ │  BunnyCDN   │ │  AI Embedding    │
│ + pgvector   │ │ (Storage +  │ │  Service (HTTP)  │
│              │ │  Video CDN) │ │                  │
└──────────────┘ └─────────────┘ └──────────────────┘
```

---

## 1.3 Các thành phần chính

| Thành phần | Mô tả |
|------------|-------|
| **NestJS App** | Core application server, cổng 3000 |
| **PostgreSQL** | Cơ sở dữ liệu quan hệ chính + extension pgvector (AI embedding) |
| **BunnyCDN** | Lưu trữ file ảnh (Storage Zone) + streaming video (Video Library) |
| **AI Embedding Service** | Microservice ngoài, sinh vector embedding cho tìm kiếm semantic |
| **FFmpeg** | Tích hợp trong Docker image, cắt video preview 5 giây |
| **Fly.io** | Hosting & deployment (region: Hong Kong) |

---

## 1.4 Luồng người dùng cốt lõi (Core User Flows)

### Luồng xem & tìm kiếm tour
```
User → Search keyword
     → [SearchingService] Log → SearchingLog table
     → [SearchingService] Upsert → SearchingStat table
     → Return suggestions (hot searches + destinations + products)
     → User clicks product → GET /product/:id → ProductDetail
```

### Luồng xem video
```
User → GET /video?query=...
     → Log search query
     → Return paginated videos (with embedding similarity if needed)
     → User likes → POST /video/:id/like
```

### Luồng upload video (Admin)
```
Admin → POST /upload/video (title)
      → BunnyAPI: create video slot → return videoId + signature
      → Frontend upload directly to BunnyStream with TUS protocol
      → BunnyCDN webhook → POST /webhook/bunny
      → [WebhookService] → update video.uploadingStatus
```

### Luồng đặt tour
```
User → GET /product (browse)
     → GET /product/:id (detail + options + itinerary)
     → POST /booking (select option, date, quantity)
     → Booking persisted với status = pending
```

---

## 1.5 Phạm vi & giới hạn

**Trong phạm vi:**
- CRUD: Product, Supplier, Destination, TourGuide, Tag, Element, Option, Itinerary
- Booking & Review
- Video management + BunnyCDN integration
- File upload (image)
- Search logging + suggestions
- AI Embedding cho video
- Cron jobs (monthly search stat reset)

**Ngoài phạm vi (hiện tại):**
- Authentication / Authorization (không có JWT/OAuth)
- Payment gateway
- Email notification
- Admin dashboard UI

---
[Trang sau →](./02-tech-stack.md)
