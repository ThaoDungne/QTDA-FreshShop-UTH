## Tài liệu cơ sở dữ liệu FreshShop (tiếng Việt)

Tài liệu này giải thích chi tiết mô hình dữ liệu MongoDB của hệ thống FreshShop (xem mã nguồn schema tại `src/schemas`). Mục tiêu là giúp bạn hiểu “tại sao” và “dùng thế nào” thay vì liệt kê toàn bộ định nghĩa schema.

### 1) Tổng quan kiến trúc dữ liệu
- Hướng NoSQL (MongoDB), ưu tiên tính đơn giản khi ghi (write) và dễ mở rộng.
- Tồn kho quản lý theo lô (`inventory_lots`) để kiểm soát HSD và giá vốn, xuất kho theo FIFO (ưu tiên lô sắp hết hạn).
- Luồng bán hàng (POS) tạo các bản ghi: `invoices` (hóa đơn), `invoice_items` (dòng hàng), `payments` (thanh toán), `stock_movements` (nhật ký kho), `loyalty_ledgers` (điểm thưởng). Tất cả nên gói trong giao dịch (MongoDB transaction) để đảm bảo nhất quán.
- Soft delete bằng trường `deletedAt` cho các bảng danh mục hay bị CRUD (admins, customers, suppliers, products) để tránh mất dữ liệu lịch sử.

### 2) Vai trò từng collection (giải thích ngắn gọn)
- `admins`: Tài khoản quản trị (đăng nhập, JWT/refresh token). Ít thay đổi. Có `isActive`, `refreshToken`, `refreshTokenExpires` để hỗ trợ bảo mật.
- `customers`: Khách hàng (thông tin cá nhân, điểm thưởng). Tránh nhồi lịch sử mua hàng vào đây, truy vấn qua `invoices` theo `customer`.
- `suppliers`: Nhà cung cấp (thông tin liên hệ, mã số thuế...).
- `products`: Danh mục sản phẩm (giá bán lẻ đề xuất, đơn vị tính, nhóm hàng, HSD mặc định...). Có `status` để “ẩn/hiện” khi ngừng kinh doanh.
- `inventory_lots`: Từng lô nhập hàng (giá vốn, số lượng nhập/còn lại, ngày hết hạn). Đây là nguồn dữ liệu chính cho xuất kho FIFO.
- `stock_movements`: Nhật ký kho (IN/OUT/ADJUST) để audit và đối soát. Mỗi bán hàng OUT theo từng lô sẽ ghi riêng 1 dòng.
- `invoices`: Hóa đơn bán hàng tổng quát (tổng tiền, kênh bán, khách, thu ngân, trạng thái...).
- `invoice_items`: Dòng hàng của hóa đơn (sản phẩm, lô, SL, đơn giá, chiết khấu, thành tiền). Tách riêng để báo cáo hiệu quả.
- `payments`: Thanh toán của hóa đơn (hiện tại: tiền mặt), sẵn sàng mở rộng nhiều phương thức.
- `promotions`: Cấu hình CTKM theo rule (điều kiện & hiệu lực). Cho phép áp dụng trên đơn hoặc dòng.
- `loyalty_ledgers`: Sổ cái điểm thưởng (EARN/REDEEM/ADJUST) để đảm bảo tính toán điểm có lịch sử, có thể tái kết hợp khi cần.

### 3) Trường dữ liệu quan trọng & lý do thiết kế
- Khóa tra cứu nhanh:
  - `admins.username` unique: đăng nhập nhanh, đảm bảo không trùng.
  - `customers.phone` unique: hạn chế trùng khách hàng, thuận tiện tra cứu POS.
  - `products.sku` unique (sparse): chuẩn hóa SKU nếu có, nhưng không bắt buộc mọi sản phẩm phải có.
- Soft delete (`deletedAt`):
  - Giữ dữ liệu cũ để truy vết; các index partial `{ deletedAt: null }` giúp truy vấn chỉ lấy bản ghi “đang hoạt động”.
- `products.attributes` dạng object mở rộng: tránh thay đổi schema khi thêm thuộc tính đặc thù (VD: hữu cơ, nguồn gốc).
- `inventory_lots.quantityAvailable`: tách `quantityIn` và `quantityAvailable` để phản ánh xuất/hao hụt theo thời gian, phục vụ kiểm kê.
- `invoices.itemsSummary`: lưu tổng đã tính sẵn để in hóa đơn và xem báo cáo nhanh; chi tiết vẫn ở `invoice_items`.
- `promotions.conditions`/`effects` dạng JSON: đơn giản hóa cấu hình rule trong giai đoạn đầu; có thể chuẩn hóa về nhiều bảng chi tiết hơn khi nhu cầu phức tạp.

