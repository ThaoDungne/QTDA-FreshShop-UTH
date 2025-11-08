# FreshShop API Documentation

## 🔐 Authentication

### POST /auth/login
**Mục đích:** Đăng nhập admin và nhận JWT token

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "admin": {
    "id": "507f1f77bcf86cd799439011",
    "username": "admin",
    "fullName": "System Administrator",
    "email": "admin@freshshop.com",
    "phone": "0123456789",
    "role": "admin",
    "isActive": true
  }
}
```

### GET /auth/profile
**Mục đích:** Lấy thông tin profile admin hiện tại

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "username": "admin",
  "fullName": "System Administrator",
  "email": "admin@freshshop.com",
  "phone": "0123456789",
  "role": "admin",
  "isActive": true,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

### POST /auth/logout
**Mục đích:** Đăng xuất admin

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Logout successful",
  "admin": "admin"
}
```

## 👥 Admin Management

### GET /admin
**Mục đích:** Lấy danh sách tất cả admin

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "username": "admin",
    "fullName": "System Administrator",
    "email": "admin@freshshop.com",
    "phone": "0123456789",
    "role": "admin",
    "isActive": true,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

### POST /admin
**Mục đích:** Tạo admin mới

**Request Body:**
```json
{
  "username": "newadmin",
  "password": "password123",
  "fullName": "New Administrator",
  "email": "newadmin@freshshop.com",
  "phone": "0987654321"
}
```

**Response (201):**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "username": "newadmin",
  "fullName": "New Administrator",
  "email": "newadmin@freshshop.com",
  "phone": "0987654321",
  "role": "admin",
  "isActive": true,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

### GET /admin/:id
**Mục đích:** Lấy thông tin admin theo ID

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "username": "admin",
  "fullName": "System Administrator",
  "email": "admin@freshshop.com",
  "phone": "0123456789",
  "role": "admin",
  "isActive": true,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

### PATCH /admin/:id
**Mục đích:** Cập nhật thông tin admin

**Request Body:**
```json
{
  "fullName": "Updated Administrator",
  "email": "updated@freshshop.com",
  "phone": "0111222333",
  "isActive": true
}
```

### DELETE /admin/:id
**Mục đích:** Xóa admin (soft delete)

**Response (200):**
```json
{
  "message": "Admin deleted successfully"
}
```

## 👤 Customer Management

### GET /customers
**Mục đích:** Lấy danh sách tất cả khách hàng

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439021",
    "fullName": "Nguyễn Thị Lan",
    "phone": "0901234567",
    "gender": "female",
    "birthDate": "1990-05-15T00:00:00.000Z",
    "address": "123 Đường ABC, Quận 1, TP.HCM",
    "loyaltyPoints": 150,
    "loyaltyTier": "Gold",
    "note": "VIP customer",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

### POST /customers
**Mục đích:** Tạo khách hàng mới

**Request Body:**
```json
{
  "fullName": "Trần Văn Nam",
  "phone": "0987654321",
  "gender": "male",
  "birthDate": "1985-03-20",
  "address": "456 Đường XYZ, Quận 2, TP.HCM",
  "loyaltyTier": "Silver",
  "note": "Regular customer"
}
```

### GET /customers/search?q=query
**Mục đích:** Tìm kiếm khách hàng theo tên hoặc số điện thoại

