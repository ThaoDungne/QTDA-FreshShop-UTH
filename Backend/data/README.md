# Import Products từ CSV vào Database

## Các bước thực hiện:

### 1. Convert CSV sang format phù hợp
```bash
cd Backend/data
npx tsx convert-csv.ts
```

Script này sẽ:
- Đọc file `bhx.csv`
- Parse và convert sang format phù hợp với Backend
- Tạo 2 file:
  - `bhx-converted.csv` - CSV format
  - `bhx-products.json` - JSON format để import

### 2. Import vào Database
```bash
cd Backend
yarn import:products
```

Hoặc:
```bash
npm run import:products
```

## Format dữ liệu

File JSON cần có format:
```json
[
  {
    "name": "Tên sản phẩm",
    "category": "Danh mục",
    "unit": "Đơn vị",
    "price": 10000,
    "sku": "BHX-001" // Optional
  }
]
```

## Lưu ý

- Script sẽ import tất cả sản phẩm từ file JSON
- Nếu SKU đã tồn tại, sẽ bỏ qua và báo lỗi
- Sản phẩm được import với status = 'active' mặc định
- Cần đảm bảo MongoDB đang chạy và kết nối được

## Thống kê

Sau khi import, script sẽ hiển thị:
- Số sản phẩm import thành công
- Số sản phẩm import thất bại (nếu có)
- Chi tiết lỗi (nếu có)

