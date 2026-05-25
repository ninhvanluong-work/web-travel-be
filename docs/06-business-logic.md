# 06 — Đặc tả Logic Nghiệp vụ (Business Logic)

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
