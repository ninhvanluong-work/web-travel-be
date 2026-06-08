# 04 — Thiết kế Cơ sở dữ liệu (Database Design)

[🏠 Về trang chủ](./README.md)

## 4.1 Tổng quan

- **Database**: PostgreSQL với extension `pgvector`
- **ORM**: TypeORM (migration-based)
- **Strategy**: Soft delete — tất cả bảng có cột `deleted_at`
- **Primary Key**: UUID v4 (`PrimaryGeneratedColumn('uuid')`)
- **Timestamps**: `timestamptz` (timezone-aware)
- **Design**: https://app.diagrams.net/#G1qDU9ewip1blzRrC4nu-Z4dfZTx_qul6E#%7B%22pageId%22%3A%22qlEHuCFNY7an6GitlOon%22%7D

---

## 4.2 BaseEntity — Cột chung cho mọi bảng

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| `id` | `uuid` PK | Khóa chính UUID |
| `created_at` | `timestamptz` | Thời gian tạo (auto) |
| `updated_at` | `timestamptz` | Thời gian cập nhật (auto) |
| `deleted_at` | `timestamptz` NULL | Soft delete timestamp |

---

## 4.3 Sơ đồ quan hệ (ERD)

```
destination ──< product >── supplier
                  │
          ┌───────┼────────────────────┐
          │       │                    │
        option  itinerary           video
          
product >──< tag              (product_tag)
product >──< element          (product_element)
product >──< tour_guide       (product_tour_guide)

product ──< booking >── user
product ──< review  >── user

user ──< searching_log

searching_stat (standalone — aggregated per query)
```

---

## 4.4 Chi tiết từng bảng

### 4.4.1 `user`

| Cột | Kiểu | Constraint | Mô tả |
|-----|------|-----------|-------|
| `id` | `uuid` | PK | — |
| `name` | `varchar(255)` | NULL | Tên người dùng |
| `ip_address` | `varchar(255)` | NULL | IP lần đầu truy cập |
| `email` | `varchar(255)` | UNIQUE, NULL | Email (optional) |
| `created_at` | `timestamptz` | NOT NULL | — |
| `updated_at` | `timestamptz` | NOT NULL | — |
| `deleted_at` | `timestamptz` | NULL | Soft delete |

**Quan hệ:**
- `1:N` với `booking`
- `1:N` với `review`
- `1:N` với `searching_log`

---

### 4.4.2 `supplier`

| Cột | Kiểu | Constraint | Mô tả |
|-----|------|-----------|-------|
| `id` | `uuid` | PK | — |
| `name` | `varchar(255)` | NOT NULL | Tên nhà cung cấp |
| `contact` | `text` | NULL | Thông tin liên hệ |
| `avatar` | `varchar(500)` | NULL | URL ảnh đại diện |
| `rating_count` | `int` | DEFAULT 0 | Số lượt đánh giá |
| `rating_rate` | `float` | DEFAULT 0 | Điểm đánh giá trung bình |
| `is_verified` | `boolean` | DEFAULT false | Đã xác minh chưa |
| `tour_offered` | `int` | DEFAULT 0 | Số tour đang cung cấp |
| `response_rate` | `float` | DEFAULT 0 | Tỷ lệ phản hồi (%) |
| `exp_years` | `int` | DEFAULT 1 | Số năm kinh nghiệm |

**Quan hệ:**
- `1:N` với `product`

---

### 4.4.3 `destination`

| Cột | Kiểu | Constraint | Mô tả |
|-----|------|-----------|-------|
| `id` | `uuid` | PK | — |
| `name` | `varchar(255)` | NOT NULL | Tên điểm đến |
| `description` | `text` | NULL | Mô tả điểm đến |

**Quan hệ:**
- `1:N` với `product`

---

### 4.4.4 `product` ⭐ (Bảng trung tâm)

| Cột | Kiểu | Constraint | Mô tả |
|-----|------|-----------|-------|
| `id` | `uuid` | PK | — |
| `name` | `varchar(500)` | NOT NULL | Tên tour |
| `description` | `text` | NULL | Mô tả đầy đủ |
| `short_description` | `text` | NULL | Mô tả ngắn |
| `slug` | `varchar` | UNIQUE, NULL | URL-friendly slug |
| `thumbnail` | `varchar` | NULL | URL ảnh đại diện |
| `code` | `varchar(255)` | NULL | Mã sản phẩm (8 ký tự random) |
| `images` | `json` | NULL | Mảng URL ảnh |
| `banner` | `jsonb` | DEFAULT `[]` | Mảng banner (`[{type, url}]`) |
| `read_before` | `jsonb` | DEFAULT `[]` | Lưu ý trước khi đi (`[{key, title, description}]`) |
| `experience` | `jsonb` | DEFAULT `[]` | Trải nghiệm (`[{imageUrl, title, content}]`) |
| `itinerary_image` | `varchar` | NULL | Ảnh lịch trình tổng quan |
| `duration` | `int` | DEFAULT 1 | Thời lượng |
| `duration_type` | `varchar` | DEFAULT `'day'` | Đơn vị: `day`, `hour` |
| `highlight` | `text` | NULL | Điểm nổi bật |
| `include` | `text` | NULL | Bao gồm trong tour |
| `exclude` | `text` | NULL | Không bao gồm |
| `status` | `enum` | DEFAULT `draft` | `draft` \| `published` \| `hidden` |
| `min_price` | `decimal(12,2)` | DEFAULT 0 | Giá thấp nhất |
| `review_point` | `float` | DEFAULT 0 | Điểm đánh giá trung bình |
| `review_count` | `int` | DEFAULT 0 | Tổng số đánh giá |
| `destination_id` | `uuid` | FK → destination | — |
| `supplier_id` | `uuid` | FK → supplier | — |

