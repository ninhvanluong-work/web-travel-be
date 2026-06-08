# 06 — Đặc tả Logic Nghiệp vụ (Business Logic)

[🏠 Về trang chủ](./README.md)

## 6.1 Product Module

### 6.1.1 Tạo sản phẩm (Create Product)

**Điều kiện tiên quyết:**
- `destinationId` phải tồn tại trong DB
- `supplierId` phải tồn tại trong DB

**Logic:**
1. Sinh `slug` từ `name` (dùng `generateSlug()` — lowercase + remove diacritics + replace space bằng `-`)
2. Sinh `code` ngẫu nhiên 8 ký tự alphanumeric
3. Lưu sản phẩm với status mặc định = `draft`
4. Nếu có `heroVideoId`: set `video.type = 'hero'` cho toàn bộ video thuộc sản phẩm đó
5. Nếu có `tagIds`: gán M:N relationship với Tag
6. Nếu có `tourGuideIds`: gán M:N relationship với TourGuide
7. Nếu có `elementIds`: gán M:N relationship với Element

### 6.1.2 Cập nhật sản phẩm (Update Product)

**Logic đặc biệt với itinerary (cascade update):**
- Khi có `itineraries[]` trong payload:
  1. Soft delete toàn bộ itinerary cũ của product
  2. Tạo mới hoàn toàn tất cả itinerary từ payload
  3. Không merge — replace hoàn toàn
  
**Logic đặc biệt với Hero Video:**
- Khi đổi `heroVideoId`:
  1. Set tất cả video của product về `type = 'normal'`
  2. Set video được chọn thành `type = 'hero'`
  3. Đảm bảo chỉ 1 video `hero` tồn tại tại mọi thời điểm

### 6.1.3 Product Status Flow

```
draft ──────────────► published ──► hidden
  ▲                       │
  └───────────────────────┘ (có thể quay lại draft)
```

- `draft`: Sản phẩm đang soạn thảo, không hiển thị public
- `published`: Hiển thị trên website, có thể đặt tour
- `hidden`: Tạm ẩn, không hiển thị nhưng vẫn lưu data

---

## 6.2 Video Module

### 6.2.1 Video Types

| Type | Mô tả | Quy tắc |
|------|-------|---------|
| `hero` | Video nổi bật của sản phẩm | Mỗi product chỉ có **đúng 1** video hero |
| `normal` | Video thường | Không giới hạn |

### 6.2.2 Like/Dislike

- `POST /video/:id/like` → tăng `video.like` thêm 1 (atomic update)
- `POST /video/:id/dislike` → giảm `video.like` đi 1 (không xuống dưới 0)
- Không có hệ thống user auth → không track ai đã like

### 6.2.3 AI Embedding Generation

Video embedding được tạo dựa trên context đa nguồn:
```
embedding = AI(
  video.name + video.description,
  product.name + product.description,
  destination.name + destination.description
)
```
- Kết quả là vector `float[]` (pgvector)
- Dùng để tìm kiếm semantic (cosine similarity)
- Gọi external service: `POST {EMBEDDING_API_URL}/embedding/video`

### 6.2.4 Video Upload Flow (Chi tiết)

```
1. Admin gọi POST /upload/video { title }
   → Backend tạo video entry trên BunnyCDN
   → videoId (guid) + tính HMAC signature
   → Return credentials cho client

2. Client tự upload file với TUS protocol trực tiếp lên BunnyCDN
   (không đi qua backend — tiết kiệm bandwidth)

3. BunnyCDN xử lý video:
   - Encode thành HLS
   - Tạo thumbnail
   - Gọi webhook khi hoàn thành

4. Webhook POST /webhook/bunny { VideoGuid, Status }
   → Lookup video theo guid
   → Update video.uploading_status
   → Status 3 (Finished) = video sẵn sàng phát
```

### 6.2.5 Video Preview Generation

- Dùng **FFmpeg** cắt 5 giây đầu từ URL video gốc
- Scale về 640px width (giữ tỷ lệ)
- CRF 28, preset fast, AAC audio 64kbps
- Upload kết quả lên BunnyCDN Storage (folder: `preview/`)
- Xoá file local sau khi upload
- **Dependency**: `ffmpeg` phải được cài trong môi trường (có trong Dockerfile)

---

## 6.3 Searching Module

### 6.3.1 Search Logging

Mỗi lần search được log với:
- `query`: từ khoá
- `ipAddress`: IP người dùng (lấy từ `x-forwarded-for` header hoặc socket)
- `userId`: optional (nếu có)

Đồng thời **upsert SearchingStat**:
- Nếu query đã tồn tại: `total_count++`, `month_count++`, update `last_searched_at`
- Nếu query mới: tạo mới với `total_count = 1`, `month_count = 1`

### 6.3.2 Suggestions Logic