**Query Parameters:**
- `q` (string): Từ khóa tìm kiếm

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439021",
    "fullName": "Nguyễn Thị Lan",
    "phone": "0901234567",
    "loyaltyPoints": 150
  }
]
```

### GET /customers/:id
**Mục đích:** Lấy thông tin khách hàng theo ID

### PATCH /customers/:id
**Mục đích:** Cập nhật thông tin khách hàng

### PATCH /customers/:id/loyalty-points
**Mục đích:** Điều chỉnh điểm thưởng khách hàng

**Request Body:**
```json
{
  "points": 50,
  "reason": "Manual adjustment",
  "note": "Bonus for good behavior"
}
```

### DELETE /customers/:id
**Mục đích:** Xóa khách hàng (soft delete)

## 🛍️ Product Management

### GET /products
**Mục đích:** Lấy danh sách tất cả sản phẩm

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439031",
    "name": "Rau muống",
    "sku": "VEG-001",
    "category": "leafy",
    "unit": "bó",
    "price": 12000,
    "expiryDays": 2,
    "supplier": "507f1f77bcf86cd799439041",
    "barcode": "1234567890123",
    "status": "active",
    "attributes": {
      "organic": true,
      "origin": "Đà Lạt"
    },
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

### POST /products
**Mục đích:** Tạo sản phẩm mới

**Request Body:**
```json
{
  "name": "Rau cải xanh",
  "sku": "VEG-002",
  "category": "leafy",
  "unit": "bó",
  "price": 15000,
  "expiryDays": 3,
  "supplier": "507f1f77bcf86cd799439041",
  "barcode": "1234567890124",
  "attributes": {
    "organic": true,
    "origin": "Miền Tây"
  }
}
```

### GET /products/active
**Mục đích:** Lấy danh sách sản phẩm đang hoạt động

### GET /products/search?q=query
**Mục đích:** Tìm kiếm sản phẩm theo tên, SKU hoặc barcode

### GET /products/category/:category
**Mục đích:** Lấy sản phẩm theo danh mục

### GET /products/supplier/:supplierId
**Mục đích:** Lấy sản phẩm theo nhà cung cấp

### GET /products/:id
**Mục đích:** Lấy thông tin sản phẩm theo ID

### PATCH /products/:id
**Mục đích:** Cập nhật thông tin sản phẩm

### DELETE /products/:id
**Mục đích:** Xóa sản phẩm (soft delete)

## 🏢 Supplier Management

### GET /suppliers
**Mục đích:** Lấy danh sách tất cả nhà cung cấp

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439041",
    "name": "Nhà cung cấp rau sạch Đà Lạt",
    "contactName": "Nguyễn Văn A",
    "phone": "0901234567",
    "email": "contact@dalat-vegetables.com",
    "address": "123 Đường ABC, Đà Lạt, Lâm Đồng",
    "taxCode": "0123456789",
    "note": "Chuyên cung cấp rau sạch từ Đà Lạt",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

### POST /suppliers
**Mục đích:** Tạo nhà cung cấp mới

**Request Body:**
```json
{
  "name": "Nhà cung cấp rau sạch Miền Tây",
  "contactName": "Trần Thị B",
  "phone": "0987654321",
  "email": "contact@mientay-vegetables.com",
  "address": "456 Đường XYZ, Cần Thơ",
  "taxCode": "0987654321",
  "note": "Chuyên cung cấp rau sạch từ Miền Tây"
}
```

### GET /suppliers/search?q=query
**Mục đích:** Tìm kiếm nhà cung cấp

### GET /suppliers/:id
**Mục đích:** Lấy thông tin nhà cung cấp theo ID

### PATCH /suppliers/:id
**Mục đích:** Cập nhật thông tin nhà cung cấp

### DELETE /suppliers/:id
**Mục đích:** Xóa nhà cung cấp (soft delete)

## 📦 Inventory Management

### POST /inventory/lots
**Mục đích:** Tạo lô hàng mới (nhập kho)

**Request Body:**
```json
{
  "productId": "507f1f77bcf86cd799439031",
  "quantityIn": 100,
  "costPerUnit": 8000,
  "supplierId": "507f1f77bcf86cd799439041",
  "receivedDate": "2025-01-01",
  "note": "Fresh delivery from supplier"
}
```

**Response (201):**
```json
{
  "_id": "507f1f77bcf86cd799439051",
  "product": "507f1f77bcf86cd799439031",
  "lotCode": "VEG-001-20250101-001",
  "receivedDate": "2025-01-01T00:00:00.000Z",
  "expiryDate": "2025-01-03T00:00:00.000Z",
  "quantityIn": 100,
  "quantityAvailable": 100,
  "costPerUnit": 8000,
  "supplier": "507f1f77bcf86cd799439041",
  "note": "Fresh delivery from supplier",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

### POST /inventory/adjust
**Mục đích:** Điều chỉnh tồn kho

**Request Body:**
```json
{
  "productId": "507f1f77bcf86cd799439031",
  "lotId": "507f1f77bcf86cd799439051",
  "quantity": 10,
  "reason": "Stock count correction",
  "note": "Physical count adjustment"
}
```

### GET /inventory/stock/:productId
**Mục đích:** Kiểm tra tồn kho sản phẩm

**Response (200):**
```json
{
  "totalAvailable": 150,
  "lots": [
    {
      "lotId": "507f1f77bcf86cd799439051",
      "lotCode": "VEG-001-20250101-001",
      "quantityAvailable": 100,
      "expiryDate": "2025-01-03T00:00:00.000Z",
      "costPerUnit": 8000
    }
  ]
}
```

### GET /inventory/expiring?days=3
**Mục đích:** Lấy danh sách hàng sắp hết hạn

**Query Parameters:**
- `days` (number): Số ngày cảnh báo trước khi hết hạn

**Response (200):**
```json
[
  {
    "product": "Rau muống",
    "lotCode": "VEG-001-20250101-001",
    "quantityAvailable": 50,
    "expiryDate": "2025-01-03T00:00:00.000Z",
    "daysUntilExpiry": 2
  }
]
```

### GET /inventory/report
**Mục đích:** Báo cáo tồn kho

**Query Parameters:**
- `lowStockThreshold` (number): Ngưỡng tồn kho thấp
- `expiryWarningDays` (number): Số ngày cảnh báo hết hạn
- `category` (string): Lọc theo danh mục

## 🛒 Point of Sale (POS)

### POST /pos/invoices
**Mục đích:** Tạo hóa đơn bán hàng

**Request Body:**
```json
{
  "customerId": "507f1f77bcf86cd799439021",
  "cashierId": "507f1f77bcf86cd799439011",
  "items": [
    {
      "productId": "507f1f77bcf86cd799439031",
      "quantity": 2,
      "unitPrice": 12000,
      "discount": 1000
    }
  ],
  "paidAmount": 50000,
  "paymentMethod": "cash",
  "note": "Customer purchase"
}
```

**Response (201):**
```json
{
  "invoice": {
    "_id": "507f1f77bcf86cd799439061",
    "code": "INV-20250101-0001",
    "customer": "507f1f77bcf86cd799439021",
    "cashier": "507f1f77bcf86cd799439011",
    "itemsSummary": {
      "itemCount": 1,
      "subtotal": 24000,
      "discountTotal": 1000,
      "taxTotal": 0,
      "grandTotal": 23000
    },
    "paidAmount": 50000,
    "changeAmount": 27000,
    "paymentMethod": "cash",
    "status": "completed",
    "createdAt": "2025-01-01T00:00:00.000Z"
  },
  "items": [...],
  "payment": {...},
  "stockMovements": [...],
  "loyaltyLedger": {...}
}
```

### GET /pos/invoices
**Mục đích:** Lấy danh sách hóa đơn

**Query Parameters:**
- `startDate` (string): Ngày bắt đầu
- `endDate` (string): Ngày kết thúc
- `customerId` (string): ID khách hàng
- `cashierId` (string): ID thu ngân

### GET /pos/invoices/:id
**Mục đích:** Lấy thông tin hóa đơn theo ID

### PATCH /pos/invoices/:id/void
**Mục đích:** Hủy hóa đơn

**Request Body:**
```json
{
  "reason": "Customer cancelled order",
  "note": "Order cancelled by customer request"
}
```

### GET /pos/invoices/:id/print
**Mục đích:** Lấy dữ liệu in hóa đơn

## 📊 Reports & Analytics

### GET /reports/revenue
**Mục đích:** Báo cáo doanh thu

**Query Parameters:**
- `startDate` (string): Ngày bắt đầu
- `endDate` (string): Ngày kết thúc
- `groupBy` (string): Nhóm theo (day/week/month)

**Response (200):**
```json
[
  {
    "period": "2025-01-01",
    "totalRevenue": 150000,
    "totalInvoices": 5,
    "averageOrderValue": 30000,
    "date": "2025-01-01T00:00:00.000Z"
  }
]
```

### GET /reports/revenue/summary
**Mục đích:** Tổng kết doanh thu

### GET /reports/top-products
**Mục đích:** Top sản phẩm bán chạy

**Query Parameters:**
- `startDate` (string): Ngày bắt đầu
- `endDate` (string): Ngày kết thúc
- `limit` (number): Số lượng sản phẩm
- `category` (string): Lọc theo danh mục

**Response (200):**
```json
[
  {
    "product": {
      "_id": "507f1f77bcf86cd799439031",
      "name": "Rau muống",
      "category": "leafy",
      "unit": "bó"
    },
    "totalQuantitySold": 50,
    "totalRevenue": 600000,
    "averagePrice": 12000
  }
]
```

### GET /reports/loyal-customers
**Mục đích:** Khách hàng thân thiết

**Query Parameters:**
- `startDate` (string): Ngày bắt đầu
- `endDate` (string): Ngày kết thúc
- `limit` (number): Số lượng khách hàng
- `minOrderCount` (number): Số đơn hàng tối thiểu
- `minTotalSpent` (number): Tổng chi tiêu tối thiểu

**Response (200):**
```json
[
  {
    "customer": {
      "_id": "507f1f77bcf86cd799439021",
      "fullName": "Nguyễn Thị Lan",
      "phone": "0901234567",
      "loyaltyPoints": 150
    },
    "totalSpent": 500000,
    "orderCount": 10,
    "averageOrderValue": 50000,
    "lastPurchaseDate": "2025-01-01T00:00:00.000Z"
  }
]
```

### GET /reports/inventory
**Mục đích:** Báo cáo tồn kho

**Query Parameters:**
- `lowStockThreshold` (number): Ngưỡng tồn kho thấp
- `expiryWarningDays` (number): Số ngày cảnh báo hết hạn
- `category` (string): Lọc theo danh mục

**Response (200):**
```json
[
  {
    "product": {
      "_id": "507f1f77bcf86cd799439031",
      "name": "Rau muống",
      "category": "leafy",
      "unit": "bó"
    },
    "totalStock": 150,
    "totalValue": 1200000,
    "lowStock": false,
    "expiringSoon": true,
    "lots": [...]
  }
]
```

## 🔧 Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Resource not found",
  "error": "Not Found"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Username already exists",
  "error": "Conflict"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

## 🔐 Authentication Flow

1. **Login:** POST /auth/login với username/password
2. **Get Token:** Nhận JWT token từ response
3. **Use Token:** Thêm `Authorization: Bearer <token>` vào headers
4. **Access Protected Routes:** Sử dụng token để truy cập các API được bảo vệ
5. **Logout:** POST /auth/logout để đăng xuất

## 📝 Notes

- Tất cả timestamps đều theo format ISO 8601
- Soft delete được sử dụng cho tất cả entities
- JWT token có thời hạn 1 giờ
- Sử dụng MongoDB ObjectId cho tất cả references
- Pagination có thể được thêm vào các endpoints list trong tương lai