**JSONB Schema chi tiết:**

```typescript
// banner[]
{ type: 'image' | 'video'; url: string }

// readBefore[]
{ key: string; title: string; description: string }

// experience[]
{ imageUrl: string; title: string; content: string }
```

**Quan hệ:**
- `N:1` với `destination`
- `N:1` với `supplier`
- `1:N` với `video`, `booking`, `option`, `review`, `itinerary`
- `N:N` với `tag` (junction: `product_tag`)
- `N:N` với `element` (junction: `product_element`)
- `N:N` với `tour_guide` (junction: `product_tour_guide`)

---

### 4.4.5 `option`

| Cột | Kiểu | Constraint | Mô tả |
|-----|------|-----------|-------|
| `id` | `uuid` | PK | — |
| `title` | `varchar(500)` | NOT NULL | Tên gói (VD: "Gói Standard") |
| `description` | `text` | NULL | Mô tả gói |
| `adult_price` | `int` | DEFAULT 0 | Giá người lớn |
| `child_price` | `int` | DEFAULT 0 | Giá trẻ em |
| `infant_price` | `int` | DEFAULT 0 | Giá em bé |
| `currency` | `varchar` | DEFAULT `'VND'` | Đơn vị tiền tệ |
| `product_id` | `uuid` | FK → product | — |

---

### 4.4.6 `itinerary`

| Cột | Kiểu | Constraint | Mô tả |
|-----|------|-----------|-------|
| `id` | `uuid` | PK | — |
| `name` | `varchar` | NOT NULL | Tiêu đề ngày (VD: "Ngày 1: Khởi hành") |
| `featured_name` | `varchar(255)` | NULL | Nhãn hiển thị (VD: "Ngày 1") |
| `order` | `int` | DEFAULT 1 | Thứ tự hiển thị |
| `description` | `text` | NULL | Nội dung chi tiết ngày |
| `product_id` | `uuid` | FK → product | — |

> ⚠️ Khi update sản phẩm, toàn bộ itinerary cũ sẽ bị **soft delete** và tạo lại hoàn toàn.

---

### 4.4.7 `booking`

| Cột | Kiểu | Constraint | Mô tả |
|-----|------|-----------|-------|
| `id` | `uuid` | PK | — |
| `booking_date` | `timestamptz` | NULL | Ngày đặt tour |
| `travel_date` | `timestamptz` | NULL | Ngày đi du lịch |
| `quantity` | `int` | DEFAULT 1 | Số lượng khách |
| `total_price` | `decimal(12,2)` | DEFAULT 0 | Tổng tiền |
| `status` | `varchar(50)` | DEFAULT `pending` | `paid` \| `pending` \| `cancel` |
| `email` | `varchar(255)` | NULL | Email liên hệ |
| `phone` | `varchar(255)` | NULL | Số điện thoại |
| `user_id` | `uuid` | FK → user | — |
| `product_id` | `uuid` | FK → product | — |

---

### 4.4.8 `review`

| Cột | Kiểu | Constraint | Mô tả |
|-----|------|-----------|-------|
| `id` | `uuid` | PK | — |
| `comment` | `text` | NULL | Nội dung đánh giá |
| `point` | `float` | DEFAULT 5 | Điểm (1-5) |
| `images` | `varchar(500)[]` | NULL | Mảng URL ảnh kèm review |
| `product_id` | `uuid` | FK → product | — |
| `user_id` | `uuid` | FK → user (nullable) | — |

---

### 4.4.9 `video`

| Cột | Kiểu | Constraint | Mô tả |
|-----|------|-----------|-------|
| `id` | `uuid` | PK | — |
| `name` | `varchar(500)` | NOT NULL | Tên video |
| `slug` | `varchar` | NULL | URL slug |
| `url` | `varchar(500)` | NULL | URL video gốc |
| `embed_url` | `varchar` | NULL | URL nhúng (iframe) |
| `short_url` | `varchar(500)` | NULL | URL rút gọn |
| `thumbnail` | `varchar` | NULL | URL ảnh thumbnail |
| `description` | `text` | NULL | Mô tả video |
| `tag` | `varchar(255)` | NULL | Tags (comma-separated) |
| `embedding` | `varchar` | NULL | pgvector embedding string |
| `like` | `int` | DEFAULT 0 | Số lượt thích |
| `type` | `varchar(50)` | DEFAULT `normal` | `hero` \| `normal` |
| `guid` | `varchar(255)` | UNIQUE, NULL | BunnyCDN video GUID |
| `uploading_status` | `int` | NULL | Trạng thái upload BunnyCDN |
| `product_id` | `uuid` | FK → product | — |

