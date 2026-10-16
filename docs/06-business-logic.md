# 06 — Đặc tả Logic Nghiệp vụ (Business Logic)

[🏠 Về trang chủ](./README.md)

> Tài liệu này phản ánh trạng thái code hiện tại (bao gồm cả các phần dở dang / có gap). Các mục có ⚠️ là hành vi thật sự trong code, không phải thiết kế mong muốn — đọc kỹ trước khi dựa vào đó để code phía client.

## Mục lục

- [6.1 Product Module](#61-product-module)
- [6.2 Tour Scheduling & Inventory (Unit, Departure Time, Pickup Location, Session, Session Unit)](#62-tour-scheduling--inventory)
- [6.3 Booking Module](#63-booking-module)
- [6.4 Payment Module (PayPal & VNPay)](#64-payment-module-paypal--vnpay)
- [6.5 Auth & Authorization](#65-auth--authorization)
- [6.6 Audit Trail (created_by / updated_by / deleted_by)](#66-audit-trail)
- [6.7 Video Module](#67-video-module)
- [6.8 Searching Module](#68-searching-module)
- [6.9 Upload Module](#69-upload-module)
- [6.10 Review Module](#610-review-module)
- [6.11 Tour Guide Module](#611-tour-guide-module)
- [6.12 Element Module](#612-element-module)
- [6.13 Supplier Module (Statistics & Payment Methods)](#613-supplier-module)
- [6.14 Mail Module](#614-mail-module)
- [6.15 Webhook Module](#615-webhook-module)
- [6.16 Known Gaps / Issues (tổng hợp)](#616-known-gaps--issues-tổng-hợp)

---

## 6.1 Product Module

### 6.1.1 Tạo sản phẩm (Create Product)

**Điều kiện tiên quyết:**
- `destinationId` phải tồn tại trong DB
- `supplierId` phải tồn tại trong DB

**Logic:**
1. Sinh `slug` từ `name` (dùng `generateSlug()` — lowercase + remove diacritics + replace space bằng `-`)
2. Sinh `code` ngẫu nhiên 8 ký tự alphanumeric
3. Lưu sản phẩm với status mặc định = `draft`, `currency` mặc định = `VND`
4. Nếu có `heroVideoId`: set `video.type = 'hero'` cho toàn bộ video thuộc sản phẩm đó, sau đó gọi `EmbeddingService.generateVideoEmbedding()` để tái sinh embedding cho video hero (lỗi embedding không làm fail request — chỉ log)
5. Nếu có `tagIds`: gán M:N relationship với Tag
6. Nếu có `tourGuideIds`: gán M:N relationship với TourGuide
7. Nếu có `elementIds`: gán M:N relationship với Element
8. Nếu có `options[]` / `departureTimes[]` / `pickupLocations[]` / `units[]`: tạo hàng loạt (bulk create), mỗi item được stamp `createdBy`/`updatedBy` = user hiện tại (xem [6.6](#66-audit-trail))

`createdBy`/`updatedBy` được set từ `userId` lấy trong JWT (`@Admin() @UseGuards(UserGuard)` — bắt buộc phải là `admin`/`super_admin`, xem [6.5](#65-auth--authorization)).

### 6.1.2 Cập nhật sản phẩm (Update Product)

Update cũng validate lại `destinationId`/`supplierId` tồn tại nếu có truyền lên (không chỉ create).

**Logic đặc biệt với itinerary (cascade update — "wipe & recreate"):**
- Khi có `itineraries[]` trong payload:
  1. Soft delete toàn bộ itinerary cũ của product (set `deletedBy` rồi `softDelete()`)
  2. Tạo mới hoàn toàn tất cả itinerary từ payload
  3. Không merge — replace hoàn toàn

**Logic đặc biệt với `options` / `departureTimes` / `pickupLocations` / `units` (cascade update — "id-based sync", khác hẳn itinerary):**
- Đây là kiểu merge theo `id`, **không** phải wipe & recreate:
  - Item trong payload có `id` khớp record hiện có → update record đó
  - Item trong payload **không có** `id` → tạo mới (bắt buộc field chính: `title` với option, `time` với departureTime, `name` với pickupLocation/unit — thiếu thì `BadRequestException`)
  - Record hiện có trong DB mà **không** xuất hiện trong payload (theo `id`) → soft delete
  - `id` truyền lên nhưng không thuộc về product đó → `NotFoundException`
- 4 nhóm entity này (`option`, `departureTime`, `pickupLocation`, `unit`) đều không có service/controller riêng để CRUD trực tiếp trừ `option`/`departureTime` (có controller riêng nhưng option's create/list route đang bị comment out) và `session`/`session-unit` (xem [6.2](#62-tour-scheduling--inventory)) — `pickupLocation` và `unit` **chỉ** có thể tạo/sửa/xoá thông qua `PUT /product/:id` hoặc `POST /product`.

**Logic đặc biệt với Hero Video:**
- Khi đổi `heroVideoId`:
  1. Set tất cả video của product về `type = 'normal'`
  2. Set video được chọn thành `type = 'hero'`
  3. Đảm bảo chỉ 1 video `hero` tồn tại tại mọi thời điểm
  4. Tái sinh embedding cho video hero mới (giống create)

### 6.1.3 Product Status Flow

```
draft ──────────────► published ──► hidden
  ▲                       │
  └───────────────────────┘ (có thể quay lại draft)
```

- `draft`: Sản phẩm đang soạn thảo, không hiển thị public
- `published`: Hiển thị trên website, có thể đặt tour
- `hidden`: Tạm ẩn, không hiển thị nhưng vẫn lưu data

⚠️ **2 cách đổi status, không tương đương nhau:**
| Endpoint | Có thể set về `draft`? |
|---|---|
| `PUT /product/:id` (update chung, field `status`) | ✅ Có — chấp nhận full `ProductStatus` enum |
| `POST /product/:id/status/:status` (endpoint chuyên đổi status) | ❌ Không — `UpdateProductStatusEnum` loại trừ `draft` khỏi danh sách hợp lệ |

### 6.1.4 Danh sách & Chi tiết sản phẩm

- `GET /product` hỗ trợ filter: `keyword` (ILike theo `name`), `supplierId`, `destinationId`, `status`, `fromDate`/`toDate` (theo `createdAt`), `tourGuideId`.
- `GET /product/:id` (chi tiết) load kèm: `itineraries`, `tourGuides`, `tags`, `supplier`, `elements` (chỉ lấy `isActive = true`), `options`, `departureTimes`, `pickupLocations`, `units`; hero video được lookup riêng (không phải formal relation) để gán vào `product.heroVideo`.
- `GET /product/:id/booking` — endpoint riêng tổng hợp thông tin cần cho màn hình đặt tour: `departureTimes`, `pickupLocations` (theo `order`), và `options` đang active (theo `order`). **Không** trả về `sessions`/giá — client phải gọi `/session` riêng để lấy ngày & giá theo unit.
- `GET /product/:id/review` — danh sách review của sản phẩm (đọc, không có create/update/delete review cho product — xem [6.10](#610-review-module)).
- `DELETE /product/:id` — **không hoạt động**: route bị comment out trong controller, và `ProductService.remove()` chỉ là stub trả về chuỗi text, không xoá gì cả.

### 6.1.5 Quyền truy cập (Auth)

| Endpoint | Guard |
|---|---|
| `GET /product`, `GET /product/:id`, `GET /product/:id/booking`, `GET /product/:id/review` | Public |
| `POST /product`, `PUT /product/:id`, `POST /product/:id/publish`, `POST /product/:id/status/:status` | `@Admin()` + `UserGuard` (bắt buộc JWT role `admin`/`super_admin`) |

---

## 6.2 Tour Scheduling & Inventory

Đây là hệ thống lập lịch/tồn kho cho tour, được thêm vào sau các module cơ bản. 
Mô hình:

```
Product ──1:N── Unit              (loại khách: Adult / Children / ...)
Product ──1:N── DepartureTime     (khung giờ khởi hành, không gắn ngày cụ thể)
Product ──1:N── PickupLocation    (điểm đón)
Product ──1:N── Session           (1 dòng = 1 ngày khởi hành cụ thể của product)
Session ──1:N── SessionUnit ──N:1── Unit   (giá của từng Unit tại 1 Session/ngày cụ thể)
```

`Option` (gói/lịch trình) **không** còn liên kết trực tiếp với `Session`/`DepartureTime`/`PickupLocation`/`Unit` — các quan hệ này đã được migrate từ `option` sang thẳng `product`. `Option` giờ chỉ còn được tham chiếu bởi `Booking.optionId` như một lựa chọn gói hiển thị/snapshot, không ảnh hưởng đến giá hay tồn kho.

### 6.2.1 Unit — Loại hành khách

- Bảng `unit`: `name` (VD: "Người lớn", "Trẻ em"), `note`, `product_id`.
- **Không có controller/service riêng** (`UnitModule` rỗng) — chỉ được tạo/sửa/xoá qua `POST /product` / `PUT /product/:id` (mảng `units[]`), theo cơ chế "id-based sync" ở [6.1.2](#612-cập-nhật-sản-phẩm-update-product).
- `Session`/`Booking` đều validate `unitId` phải thuộc đúng `productId` đang thao tác.

### 6.2.2 Departure Time — Khung giờ khởi hành

- Bảng `departure_time`: `time` (TIME, bắt buộc), `label`, `order`, `is_active`, `note`, `product_id`.
- Có controller riêng `/departure-time` (`GET` list theo `productId`, `GET :id`, `POST`/`PUT`/`DELETE` — 3 route sau yêu cầu `@Admin()`), **đồng thời** cũng quản lý được qua `PUT /product/:id` (mảng `departureTimes[]`) — 2 đường vào cùng dữ liệu.
- Chỉ mang tính mô tả (giờ khởi hành hiển thị), **không** gắn với capacity/session.

### 6.2.3 Pickup Location — Điểm đón

- Bảng `pickup_location`: `name`, `address`, `is_popular`, `map_url`, `order`, `product_id`.
- **Không có controller/service riêng** — chỉ tạo/sửa/xoá qua `POST /product` / `PUT /product/:id`.
- Thuần thông tin, **không có phí phụ thu** (không có cột giá) — chọn pickup location không ảnh hưởng `totalPrice` của booking.

### 6.2.4 Session — Ngày khởi hành cụ thể

- Bảng `session` (tên cũ: `tour_session`, đã đổi tên qua migration): 1 dòng = 1 `product_id` + `travel_date`.
- `capacity` (int, mặc định 0): số chỗ tối đa cho phép book.
- `status`: `inactive` (mặc định) | `active` — **Booking chỉ chấp nhận tạo trên session có `status = active`.**

**Endpoint** (`/session`, tất cả route mutate yêu cầu `@Admin()`):
| Method | Path | Mô tả |
|---|---|---|
| `GET` | `/session` | List/paginate |
| `GET` | `/session/:id` | Chi tiết (kèm `sessionUnits.unit`) |
| `POST` | `/session` | Tạo 1 session cho 1 ngày |
| `POST` | `/session/range` | Tạo hàng loạt session theo khoảng ngày |
| `PUT` | `/session/:id` | Cập nhật (status + diff sessionUnits) |
| `DELETE` | `/session/:id` | Soft delete |

**Logic `POST /session`:**
- Dedup theo `(productId, travelDate)` — nếu ngày đó đã có session, trả về session hiện có thay vì tạo trùng.
- Validate toàn bộ `sessionUnits[].unitId` phải unique và thuộc đúng product.
- Session mới luôn tạo với `status: active`.

**Logic `POST /session/range`:**
- Tạo session cho từng ngày trong `[fromDate, toDate]`, tối đa 366 ngày.
- Có thể lọc theo `daysOfWeek` (1=Thứ 2 .. 7=Chủ nhật) — chỉ tạo vào các thứ được chọn.
- `duplicateStrategy`: `SKIP` (mặc định — bỏ qua ngày đã có session) hoặc `OVERWRITE` (ghi đè status + thay toàn bộ `sessionUnits` của ngày đó). Nếu `SKIP` và không có ngày nào mới để tạo → `ConflictException`.

> ⚠️ **Capacity hiện không hoạt động qua API:** field `capacity` trong `CreateSessionDto`/`CreateSessionRangeDto` đang bị **comment out**, và hoàn toàn không có trong `UpdateSessionDto` → session tạo ra luôn có `capacity = 0` mặc định của cột DB, **không có cách nào set giá trị khác qua API hiện tại**. Xem thêm [6.3](#63-booking-module) và [6.16](#616-known-gaps--issues-tổng-hợp).

### 6.2.5 Session Unit — Giá theo ngày

- Bảng `session_unit`: `(session_id, unit_id)` unique, `price` (decimal 12,2, mặc định 0).
- Đây là **ma trận giá theo ngày**: mỗi Unit (loại khách) có 1 giá riêng cho từng Session (ngày).
- Không có controller riêng — quản lý hoàn toàn qua `SessionService` (nested trong create/createRange/update của Session).

---

## 6.3 Booking Module

### 6.3.1 Booking Status Flow

```
pending ──► paid
   │
   └──► cancel   (⚠️ định nghĩa nhưng KHÔNG có code path nào set trạng thái này)
```

- `pending`: Vừa tạo, chờ thanh toán
- `paid`: Set tự động bởi `PaymentService` khi thanh toán PayPal/VNPay thành công — **không có endpoint nào set thủ công**
- `cancel`: Có trong enum và được đếm trong thống kê, nhưng **không có API nào để huỷ booking** hiện tại

### 6.3.2 Tạo Booking (`POST /booking`, `OptionalUserGuard` — cho phép guest lẫn user đăng nhập)

1. Payload `passengers[]` (mỗi item `{unitId, count}`) không được rỗng.
2. Load `Product` (kèm `supplier`) — 404 nếu không có.
3. Load `Option` theo `{id, productId}` — 404 nếu không khớp.
4. Load `Session` theo `{id, productId}` — 404 nếu không khớp; **400 nếu `session.status !== active`**.
5. Nếu có `pickupLocationId`/`departureId`: load & validate thuộc đúng product — 404 nếu sai.
6. Với từng dòng `passengers[]`: tra `SessionUnit` theo `(sessionId, unitId)` để lấy giá của ngày đó.
   - 400 nếu `unitId` không tồn tại.
   - 400 `"Unit {id} not available for this session"` nếu ngày đó chưa cấu hình giá cho unit này (không có `SessionUnit` tương ứng).
7. Tính `totalCount` (tổng `count`) và `totalPrice` (tổng `price * count`), snapshot vào cột `passengers` (jsonb `[{unitId, unitName, price, count}]` — **không phải FK sống**, là bản chụp tại thời điểm đặt).
8. Sinh `bookingCode` = `BK` + timestamp base36 + 3 byte random hex (viết hoa), lưu unique.
9. Snapshot thêm các field hiển thị: `productName`, `optionName`, `departureTime`/`departureLabel`, `pickupLocationName`, `supplierId`/`supplierName`, `currency` (lấy từ product).
10. Lưu `Booking` với `status = pending`.
11. Nếu product có supplier với email → gửi mail thông báo cho **supplier** (không phải khách hàng) qua [Mail Module](#614-mail-module). Lỗi gửi mail bị log, không làm fail request.

> ⚠️ **Không kiểm tra & không khoá tồn kho thực sự & mặc định là không giới hạn capacity**

### 6.3.3 Danh sách & Thống kê Booking

- `GET /booking` — filter: `supplierId`, `productId`, `status`, `fromDate`/`toDate` (theo `travelDate`), `keyword` (search OR trên `phone, email, productName, optionName, username, bookingCode`).
- Trả kèm `BookingStatDto`: số lượng + tổng `totalPrice` group theo từng status (`pending`/`paid`/`cancel`/`total`).

### 6.3.4 Fields đáng chú ý

| Field | Ghi chú |
|---|---|
| `travel_date` | Ngày dự kiến đi (copy từ session tại thời điểm đặt) |
| `total_price` | Tính 1 lần khi tạo booking, không tự tính lại nếu giá session thay đổi sau đó |
| `passengers` (jsonb) | Snapshot số lượng + giá theo từng unit — thay cho các cột `adult/child/infant_price` cũ (đã bị xoá) |
| `messenger_app` (jsonb) | `[{name, username}]` — kênh liên hệ thêm ngoài email/phone |
| `booking_code` | Unique, dùng để tra cứu / hiển thị cho khách |

---

## 6.4 Payment Module (PayPal & VNPay)

Booking không tự thanh toán — có 2 luồng thanh toán riêng, kết quả cùng đổ về `booking.status = paid`.

### 6.4.1 Bảng liên quan

- `booking_payment`: 1 lần thử thanh toán cho 1 booking — `provider` (`paypal`/`vnpay`), `provider_tx_id` (mã giao dịch/capture của cổng), `provider_intent_id` (PayPal order id hoặc VNPay `txnRef`), `price`, `currency`, `status` (`pending`/`succeed`/`failed`), `failure_reason`, `raw_response` (jsonb — toàn bộ payload trả về từ cổng), `booking_id`.
- `booking_payment_history`: log append-only từng lần đổi trạng thái — `from_status`/`to_status`, `provider`, `provider_tx_id`, `reason`, `raw_response`, `source` (VD: `paypal_capture`, `paypal_webhook`, `vnpay_callback`).
- Một booking có thể có **nhiều** `booking_payment` (VD: thử VNPay fail rồi thử lại → tạo `booking_payment` mới với `txnRef` mới).

### 6.4.2 PayPal (`/payment/paypal`)

| Endpoint | Guard | Mô tả |
|---|---|---|
| `GET /payment/paypal/config` | Public | Trả `clientId` + `currency` cho FE khởi tạo PayPal SDK |
| `POST /payment/paypal/:bookingId/create-order` | `OptionalUserGuard` | Tạo PayPal order (intent `CAPTURE`) cho booking đang `pending`; lưu `booking_payment(status=pending)` |
| `POST /payment/paypal/:bookingId/capture-order` | `OptionalUserGuard` | Capture order; `COMPLETED` → payment `succeed` + booking `paid`; ngược lại → payment `failed` + 400 |

- **`POST /webhook/paypal`** mới là nguồn xác nhận đáng tin cậy nhất (server-to-server), xem [6.15](#615-webhook-module) — capture-order từ client cũng set `succeed` nhưng webhook double-check độc lập.

### 6.4.3 VNPay (`/payment/vnpay`)

| Endpoint | Guard | Mô tả |
|---|---|---|
| `POST /payment/vnpay/:bookingId/create-payment-url` | `OptionalUserGuard` | Sinh URL redirect sang VNPay; lưu `booking_payment(status=pending)` |
| `GET /payment/vnpay/return` | Public | URL browser redirect về sau khi thanh toán — verify chữ ký rồi **redirect tiếp** về `{FRONTEND_URL}/payment/vnpay/return?...` — **không phải nguồn xác nhận chính thức** |
| `GET /webhook/vnpay/ipn` | Public (xác thực bằng chữ ký VNPay) | IPN server-to-server — **nguồn xác nhận chính thức duy nhất** để set `paid` |

### 6.4.4 Business rules chung

- Booking chỉ "payable" khi `status === pending` (400 nếu không) — với PayPal/VNPay đều check thêm `bookingId` phải khớp payment đang thao tác.
- `markPaymentSucceeded`: set `booking_payment.status = succeed` + lưu `providerTxId`/`rawResponse`, sau đó update trực tiếp `booking.status = paid`, cuối cùng ghi `booking_payment_history`.
- `markPaymentFailed`: set `booking_payment.status = failed` + `failureReason`, **không** đụng đến `booking.status` (vẫn `pending` để khách thử lại).
- VNPay callback verify thêm: **số tiền trả về phải khớp `payment.price`** — lệch tiền → tự động fail với lý do `"Amount mismatch"`.
- Không có logic nào cộng lại `session.capacity` khi thanh toán fail/booking không hoàn tất (nhất quán với việc capacity chưa thực sự được enforce — xem [6.3.2](#632-tạo-booking-post-booking-optionalUserGuard--cho-phép-guest-lẫn-user-đăng-nhập)).

### 6.4.5 Xem lịch sử thanh toán

- `GET /booking/:id/payment` — toàn bộ `BookingPayment` của 1 booking.
- `GET /booking-payment/:id/logs` — toàn bộ `BookingPaymentHistory` của 1 `booking_payment`, theo thứ tự thời gian.

---

## 6.5 Auth & Authorization

Hệ thống dùng **JWT (access + refresh token)**, không có bảng "admin token" riêng — admin chỉ là 1 giá trị `role` trên cùng bảng `user`.

### 6.5.1 Routes (`/auth`)

| Method | Path | Guard | Mô tả |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Đăng ký user thường; **chặn** tự đăng ký với role `admin`/`super_admin` |
| `POST` | `/auth/login` | Public | Đăng nhập user thường |
| `POST` | `/auth/admin/login` | Public (service tự chặn) | Dùng chung bảng `user`, credential check giống `login`, nhưng **401 nếu `role` không phải `admin`/`super_admin`** |
| `POST` | `/auth/forgot-password` | Public | Sinh token reset (hash SHA-256 lưu DB), hết hạn **5 phút**, gửi mail chứa link |
| `POST` | `/auth/reset-password` | Public | Dùng token reset để đổi mật khẩu |
| `POST` | `/auth/access-token/renew` | Public (verify refresh token trong body) | Rotation: so `version` trong token với `user.refresh_token_version`, lệch → 401; thành công → tăng version + cấp lại cả 2 token |
| `POST` | `/auth/logout` | `UserGuard` | Tăng `refresh_token_version` → vô hiệu hoá mọi refresh token cũ |
| `POST` | `/auth/change-password` | `UserGuard` | Đổi mật khẩu khi đã đăng nhập: kiểm tra `oldPassword`, tăng `refresh_token_version` → refresh token cũ ở mọi thiết bị bị vô hiệu; response trả cặp token mới để thiết bị hiện tại không bị đăng xuất |

### 6.5.2 JWT payload

- Access token: `{ userId, tourGuideId, role }`, hết hạn theo `JWT_EXPIRES_IN` (mặc định `7d`).
- Refresh token: `{ userId, tourGuideId, role, version }`, hết hạn **cố định 7 ngày** (không phụ thuộc `JWT_EXPIRES_IN`).
- Mật khẩu hash bằng bcrypt (`BCRYPT_SALT_ROUNDS`, mặc định 10).
- 4 role: `normal`, `tour_guide`, `admin`, `super_admin`.

### 6.5.3 Guard & Decorator

- `UserGuard` — bắt buộc có `Authorization: Bearer <jwt>` hợp lệ. Đọc metadata `@Public()`/`@Admin()`/`@SuperAdmin()`/`@TourGuide()` để quyết định role yêu cầu. Set `request.userId`/`tourGuideId`/`role` sau khi verify.
- `OptionalUserGuard` — cùng cơ chế nhưng **không throw nếu thiếu token hoàn toàn** (cho phép guest); nếu **có** token nhưng invalid/hết hạn thì vẫn 401. Dùng cho các flow vừa cho guest vừa cho user đăng nhập: tạo booking, tạo review, tạo PayPal order...
- `@UserId()` / `@TourGuideId()` — param decorator lấy giá trị guard đã set vào `request`.

> ⚠️ **Không có global guard.** `main.ts`/`app.module.ts` không đăng ký `APP_GUARD` nào — **mọi route mặc định public**, chỉ được bảo vệ khi controller tự thêm `@UseGuards(UserGuard)` + role decorator. Điều này đã dẫn tới một số route bị bỏ sót guard (xem [6.16](#616-known-gaps--issues-tổng-hợp)). `@Public()` decorator tồn tại trong code nhưng **chưa được dùng ở đâu cả** (không có global guard nên không cần).

### 6.5.4 Endpoint nào yêu cầu quyền gì (tổng hợp)

| Mức | Áp dụng cho |
|---|---|
| `@Admin()` (admin/super_admin) | Destination*, Element (mutate), Option (`PUT`/`DELETE`), Product (mutate), Session (mutate), Supplier (toàn bộ controller), Supplier Payment (toàn bộ controller), Tag (mutate), Video (`GET /admin`, mutate), Departure Time (mutate), User (toàn bộ controller — xem [5.18](05-api-reference.md#518-user-user)) |
| `@TourGuide()` (phải có `tourGuideId` trong token) | Tour guide tự cập nhật profile, onboarding, CRUD "moment" của chính mình |
| `OptionalUserGuard` | Booking (`POST`), Review (`POST tour-guide/:id`), Payment create-order/capture-order/create-payment-url |
| Không guard (public thật) | Toàn bộ `GET` liệt kê/chi tiết, Upload (cả 2 endpoint), Webhook (tự xác thực bằng HMAC/chữ ký riêng, không dùng JWT) |

\* Destination hiện **không có route nào hoạt động** — xem [6.16](#616-known-gaps--issues-tổng-hợp).

---

## 6.6 Audit Trail

13 entity "kiểu CMS" (danh sách bên dưới) kế thừa `AuditableEntity` thay vì `BaseEntity` thường, có thêm 3 cột: `created_by`, `updated_by`, `deleted_by` (uuid, nullable, **không có FK constraint** tới `user.id`).

**Danh sách entity có audit:** `product`, `destination`, `element`, `itinerary`, `option`, `pickup_location`, `supplier`, `tour_guide`, `unit`, `tag`, `video`, `departure_time`, `session`.

**Không có audit** (không track ai tạo/sửa/xoá): `user`, `booking`, `booking_payment`, `booking_payment_history`, `review`, `supplier_payment`, `searching_log`, `session_unit`.

### Cách hoạt động

- **Không** có TypeORM subscriber, entity hook (`@BeforeInsert`...), hay interceptor nào tự động làm việc này.
- Hoàn toàn **thủ công theo convention**: controller nhận `@UserId()`, truyền xuống service; service tự gán `createdBy`/`updatedBy` khi `create()`/`update()`, hoặc gọi `repository.update(id, { deletedBy: userId })` **trước** khi gọi `.softDelete(id)` (2 lệnh ghi riêng biệt, không transaction).
- **Không lưu old/new value** — chỉ lưu uuid người thao tác cho mỗi lifecycle event, không phải audit log dạng diff.

### Gap đã biết

- Vì hoàn toàn dựa vào convention, một số chỗ bị bỏ sót → `created_by`/`updated_by`/`deleted_by` bị `NULL` dù đúng ra phải có giá trị:
  - Tạo Tour Guide qua `POST /auth/register` (tự đăng ký) — không truyền `userId`.
  - Tạo Tour Guide qua `POST /tour-guide` (tự đăng ký, không guard) — `userId` luôn `undefined`.
  - `DELETE /tour-guide/:id` — không có guard nào chạy nên không có `userId` thật để gán `deletedBy`.
  - Xoá "moment" (`DELETE /tour-guide/:id/moment/:momentId`) — gọi `videoService.remove()` mà không truyền `userId`.
- Update/soft-delete không nằm trong transaction — crash giữa 2 lệnh ghi có thể để lại `deleted_by` đã set nhưng `deleted_at` vẫn `NULL` (hoặc ngược lại).

---

## 6.7 Video Module

### 6.7.1 Video Types

| Type | Mô tả | Quy tắc |
|------|-------|---------|
| `hero` | Video nổi bật của sản phẩm | Mỗi product chỉ có **đúng 1** video hero |
| `normal` | Video thường | Không giới hạn |
| `moment` | Video "khoảnh khắc" gắn với 1 Tour Guide (không gắn product) | Set tự động khi `create()` có `tourGuideId`; quản lý qua sub-resource `/tour-guide/:id/moment` |

### 6.7.2 Like/Dislike

- `POST /video/:id/like` → tăng `video.like` thêm 1 (atomic `increment`)
- `POST /video/:id/dislike` → giảm `video.like` đi 1 (atomic `decrement`)
- ⚠️ **Không có chặn dưới 0** — `decrement` là câu SQL `like = like - 1` thuần, không có điều kiện `WHERE like > 0` hay check nào khác → dislike liên tục có thể khiến `like` thành số âm.
- Không có hệ thống user auth bắt buộc cho endpoint này → không track ai đã like.

### 6.7.3 AI Embedding Generation

Video embedding được tạo dựa trên context đa nguồn:
```
embedding = AI(
  video.name + video.description,
  product.name + product.description,
  destination.name + destination.description
)
```
- Kết quả là vector `float[]` (pgvector), fallback `'empty'` nếu thiếu text nguồn nào.
- Dùng để tìm kiếm semantic (cosine similarity).
- Gọi external service: `POST {EMBEDDING_API_URL}/embedding/video`.
- **Được trigger ở 3 nơi**: (1) khi tạo/update video trực tiếp có set hero, (2) khi tạo product với `heroVideoId`, (3) khi update product đổi `heroVideoId` — không chỉ riêng luồng video như trước đây.
- Có thêm cron job backfill hàng ngày cho video thiếu embedding — xem [6.8.3](#683-cron-jobs-taskservice).

### 6.7.4 Video Upload Flow (Chi tiết)

```
1. Client gọi POST /upload/video { title }   (⚠️ hiện KHÔNG có auth guard nào — public)
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
   → Nếu Status = 3 (Finished): gọi thêm BunnyCDN SDK lấy video length → lưu vào video.duration
```

### 6.7.5 Video Preview Generation

- Dùng **FFmpeg** cắt 5 giây đầu từ URL video gốc
- Scale về 640px width (giữ tỷ lệ)
- CRF 28, preset fast, AAC audio 64kbps
- Upload kết quả lên BunnyCDN Storage (folder: `preview/`)
- Xoá file local sau khi upload
- **Dependency**: `ffmpeg` phải được cài trong môi trường (có trong Dockerfile)

### 6.7.6 Quyền truy cập

| Endpoint | Guard |
|---|---|
| `GET /video`, `GET /video/:slug`, `GET /video/id/:id`, like/dislike | Public |
| `GET /video/admin`, `POST /video`, `PUT /video/:id` | `@Admin()` + `UserGuard` |

---

## 6.8 Searching Module

### 6.8.1 Search Logging

Mỗi lần search được log với:
- `query`: từ khoá
- `ipAddress`: IP người dùng (lấy từ `x-forwarded-for` header hoặc socket)
- `userId`: optional (nếu có)

Đồng thời **upsert SearchingStat**:
- Nếu query đã tồn tại: `total_count++`, `month_count++`, update `last_searched_at`
- Nếu query mới: tạo mới với `total_count = 1`, `month_count = 1`

### 6.8.2 Suggestions Logic

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

### 6.8.3 Cron Jobs (TaskService)

⚠️ Cả 2 cron dưới đây chạy **`EVERY_DAY_AT_MIDNIGHT`** (hàng ngày, không phải hàng tháng như tên gọi có thể gợi ý).

**1. Recompute `month_count` (hàng ngày, không phải "reset hàng tháng"):**
```
Logic:
1. Tính số lần search từng query TÍNH TỪ ĐẦU THÁNG hiện tại (aggregate từ searching_log)
2. Update month_count trong searching_stat cho mỗi query
3. Queries không xuất hiện trong tháng (tính đến hiện tại) → month_count = 0
```
Vì chạy mỗi ngày, đây thực chất là "tính lại số liệu tháng hiện tại tới hiện tại", không phải hành động "reset về 0 khi sang tháng mới" — tuy hiệu ứng cuối cùng (số liệu tháng cũ về 0 khi qua tháng mới) là tương đương.

**2. Backfill embedding cho video thiếu (mới, chưa từng được tài liệu hoá):**
```
Logic:
- Tìm toàn bộ video có embedding IS NULL
- Với mỗi video: gọi EmbeddingService sinh embedding rồi lưu lại
```
Có đoạn gọi tương tự ở `onModuleInit` nhưng đang bị comment out — **không chạy lúc app khởi động**, chỉ chạy theo cron.

---

## 6.9 Upload Module

### 6.9.1 File Path Convention

```
Format: {fileType}/{folder}/{year}/{month}/wt_{timestamp}.{ext}

Ví dụ (khi có folder — chỉ xảy ra với upload nội bộ, xem ghi chú dưới):
  file/preview/2026/05/wt_1748123456789.mp4
```

⚠️ **Segment `{folder}` không thể set qua endpoint public.** `POST /upload/:fileType` không truyền `folder` xuống service → mọi file upload qua API public thực tế có path dạng `img/2026/05/wt_....jpg` (bỏ qua segment folder). Segment `folder` **chỉ** được dùng nội bộ khi hệ thống tự tạo video preview (`folder='preview'`, xem [6.7.5](#675-video-preview-generation)).

### 6.9.2 Validation Rules

| FileType | Phép mở rộng | Xử lý từ chối |
|----------|-------------|---------------|
| `img` | jpg, jpeg, png, webp, gif | `BadRequestException` |
| `file` | Tất cả | Không validate extension |

### 6.9.3 Quyền truy cập

⚠️ **Cả `POST /upload/video` lẫn `POST /upload/:fileType` hiện đều không có auth guard nào** — code đã import `Admin`/`UserGuard` nhưng đang comment out kèm `// TODO: check client`. Bất kỳ ai cũng có thể gọi 2 endpoint này.

---

## 6.10 Review Module

⚠️ Module này đã được viết lại hoàn toàn — **chỉ còn 1 route duy nhất**, và nó tạo review cho **Tour Guide**, không phải cho Product.

### 6.10.1 `POST /review/tour-guide/:tourGuideId` (`OptionalUserGuard`)

- `point`: 1–5, **bắt buộc** (không có default, khác với mô tả cũ).
- `comment`, `images[]`: optional.
- `tourGuideSubRatings[]` (optional): đánh giá theo từng tiêu chí — `storytelling`, `localKnowledge`, `careAttention`, `safetyAwareness`, `punctuality`, `english`, `funny`.
- Nếu request không có `userId` (guest): tự tạo 1 `User` ẩn danh (`role: normal`, `name: 'Anonymous'`) để gắn review vào.
- Sau khi tạo review, **tự động cập nhật thống kê trên chính `TourGuide`** (tính trung bình trọng số — incremental weighted average, không phải tính lại từ đầu mỗi lần):
  - `tourGuide.ratingCount` (+1)
  - `tourGuide.ratingValue` (điểm trung bình mới)
  - `tourGuide.userReview` (jsonb) — gồm `reviewCount`, `reviewValue`, và mảng `ratings[]` theo từng tiêu chí sub-rating ở trên.

### 6.10.2 Đọc review

- `GET /product/:id/review` — review của sản phẩm.
- `GET /tour-guide/:id/review` — review của tour guide.

### 6.10.3 `product.review_point` / `product.review_count`

> ⚠️ **Vẫn đúng như tài liệu cũ: 2 field này được quản lý thủ công, không có auto-trigger.** Nhưng khác biệt lớn so với trước: hiện **không còn API nào để tạo review cho Product cả** (route cũ đã bị xoá khi review module được viết lại chỉ còn phục vụ Tour Guide) — nên "cần update thủ công khi có review mới" hiện gần như không còn xảy ra qua luồng bình thường, trừ khi có ai chỉnh trực tiếp DB.

---

## 6.11 Tour Guide Module

Chưa từng được tài liệu hoá trước đây dù có khá nhiều nghiệp vụ.

| Method | Path | Guard | Mô tả |
|---|---|---|---|
| `POST` | `/tour-guide` | Không có guard | Tự đăng ký hồ sơ tour guide (không cần đăng nhập trước) |
| `GET` | `/tour-guide` | Public | Danh sách |
| `GET` | `/tour-guide/skills` | Public | Danh sách kỹ năng chuẩn hoá (đọc từ `src/common/constants/tour-guide-skills.json`) |
| `GET` | `/tour-guide/:id` | Public | Chi tiết |
| `PUT` | `/tour-guide/:id` | `@TourGuide()` | Cập nhật hồ sơ |
| `POST` | `/tour-guide/onboarding` | `@TourGuide()` | Hoàn tất onboarding |
| `GET` | `/tour-guide/:id/review` | Public | Danh sách review |
| `GET` | `/tour-guide/:id/moment` | Public | Danh sách "moment" (video) |
| `POST` | `/tour-guide/:id/moment` | `@TourGuide()` | Tạo moment (video `type = moment`) |
| `PUT` | `/tour-guide/:id/moment/:momentId` | `@TourGuide()` | Sửa moment |
| `DELETE` | `/tour-guide/:id/moment/:momentId` | `@TourGuide()` | Xoá moment |
| `DELETE` | `/tour-guide/:id` | ⚠️ **Không có guard nào** | Xoá hồ sơ tour guide |

- `@TourGuide()` yêu cầu JWT có `tourGuideId` — không tự động kiểm tra `tourGuideId` trong token có khớp với `:id` trên URL hay không (xem [6.16](#616-known-gaps--issues-tổng-hợp) nếu cần rà lại theo hướng bảo mật).

---

## 6.12 Element Module

**Element** là danh mục các tiện ích/thuộc tính tái sử dụng:
- Được tạo 1 lần, gán cho nhiều sản phẩm
- `is_active = false` → không hiển thị dù đã gán vào sản phẩm
- Khi load product detail: tự động filter `elements.filter(e => e.isActive)`
- `PUT /element/:id/active` — bật lại element đã tắt.
- `DELETE /element/:id` — thực chất là **deactivate** (`is_active = false`), không phải xoá cứng dữ liệu.
- Toàn bộ route mutate (`POST`, `PUT`, `PUT :id/active`, `DELETE`) yêu cầu `@Admin()`.

Tương tự, `Tag` cũng có `PUT /tag/:id` (chưa từng được liệt kê trong API reference cũ) và `DELETE /tag/:id` cũng là deactivate, không phải xoá cứng.

---

## 6.13 Supplier Module

### 6.13.1 Supplier Statistics

Các field thống kê trên `supplier` hiện được cập nhật thủ công:
- `rating_count`: Tổng số đánh giá
- `rating_rate`: Điểm trung bình
- `tour_offered`: Số tour đang hoạt động
- `response_rate`: Tỷ lệ phản hồi
- `exp_years`: Số năm kinh nghiệm

> Chưa có auto-sync từ review/booking. Cần update qua API khi có thay đổi.

### 6.13.2 Supplier Payment Method (mới, chưa từng tài liệu hoá)

- Bảng `supplier_payment` — phương thức nhận thanh toán của supplier (`BANK`, `CARD`, `PAYPAL`, `VNPAY` — enum `SupplierPaymentMethod`, dùng chung với `booking_payment.provider`).
- Toàn bộ CRUD (`POST`/`GET`/`GET :id`/`PUT`/`DELETE`) tại `/supplier-payment`, **cả controller yêu cầu `@Admin()`**.
- Business rule: set `isDefault: true` sẽ tự động bỏ `isDefault` của mọi payment method khác **cùng supplier** — đảm bảo mỗi supplier chỉ có đúng 1 phương thức mặc định tại một thời điểm.

---

## 6.14 Mail Module

Module `MailModule` (global) dùng `@nestjs-modules/mailer`, gửi qua SMTP Gmail (host `smtp.gmail.com:587` hardcode trong code, xác thực bằng env `SMPT_USER`/`SMPT_APP_PASSWORD` — **tên biến bị lỗi chính tả có chủ đích trong code, không phải "SMTP"**).

- Hiện chỉ có **1 loại mail**: `sendSupplierBookingNotification(booking, supplier)` — gửi cho **supplier**, không phải khách hàng, ngay sau khi tạo booking (status vẫn `pending`, chưa thanh toán).
- Nội dung: mã booking, ngày đi, giờ/điểm khởi hành, thông tin khách (tên/email/phone), breakdown số khách theo unit, điểm đón, tổng tiền, các kênh liên hệ `messengerApp`.
- ⚠️ Tiêu đề mail dùng chữ "confirmed" dù trạng thái booking thực tế vẫn là `pending` — dễ gây hiểu lầm.
- Lỗi gửi mail bị bắt và log lại, **không** làm fail việc tạo booking.

---

## 6.15 Webhook Module

Nhận sự kiện server-to-server từ 3 nguồn khác nhau, mỗi nguồn tự xác thực theo cơ chế riêng (không dùng JWT):

| Endpoint | Nguồn | Xác thực |
|---|---|---|
| `POST /webhook/bunny` | BunnyCDN | HMAC-SHA256 header (xem [6.15.1](#6151-bunnycdn-video-webhook)) |
| `POST /webhook/paypal` | PayPal | 5 header `paypal-*` + gọi API PayPal verify chữ ký |
| `GET /webhook/vnpay/ipn` | VNPay | Query string signature (SHA512 HMAC) |

### 6.15.1 BunnyCDN Video Webhook

**Mục đích:** Sau khi client upload video lên BunnyCDN (qua TUS protocol), BunnyCDN tự động gọi webhook `POST /webhook/bunny` để thông báo trạng thái xử lý video (encode, thumbnail, hoàn thành...). Backend nhận sự kiện này để đồng bộ `video.uploading_status` trong database.

**Luồng xử lý (Flow):**

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
            → Nếu Status = Finished (3): gọi thêm BunnyCDN SDK lấy video length,
              lưu vào video.duration
            → Return { success: true }
```

**Xác thực chữ ký (Signature Validation):**

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

**BunnyVideoStatus — Bảng trạng thái:**

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

**Cấu hình Webhook trên BunnyCDN:**

1. Vào **BunnyCDN Dashboard** → **Stream** → chọn Video Library
2. Tab **Settings** → **Webhook URL**
3. Điền: `https://web-travel-be.fly.dev/webhook/bunny`
4. Lưu lại — BunnyCDN sẽ tự gọi mỗi khi video thay đổi trạng thái

> ⚠️ Webhook chỉ hoạt động với HTTPS URL public. Khi dev local cần dùng tunnel như **ngrok**: `ngrok http 3000` rồi dùng URL ngrok.

### 6.15.2 PayPal Webhook (`POST /webhook/paypal`)

- Validate 5 header: `paypal-auth-algo`, `paypal-cert-url`, `paypal-transmission-id`, `paypal-transmission-sig`, `paypal-transmission-time`.
- Gọi API PayPal (`verifyWebhookSignature`) để xác thực.
- Chỉ xử lý event `PAYMENT.CAPTURE.COMPLETED` → gọi `PaymentService.markPaymentSucceededByOrderId()`.
- Đây là nguồn xác nhận thanh toán PayPal **đáng tin cậy nhất** (song song với luồng client-driven `capture-order`).

### 6.15.3 VNPay IPN (`GET /webhook/vnpay/ipn`)

- Đây là endpoint **duy nhất chính thức** để xác nhận thanh toán VNPay thành công (khác với `/payment/vnpay/return` chỉ để redirect trình duyệt).
- Verify chữ ký từ query string, đối chiếu `providerIntentId = txnRef`, kiểm tra số tiền khớp, rồi trả về đúng format VNPay yêu cầu:

| RspCode | Ý nghĩa |
|---|---|
| `00` | Xác nhận thành công |
| `01` | Không tìm thấy order |
| `04` | Số tiền không khớp |
| `97` | Chữ ký không hợp lệ |

### 6.15.4 Biến môi trường cần thiết

| Biến | Dùng cho |
|------|-------|
| `BUNNY_READONLY_API_KEY` | Secret verify HMAC webhook Bunny — **khác** `BUNNY_API_KEY` (key ghi/tạo video) |
| `PAYPAL_*` | Client id/secret, mode (sandbox/live), webhook id — xem [08-environment.md](./08-environment.md) |
| `VNPAY_*` | TMN code, secret key, URL cổng — xem [08-environment.md](./08-environment.md) |

---

## 6.16 Known Gaps / Issues (tổng hợp)

Danh sách toàn bộ điểm dở dang/rủi ro phát hiện được khi rà code so với docs, gom lại một chỗ để dễ lên kế hoạch xử lý. Xem thêm bảng tổng hợp ở [09-development.md §9.9](./09-development.md#99-known-issues--todo).

| # | Vấn đề | Mức độ | Vị trí |
|---|---|---|---|
| 1 | `Session.capacity` không thể set qua API, check overbooking bị disable nhưng vẫn trừ âm | 🔴 Nghiệp vụ | `session.service.ts`, `booking.service.ts` |
| 2 | Không có endpoint huỷ booking (`cancel` không thể reach) | 🔴 Nghiệp vụ | `booking.controller.ts` |
| 3 | Tạo booking + trừ capacity không transaction → race condition khi nhiều người đặt cùng lúc | 🔴 Nghiệp vụ | `booking.service.ts` |
| 4 | `Destination` không có CRUD thật (module chưa đăng ký, controller/service là boilerplate) | 🔴 Chức năng | `destination.module.ts` |
| 5 | ~~`User` controller — không có API user CRUD~~ ✅ Đã có API quản lý user `/user` | — | `user.controller.ts` |
| 6 | Upload (`/upload/video`, `/upload/:fileType`) không có auth guard nào | 🔴 Bảo mật | `upload.controller.ts` |
| 7 | `DELETE /tour-guide/:id` không có guard nào | 🔴 Bảo mật | `tour-guide.controller.ts` |
| 8 | `GET /booking`, `GET /booking/:id/payment` không kiểm tra quyền sở hữu | 🟠 Bảo mật | `booking.controller.ts` |
| 9 | Không có global guard — mỗi route mới phải tự nhớ gắn `@UseGuards` | 🟠 Kiến trúc | toàn hệ thống |
| 10 | Audit columns không có FK tới `user.id`, không cover `booking`/`review`/`user`/`supplier_payment`, vài chỗ set `NULL` do quên truyền `userId` | 🟡 Data quality | xem [6.6](#66-audit-trail) |
| 11 | `Video.like` có thể âm (decrement không chặn dưới 0) | 🟡 Nghiệp vụ | `video.service.ts` |
| 12 | Response shape lỗi khác response shape thành công (`{statusCode,message,timestamp,path}` vs `{data,code,error,message}`) | 🟡 API contract | `telegram-exception.filter.ts` |
| 13 | Upload path convention: segment `{folder}` không dùng được từ API public dù có trong format | 🟡 Docs/API | `upload.controller.ts` |
| 14 | `product.review_point`/`review_count` vẫn thủ công (và hiện không còn API tạo review cho product) | 🟡 Nghiệp vụ | `review` module |
| 15 | Env vars dùng trong code nhưng thiếu trong `08-environment.md` trước bản cập nhật này | 🟢 Docs | đã bổ sung — xem [08-environment.md](./08-environment.md) |

---
[← Trang trước](./05-api-reference.md) | [Trang sau →](./07-deploy.md)
