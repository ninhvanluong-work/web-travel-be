# 03 — Kiến trúc hệ thống (Architecture)

[🏠 Về trang chủ](./README.md)

## 3.1 Cấu trúc thư mục

```
web-travel-be/
├── src/
│   ├── app.module.ts              # Root module
│   ├── main.ts                    # Bootstrap (CORS, Pipes, Swagger, Port)
│   ├── config/
│   │   └── swagger.config.ts      # Swagger setup
│   ├── common/
│   │   ├── guards/                # UserGuard, OptionalUserGuard (JWT)
│   │   ├── decorators/            # @Admin/@SuperAdmin/@TourGuide/@Public, @UserId/@TourGuideId
│   │   ├── filters/                # TelegramExceptionFilter (global exception filter)
│   │   ├── mail/                  # MailModule (@Global) — nodemailer/Gmail SMTP
│   │   ├── constants/             # USER_TOKEN (swagger), tour-guide-skills.json
│   │   └── utils/
│   │       ├── format.ts          # formatApiResponse helper
│   │       ├── gen-code.ts        # generateSlug, generateRandomCode
│   │       └── security.ts        # Security utilities
│   ├── types/
│   │   ├── common.dto.ts          # IdDto, BasicInfoDto
│   │   ├── http.dto.ts            # HTTP response types
│   │   └── pagination.dto.ts      # PaginationResponse, ListItemsResponse
│   ├── database/
│   │   ├── base.entity.ts         # BaseEntity (id, createdAt, updatedAt, deletedAt)
│   │   ├── auditable.entity.ts    # AuditableEntity extends BaseEntity (createdBy/updatedBy/deletedBy)
│   │   ├── database.module.ts     # TypeORM config module
│   │   ├── data-source.ts         # TypeORM DataSource (CLI migration)
│   │   └── migrations/            # TypeORM migration files (timestamp prefix)
│   └── modules/
│       ├── auth/                  # JWT login/register/refresh (§6.5)
│       ├── user/                  # ⚠️ Route toàn bộ bị comment out — không có API
│       ├── supplier/              # Tour suppliers + supplier-payment
│       ├── destination/           # ⚠️ Chưa đăng ký vào AppModule — không có API
│       ├── product/               # Tour products (core entity)
│       ├── option/                # Pricing options per product
│       ├── unit/                  # Loại hành khách (không có controller riêng)
│       ├── departure-time/        # Khung giờ khởi hành
│       ├── pickup-location/       # Điểm đón (không có controller riêng)
│       ├── session/                # Ngày khởi hành cụ thể + capacity
│       ├── session-unit/          # Giá theo (session, unit) — không có controller riêng
│       ├── element/               # Product attribute elements
│       ├── Itinerary/             # Day-by-day itinerary
│       ├── tag/                   # Product tags
│       ├── tour-guide/            # Tour guides (profile, moments, skills)
│       ├── booking/               # Tour bookings
│       ├── payment/                # PayPal + VNPay integration
│       ├── review/                # ⚠️ Chỉ còn review cho Tour Guide, không còn cho Product
│       ├── video/                 # Video management (BunnyCDN)
│       ├── upload/                # File/Video upload handler (⚠️ hiện không auth)
│       ├── webhook/               # BunnyCDN + PayPal + VNPay webhook receiver
│       ├── searching/             # Search log + stat + suggestions
│       ├── embedding/             # AI vector embedding service
│       └── task/                  # Cron jobs (scheduled tasks)
├── docs/                          # Documentation (this folder)
├── certs/                         # SSL certificates (for DB connection)
├── Dockerfile                     # Multi-stage Docker build
├── docker-compose.yml             # Local dev: PostgreSQL + pgvector
├── fly.toml                       # Fly.io deployment config
├── package.json
└── tsconfig.json
```

---

## 3.2 Module Dependency Graph

