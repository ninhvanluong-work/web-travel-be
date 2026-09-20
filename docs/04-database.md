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

### AuditableEntity — Cột bổ sung cho 13 bảng "kiểu CMS"

`AuditableEntity extends BaseEntity`, thêm 3 cột (migration `1789000000000-add-audit-columns.ts`):

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| `created_by` | `uuid` NULL | Người tạo (không có FK constraint tới `user.id`) |
| `updated_by` | `uuid` NULL | Người cập nhật gần nhất |
| `deleted_by` | `uuid` NULL | Người soft-delete |

Áp dụng cho: `product`, `destination`, `element`, `itinerary`, `option`, `pickup_location`, `supplier`, `tour_guide`, `unit`, `tag`, `video`, `departure_time`, `session`. Các bảng còn lại (`user`, `booking`, `booking_payment`, `booking_payment_history`, `review`, `supplier_payment`, `searching_log`, `session_unit`) vẫn dùng `BaseEntity` thường, không có audit. Chi tiết cách hoạt động: [06-business-logic.md §6.6](./06-business-logic.md#66-audit-trail).

---

## 4.3 Sơ đồ quan hệ (ERD)

```
destination ──< product >── supplier
                  │
          ┌───────┼──────────┬──────────────┬───────────────┬──────────────┐
          │       │          │              │               │              │
        option  itinerary  video          unit        departure_time  pickup_location
                                             │
                                          session ──< session_unit >── unit
                                             ▲
                                             │ (tour_session_id)
product >──< tag              (product_tag)
product >──< element          (product_element)
product >──< tour_guide       (product_tour_guide)

booking ──> product, option, session, departure_time, pickup_location, supplier, user
booking ──< booking_payment ──< booking_payment_history
booking ──> booking  (booking_payment_history duplicates booking_id)

product ──< review  (qua product_id, chỉ đọc — không còn API tạo review cho product)
tour_guide ──< review (POST /review/tour-guide/:id — API review đang hoạt động)

user ──< searching_log
supplier ──< supplier_payment

searching_stat (standalone — aggregated per query)
```

> Xem chi tiết nghiệp vụ của cụm `unit / departure_time / pickup_location / session / session_unit` (hệ thống lập lịch & tồn kho) tại [06-business-logic.md §6.2](./06-business-logic.md#62-tour-scheduling--inventory).

---

## 4.4 Chi tiết từng bảng

### 4.4.1 `user`

| Cột | Kiểu | Constraint | Mô tả |
|-----|------|-----------|-------|
| `id` | `uuid` | PK | — |
| `name` | `varchar(255)` | NULL | Tên người dùng |
| `ip_address` | `varchar(255)` | NULL | IP lần đầu truy cập |
| `email` | `varchar(255)` | UNIQUE, NULL | Email (optional) |
| `password` | `varchar(500)` | NULL | Hash bcrypt |
| `role` | `varchar(50)` | DEFAULT `'normal'` | `normal` \| `tour_guide` \| `admin` \| `super_admin` |
| `tour_guide_id` | `uuid` | FK → tour_guide, UNIQUE, NULL | Gắn user với hồ sơ tour guide (nếu role = tour_guide) |
| `refresh_token_version` | `int` | DEFAULT 1 | Tăng lên mỗi lần logout/renew để vô hiệu hoá refresh token cũ (rotation) |
| `reset_password_token` | `varchar(500)` | NULL | Hash SHA-256 của token reset password |
| `reset_password_token_exp` | `timestamptz` | NULL | Hết hạn 5 phút sau khi sinh |
| `created_at` | `timestamptz` | NOT NULL | — |
| `updated_at` | `timestamptz` | NOT NULL | — |
| `deleted_at` | `timestamptz` | NULL | Soft delete |

**Quan hệ:**
- `1:N` với `booking`
- `1:N` với `review`
- `1:N` với `searching_log`
- `N:1` với `tour_guide` (qua `tour_guide_id`)

> ⚠️ Không có API CRUD nào hoạt động cho bảng này — `UserController` hiện có toàn bộ route bị comment out. Chi tiết cơ chế đăng nhập/JWT: [06-business-logic.md §6.5](./06-business-logic.md#65-auth--authorization).

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
| `highlight` | `text` | NULL | Điểm nổi bật |
| `include` | `text` | NULL | Bao gồm trong tour |
| `exclude` | `text` | NULL | Không bao gồm |
| `status` | `enum` | DEFAULT `draft` | `draft` \| `published` \| `hidden` |
| `min_price` | `decimal(12,2)` | DEFAULT 0 | Giá thấp nhất |
| `currency` | `varchar(255)` | DEFAULT `'VND'` | Đơn vị tiền tệ (snapshot vào `booking.currency` khi đặt) |
| `review_point` | `float` | DEFAULT 0 | Điểm đánh giá trung bình (⚠️ vẫn cập nhật thủ công) |
| `review_count` | `int` | DEFAULT 0 | Tổng số đánh giá (⚠️ vẫn cập nhật thủ công) |
| `destination_id` | `uuid` | FK → destination | — |
| `supplier_id` | `uuid` | FK → supplier | — |
| `created_by` / `updated_by` / `deleted_by` | `uuid` NULL | Audit columns (`AuditableEntity`) | Xem [§4.2](#42-baseentity--cột-chung-cho-mọi-bảng) |

> ⚠️ `duration` và `duration_type` từng tồn tại nhưng đã bị **xoá** khỏi bảng (migration `1780156495637-product-remove-duration.ts`) — không còn trên entity hiện tại.

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
- `1:N` với `video`, `booking`, `option`, `review`, `itinerary`, `unit`, `departure_time`, `pickup_location`, `session`
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
| `created_by` / `updated_by` / `deleted_by` | `uuid` NULL | Audit columns | |

> ⚠️ `option` **không còn** liên kết trực tiếp tới `session`/`departure_time`/`pickup_location`/`unit` — các FK này đã được migrate sang `product`. `Option` giờ chỉ đóng vai trò gói hiển thị, được `booking.option_id` tham chiếu như một lựa chọn/snapshot, không ảnh hưởng giá hay tồn kho. Chi tiết: [06-business-logic.md §6.2](./06-business-logic.md#62-tour-scheduling--inventory).

---

### 4.4.6 `unit` — Loại hành khách (mới)

| Cột | Kiểu | Constraint | Mô tả |
|-----|------|-----------|-------|
| `id` | `uuid` | PK | — |
| `name` | `varchar(255)` | NOT NULL | VD: "Người lớn", "Trẻ em" |
| `note` | `text` | NULL | Ghi chú |
| `product_id` | `uuid` | FK → product, NULL | — |
| `created_by` / `updated_by` / `deleted_by` | `uuid` NULL | Audit columns | |

**Quan hệ:** `N:1` với `product`, `1:N` với `session_unit`. Không có controller/service riêng — chỉ CRUD qua `POST/PUT /product`.

---

### 4.4.7 `departure_time` — Khung giờ khởi hành (mới)

| Cột | Kiểu | Constraint | Mô tả |
|-----|------|-----------|-------|
| `id` | `uuid` | PK | — |
| `product_id` | `uuid` | FK → product, NOT NULL | — |
| `time` | `time` | NOT NULL | VD: `07:30:00` |
| `label` | `varchar(255)` | NULL | VD: "Khởi hành sáng" |
| `order` | `int` | DEFAULT 0 | Thứ tự hiển thị |
| `is_active` | `boolean` | DEFAULT true | — |
| `note` | `text` | NULL | — |
| `created_by` / `updated_by` / `deleted_by` | `uuid` NULL | Audit columns | |

Có controller riêng `/departure-time` **và** có thể quản lý qua `PUT /product/:id` (2 đường vào cùng dữ liệu).

---

### 4.4.8 `pickup_location` — Điểm đón (mới)

| Cột | Kiểu | Constraint | Mô tả |
|-----|------|-----------|-------|
| `id` | `uuid` | PK | — |
| `product_id` | `uuid` | FK → product, NOT NULL | — |
| `name` | `varchar(500)` | NOT NULL | — |
| `address` | `varchar(500)` | NULL | — |
| `is_popular` | `boolean` | DEFAULT false | — |
| `map_url` | `varchar(500)` | NULL | — |
| `order` | `int` | DEFAULT 0 | — |
| `created_by` / `updated_by` / `deleted_by` | `uuid` NULL | Audit columns | |

Không có controller/service riêng — chỉ CRUD qua `POST/PUT /product`. Không có cột giá — chọn điểm đón không phát sinh phụ phí.

---

### 4.4.9 `session` — Ngày khởi hành cụ thể (mới, tên cũ `tour_session`)

| Cột | Kiểu | Constraint | Mô tả |
|-----|------|-----------|-------|
| `id` | `uuid` | PK | — |
| `product_id` | `uuid` | FK → product, NULL | — |
| `travel_date` | `timestamptz` | NULL | Ngày khởi hành |
| `capacity` | `int` | DEFAULT 0 | Số chỗ tối đa — ⚠️ hiện không có API nào set khác 0 |
| `status` | `varchar(50)` | DEFAULT `'inactive'` | `active` \| `inactive` |
| `created_by` / `updated_by` / `deleted_by` | `uuid` NULL | Audit columns | |

**Quan hệ:** `N:1` với `product`, `1:N` với `session_unit`. `booking.tour_session_id` FK tới bảng này. Chi tiết nghiệp vụ (dedup theo ngày, tạo hàng loạt theo khoảng ngày, gap về capacity): [06-business-logic.md §6.2.4](./06-business-logic.md#624-session--ngày-khởi-hành-cụ-thể).

---

### 4.4.10 `session_unit` — Giá theo ngày (mới)

| Cột | Kiểu | Constraint | Mô tả |
|-----|------|-----------|-------|
| `id` | `uuid` | PK | — |
| `session_id` | `uuid` | FK → session, NOT NULL | — |
| `unit_id` | `uuid` | FK → unit, NOT NULL | — |
| `price` | `decimal(12,2)` | DEFAULT 0 | Giá của unit này tại session/ngày này |

Unique constraint `(session_id, unit_id)`. **Không có audit columns** (chỉ `BaseEntity`), không có controller riêng — quản lý qua `SessionService`.

---

### 4.4.11 `itinerary`

| Cột | Kiểu | Constraint | Mô tả |
|-----|------|-----------|-------|
| `id` | `uuid` | PK | — |
| `name` | `varchar` | NOT NULL | Tiêu đề ngày (VD: "Ngày 1: Khởi hành") |
| `featured_name` | `varchar(255)` | NULL | Nhãn hiển thị (VD: "Ngày 1") |
| `order` | `int` | DEFAULT 1 | Thứ tự hiển thị |
| `description` | `text` | NULL | Nội dung chi tiết ngày |
| `product_id` | `uuid` | FK → product | — |
| `created_by` / `updated_by` / `deleted_by` | `uuid` NULL | Audit columns | |

> ⚠️ Khi update sản phẩm, toàn bộ itinerary cũ sẽ bị **soft delete** (kèm stamp `deleted_by`) và tạo lại hoàn toàn — khác với cách `option`/`unit`/`departureTime`/`pickupLocation` được đồng bộ theo `id` (xem [06-business-logic.md §6.1.2](./06-business-logic.md#612-cập-nhật-sản-phẩm-update-product)).

---

### 4.4.12 `booking`

| Cột | Kiểu | Constraint | Mô tả |
|-----|------|-----------|-------|
| `id` | `uuid` | PK | — |
| `booking_code` | `varchar(50)` | UNIQUE, NULL | Mã booking tự sinh (`BK` + timestamp base36 + 3 byte hex) |
| `travel_date` | `timestamptz` | NULL | Ngày đi (snapshot từ session) |
| `product_id` | `uuid` | FK → product, NULL | — |
| `product_name` | `varchar(500)` | NULL | Snapshot tên sản phẩm |
| `option_id` | `uuid` | FK → option, NULL | — |
| `option_name` | `varchar(500)` | NULL | Snapshot tên gói |
| `tour_session_id` | `uuid` | FK → session, NULL | ⚠️ tên cột vẫn giữ `tour_session_id` dù bảng đích đã đổi tên thành `session` |
| `pickup_location_id` | `uuid` | FK → pickup_location, NULL | — |
| `pickup_location_name` | `varchar(500)` | NULL | Snapshot tên điểm đón |
| `departure_id` | `uuid` | FK → departure_time, NULL | — |
| `departure_time` | `time` | NULL | Snapshot giờ khởi hành |
| `departure_label` | `varchar(255)` | NULL | Snapshot nhãn khởi hành |
| `passengers` | `jsonb` | DEFAULT `[]` | `[{unitId, unitName, price, count}]` — snapshot, không phải FK sống |
| `total_price` | `decimal(12,2)` | DEFAULT 0 | Tính 1 lần khi tạo booking |
| `currency` | `varchar(10)` | DEFAULT `'VND'` | Snapshot từ `product.currency` |
| `status` | `varchar(50)` | DEFAULT `'pending'` | `pending` \| `paid` \| `cancel` (⚠️ `cancel` không có code path nào set) |
| `email` / `phone` / `username` | `varchar(255)` | NULL | Thông tin liên hệ khách |
| `messenger_app` | `jsonb` | DEFAULT `[]` | `[{name, username}]` |
| `supplier_id` | `uuid` | FK → supplier, NULL | Denormalized từ `product.supplier_id` |
| `supplier_name` | `varchar(255)` | NULL | Snapshot tên supplier |
| `user_id` | `uuid` | FK → user, NULL | — |

> **Không có audit columns** (chỉ `BaseEntity`) — không track ai tạo/sửa booking. Đã trải qua nhiều migration: các cột `adult/child/infant_price`, `booking_date`, `quantity` từng tồn tại nhưng đã bị **xoá**, thay bằng `passengers` (jsonb) — xem [06-business-logic.md §6.3](./06-business-logic.md#63-booking-module) để hiểu đầy đủ luồng tạo booking và các gap (capacity không được enforce, không có transaction, không có endpoint huỷ).

---

### 4.4.13 `booking_payment` (mới)

| Cột | Kiểu | Constraint | Mô tả |
|-----|------|-----------|-------|
| `id` | `uuid` | PK | — |
| `booking_id` | `uuid` | FK → booking, NULL | — |
| `provider` | `varchar(100)` | NULL | `paypal` \| `vnpay` |
| `provider_tx_id` | `varchar(255)` | NULL | Mã giao dịch/capture của cổng |
| `provider_intent_id` | `varchar(255)` | NULL | PayPal order id hoặc VNPay `txnRef` |
| `price` | `decimal(12,2)` | DEFAULT 0 | — |
| `currency` | `varchar(10)` | DEFAULT `'VND'` | — |
| `status` | `varchar(50)` | DEFAULT `'pending'` | `pending` \| `succeed` \| `failed` |
| `failure_reason` | `text` | NULL | — |
| `raw_response` | `jsonb` | NULL | Toàn bộ payload trả về từ cổng thanh toán |

Một booking có thể có nhiều `booking_payment` (VD: thử lại sau khi fail). Chi tiết: [06-business-logic.md §6.4](./06-business-logic.md#64-payment-module-paypal--vnpay).

---

### 4.4.14 `booking_payment_history` (mới)

| Cột | Kiểu | Constraint | Mô tả |
|-----|------|-----------|-------|
| `id` | `uuid` | PK | — |
| `booking_payment_id` | `uuid` | FK → booking_payment, NOT NULL, indexed | — |
| `booking_id` | `uuid` | FK → booking, NULL | Denormalized |
| `from_status` | `varchar(50)` | NULL | NULL nếu là log đầu tiên |
| `to_status` | `varchar(50)` | NOT NULL | — |
| `provider` / `provider_tx_id` | `varchar` | NULL | — |
| `reason` | `text` | NULL | — |
| `raw_response` | `jsonb` | NULL | — |
| `source` | `varchar(50)` | NULL | VD: `paypal_capture`, `paypal_webhook`, `vnpay_callback` |

Bảng log append-only, đọc qua `GET /booking-payment/:id/logs`.

---

### 4.4.15 `review`

| Cột | Kiểu | Constraint | Mô tả |
|-----|------|-----------|-------|
| `id` | `uuid` | PK | — |
| `comment` | `text` | NULL | Nội dung đánh giá |
| `point` | `float` | NOT NULL, 1-5 | ⚠️ Không có default (khác tài liệu cũ) |
| `images` | `varchar(500)[]` | NULL | Mảng URL ảnh kèm review |
| `tour_guide_sub_ratings` | — | — | Không lưu riêng — được gộp vào `tour_guide.user_review` (jsonb) ngay khi tạo review |
| `product_id` | `uuid` | FK → product, NULL | Chỉ dùng để đọc (`GET /product/:id/review`) — **không còn API tạo review cho product** |
| `user_id` | `uuid` | FK → user (nullable) | Nếu ẩn danh: tự tạo `User(role=normal, name='Anonymous')` |

> ⚠️ Review hiện chỉ tạo được cho **Tour Guide** (`POST /review/tour-guide/:tourGuideId`), không tạo được cho Product qua API. Khi tạo review tour guide, hệ thống tự cập nhật `tour_guide.rating_count`/`rating_value`/`user_review` — xem [06-business-logic.md §6.10](./06-business-logic.md#610-review-module).

---

### 4.4.16 `video`

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
| `like` | `int` | DEFAULT 0 | ⚠️ Có thể âm — dislike không chặn dưới 0 |
| `type` | `varchar(50)` | DEFAULT `normal` | `hero` \| `normal` \| `moment` |
| `guid` | `varchar(255)` | UNIQUE, NULL | BunnyCDN video GUID |
| `uploading_status` | `int` | NULL | Trạng thái upload BunnyCDN (xem bảng `BunnyVideoStatus`) |
| `duration` | — | NULL | Thời lượng video (giây), lấy từ BunnyCDN SDK sau khi webhook báo `Finished` |
| `product_id` | `uuid` | FK → product, NULL | — |
| `created_by` / `updated_by` / `deleted_by` | `uuid` NULL | Audit columns | |

**Video Types:**
- `hero`: Video nổi bật của sản phẩm (1 sản phẩm chỉ có 1)
- `normal`: Video bình thường
- `moment`: Video gắn với Tour Guide (không gắn product) — quản lý qua `/tour-guide/:id/moment`

**BunnyVideoStatus** (integer enum từ BunnyCDN — đã sửa lại cho đúng 11 giá trị thực tế, khác bảng rút gọn trước đây):

| Giá trị | Tên | | Giá trị | Tên |
|---|---|---|---|---|
| `0` | Queued | | `6` | PresignedUploadStarted |
| `1` | Processing | | `7` | PresignedUploadFinished |
| `2` | Encoding | | `8` | PresignedUploadFailed |
| `3` | Finished ✅ | | `9` | CaptionsGenerated |
| `4` | ResolutionFinished | | `10` | TitleOrDescriptionGenerated |
| `5` | Failed ❌ | | | |

---

### 4.4.17 `element`

| Cột | Kiểu | Constraint | Mô tả |
|-----|------|-----------|-------|
| `id` | `uuid` | PK | — |
| `key` | `varchar(255)` | NOT NULL | Key duy nhất (VD: `include_breakfast`) |
| `name` | `varchar(255)` | NOT NULL | Tên hiển thị |
| `description` | `text` | NULL | Mô tả |
| `is_active` | `boolean` | DEFAULT true | Trạng thái kích hoạt |
| `created_by` / `updated_by` / `deleted_by` | `uuid` NULL | Audit columns | |

> Element là các thuộc tính/tiện ích chung có thể gắn vào nhiều sản phẩm (VD: "Bao gồm bữa sáng", "WiFi miễn phí"). `DELETE /element/:id` thực chất là **deactivate** (`is_active=false`), có `PUT /element/:id/active` để bật lại.

---

### 4.4.18 `tag`

| Cột | Kiểu | Constraint | Mô tả |
|-----|------|-----------|-------|
| `id` | `uuid` | PK | — |
| `name` | `varchar(255)` | UNIQUE, NOT NULL | Tên tag (VD: `adventure`, `family`) |
| `created_by` / `updated_by` / `deleted_by` | `uuid` NULL | Audit columns | |

> `DELETE /tag/:id` cũng là deactivate, không xoá cứng — tương tự `element`.

---

### 4.4.19 `tour_guide`

Entity này lớn hơn nhiều so với tài liệu trước đây — là hồ sơ đầy đủ của hướng dẫn viên, không chỉ vài field rating.

| Cột | Kiểu | Constraint | Mô tả |
|-----|------|-----------|-------|
| `id` | `uuid` | PK | — |
| `name` | `varchar(255)` | NOT NULL | Tên hướng dẫn viên |
| `ref_code` | `varchar(50)` | UNIQUE, NOT NULL | Mã tham chiếu |
| `avatar` | `varchar` | NULL | URL ảnh đại diện |
| `cover_img` | `varchar` | NULL | Ảnh bìa |
| `rating_count` | `int` | DEFAULT 0 | Số lượt đánh giá |
| `rating_value` | `float` | DEFAULT 0 | Điểm trung bình (tên cột thực tế — **không phải `rating_star`**) |
| `exp_year` | `int` | DEFAULT 0 | Số năm kinh nghiệm |
| `location_id` | `uuid` | FK → destination, NULL | Khu vực hoạt động chính |
| `quote` | `varchar(500)` | NULL | Câu trích dẫn ngắn |
| `summary` | `text` | NULL | Tóm tắt |
| `description` | `text` | NULL | Mô tả dài |
| `languages` | `varchar(50)[]` | NULL | VD: `['EN','VN','FR']` |
| `experts` | `varchar(100)[]` | NULL | Chuyên môn, VD: `['Trekking','Food tours']` |
| `supplier_review` | `jsonb` | NULL | Mảng review từ supplier (khác review từ user) |
| `user_review` | `jsonb` | DEFAULT (7 tiêu chí, value 0) | `{reviewCount, reviewValue, ratings[]}` — auto-update khi có review mới (xem [6.10](./06-business-logic.md#610-review-module)) |
| `career_path` | `jsonb` | NULL | — |
| `onboarding` | `boolean` | DEFAULT false | Đã hoàn tất onboarding hay chưa |
| `created_by` / `updated_by` / `deleted_by` | `uuid` NULL | Audit columns | |

**Quan hệ:** `N:1` với `destination` (qua `location_id`), `N:N` với `product`, `1:1` với `user` (qua `user.tour_guide_id`).

---

### 4.4.20 `supplier_payment` (mới)

| Cột | Kiểu | Constraint | Mô tả |
|-----|------|-----------|-------|
| `id` | `uuid` | PK | — |
| `supplier_id` | `uuid` | FK → supplier | — |
| `method` | `varchar` | — | `bank` \| `card` \| `paypal` \| `vnpay` (enum `SupplierPaymentMethod`, dùng chung với `booking_payment.provider`) |
| `is_default` | `boolean` | DEFAULT false | Chỉ 1 record `true` cho mỗi supplier (enforce ở service layer, không phải DB constraint) |

Toàn bộ CRUD tại `/supplier-payment`, yêu cầu `@Admin()`.

---

### 4.4.21 `searching_log`

| Cột | Kiểu | Constraint | Mô tả |
|-----|------|-----------|-------|
| `id` | `uuid` | PK | — |
| `query` | `text` | NOT NULL | Từ khoá tìm kiếm |
| `ip_address` | `varchar(50)` | NOT NULL | IP người tìm kiếm |
| `user_id` | `uuid` | FK → user, NULL | User (nếu có) |

> Ghi lại từng lần tìm kiếm. Dùng để tính `searching_stat`.

---

### 4.4.22 `searching_stat`

| Cột | Kiểu | Constraint | Mô tả |
|-----|------|-----------|-------|
| `id` | `uuid` | PK | — |
| `query` | `text` | UNIQUE, NOT NULL | Từ khoá |
| `total_count` | `int` | DEFAULT 1 | Tổng số lần tìm kiếm (all-time) |
| `month_count` | `int` | DEFAULT 1 | Số lần trong tháng hiện tại |
| `last_searched_at` | `timestamptz` | NOT NULL | Lần cuối tìm kiếm |

> ⚠️ `month_count` được tính lại **hàng ngày** (không phải "reset hàng tháng" như tên gợi ý) — xem [06-business-logic.md §6.8.3](./06-business-logic.md#683-cron-jobs-taskservice).

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
| `user` | `tour_guide_id` (UNIQUE) | 1 tour guide chỉ gắn với 1 user |
| `session_unit` | `(session_id, unit_id)` (UNIQUE) | Mỗi unit chỉ có 1 giá / session |
| `booking` | `booking_code` (UNIQUE) | Tra cứu booking theo mã |
| `booking_payment_history` | `booking_payment_id` | Truy vấn log theo payment |
| `tour_guide` | `ref_code` (UNIQUE) | Mã tham chiếu không trùng |

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
