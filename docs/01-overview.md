# 01 — Tổng quan hệ thống (System Overview)

[🏠 Về trang chủ](./README.md)

## 1.1 Giới thiệu

**Web Travel Backend** là REST API phục vụ nền tảng du lịch trực tuyến, cung cấp:

- Quản lý **sản phẩm du lịch** (tour, gói nghỉ dưỡng), kèm hệ thống **lập lịch (tour schedule)** (loại khách, khung giờ khởi hành, điểm đón, ngày khởi hành cụ thể + giá theo ngày)
- Quản lý **nhà cung cấp** (supplier, kèm phương thức nhận thanh toán) và **hướng dẫn viên** (tour guide, có hồ sơ + "moment" video riêng)
- Hệ thống **đặt tour** (booking), **thanh toán online** (PayPal, VNPay) và **đánh giá** (review — hiện chỉ cho tour guide)
- **Xác thực & phân quyền** (JWT: user thường / tour guide / admin / super admin) và **audit trail** (created_by/updated_by/deleted_by) cho các entity quản trị
- Phát video ngắn (short-form video) gắn với sản phẩm hoặc tour guide, tích hợp **BunnyCDN**
- **AI Embedding** để hỗ trợ tìm kiếm semantic
- **Hệ thống tìm kiếm** với gợi ý (suggestions) và thống kê hot search
- Gửi **email thông báo** cho supplier khi có booking mới
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
     → GET /product/:id + GET /product/:id/booking (options, departureTimes, pickupLocations)
     → GET /session?productId=... (chọn ngày khởi hành + xem giá theo unit qua sessionUnits)
     → POST /booking (option, session, passengers[] theo unit, pickup/departure tuỳ chọn)
     → Booking persisted với status = pending
     → POST /payment/paypal/:bookingId/create-order (hoặc /payment/vnpay/:bookingId/create-payment-url)
     → Thanh toán xong → webhook xác nhận → booking.status = paid
```

---

## 1.5 Phạm vi & giới hạn

**Trong phạm vi:**
- CRUD: Product, Supplier (+ Supplier Payment), TourGuide, Tag, Element, Option, Itinerary
- Lập lịch & tồn kho: Unit, Departure Time, Pickup Location, Session, Session Unit (⚠️ capacity chưa enforce được — xem §6.16)
- Booking & thanh toán (PayPal, VNPay) & Review (chỉ cho Tour Guide)
- Authentication / Authorization (JWT — user thường / tour guide / admin / super admin, không phải global guard)
- Audit trail (created_by/updated_by/deleted_by) cho 13 entity quản trị
- Video management + BunnyCDN integration
- File upload (image/file)
- Search logging + suggestions
- AI Embedding cho video
- Email thông báo supplier khi có booking mới
- Cron jobs (daily: tính lại search stat trong tháng, backfill embedding còn thiếu)

**Ngoài phạm vi / chưa hoàn thiện (hiện tại):**
- Giới hạn số chỗ theo ngày (capacity check đang bị tắt)
- Admin dashboard UI
- CI/CD pipeline

---
[Trang sau →](./02-tech-stack.md)