```
getSuggestions(keyword):
  if keyword is empty:
    → return { hotSearches: top 8 by month_count, destinations: [], products: [] }
  
  if keyword has value:
    → parallel fetch:
      - hotSearches: query ILIKE 'keyword%', top 8 by month_count
      - destinations: name ILIKE 'keyword%', take 2
      - products: name ILIKE 'keyword%' AND status = 'published', 
                  order by reviewPoint DESC, take 2
    → return merged result
```

### 6.3.3 Monthly Reset Cron Job (TaskService)

```
Schedule: mỗi đầu tháng (cron: '0 0 1 * *')

Logic:
1. Tính số lần search từng query trong tháng hiện tại
   (aggregate từ searching_log)
2. Update month_count trong searching_stat cho mỗi query
3. Queries không xuất hiện trong tháng → month_count = 0
```

---

## 6.4 Upload Module

### 6.4.1 File Path Convention

```
Format: {fileType}/{folder}/{year}/{month}/wt_{timestamp}.{ext}

Ví dụ:
  img/product/2026/05/wt_1748123456789.jpg
  file/preview/2026/05/wt_1748123456789.mp4
```

### 6.4.2 Validation Rules

| FileType | Phép mở rộng | Xử lý từ chối |
|----------|-------------|---------------|
| `img` | jpg, jpeg, png, webp, gif | `BadRequestException` |
| `file` | Tất cả | Không validate extension |

---

## 6.5 Review Module

### 6.5.1 Tạo Review

- Review gắn với `product_id` và `user_id` (optional)
- `point` từ 1-5 (mặc định 5)
- Có thể kèm mảng ảnh `images[]`

### 6.5.2 Cập nhật Review Stats trên Product

> ⚠️ **Lưu ý**: Hiện tại `product.review_point` và `product.review_count` được quản lý thủ công, chưa có auto-trigger khi tạo/xoá review. Cần update thủ công hoặc thêm cron job.

---

## 6.6 Booking Module

### 6.6.1 Booking Status Flow

```
pending ──► paid
   │
   └──► cancel
```

- `pending`: Vừa tạo, chờ thanh toán
- `paid`: Đã thanh toán xác nhận
- `cancel`: Huỷ (không xoá dữ liệu)

### 6.6.2 Fields

- `booking_date`: Ngày user tạo booking
- `travel_date`: Ngày dự kiến đi du lịch
- `total_price`: Tổng tiền (tính trước khi lưu, không tính lại từ option)
- `quantity`: Số người (không phân loại adult/child riêng ở booking level)

---

## 6.7 Element Module

**Element** là danh mục các tiện ích/thuộc tính tái sử dụng:
- Được tạo 1 lần, gán cho nhiều sản phẩm
- `is_active = false` → không hiển thị dù đã gán vào sản phẩm
- Khi load product detail: tự động filter `elements.filter(e => e.isActive)`

---

## 6.8 Supplier Statistics

Các field thống kê trên `supplier` hiện được cập nhật thủ công:
- `rating_count`: Tổng số đánh giá
- `rating_rate`: Điểm trung bình
- `tour_offered`: Số tour đang hoạt động
- `response_rate`: Tỷ lệ phản hồi
- `exp_years`: Số năm kinh nghiệm

> Chưa có auto-sync từ review/booking. Cần update qua API khi có thay đổi.

---

## 6.9 Webhook Module — BunnyCDN Video Webhook

### 6.9.1 Mục đích

Sau khi client upload video lên BunnyCDN (qua TUS protocol), BunnyCDN tự động gọi webhook `POST /webhook/bunny` để thông báo trạng thái xử lý video (encode, thumbnail, hoàn thành...). Backend nhận sự kiện này để đồng bộ `video.uploading_status` trong database.

---

### 6.9.2 Luồng xử lý (Flow)

```
BunnyCDN (sau khi xử lý video)
    │
    │  POST /webhook/bunny
    │  Headers:
    │    x-bunnystream-signature: <hmac-sha256-hex>
    │    x-bunnystream-signature-version: v1
    │    x-bunnystream-signature-algorithm: hmac-sha256
    │  Body (raw JSON):
    │    { VideoGuid, VideoLibraryId, Status, IsLiveStreamWebhook }
    │
    ▼
WebhookController.handleWebhook()
    │
    ├─ [1] Kiểm tra headers đầy đủ → thiếu → 401 Unauthorized
    │
    ├─ [2] Lấy rawBody (đã được body-parser giữ lại)
    │       → thiếu body → 401 Unauthorized
    │
    ├─ [3] validateWebhookSignature()
    │       → HMAC-SHA256(rawBody, BUNNY_READONLY_API_KEY)
    │       → So sánh timing-safe với header signature
    │       → không khớp → 401 Unauthorized
    │
    ├─ [4] Parse JSON body → BunnyWebhookPayload
    │
    └─ [5] WebhookService.handleBunnyWebhook(payload)
            → VideoService.updateUploadingStatus(VideoGuid, Status)
            → UPDATE video SET uploading_status = ? WHERE guid = ?
            → Return { success: true }
```

