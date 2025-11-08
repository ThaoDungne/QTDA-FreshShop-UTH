# FreshShop - Hệ thống quản lý cửa hàng rau củ

## 🚀 Cài đặt và chạy

### 1. Cài đặt dependencies
```bash
yarn install
```

### 2. Cấu hình MongoDB
Đảm bảo MongoDB đang chạy trên `mongodb://localhost:27017/freshshop`

### 3. Seed dữ liệu mẫu
```bash
yarn run seed
```

### 4. Chạy ứng dụng
```bash
yarn start:dev
```

### 5. Test nhanh toàn bộ hệ thống
```bash
yarn run test:quick
```

## 📊 API Documentation

Truy cập Swagger UI tại: **http://localhost:3000/api**

## 🏗️ Kiến trúc hệ thống

### Modules chính:
- **Admin Management** - Quản lý tài khoản admin
- **Customer Management** - Quản lý khách hàng và loyalty points
- **Product Management** - Quản lý sản phẩm
- **Supplier Management** - Quản lý nhà cung cấp
- **Inventory Management** - Quản lý tồn kho và nhập/xuất
- **Point of Sale (POS)** - Bán hàng và tạo hóa đơn
- **Reports & Analytics** - Báo cáo và phân tích

### Flow chính:

#### 1. Nhập kho (Inventory Intake)
```bash
# Tạo inventory lot mới
POST /inventory/lots
{
  "productId": "product_id",
  "quantityIn": 100,
  "costPerUnit": 8000,
  "supplierId": "supplier_id",
  "receivedDate": "2025-01-01",
  "note": "Fresh delivery"
}
```

#### 2. Bán hàng (POS)
```bash
# Tạo hóa đơn bán hàng
POST /pos/invoices
{
  "customerId": "customer_id",
  "cashierId": "admin_id",
  "items": [
    {
      "productId": "product_id",
      "quantity": 2,
      "unitPrice": 12000,
      "discount": 1000
    }
  ],
  "paidAmount": 50000,
  "paymentMethod": "cash"
}
```

#### 3. Báo cáo
```bash
# Doanh thu theo ngày
GET /reports/revenue?startDate=2025-01-01&endDate=2025-01-31&groupBy=day

# Top sản phẩm bán chạy
GET /reports/top-products?startDate=2025-01-01&endDate=2025-01-31&limit=10

# Khách hàng thân thiết
GET /reports/loyal-customers?startDate=2025-01-01&endDate=2025-01-31&limit=10

# Báo cáo tồn kho
GET /reports/inventory?lowStockThreshold=10&expiryWarningDays=3
```

## 🧪 Test Cases

### Unit Tests
```bash
# Chạy tất cả tests
yarn test

# Chạy tests với coverage
yarn test:cov

# Chạy tests cho schema
yarn test src/schemas/admin.schema.spec.ts

# Chạy tests cho services
yarn test src/services/inventory.service.spec.ts
yarn test src/services/pos.service.spec.ts
```

### Test Cases quan trọng:

1. **Admin Schema Validation**
   - Test unique username constraint
   - Test soft delete functionality
   - Test password hashing

2. **Inventory Service**
   - Test createInventoryLot với validation
   - Test deductProductQuantity với FIFO logic
   - Test stock adjustment

3. **POS Service**
   - Test createInvoice với transaction
   - Test voidInvoice với rollback
   - Test loyalty points calculation

## 📈 Tính năng nổi bật

### 1. FIFO Stock Management
- Tự động chọn lô hết hạn trước khi xuất kho
- Tracking đầy đủ từng lô nhập/xuất
- Cảnh báo hàng sắp hết hạn

### 2. Transaction Safety
- MongoDB transactions cho tất cả thao tác bán hàng
- Rollback tự động khi có lỗi
- Đảm bảo tính nhất quán dữ liệu

### 3. Advanced Reporting
- 4 loại báo cáo chính với aggregation pipelines
- Real-time inventory tracking
- Customer loyalty analytics

### 4. Soft Delete Support
- Tất cả entities hỗ trợ soft delete
- Indexes tối ưu cho performance
- Data integrity được đảm bảo

### 5. Swagger Documentation
- API documentation đầy đủ với Swagger UI
- Interactive testing interface
- Request/Response examples
- Authentication support

## 🔧 Cấu hình môi trường

```bash
# .env
MONGODB_URI=mongodb://localhost:27017/freshshop
MONGODB_DB_NAME=freshshop
PORT=3000
```

## 📝 Dữ liệu mẫu

Sau khi chạy `yarn run seed`, hệ thống sẽ có:

- **1 Admin**: username=admin, password=admin123
- **3 Suppliers**: Nhà cung cấp rau sạch
- **8 Products**: Rau củ đa dạng với categories khác nhau
- **~24 Inventory Lots**: Lô hàng với expiry dates khác nhau
- **5 Customers**: Khách hàng mẫu với loyalty points
- **5 Invoices**: Hóa đơn mẫu với stock movements
- **Loyalty Ledgers**: Lịch sử tích điểm

## 🚀 Quick Start