### 4) Quan hệ và hướng truy vấn
- Chuỗi dữ liệu bán hàng:
  - `invoices` (1) —> `invoice_items` (n) —> mỗi item có thể tham chiếu `inventory_lots` (lô xuất) và `products`.
  - `payments` liên kết 1-n với `invoices` (hiện tại 1-1 với tiền mặt, nhưng sẵn sàng cho nhiều lần thanh toán).
  - `stock_movements` ghi lại cả nhập (IN), xuất (OUT), điều chỉnh (ADJUST), tham chiếu `product`, có thể tham chiếu `lot` và `invoice`.
- Kiểm kê tồn kho hiện tại:
  - Tổng hợp `inventory_lots.quantityAvailable` theo `product`.
  - FIFO: ưu tiên `inventory_lots` theo `expiryDate` tăng dần (nếu không có HSD, dùng `receivedDate`).
- Lịch sử mua hàng của khách:
  - Từ `invoices` lọc theo `customer`, join `invoice_items` khi cần chi tiết mặt hàng.

### 5) Chỉ mục (indexes) trọng yếu và cách dùng
- Tìm kiếm/tra cứu nhanh:
  - `customers`: `{ phone: 1 } unique`, `{ fullName: 'text', phone: 1 }` cho tìm theo tên/điện thoại.
  - `products`: `{ name: 'text' }`, `{ category: 1 }`, `{ supplier: 1 }` hỗ trợ duyệt danh mục và tìm kiếm.
- Báo cáo & đối soát:
  - `invoices`: `{ createdAt: -1 }`, `{ customer: 1 }`, `{ cashier: 1 }` cho báo cáo theo thời gian, KH, thu ngân.
  - `invoice_items`: `{ product: 1 }`, `{ createdAt: -1 }` cho top-selling theo kỳ.
  - `inventory_lots`: `{ product: 1, expiryDate: 1 }` giúp chọn FIFO và phát hiện sắp hết hạn.
  - `stock_movements`: `{ product: 1, createdAt: -1 }`, `{ type: 1, createdAt: -1 }` cho audit nhanh.

### 6) Luồng giao dịch bán hàng (POS) — khuyến nghị triển khai
Thực hiện trong 1 transaction để đảm bảo tất cả-cùng-thành công hoặc rollback:
1) Tạo `invoice` với `itemsSummary` dựa trên dữ liệu tạm tính.
2) Tạo `invoice_items` theo từng sản phẩm.
3) Chọn lô theo FIFO và trừ `inventory_lots.quantityAvailable` tương ứng; kiểm tra đủ tồn trước khi trừ.
4) Ghi `stock_movements` kiểu `OUT` cho từng lô thực xuất.
5) Tạo `payments` (hiện tại: tiền mặt). Nếu sau mở rộng trả nhiều lần — tạo nhiều bản ghi.
6) Áp CTKM (nếu có) và ghi `loyalty_ledgers` (EARN), đồng thời cập nhật `customers.loyaltyPoints`.
7) Commit; nếu lỗi ở bất kỳ bước nào thì rollback toàn bộ.

### 7) Chiến lược soft delete và dọn dẹp dữ liệu
- Khi xóa “mềm”, chỉ đặt `deletedAt = now`. Ứng dụng mặc định lọc `deletedAt: null`.
- Nếu muốn dọn rác: có thể chạy tác vụ nền chuyển các bản ghi đã xóa quá N ngày sang lưu trữ khác hoặc xóa hẳn.

### 8) Lý do không nhồi nhét dữ liệu vào một collection
- Tránh embed quá sâu (ví dụ, toàn bộ lịch sử mua hàng trong `customers`) để không làm tài liệu phình to và khó index.
- Tách `invoice_items` giúp báo cáo linh hoạt (top sản phẩm, doanh thu theo nhóm hàng...).
- `inventory_lots` độc lập đảm bảo FIFO/expiry minh bạch và có thể kiểm kê theo lô.

### 9) Mẹo vận hành & hiệu năng
- Luôn lọc `deletedAt: null` với các collection có soft delete.
- Lập kế hoạch index dựa trên use case thực tế (tìm kiếm bán hàng theo tên/điện thoại, lọc sản phẩm theo danh mục, báo cáo theo thời gian...).
- Với truy vấn nặng (báo cáo), ưu tiên Aggregation Pipeline và cân nhắc thêm chỉ mục ghép (compound) đúng hướng.

### 10) Tôi xem ERD ở đâu?
- Bạn có thể dùng DBML để vẽ ERD trên `dbdiagram.io`. Để tránh rườm rà, tài liệu này không dán toàn bộ DBML.
- Nếu cần, tôi có thể tạo một file `DBML.md` riêng chứa sơ đồ đầy đủ hoặc xuất ảnh PNG/SVG từ ERD và thêm vào repo.

### 11) Nguồn tham chiếu mã nguồn
- Mọi định nghĩa chi tiết nằm trong: `src/schemas/*.schema.ts`.
- Một số enum dùng chung: `src/common/enums`.

Nếu bạn muốn, tôi có thể bổ sung mục “Ví dụ truy vấn thường dùng” (aggregation cho doanh thu/ngày, top-selling, khách hàng thân thiết, tồn kho hiện tại) kèm giải thích từng bước.


