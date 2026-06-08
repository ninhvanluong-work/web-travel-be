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
│   │   ├── database.module.ts     # TypeORM config module
│   │   ├── data-source.ts         # TypeORM DataSource (CLI migration)
│   │   └── migrations/            # TypeORM migration files (timestamp prefix)
│   └── modules/
│       ├── user/                  # User management
│       ├── supplier/              # Tour suppliers
│       ├── destination/           # Travel destinations
│       ├── product/               # Tour products (core entity)
│       ├── option/                # Pricing options per product
│       ├── element/               # Product attribute elements
│       ├── Itinerary/             # Day-by-day itinerary
│       ├── tag/                   # Product tags
│       ├── tour-guide/            # Tour guides
│       ├── booking/               # Tour bookings
│       ├── review/                # Product reviews
│       ├── video/                 # Video management (BunnyCDN)
│       ├── upload/                # File/Video upload handler
│       ├── webhook/               # BunnyCDN webhook receiver
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
├── DatabaseModule ← TypeORM + PostgreSQL
├── UserModule
├── ProductModule
│   ├── ReviewModule
│   └── ElementModule
├── VideoModule
│   ├── EmbeddingModule
│   ├── UploadModule
│   └── SearchingModule (for search logging)
├── TaskModule
│   ├── VideoModule
│   └── SearchingModule
├── UploadModule
├── WebhookModule
│   └── VideoModule
├── SearchingModule
├── OptionModule
├── ElementModule
├── ItineraryModule
├── ReviewModule
├── TourGuideModule
├── TagModule
├── SupplierModule
└── DestinationModule
```

---

## 3.3 Luồng Request tiêu chuẩn

```
HTTP Request
    │
    ▼
ValidationPipe (class-validator transform)
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
formatApiResponse({ data, code, error, message })
    │
    ▼
HTTP Response (JSON)
```

### Response format chuẩn:
```json
{
  "data": { ... },
  "code": 200,
  "error": null,
  "message": "ok"
}
```

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
1. VideoService tạo/update video
2. Gọi EmbeddingService.generateVideoEmbedding(video)
3. EmbeddingService → POST {EMBEDDING_API_URL}/embedding/video
   Body: { video: {name, desc}, product: {...}, destination: {...} }
4. Nhận vector number[]
5. pgvector.toSql() → lưu vào video.embedding (pgvector column)
```

---
[← Trang trước](./02-tech-stack.md) | [Trang sau →](./04-database.md)
