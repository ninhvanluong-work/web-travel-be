# 05 — API Reference

[🏠 Về trang chủ](./README.md)

> Swagger UI đầy đủ: `http://localhost:3000/docs` (hoặc production URL `https://web-travel-be.fly.dev/docs`)
>
> Tất cả response thành công theo format:
> ```json
> { "data": any, "code": number, "error": null | string, "message": string }
> ```
> ⚠️ Response **lỗi** (exception) theo format khác: `{ "statusCode": number, "message": string, "timestamp": string, "path": string }` — không có field `data`/`error`, field tên `statusCode` chứ không phải `code`. Xem [03-architecture.md §3.3](./03-architecture.md#33-luồng-request-tiêu-chuẩn).
>
> **Cột "Guard"** cho biết endpoint có yêu cầu JWT hay không: `Public` (không cần token), `Optional` (`OptionalUserGuard` — hoạt động cả khi có và không có token), `Admin`/`SuperAdmin`/`TourGuide` (`UserGuard` bắt buộc, role tương ứng). Chi tiết cơ chế: [06-business-logic.md §6.5](./06-business-logic.md#65-auth--authorization).

---

## 5.1 Auth `/auth`

| Method | Path | Guard | Mô tả |
|--------|------|-------|------|
| `POST` | `/auth/register` | Public | Đăng ký user (không tự đăng ký được role `admin`/`super_admin`) |
| `POST` | `/auth/login` | Public | Đăng nhập user thường |
| `POST` | `/auth/admin/login` | Public | Đăng nhập admin — dùng chung bảng `user`, 401 nếu role không phải `admin`/`super_admin` |
| `POST` | `/auth/forgot-password` | Public | Gửi mail link reset password (hết hạn 5 phút) |
| `POST` | `/auth/reset-password` | Public | Đổi mật khẩu bằng token reset |
| `POST` | `/auth/access-token/renew` | Public | Cấp lại access + refresh token (refresh-token rotation) |
| `POST` | `/auth/logout` | Bắt buộc đăng nhập | Tăng `refresh_token_version` → vô hiệu hoá mọi refresh token cũ |
| `POST` | `/auth/change-password` | Bắt buộc đăng nhập | Đổi mật khẩu (`oldPassword`, `newPassword`). Sai mật khẩu cũ / trùng mật khẩu cũ → `400`. Tăng `refresh_token_version` (đăng xuất thiết bị khác) và trả về token mới cho thiết bị hiện tại (cùng format response login) |

### Body `POST /auth/login`
```json
{ "email": "user@example.com", "password": "..." }
```

### Response `POST /auth/login` / `POST /auth/admin/login` / `POST /auth/access-token/renew`
```json
{
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  },
  "code": 200,
  "error": null,
  "message": "ok"
}
```
> Gắn `accessToken` vào header `Authorization: Bearer <accessToken>` cho các request cần đăng nhập.

---

## 5.2 Product `/product`

| Method | Path | Guard | Mô tả |
|--------|------|-------|------|
| `GET` | `/product` | Public | Danh sách sản phẩm (phân trang, filter) |
| `GET` | `/product/:id` | Public | Chi tiết sản phẩm theo ID |
| `GET` | `/product/:id/booking` | Public | Tổng hợp `departureTimes`/`pickupLocations`/`options` phục vụ màn hình đặt tour |
| `GET` | `/product/:id/review` | Public | Danh sách review của sản phẩm |
| `POST` | `/product` | Admin | Tạo sản phẩm mới |
| `PUT` | `/product/:id` | Admin | Cập nhật sản phẩm |
| `POST` | `/product/:id/publish` | Admin | Chuyển status → `published` |
| `POST` | `/product/:id/status/:status` | Admin | Đổi status (**không** chấp nhận `draft`) |
| `DELETE` | `/product/:id` | — | ⚠️ Route bị comment out — **không hoạt động** |

### Query params `GET /product`
| Param | Kiểu | Mô tả |
|-------|------|-------|
| `page` | number | Trang (default: 1) |
| `pageSize` | number | Số item mỗi trang (default: 10) |
| `keyword` | string | Tìm kiếm theo tên |
| `supplierId` | uuid | Filter theo supplier |
| `destinationId` | uuid | Filter theo destination |
| `tourGuideId` | uuid | Filter theo tour guide gắn với sản phẩm |
| `status` | `draft\|published\|hidden` | Filter theo trạng thái |
| `fromDate` | ISO date | Từ ngày tạo |
| `toDate` | ISO date | Đến ngày tạo |

### Response `GET /product`
```json
{
  "data": {
    "items": [
      {
        "id": "uuid",
        "name": "Hạ Long Bay Tour",
        "slug": "ha-long-bay-tour",
        "code": "ABCD1234",
        "thumbnail": "https://cdn.example.com/img.jpg",
        "minPrice": 1500000,
        "currency": "VND",
        "status": "published",
        "reviewPoint": 4.5,
        "destination": { "id": "uuid", "name": "Hạ Long" },
        "supplier": { "id": "uuid", "name": "Travel Co" }
      }
    ],
    "pagination": { "page": 1, "pageSize": 10, "total": 100, "totalPages": 10 }
  },
  "code": 200,
  "error": null,
  "message": "ok"
}
```

### Body `POST /product` (yêu cầu `Authorization: Bearer <admin-token>`)
```json
{
  "name": "Hạ Long Bay Tour",
  "destinationId": "uuid",
  "supplierId": "uuid",
  "description": "...",
  "shortDescription": "...",
  "highlight": "...",
  "include": "...",
  "exclude": "...",
  "status": "draft",
  "heroVideoId": "uuid (optional)",
  "tagIds": ["uuid1", "uuid2"],
  "tourGuideIds": ["uuid"],
  "elementIds": ["uuid"],
  "options": [{ "title": "Gói Standard", "adultPrice": 1500000, "childPrice": 1000000 }],
  "units": [{ "name": "Người lớn" }, { "name": "Trẻ em" }],
  "departureTimes": [{ "time": "07:30", "label": "Khởi hành sáng" }],
  "pickupLocations": [{ "name": "Bến xe Mỹ Đình" }],
  "itineraries": [{ "name": "Ngày 1: Khởi hành", "order": 1 }]
}
```
> `options`/`units`/`departureTimes`/`pickupLocations` khi update là **id-based sync** (có `id` → update, thiếu `id` → tạo mới, record cũ vắng mặt → soft delete). `itineraries` khi update là **wipe & recreate** hoàn toàn. Chi tiết: [06-business-logic.md §6.1](./06-business-logic.md#61-product-module).

---

## 5.3 Tour Scheduling & Inventory

### 5.3.1 Session `/session`

| Method | Path | Guard | Mô tả |
|--------|------|-------|------|
| `GET` | `/session` | Public | Danh sách/phân trang session |
| `GET` | `/session/:id` | Public | Chi tiết (kèm `sessionUnits.unit`) |
| `POST` | `/session` | Admin | Tạo 1 session (dedup theo `productId`+`travelDate`) |
| `POST` | `/session/range` | Admin | Tạo hàng loạt session theo khoảng ngày |
| `PUT` | `/session/:id` | Admin | Cập nhật status + `sessionUnits` |
| `DELETE` | `/session/:id` | Admin | Soft delete |

### Body `POST /session`
```json
{
  "productId": "uuid",
  "travelDate": "2026-06-15",
  "sessionUnits": [
    { "unitId": "uuid-adult", "price": 1500000 },
    { "unitId": "uuid-child", "price": 1000000 }
  ]
}
```

### Body `POST /session/range`
```json
{
  "productId": "uuid",
  "fromDate": "2026-06-01",
  "toDate": "2026-08-31",
  "daysOfWeek": [6, 7],
  "duplicateStrategy": "skip",
  "sessionUnits": [{ "unitId": "uuid-adult", "price": 1500000 }]
}
```
> `daysOfWeek`: 1=Thứ 2 .. 7=Chủ nhật. `duplicateStrategy`: `skip` (mặc định, bỏ qua ngày đã có session) hoặc `overwrite`. Tối đa 366 ngày mỗi lần gọi.

> ⚠️ Cả 2 endpoint trên **chấp nhận nhưng bỏ qua field `capacity`** (đang bị comment out ở tầng DTO) — mọi session tạo ra hiện có `capacity = 0` mặc định, xem [06-business-logic.md §6.2.4](./06-business-logic.md#624-session--ngày-khởi-hành-cụ-thể).

### 5.3.2 Departure Time `/departure-time`

| Method | Path | Guard | Mô tả |
|--------|------|-------|------|
| `GET` | `/departure-time?productId=` | Public | Danh sách theo product, sort theo `order` |
| `GET` | `/departure-time/:id` | Public | Chi tiết |
| `POST` | `/departure-time` | Admin | Tạo mới |
| `PUT` | `/departure-time/:id` | Admin | Cập nhật |
| `DELETE` | `/departure-time/:id` | Admin | Soft delete |

> Cũng có thể quản lý qua `PUT /product/:id` (mảng `departureTimes[]`) — 2 đường vào cùng dữ liệu.

### 5.3.3 Unit & Pickup Location

⚠️ **Không có controller/endpoint riêng** cho `unit` và `pickup_location` — 2 entity này chỉ tạo/sửa/xoá được thông qua `POST /product` hoặc `PUT /product/:id` (mảng `units[]` / `pickupLocations[]`). Xem [06-business-logic.md §6.2](./06-business-logic.md#62-tour-scheduling--inventory).

---

## 5.4 Booking `/booking`

| Method | Path | Guard | Mô tả |
|--------|------|-------|------|
| `POST` | `/booking` | Optional | Tạo booking mới (guest hoặc user đăng nhập) |
| `GET` | `/booking` | Public ⚠️ | Danh sách + thống kê — **không lọc theo quyền sở hữu** |
| `GET` | `/booking/:id/payment` | Public ⚠️ | Lịch sử `booking_payment` của 1 booking |

### Body `POST /booking`
```json
{
  "productId": "uuid",
  "optionId": "uuid",
  "tourSessionId": "uuid",
  "pickupLocationId": "uuid (optional)",
  "departureId": "uuid (optional)",
  "passengers": [
    { "unitId": "uuid-adult", "count": 2 },
    { "unitId": "uuid-child", "count": 1 }
  ],
  "email": "khach@example.com",
  "phone": "0900000000",
  "username": "Nguyễn Văn A",
  "messengerApp": [{ "name": "zalo", "username": "0900000000" }]
}
```
> Giá từng `unitId` được tra theo `SessionUnit` của đúng `tourSessionId` — **không** truyền giá từ client. `tourSessionId` phải trỏ tới session có `status = active`, nếu không sẽ 400. Chi tiết đầy đủ luồng (kể cả gap về capacity/overbooking): [06-business-logic.md §6.3](./06-business-logic.md#63-booking-module).

### Query params `GET /booking`
| Param | Mô tả |
|---|---|
| `supplierId`, `productId`, `status` | Filter chính xác |
| `fromDate`/`toDate` | Filter theo `travelDate` |
| `keyword` | Tìm OR trên `phone, email, productName, optionName, username, bookingCode` |

Response kèm `stat`: `{ pending: {count,totalPrice}, paid: {...}, cancel: {...}, total: {...} }`.

---

## 5.5 Payment `/payment`

### 5.5.1 PayPal `/payment/paypal`

| Method | Path | Guard | Mô tả |
|--------|------|-------|------|
| `GET` | `/payment/paypal/config` | Public | `{ clientId, currency }` cho FE khởi tạo SDK |
| `POST` | `/payment/paypal/:bookingId/create-order` | Optional | Tạo PayPal order cho booking `pending` |
| `POST` | `/payment/paypal/:bookingId/capture-order` | Optional | Capture order, body `{ "orderId": "..." }` |

### 5.5.2 VNPay `/payment/vnpay`

| Method | Path | Guard | Mô tả |
|--------|------|-------|------|
| `POST` | `/payment/vnpay/:bookingId/create-payment-url` | Optional | Trả URL redirect sang VNPay |
| `GET` | `/payment/vnpay/return` | Public | Browser return URL — chỉ redirect FE, **không** phải nguồn xác nhận chính thức |

> Xác nhận thanh toán chính thức luôn qua webhook (`/webhook/paypal`, `/webhook/vnpay/ipn`), không phải qua 2 endpoint trên — xem [5.7](#57-webhook-webhook) và [06-business-logic.md §6.4](./06-business-logic.md#64-payment-module-paypal--vnpay).

### 5.5.3 Booking Payment Logs `/booking-payment`

| Method | Path | Guard | Mô tả |
|--------|------|-------|------|
| `GET` | `/booking-payment/:id/logs` | Public | Lịch sử đổi trạng thái của 1 `booking_payment`, cũ → mới |

---

## 5.6 Video `/video`

| Method | Path | Guard | Mô tả |
|--------|------|-------|------|
| `GET` | `/video` | Public | Danh sách video (public, có log search) |
| `GET` | `/video/admin` | Admin | Danh sách video (admin view) |
| `GET` | `/video/:slug` | Public | Chi tiết video theo slug |
| `GET` | `/video/id/:id` | Public | Chi tiết video theo ID |
| `POST` | `/video` | Admin | Tạo video mới |
| `PUT` | `/video/:id` | Admin | Cập nhật video |
| `POST` | `/video/:id/like` | Public | Like video (không chặn double-like) |
| `POST` | `/video/:id/dislike` | Public | Dislike video 

### Query params `GET /video`
| Param | Kiểu | Mô tả |
|-------|------|-------|
| `query` | string | Từ khoá tìm kiếm (được log vào searching) |
| `userId` | uuid | User đang tìm (optional, cho log) |
| `page` | number | Trang |
| `pageSize` | number | Số item |
| `productId` | uuid | Filter theo sản phẩm |
| `type` | `hero\|normal\|moment` | Filter theo loại video |

---

## 5.7 Webhook `/webhook`

| Method | Path | Xác thực | Mô tả |
|--------|------|------|------|
| `POST` | `/webhook/bunny` | HMAC-SHA256 header (`BUNNY_READONLY_API_KEY`) | BunnyCDN báo trạng thái video |
| `POST` | `/webhook/paypal` | Header `paypal-*` + verify API PayPal | PayPal báo `PAYMENT.CAPTURE.COMPLETED` |
| `GET` | `/webhook/vnpay/ipn` | Query signature SHA512 HMAC | VNPay IPN — nguồn xác nhận thanh toán chính thức |

### `POST /webhook/bunny`
```json
{ "VideoGuid": "bunny-video-guid", "VideoLibraryId": 12345, "Status": 3 }
```
> Status 3 = Finished. Backend cập nhật `video.uploading_status` (và `video.duration` nếu Finished). Chi tiết đầy đủ: [06-business-logic.md §6.15](./06-business-logic.md#615-webhook-module).

---

## 5.8 Upload `/upload`

⚠️ **Cả 2 endpoint dưới đây hiện không có auth guard nào** (code đã import guard nhưng đang comment out).

| Method | Path | Guard | Mô tả |
|--------|------|-------|------|
| `POST` | `/upload/video` | — (không có, dù có ý định thêm) | Tạo video slot trên BunnyCDN → nhận signature |
| `POST` | `/upload/:fileType` | — (không có, dù có ý định thêm) | Upload file lên BunnyCDN Storage |

### `POST /upload/video`
**Body:** `{ "title": "Video name" }`

**Response:**
```json
{
  "videoId": "bunny-guid",
  "libraryId": "12345",
  "expirationTime": 1234567890,
  "signature": "sha256-hex-string"
}
```
> Frontend dùng `videoId` + `signature` để upload file trực tiếp qua BunnyStream TUS API.

### `POST /upload/:fileType`
**Path param `fileType`:** `img` | `file`
**Body:** `multipart/form-data` — field `file`

**Response:**
```json
{ "fileType": "img", "url": "https://cdn.example.com/img/2026/05/wt_1748123456789.jpg" }
```
> ⚠️ Path thực tế **không** có segment thư mục con (`img/product/...`) dù format lý thuyết hỗ trợ — endpoint public luôn upload thẳng vào `{fileType}/{year}/{month}/...`. Chi tiết: [06-business-logic.md §6.9](./06-business-logic.md#69-upload-module).

---

## 5.9 Searching `/searching`

| Method | Path | Guard | Mô tả |
|--------|------|-------|------|
| `POST` | `/searching` | Public | Log 1 lượt tìm kiếm |
| `GET` | `/searching/suggestions` | Public | Gợi ý tìm kiếm |
| `GET` | `/searching/hot` | Public | Hot searches (top 8, tính đến hiện tại trong tháng) |

### `GET /searching/suggestions?keyword=ha`
**Response:**
```json
{
  "data": {
    "hotSearches": [{ "query": "hạ long", "monthCount": 150 }],
    "destinations": [{ "id": "uuid", "name": "Hạ Long" }],
    "products": [
      {
        "id": "uuid",
        "name": "Hạ Long Bay Tour",
        "slug": "ha-long-bay-tour",
        "thumbnail": "https://...",
        "minPrice": 1500000
      }
    ]
  }
}
```
> Nếu không có `keyword`, chỉ trả hot searches.

---

## 5.10 Supplier `/supplier`

| Method | Path | Guard | Mô tả |
|--------|------|-------|------|
| `GET` | `/supplier` | Admin | Danh sách supplier |
| `GET` | `/supplier/:id` | Admin | Chi tiết |
| `POST` | `/supplier` | Admin | Tạo mới |
| `PUT` | `/supplier/:id` | Admin | Cập nhật |
| `DELETE` | `/supplier/:id` | Admin | Xoá |

> ⚠️ Toàn bộ controller (kể cả `GET`) yêu cầu `@Admin()` — khác phần lớn module khác (nơi `GET` thường public).

### Supplier Payment `/supplier-payment` (mới)

| Method | Path | Guard | Mô tả |
|--------|------|-------|------|
| `GET` | `/supplier-payment` | Admin | Danh sách phương thức thanh toán |
| `GET` | `/supplier-payment/:id` | Admin | Chi tiết |
| `POST` | `/supplier-payment` | Admin | Tạo mới — `isDefault: true` sẽ bỏ default của các record khác cùng supplier |
| `PUT` | `/supplier-payment/:id` | Admin | Cập nhật |
| `DELETE` | `/supplier-payment/:id` | Admin | Xoá |

---

## 5.11 Destination `/destination`

| Method | Path | Guard | Mô tả |
|--------|------|-------|------|
| `GET` | `/destination` | Public | Danh sách, phân trang (`keyword`, `page`, `pageSize`), tìm theo `name` |
| `GET` | `/destination/:id` | Public | Chi tiết |
| `POST` | `/destination` | Admin | Tạo mới — `name` trùng (không phân biệt hoa thường) → `409` |
| `PUT` | `/destination/:id` | Admin | Cập nhật (partial) |
| `DELETE` | `/destination/:id` | Admin | **Soft delete** — nếu còn product dùng destination này → `409` |

### Body `POST /destination`
```json
{
  "name": "Hạ Long",
  "description": "Vịnh Hạ Long - di sản thiên nhiên thế giới"
}
```

---

## 5.12 Option `/option`

| Method | Path | Guard | Mô tả |
|--------|------|-------|------|
| `GET` | `/option` | — | ⚠️ Route bị comment out — **không hoạt động** |
| `POST` | `/option` | — | ⚠️ Route bị comment out — **không hoạt động** |
| `PUT` | `/option/:id` | Admin | Cập nhật |
| `DELETE` | `/option/:id` | Admin | Xoá |

> Tạo/liệt kê option trong thực tế đi qua `POST/PUT /product` (mảng `options[]`), không qua `/option` trực tiếp.

---

## 5.13 Element `/element`

| Method | Path | Guard | Mô tả |
|--------|------|-------|------|
| `GET` | `/element` | Public | Danh sách element |
| `POST` | `/element` | Admin | Tạo mới |
| `PUT` | `/element/:id` | Admin | Cập nhật |
| `PUT` | `/element/:id/active` | Admin | Kích hoạt lại element đã deactivate |
| `DELETE` | `/element/:id` | Admin | ⚠️ Thực chất là **deactivate** (`is_active=false`), không xoá cứng |

---

## 5.14 Itinerary `/itinerary`

| Method | Path | Mô tả |
|--------|------|-------|
| `GET` | `/itinerary` | Danh sách |
| `POST` | `/itinerary` | Tạo mới |
| `PUT` | `/itinerary/:id` | Cập nhật |

> Thường được quản lý qua `PUT /product/:id` với field `itineraries[]` (wipe & recreate — xem [06-business-logic.md §6.1.2](./06-business-logic.md#612-cập-nhật-sản-phẩm-update-product)).

---

## 5.15 Review `/review`

⚠️ Module đã được viết lại — **chỉ còn đúng 1 route**, tạo review cho Tour Guide (không phải Product).

| Method | Path | Guard | Mô tả |
|--------|------|-------|------|
| `POST` | `/review/tour-guide/:tourGuideId` | Optional | Tạo review cho tour guide (tự tạo user ẩn danh nếu là guest) |

Đọc review: `GET /product/:id/review` (sản phẩm) và `GET /tour-guide/:id/review` (tour guide) — xem section tương ứng.

### Body `POST /review/tour-guide/:tourGuideId`
```json
{
  "point": 5,
  "comment": "Hướng dẫn viên rất nhiệt tình!",
  "images": ["https://..."],
  "tourGuideSubRatings": [
    { "key": "storytelling", "value": 5 },
    { "key": "punctuality", "value": 4 }
  ]
}
```

---

## 5.16 Tag `/tag`

| Method | Path | Guard | Mô tả |
|--------|------|-------|------|
| `GET` | `/tag` | Public | Danh sách tag |
| `POST` | `/tag` | Admin | Tạo mới |
| `PUT` | `/tag/:id` | Admin | Cập nhật |
| `DELETE` | `/tag/:id` | Admin | ⚠️ Thực chất là **deactivate**, không xoá cứng |

---

## 5.17 Tour Guide `/tour-guide`

| Method | Path | Guard | Mô tả |
|--------|------|-------|------|
| `POST` | `/tour-guide` | — (không có) | Tự đăng ký hồ sơ tour guide |
| `GET` | `/tour-guide` | Public | Danh sách |
| `GET` | `/tour-guide/skills` | Public | Danh sách kỹ năng chuẩn hoá |
| `GET` | `/tour-guide/:id` | Public | Chi tiết |
| `PUT` | `/tour-guide/:id` | TourGuide | Cập nhật hồ sơ |
| `POST` | `/tour-guide/onboarding` | TourGuide | Hoàn tất onboarding |
| `DELETE` | `/tour-guide/:id` | — ⚠️ **Không có guard nào** | Xoá hồ sơ |
| `GET` | `/tour-guide/:id/review` | Public | Danh sách review |
| `GET` | `/tour-guide/:id/moment` | Public | Danh sách "moment" (video) |
| `POST` | `/tour-guide/:id/moment` | TourGuide | Tạo moment |
| `PUT` | `/tour-guide/:id/moment/:momentId` | TourGuide | Sửa moment |
| `DELETE` | `/tour-guide/:id/moment/:momentId` | TourGuide | Xoá moment |

---

## 5.18 User `/user`

Toàn bộ controller yêu cầu `@Admin()` (admin/super_admin). Response không bao giờ trả `password`/token nội bộ.

| Method | Path | Guard | Mô tả |
|--------|------|-------|------|
| `GET` | `/user` | Admin | Danh sách, phân trang (`keyword` tìm OR trên `name`/`email`, `role`, `page`, `pageSize`) |
| `GET` | `/user/:id` | Admin | Chi tiết |
| `POST` | `/user` | Admin | Tạo user — email trùng (kể cả user đã xoá) → `409`; role `tour_guide` tự tạo hồ sơ Tour Guide |
| `PUT` | `/user/:id` | Admin | Cập nhật `name`/`email`/`role` (partial). Đổi role → tăng `refresh_token_version` (buộc login lại) |
| `POST` | `/user/:id/reset-password` | Admin | Cấp lại mật khẩu: admin nhập `newPassword`; vô hiệu hoá mọi refresh token cũ |
| `DELETE` | `/user/:id` | Admin | **Soft delete** — user bị xoá không login/renew token được |

**Phân quyền** (`403` nếu vi phạm):
- `admin` chỉ quản lý được user `normal`/`tour_guide`; chỉ `super_admin` mới tạo/sửa/xoá/reset tài khoản `admin`.
- Không ai tạo hoặc gán role `super_admin` qua API; không ai sửa/xoá/reset tài khoản `super_admin` khác.
- Được sửa thông tin / reset mật khẩu của chính mình, nhưng không tự đổi role và không tự xoá.

### Body `POST /user`
```json
{
  "email": "user@example.com",
  "password": "123456",
  "name": "Nguyễn Văn A",
  "role": "normal"
}
```

### Body `POST /user/:id/reset-password`
```json
{ "newPassword": "123456" }
```

---

## 5.19 Health Check

| Method | Path | Mô tả |
|--------|------|-------|
| `GET` | `/` | App health check (AppController) |

---
[← Trang trước](./04-database.md) | [Trang sau →](./06-business-logic.md)