```
AppModule
├── ConfigModule (global)
├── ScheduleModule
├── MailModule (global)         ← @nestjs-modules/mailer, dùng bởi BookingModule
├── DatabaseModule ← TypeORM + PostgreSQL
├── AuthModule                  ← JWT, dùng UserModule + TourGuideModule
├── UserModule                  
├── ProductModule
│   ├── OptionModule / UnitModule / DepartureTimeModule / PickupLocationModule (nested CRUD)
│   ├── ReviewModule
│   └── ElementModule
├── SessionModule
│   └── SessionUnitModule (nested, không controller riêng)
├── BookingModule
│   ├── ProductModule / OptionModule / SessionModule / PickupLocationModule / DepartureTimeModule
│   └── MailModule
├── PaymentModule (PayPal + VNPay)
│   └── BookingModule
├── VideoModule
│   ├── EmbeddingModule
│   ├── UploadModule
│   └── SearchingModule (for search logging)
├── TaskModule
│   ├── VideoModule
│   └── SearchingModule
├── UploadModule
├── WebhookModule
│   ├── VideoModule
│   └── PaymentModule
├── SearchingModule
├── OptionModule
├── UnitModule                  (empty module — no providers/controllers)
├── DepartureTimeModule
├── PickupLocationModule        (no module registration — entity + DTO only)
├── ElementModule
├── ItineraryModule
├── ReviewModule
├── TourGuideModule
├── TagModule
├── SupplierModule
│   └── SupplierPaymentModule
└── DestinationModule           ⚠️ chưa được import vào AppModule — không có route hoạt động
```

> Chi tiết nghiệp vụ và các gap của từng module mới (auth, audit, session/unit/departure-time/pickup-location, payment, mail): [06-business-logic.md](./06-business-logic.md).

---

## 3.3 Luồng Request tiêu chuẩn

```
HTTP Request
    │
    ▼
ValidationPipe (class-validator transform)
    │
    ▼
UserGuard / OptionalUserGuard (nếu controller có @UseGuards — KHÔNG global, xem §3.3.1)
    │
    ▼
Controller (route matching, param extraction)
    │
    ▼
Service (business logic, TypeORM repository calls)
    │
    ▼
Repository → PostgreSQL
    │
    ▼
formatApiResponse({ data, code, error, message })   ← chỉ áp dụng cho response THÀNH CÔNG
    │
    ▼
HTTP Response (JSON)
```

### Response format chuẩn (success):
```json
{
  "data": { ... },
  "code": 200,
  "error": null,
  "message": "ok"
}
```

### ⚠️ Response khi có exception — shape khác hẳn

`TelegramExceptionFilter` (global exception filter, đăng ký trong `main.ts`) trả lỗi theo shape của NestJS mặc định, **không** đi qua `formatApiResponse()`:
```json
{
  "statusCode": 400,
  "message": "Unit xxx not available for this session",
  "timestamp": "2026-09-20T10:00:00.000Z",
  "path": "/booking"
}
```
Client cần xử lý 2 shape khác nhau tuỳ theo response có lỗi hay không (field `code` vs `statusCode`, có/không có `data`/`error`).

### 3.3.1 Không có Global Guard