```bash
# 1. Clone và cài đặt
git clone <repo>
cd freshshop
yarn install

# 2. Seed dữ liệu
yarn run seed

# 3. Chạy ứng dụng
yarn start:dev

# 4. Test toàn bộ flow
yarn run test:quick

# 5. Truy cập API docs
open http://localhost:3000/api
```

## 📚 API Endpoints

### Admin Management
- `GET /admin` - Danh sách admin
- `POST /admin` - Tạo admin mới
- `GET /admin/:id` - Chi tiết admin
- `PATCH /admin/:id` - Cập nhật admin
- `DELETE /admin/:id` - Xóa admin (soft delete)

### Customer Management
- `GET /customers` - Danh sách khách hàng
- `POST /customers` - Tạo khách hàng mới
- `GET /customers/search?q=query` - Tìm kiếm khách hàng
- `PATCH /customers/:id/loyalty-points` - Điều chỉnh điểm thưởng

### Product Management
- `GET /products` - Danh sách sản phẩm
- `GET /products/active` - Sản phẩm đang hoạt động
- `GET /products/search?q=query` - Tìm kiếm sản phẩm
- `GET /products/category/:category` - Sản phẩm theo danh mục

### Supplier Management
- `GET /suppliers` - Danh sách nhà cung cấp
- `POST /suppliers` - Tạo nhà cung cấp mới
- `GET /suppliers/search?q=query` - Tìm kiếm nhà cung cấp
- `PATCH /suppliers/:id` - Cập nhật nhà cung cấp
- `DELETE /suppliers/:id` - Xóa nhà cung cấp (soft delete)

### Inventory Management
- `POST /inventory/lots` - Tạo lô hàng mới
- `POST /inventory/adjust` - Điều chỉnh tồn kho
- `GET /inventory/stock/:productId` - Kiểm tra tồn kho
- `GET /inventory/expiring?days=3` - Hàng sắp hết hạn
- `GET /inventory/report` - Báo cáo tồn kho

### Point of Sale
- `POST /pos/invoices` - Tạo hóa đơn
- `GET /pos/invoices` - Danh sách hóa đơn
- `GET /pos/invoices/:id` - Chi tiết hóa đơn
- `PATCH /pos/invoices/:id/void` - Hủy hóa đơn
- `GET /pos/invoices/:id/print` - In hóa đơn

### Reports & Analytics
- `GET /reports/revenue` - Báo cáo doanh thu
- `GET /reports/revenue/summary` - Tổng kết doanh thu
- `GET /reports/top-products` - Top sản phẩm bán chạy
- `GET /reports/top-products/revenue` - Top sản phẩm theo doanh thu
- `GET /reports/category-sales` - Bán hàng theo danh mục
- `GET /reports/loyal-customers` - Khách hàng thân thiết
- `GET /reports/customer-segments` - Phân khúc khách hàng
- `GET /reports/loyalty-points` - Báo cáo điểm thưởng
- `GET /reports/inventory` - Báo cáo tồn kho
- `GET /reports/inventory/low-stock` - Hàng tồn kho thấp
- `GET /reports/inventory/expiring` - Hàng sắp hết hạn
- `GET /reports/inventory/value` - Giá trị tồn kho

## 🎯 Business Logic

### Inventory Management
- **FIFO (First In, First Out)**: Ưu tiên lô hết hạn trước
- **Expiry Tracking**: Theo dõi HSD và cảnh báo
- **Cost Tracking**: Theo dõi giá vốn từng lô

### Sales Process
- **Stock Validation**: Kiểm tra tồn kho trước khi bán
- **Automatic Deduction**: Tự động trừ kho theo FIFO
- **Payment Processing**: Xử lý thanh toán tiền mặt
- **Loyalty Points**: Tích điểm tự động

### Reporting
- **Real-time Data**: Dữ liệu thời gian thực
- **Flexible Filtering**: Lọc theo thời gian, sản phẩm, khách hàng
- **Performance Optimized**: Indexes tối ưu cho queries

## 🔒 Security & Validation

- **Input Validation**: Class-validator cho tất cả DTOs
- **Type Safety**: TypeScript strict mode
- **Data Integrity**: MongoDB transactions
- **Soft Delete**: Không mất dữ liệu khi xóa

## 📊 Performance

- **Database Indexes**: Tối ưu cho tất cả queries
- **Aggregation Pipelines**: Hiệu quả cho báo cáo
- **Connection Pooling**: MongoDB connection optimization
- **Memory Management**: Efficient data structures

## 🎨 Swagger UI Features

- **Interactive API Testing**: Test APIs trực tiếp từ browser
- **Request/Response Examples**: Mẫu dữ liệu cho mỗi endpoint
- **Schema Validation**: Hiển thị validation rules
- **Authentication Support**: Hỗ trợ authentication schemes
- **Response Models**: Mô tả chi tiết response structure

---

**🎉 Hệ thống FreshShop đã sẵn sàng sử dụng!**

Truy cập **http://localhost:3000/api** để khám phá API documentation đầy đủ với Swagger UI.