---

### 6.9.3 Xác thực chữ ký (Signature Validation)

Đây là bước quan trọng nhất — đảm bảo request thực sự đến từ BunnyCDN, không phải bên thứ ba giả mạo.

**Điều kiện để signature hợp lệ (tất cả phải đúng):**

| Điều kiện | Giá trị hợp lệ | Lỗi nếu sai |
|-----------|---------------|------------|
| `x-bunnystream-signature-version` | phải là `"v1"` | 401 |
| `x-bunnystream-signature-algorithm` | phải là `"hmac-sha256"` | 401 |
| Header signature | chỉ chứa ký tự `[0-9a-f]` (hex) | 401 |
| Độ dài signature | phải bằng đúng độ dài expected hex | 401 |
| Chữ ký HMAC | `HMAC-SHA256(rawBody, BUNNY_READONLY_API_KEY)` phải khớp | 401 |

**Tại sao dùng `timingSafeEqual`?**

So sánh chuỗi thông thường (`===`) dễ bị **timing attack** — kẻ tấn công đo thời gian response để đoán từng ký tự. `crypto.timingSafeEqual()` luôn mất cùng một lượng thời gian bất kể kết quả so sánh → ngăn chặn timing attack.

**Tại sao cần `rawBody`?**

HMAC được tính trên **raw bytes của body**, không phải parsed JSON. Nếu body bị parse rồi `JSON.stringify()` lại, thứ tự key có thể thay đổi → chữ ký sai. `body-parser` được cấu hình trong `main.ts` để giữ `req.rawBody`:

```typescript
// main.ts
app.use(bodyParser.json({
  verify: (req: any, res, buf) => {
    req.rawBody = buf.toString(); // giữ nguyên raw string
  },
}));
```

**Biến môi trường cần thiết:**

| Biến | Mô tả |
|------|-------|
| `BUNNY_READONLY_API_KEY` | Readonly API Key từ BunnyCDN dashboard — dùng làm secret cho HMAC |

> ⚠️ **Khác với `BUNNY_API_KEY`** — `BUNNY_READONLY_API_KEY` là key chỉ đọc, dùng riêng để verify webhook. Cần thêm vào `docs/08-environment.md` và Fly.io secrets.

---

### 6.9.4 BunnyVideoStatus — Bảng trạng thái

| Giá trị (int) | Tên enum | Mô tả |
|--------------|----------|-------|
| `0` | `Queued` | Video đang chờ trong hàng đợi |
| `1` | `Processing` | Đang xử lý (phân tích video) |
| `2` | `Encoding` | Đang encode sang HLS |
| `3` | `Finished` | ✅ Hoàn thành — video sẵn sàng phát |
| `4` | `ResolutionFinished` | Một resolution đã encode xong (nhiều quality) |
| `5` | `Failed` | ❌ Xử lý thất bại |
| `6` | `PresignedUploadStarted` | Bắt đầu upload qua presigned URL |
| `7` | `PresignedUploadFinished` | Upload qua presigned URL xong |
| `8` | `PresignedUploadFailed` | ❌ Upload qua presigned URL thất bại |
| `9` | `CaptionsGenerated` | Phụ đề đã được tạo |
| `10` | `TitleOrDescriptionGenerated` | AI đã sinh title/description |

> BunnyCDN có thể gọi webhook **nhiều lần** với các status khác nhau trong vòng đời 1 video. Backend cập nhật `uploading_status` mỗi lần nhận.

---

### 6.9.5 Payload Interface

```typescript
interface BunnyWebhookPayload {
  IsLiveStreamWebhook: boolean; // false với video thường
  VideoLibraryId: number;       // ID của Video Library
  VideoGuid: string;            // GUID dùng để lookup trong DB
  Status: number;               // BunnyVideoStatus enum value
}
```

---

### 6.9.6 Cấu hình Webhook trên BunnyCDN

Để BunnyCDN biết gọi về đâu, cần đăng ký URL trong dashboard:

1. Vào **BunnyCDN Dashboard** → **Stream** → chọn Video Library
2. Tab **Settings** → **Webhook URL**
3. Điền: `https://web-travel-be.fly.dev/webhook/bunny`
4. Lưu lại — BunnyCDN sẽ tự gọi mỗi khi video thay đổi trạng thái

> ⚠️ Webhook chỉ hoạt động với HTTPS URL public. Khi dev local cần dùng tunnel như **ngrok**: `ngrok http 3000` rồi dùng URL ngrok.

---
[← Trang trước](./05-api-reference.md) | [Trang sau →](./07-deploy.md)