Không có `APP_GUARD`/`APP_INTERCEPTOR` nào đăng ký trong `AppModule`. **Mọi route mặc định public** — chỉ được bảo vệ khi controller tự thêm `@UseGuards(UserGuard)` (hoặc `OptionalUserGuard`) + role decorator (`@Admin()`/`@SuperAdmin()`/`@TourGuide()`). Nghĩa là tạo controller/route mới **phải chủ động nhớ** gắn guard — một vài route hiện tại đã bị bỏ sót (upload, xoá tour guide...). Chi tiết: [06-business-logic.md §6.5](./06-business-logic.md#65-auth--authorization) và [§6.16](./06-business-logic.md#616-known-gaps--issues-tổng-hợp).

---

## 3.4 Chiến lược Soft Delete

Tất cả entity kế thừa `BaseEntity` đều có cột `deleted_at` (timestamptz, nullable).

- TypeORM `@DeleteDateColumn` → tự động filter `WHERE deleted_at IS NULL` trong mọi query
- Dữ liệu không bao giờ bị xoá vật lý khỏi DB
- Dùng `softDelete()` hoặc `softRemove()` để xoá logic

---

## 3.5 Conventions

### Naming
- **Controller**: `@Controller('resource-name')` — kebab-case
- **Entity table**: snake_case (ví dụ: `tour_guide`, `searching_log`)
- **Column**: snake_case trong DB, camelCase trong TypeScript
- **FK naming**: `FK_{Entity}_{Relation}` (ví dụ: `FK_Product_Destination`)
- **Migration file**: `{timestamp}-{kebab-description}.ts`

### Code style
- Path alias `src/` thay vì relative imports dài
- DTO: `{action}{Resource}Dto` (ví dụ: `CreateProductDto`, `GetVideoDto`)
- Service method: `findAll`, `findOne`, `create`, `update`, `remove`

### API Response
- Luôn dùng `formatApiResponse()` từ `src/common/utils/format.ts`
- HTTP status code trong body `.code` (không chỉ HTTP status)

---

## 3.6 External Integrations

### BunnyCDN — Video Upload Flow (TUS Protocol)
```
1. Admin: POST /upload/video { title }
2. Backend → BunnyAPI: POST /library/{id}/videos → { guid, ... }
3. Backend tạo HMAC SHA256 signature
4. Return: { videoId, libraryId, expirationTime, signature }
5. Frontend upload file trực tiếp đến BunnyStream (TUS)
6. BunnyCDN xử lý xong → POST /webhook/bunny { VideoGuid, Status }
7. Backend update video.uploadingStatus
```

### BunnyCDN — File Upload Flow
```
1. Client: POST /upload/file (multipart form-data)
2. Backend validate extension (whitelist)
3. Generate path: {fileType}/{folder}/{year}/{month}/wt_{timestamp}.{ext}
4. Upload stream → BunnyStorageSDK
5. Return: { fileType, url }
```

### AI Embedding Service
```
1. VideoService tạo/update video (hoặc ProductService khi set/đổi heroVideoId)
2. Gọi EmbeddingService.generateVideoEmbedding(video)
3. EmbeddingService → POST {EMBEDDING_API_URL}/embedding/video
   Body: { video: {name, desc}, product: {...}, destination: {...} }
4. Nhận vector number[]
5. pgvector.toSql() → lưu vào video.embedding (pgvector column)
```
> Cron job hàng ngày backfill embedding cho video còn thiếu — xem [06-business-logic.md §6.8.3](./06-business-logic.md#683-cron-jobs-taskservice).

### Auth — JWT Flow
```
1. Client: POST /auth/login { email, password }
2. AuthService verify bcrypt → sinh accessToken + refreshToken (JWT_SECRET)
3. Client gắn accessToken vào header Authorization: Bearer <token> cho mọi request cần đăng nhập
4. UserGuard verify token mỗi request, đọc role/userId/tourGuideId từ payload
5. Khi accessToken hết hạn: POST /auth/access-token/renew { refreshToken }
   → so version trong token với user.refresh_token_version trong DB (rotation)
   → cấp lại cả 2 token
```
> Không có global guard — auth chỉ áp dụng cho route tự khai báo `@UseGuards`. Chi tiết: [06-business-logic.md §6.5](./06-business-logic.md#65-auth--authorization).

### Payment — PayPal / VNPay Flow
```
1. Client: POST /payment/{paypal|vnpay}/:bookingId/create-order (hoặc create-payment-url)
   → Backend gọi PayPal/VNPay API, lưu booking_payment(status=pending)
   → Trả về approveUrl (PayPal) hoặc redirect URL (VNPay)
2. Khách thanh toán trên trang PayPal/VNPay
3a. PayPal: server gọi POST /webhook/paypal (nguồn xác nhận chính thức)
3b. VNPay: server gọi GET /webhook/vnpay/ipn (nguồn xác nhận chính thức)
    (song song: browser redirect về /payment/vnpay/return — chỉ để hiển thị UI, không xác nhận)
4. PaymentService.markPaymentSucceeded() → booking_payment.status=succeed, booking.status=paid
   → ghi booking_payment_history
```
> Chi tiết đầy đủ + các gap (không hoàn tồn kho khi fail...): [06-business-logic.md §6.4](./06-business-logic.md#64-payment-module-paypal--vnpay).

---
[← Trang trước](./02-tech-stack.md) | [Trang sau →](./04-database.md)
