# API Services

Thư mục này chứa các service để giao tiếp với Backend API.

## Cấu trúc

- `api.ts` - Axios instance với interceptors
- `auth.service.ts` - Authentication service
- `product.service.ts` - Product management service
- `customer.service.ts` - Customer management service
- `supplier.service.ts` - Supplier management service
- `sale.service.ts` - POS/Sale service
- `inventory.service.ts` - Inventory management service
- `report.service.ts` - Reports service
- `index.ts` - Export tất cả services và types

## Cấu hình

### Environment Variables

Tạo file `.env` trong thư mục `Frontend`:

```env
VITE_API_URL=http://localhost:5000
VITE_API_KEY=your-api-key-here
```

### API Base URL

Mặc định: `http://localhost:5000`

Có thể thay đổi qua biến môi trường `VITE_API_URL`.

## Cách sử dụng

### Import service

```typescript
import { productService, authService } from '@/services';
// hoặc
import productService from '@/services/product.service';
```

### Ví dụ: Đăng nhập

```typescript
import { authService } from '@/services';

const handleLogin = async (username: string, password: string) => {
  try {
    const response = await authService.login({ username, password });
    console.log('Login successful:', response.admin);
    // Token đã được tự động lưu vào localStorage
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

### Ví dụ: Lấy danh sách sản phẩm

```typescript
import { productService } from '@/services';

const fetchProducts = async () => {
  try {
    const products = await productService.getAll();
    console.log('Products:', products);
  } catch (error) {
    console.error('Failed to fetch products:', error);
  }
};
```

### Ví dụ: Tạo sản phẩm mới

```typescript
import { productService } from '@/services';

const createProduct = async () => {
  try {
    const newProduct = await productService.create({
      name: 'Rau muống',
      category: 'leafy',
      unit: 'bó',
      price: 12000,
      status: 'active',
    });
    console.log('Product created:', newProduct);
  } catch (error) {
    console.error('Failed to create product:', error);
  }
};
```

## Authentication

API instance tự động:
- Thêm JWT token vào header `Authorization: Bearer <token>`
- Thêm API Key vào header `X-API-Key: <key>`
- Xử lý lỗi 401 và tự động redirect về login
- Lưu token vào localStorage sau khi login

## Error Handling

Tất cả services sử dụng try-catch để xử lý lỗi:

```typescript
try {
  const data = await productService.getAll();
} catch (error) {
  if (error.response?.status === 401) {
    // Unauthorized - token hết hạn
  } else if (error.response?.status === 404) {
    // Not found
  } else {
    // Other errors
  }
}
```

## Services Available

### AuthService
- `login()` - Đăng nhập
- `logout()` - Đăng xuất
- `getProfile()` - Lấy thông tin profile
- `isAuthenticated()` - Kiểm tra đã đăng nhập
- `getCurrentUser()` - Lấy user hiện tại

### ProductService
- `getAll()` - Lấy tất cả sản phẩm
- `getById()` - Lấy sản phẩm theo ID
- `getActiveProducts()` - Lấy sản phẩm đang hoạt động
- `search()` - Tìm kiếm sản phẩm
- `getByCategory()` - Lấy sản phẩm theo danh mục
- `create()` - Tạo sản phẩm mới
- `update()` - Cập nhật sản phẩm
- `delete()` - Xóa sản phẩm

### CustomerService
- `getAll()` - Lấy tất cả khách hàng
- `getById()` - Lấy khách hàng theo ID
- `search()` - Tìm kiếm khách hàng
- `create()` - Tạo khách hàng mới
- `update()` - Cập nhật khách hàng
- `adjustLoyaltyPoints()` - Điều chỉnh điểm thưởng
- `delete()` - Xóa khách hàng

### SupplierService
- `getAll()` - Lấy tất cả nhà cung cấp
- `getById()` - Lấy nhà cung cấp theo ID
- `search()` - Tìm kiếm nhà cung cấp
- `create()` - Tạo nhà cung cấp mới
- `update()` - Cập nhật nhà cung cấp
- `delete()` - Xóa nhà cung cấp

### SaleService
- `createInvoice()` - Tạo hóa đơn mới
- `getInvoices()` - Lấy danh sách hóa đơn
- `getInvoiceById()` - Lấy hóa đơn theo ID
- `voidInvoice()` - Hủy hóa đơn

### InventoryService
- `createLot()` - Tạo lô hàng mới
- `adjustStock()` - Điều chỉnh tồn kho
- `getStock()` - Kiểm tra tồn kho
- `getExpiringProducts()` - Lấy hàng sắp hết hạn
- `getInventoryReport()` - Báo cáo tồn kho

### ReportService
- `getRevenueReport()` - Báo cáo doanh thu
- `getTopProducts()` - Top sản phẩm bán chạy
- `getLoyalCustomers()` - Khách hàng thân thiết
- `getInventoryReport()` - Báo cáo tồn kho