**Video Types:**
- `hero`: Video nổi bật của sản phẩm (1 sản phẩm chỉ có 1)
- `normal`: Video bình thường

**BunnyVideoStatus** (integer enum từ BunnyCDN):
- `0`: Queued
- `1`: Processing
- `2`: Encoding
- `3`: Finished
- `4`: Error
- `5`: UploadFailed
- `6`: Captions processing

---

### 4.4.10 `element`

| Cột | Kiểu | Constraint | Mô tả |
|-----|------|-----------|-------|
| `id` | `uuid` | PK | — |
| `key` | `varchar(255)` | NOT NULL | Key duy nhất (VD: `include_breakfast`) |
| `name` | `varchar(255)` | NOT NULL | Tên hiển thị |
| `description` | `text` | NULL | Mô tả |
| `is_active` | `boolean` | DEFAULT true | Trạng thái kích hoạt |

> Element là các thuộc tính/tiện ích chung có thể gắn vào nhiều sản phẩm (VD: "Bao gồm bữa sáng", "WiFi miễn phí").

---

### 4.4.11 `tag`

| Cột | Kiểu | Constraint | Mô tả |
|-----|------|-----------|-------|
| `id` | `uuid` | PK | — |
| `name` | `varchar(255)` | UNIQUE, NOT NULL | Tên tag (VD: `adventure`, `family`) |

---

### 4.4.12 `tour_guide`

| Cột | Kiểu | Constraint | Mô tả |
|-----|------|-----------|-------|
| `id` | `uuid` | PK | — |
| `name` | `varchar(255)` | NOT NULL | Tên hướng dẫn viên |
| `avatar` | `varchar` | NULL | URL ảnh đại diện |
| `rating_count` | `int` | DEFAULT 0 | Số lượt đánh giá |
| `exp_year` | `int` | DEFAULT 0 | Số năm kinh nghiệm |
| `rating_star` | `float` | DEFAULT 0 | Điểm trung bình |

---

### 4.4.13 `searching_log`

| Cột | Kiểu | Constraint | Mô tả |
|-----|------|-----------|-------|
| `id` | `uuid` | PK | — |
| `query` | `text` | NOT NULL | Từ khoá tìm kiếm |
| `ip_address` | `varchar(50)` | NOT NULL | IP người tìm kiếm |
| `user_id` | `uuid` | FK → user, NULL | User (nếu có) |

> Ghi lại từng lần tìm kiếm. Dùng để tính `searching_stat`.

---

### 4.4.14 `searching_stat`

| Cột | Kiểu | Constraint | Mô tả |
|-----|------|-----------|-------|
| `id` | `uuid` | PK | — |
| `query` | `text` | UNIQUE, NOT NULL | Từ khoá |
| `total_count` | `int` | DEFAULT 1 | Tổng số lần tìm kiếm (all-time) |
| `month_count` | `int` | DEFAULT 1 | Số lần trong tháng hiện tại |
| `last_searched_at` | `timestamptz` | NOT NULL | Lần cuối tìm kiếm |

> Được reset `month_count` hàng tháng bởi cron job.

---

## 4.5 Junction Tables (Many-to-Many)

| Bảng | Cột | Mô tả |
|------|-----|-------|
| `product_tag` | `product_id`, `tag_id` | Product ↔ Tag |
| `product_element` | `product_id`, `element_id` | Product ↔ Element |
| `product_tour_guide` | `product_id`, `tour_guide_id` | Product ↔ TourGuide |

---

## 4.6 Indexes đáng chú ý

| Bảng | Cột | Lý do |
|------|-----|-------|
| `product` | `slug` (UNIQUE) | Lookup theo URL slug |
| `product` | `status` | Filter theo trạng thái published |
| `video` | `guid` (UNIQUE) | BunnyCDN webhook lookup |
| `tag` | `name` (UNIQUE) | Không trùng tag |
| `searching_stat` | `query` (UNIQUE) | Upsert nhanh |
| `user` | `email` (UNIQUE) | Không trùng email |

---

## 4.7 Migrations

Migrations nằm trong `src/database/migrations/`, được đặt tên theo pattern:
```
{unix_timestamp}-{mô-tả-kebab}.ts
```

Ví dụ:
```
1772294941040-init.ts
1778422951994-review-images.ts
1778830254119-year-exp.ts
```

**Các lệnh:**
```bash
# Chạy migration
yarn migration:run

# Tạo migration mới
yarn migration:generate src/database/migrations/ten-migration

# Rollback migration cuối
yarn migration:revert
```

---
[← Trang trước](./03-architecture.md) | [Trang sau →](./05-api-reference.md)
