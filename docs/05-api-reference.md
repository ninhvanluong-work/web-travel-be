# 05 — API Reference

> Swagger UI đầy đủ: `http://localhost:3000/docs` (hoặc production URL `https://web-travel-be.fly.dev/docs`)
>
> Tất cả response theo format:
> ```json
> { "data": any, "code": number, "error": null | string, "message": string }
> ```

---

## 5.1 Product `/product`

| Method | Path | Mô tả |
|--------|------|-------|
| `GET` | `/product` | Danh sách sản phẩm (phân trang, filter) |
| `GET` | `/product/:id` | Chi tiết sản phẩm theo ID |
| `POST` | `/product` | Tạo sản phẩm mới |
| `PUT` | `/product/:id` | Cập nhật sản phẩm |
| `DELETE` | `/product/:id` | Xoá sản phẩm (soft delete) |

### Query params `GET /product`
| Param | Kiểu | Mô tả |
|-------|------|-------|
| `page` | number | Trang (default: 1) |
| `pageSize` | number | Số item mỗi trang (default: 10) |
| `keyword` | string | Tìm kiếm theo tên |
| `supplierId` | uuid | Filter theo supplier |
| `destinationId` | uuid | Filter theo destination |
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
        "status": "published",
        "reviewPoint": 4.5,
        "destination": { "id": "uuid", "name": "Hạ Long" },
        "supplier": { "id": "uuid", "name": "Travel Co" }
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 100,
      "totalPages": 10
    }
  },
  "code": 200,
  "error": null,
  "message": "ok"
}
```

### Body `POST /product`
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
  "elementIds": ["uuid"]
}
```

---

## 5.2 Video `/video`

| Method | Path | Mô tả |
|--------|------|-------|
| `GET` | `/video` | Danh sách video (public, có log search) |
| `GET` | `/video/admin` | Danh sách video (admin view) |
| `GET` | `/video/:slug` | Chi tiết video theo slug |
| `GET` | `/video/id/:id` | Chi tiết video theo ID |
| `POST` | `/video` | Tạo video mới |
| `PUT` | `/video/:id` | Cập nhật video |
| `POST` | `/video/:id/like` | Like video |
| `POST` | `/video/:id/dislike` | Dislike video |

### Query params `GET /video`
| Param | Kiểu | Mô tả |
|-------|------|-------|
| `query` | string | Từ khoá tìm kiếm (được log vào searching) |
| `userId` | uuid | User đang tìm (optional, cho log) |
| `page` | number | Trang |
| `pageSize` | number | Số item |
| `productId` | uuid | Filter theo sản phẩm |
| `type` | `hero\|normal` | Filter theo loại video |

---

## 5.3 Upload `/upload`

| Method | Path | Mô tả |
|--------|------|-------|
| `POST` | `/upload/video` | Tạo video slot trên BunnyCDN → nhận signature |
| `POST` | `/upload/file` | Upload file ảnh lên BunnyCDN Storage |

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

### `POST /upload/file`
**Body:** `multipart/form-data`
- `file`: File ảnh (jpg, jpeg, png, webp, gif)
- `fileType`: `img` | `file`
- `folder` (optional): Subfolder trong storage

**Response:**
```json
{
  "fileType": "img",
  "url": "https://cdn.example.com/img/2026/05/wt_1748123456789.jpg"
}
```

---

## 5.4 Webhook `/webhook`

| Method | Path | Mô tả |
|--------|------|-------|
| `POST` | `/webhook/bunny` | Nhận event từ BunnyCDN khi video xử lý xong |

### `POST /webhook/bunny`
BunnyCDN gọi tự động sau khi video hoàn thành encode.
```json
{
  "VideoGuid": "bunny-video-guid",
  "VideoLibraryId": 12345,
  "Status": 3
}
```
> Status 3 = Finished. Backend cập nhật `video.uploading_status`.

---

## 5.5 Searching `/searching`

| Method | Path | Mô tả |
|--------|------|-------|
| `POST` | `/searching` | Log 1 lượt tìm kiếm |
| `GET` | `/searching/suggestions` | Gợi ý tìm kiếm |
| `GET` | `/searching/hot` | Hot searches (top 8 tháng này) |

### `GET /searching/suggestions?keyword=ha`
**Response:**
```json
{
  "data": {
    "hotSearches": [
      { "query": "hạ long", "monthCount": 150 }
    ],
    "destinations": [
      { "id": "uuid", "name": "Hạ Long" }
    ],
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

## 5.6 Supplier `/supplier`

| Method | Path | Mô tả |
|--------|------|-------|
| `GET` | `/supplier` | Danh sách supplier |
| `GET` | `/supplier/:id` | Chi tiết |
| `POST` | `/supplier` | Tạo mới |
| `PUT` | `/supplier/:id` | Cập nhật |
| `DELETE` | `/supplier/:id` | Xoá |

---

## 5.7 Destination `/destination`

| Method | Path | Mô tả |
|--------|------|-------|
| `GET` | `/destination` | Danh sách điểm đến |
| `GET` | `/destination/:id` | Chi tiết |
| `POST` | `/destination` | Tạo mới |
| `PUT` | `/destination/:id` | Cập nhật |
| `DELETE` | `/destination/:id` | Xoá |

---

## 5.8 Option `/option`

| Method | Path | Mô tả |
|--------|------|-------|
| `GET` | `/option` | Danh sách option |
| `POST` | `/option` | Tạo option (gắn với product) |
| `PUT` | `/option/:id` | Cập nhật |
| `DELETE` | `/option/:id` | Xoá |

---

## 5.9 Element `/element`

| Method | Path | Mô tả |
|--------|------|-------|
| `GET` | `/element` | Danh sách element |
| `POST` | `/element` | Tạo mới |
| `PUT` | `/element/:id` | Cập nhật |
| `DELETE` | `/element/:id` | Xoá |

---

## 5.10 Itinerary `/itinerary`

| Method | Path | Mô tả |
|--------|------|-------|
| `GET` | `/itinerary` | Danh sách |
| `POST` | `/itinerary` | Tạo mới |
| `PUT` | `/itinerary/:id` | Cập nhật |

> Thường được quản lý qua `PUT /product/:id` với field `itineraries[]`.

---

## 5.11 Review `/review`

| Method | Path | Mô tả |
|--------|------|-------|
| `GET` | `/review` | Danh sách review |
| `POST` | `/review` | Tạo review mới |
| `PUT` | `/review/:id` | Cập nhật |
| `DELETE` | `/review/:id` | Xoá |

---

## 5.12 Tag `/tag`

| Method | Path | Mô tả |
|--------|------|-------|
| `GET` | `/tag` | Danh sách tag |
| `POST` | `/tag` | Tạo mới |
| `DELETE` | `/tag/:id` | Xoá |

---

## 5.13 TourGuide `/tour-guide`

| Method | Path | Mô tả |
|--------|------|-------|
| `GET` | `/tour-guide` | Danh sách hướng dẫn viên |
| `POST` | `/tour-guide` | Tạo mới |
| `PUT` | `/tour-guide/:id` | Cập nhật |
| `DELETE` | `/tour-guide/:id` | Xoá |

---

## 5.14 User `/user`

| Method | Path | Mô tả |
|--------|------|-------|
| `GET` | `/user` | Danh sách user |
| `GET` | `/user/:id` | Chi tiết |
| `POST` | `/user` | Tạo user |
| `PUT` | `/user/:id` | Cập nhật |

---

## 5.15 Health Check

| Method | Path | Mô tả |
|--------|------|-------|
| `GET` | `/` | App health check (AppController) |
