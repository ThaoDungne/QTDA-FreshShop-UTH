## Tài liệu luồng xử lý (Process Flows) – FreshShop

Tài liệu này mô tả chi tiết các luồng nghiệp vụ chính trong hệ thống: xác thực, nhập kho, bán hàng (POS) với FIFO, thanh toán, điểm thưởng, rollback khi lỗi, và idempotency. Mục tiêu: giúp Dev/QA/OPS hiểu cách hệ thống cần vận hành đầu–cuối, không phụ thuộc cụ thể vào UI.

### 1) Xác thực & phân quyền
- Đăng nhập (Admin):
  1. Admin gửi `username/password` tới `POST /auth/login`.
  2. Hệ thống xác thực, trả về `access_token (JWT, ~1h)` + `refresh_token (7 ngày)`.
  3. Lưu `refreshToken` và `refreshTokenExpires` trong `admins`.
- Làm mới token:
  1. Gửi `POST /auth/refresh` kèm `refresh_token` hợp lệ.
  2. Hệ thống tạo `access_token` mới; giữ nguyên `refresh_token` (hoặc quay vòng nếu cần).
- Đăng xuất:
  1. `POST /auth/logout` với JWT hợp lệ.
  2. Xóa `refreshToken` và `refreshTokenExpires` của admin tương ứng.
- Bảo vệ API:
  - Các API quản trị/nghiệp vụ dùng API Key (`X-API-Key`) hoặc JWT tùy controller theo cấu hình hiện tại.
  - Swagger đã khai báo cả JWT và API Key để thử nhanh.

### 2) Nhập kho (Inbound/Receiving)
Mục tiêu: ghi nhận lô hàng mới, cập nhật tồn kho, đảm bảo truy vết.

- Input tối thiểu:
  - `productId`, `quantityIn`, `costPerUnit`, `receivedDate` (thường là now), `supplierId?`, `note?`.
- Xử lý:
  1. Tạo `lotCode` (định dạng gợi ý: `SKU-YYYYMMDD-xxx`).
  2. Tính `expiryDate` nếu `product.expiryDays` tồn tại: `receivedDate + expiryDays`.
  3. Tạo bản ghi `inventory_lots` với `quantityIn = quantityAvailable = quantityIn`.
  4. Ghi `stock_movements` với `type=IN`, `product`, `lot`, `quantity`, `reason=PURCHASE`, `actor=admin`.
- Kết quả:
  - Có thêm lô hàng với số lượng khả dụng, phục vụ FIFO.

### 3) Bán hàng (POS) – Transaction + FIFO
Toàn bộ quy trình nên chạy trong 1 MongoDB transaction.

- Input tối thiểu:
  - `cashierId` (admin), `customerId?`, danh sách items `[ {productId, quantity} ]`, `paidAmount`, `paymentMethod='cash'`, `promotionIds?`, `idempotencyKey?`.
- Tiền xử lý & kiểm tra:
  1. Kiểm tra `customer` (nếu cung cấp). Nếu không, có thể bán cho khách lẻ.
  2. Đối với từng `product`, kiểm tra tổng tồn khả dụng (tổng `inventory_lots.quantityAvailable`). Nếu không đủ → báo lỗi.
  3. Chuẩn bị danh sách lô theo FIFO: sắp xếp `inventory_lots` của sản phẩm theo `expiryDate` tăng dần (nếu null thì xếp sau theo `receivedDate`).
  4. Tính giá trị dòng hàng: `unitPrice` lấy từ `product.price` (có thể điều chỉnh nếu có CTKM dòng), `lineTotal = quantity * unitPrice - discount`.
- Thực thi trong transaction:
  1. Tạo `invoice.code` dạng thân thiện (ví dụ: `INV-YYYYMMDD-####`).
  2. Tạo `invoice` với `itemsSummary` tạm để giữ tổng (ban đầu có thể là 0; sẽ cập nhật sau khi tính từ items).
  3. Cho mỗi item:
     - Phân bổ theo FIFO qua danh sách lô; với mỗi lô được lấy, tạo 1 bản ghi `invoice_items` (tham chiếu `lotId` tương ứng), ghi `quantity` thực lấy từ lô.
     - Giảm `inventory_lots.quantityAvailable` tương ứng; nếu < 0 → rollback.
     - Ghi `stock_movements` với `type=OUT`, `reason=SALE` cho từng lô.
  4. Tính lại tổng `itemsSummary`: `itemCount`, `subtotal`, `discountTotal`, `taxTotal`, `grandTotal`.
  5. Ghi `payments` (hiện tại 1 lần, tiền mặt). Kiểm tra `paidAmount >= grandTotal` để xác định `changeAmount`.
  6. Áp `promotions` (nếu có) → điều chỉnh totals phù hợp.
  7. Ghi `loyalty_ledgers` (EARN) theo quy tắc tích điểm (ví dụ: `points = floor(grandTotal / 10000)`), cập nhật `customers.loyaltyPoints`.
  8. Cập nhật `invoice.status='completed'` (hoặc `void` nếu hủy), lưu `itemsSummary` đã tính cuối.
  9. Commit transaction.
- Lỗi & rollback:
  - bất kỳ bước nào lỗi (hết hàng, lô hết hạn, ghi DB thất bại, tính tổng sai lệch, v.v.) → rollback toàn bộ.

### 4) Idempotency (tránh tạo trùng hóa đơn khi retry)
- Nhận `idempotencyKey` trên `create invoice`.
- Lưu dấu vết (ví dụ: collection `request_keys` hoặc embed vào hóa đơn) gồm: `key`, `status`, `invoiceId`.
- Nếu nhận lại cùng `idempotencyKey`:
  - Nếu `status=completed` → trả về kết quả cũ.
  - Nếu đang `processing` → trả về 202 kèm thông tin đợi hoặc block theo chiến lược hàng đợi.

### 5) In hóa đơn & nhật ký
- In hóa đơn sử dụng dữ liệu từ `invoice` + `invoice_items` (unit, unitPrice, quantity, lineTotal…).
- `stock_movements` là nhật ký đối soát: có thể truy ngược từ `invoice` đến các lô đã xuất.

### 6) Trả hàng/hủy hóa đơn (void) – gợi ý
- Hủy hóa đơn (`status='void'`) hoặc tạo hóa đơn `RETURN` (mở rộng) để ghi nhận hàng trả.
- Nếu hoàn hàng:
  - Ghi `stock_movements` `type=IN`, `reason=ADJUSTMENT` hoặc `RETURN` (nếu định nghĩa).
  - Tăng lại `inventory_lots.quantityAvailable` (ưu tiên trả về đúng lô đã xuất nếu còn theo dõi).
  - Điều chỉnh `payments` (trả lại tiền) và `loyalty_ledgers` (giảm điểm).
- Tất cả cần gói trong transaction.

### 7) Báo cáo – hướng tiếp cận nhanh
- Doanh thu theo ngày/tuần/tháng:
  - Từ `invoices` (status=completed), group theo bucket thời gian trên `createdAt`, sum `grandTotal`.
- Top sản phẩm bán chạy:
  - Từ `invoice_items`, group theo `productId`, sum `quantity` trong khoảng thời gian.
- Khách hàng thân thiết:
  - Từ `invoices` group theo `customerId`, sum `grandTotal` hoặc từ `loyalty_ledgers` sum điểm.
- Tồn kho hiện tại theo sản phẩm:
  - Từ `inventory_lots`, group theo `productId`, sum `quantityAvailable`; kèm thống kê lô sắp hết hạn (min `expiryDate`).

### 8) Kiểm soát chất lượng & ngoại lệ
- Kiểm tra HSD khi xuất: nếu `expiryDate < now` → cảnh báo/chặn (quy định tùy doanh nghiệp).
- Cạnh tranh ghi (concurrency): dùng transaction + cập nhật theo điều kiện (ví dụ: check `quantityAvailable` ngay trước khi ghi).
- Logging: log ngắn gọn lý do lỗi, ID giao dịch, mã hóa đơn để dễ tra cứu.

### 9) Gợi ý test (manual/automation)
- Nhập kho: tạo 2–3 lô cùng sản phẩm với HSD khác nhau, xác minh chọn FIFO khi bán.
- Bán hàng: bán vượt tồn → phải bị chặn; bán hợp lệ → trừ tồn đúng lô, tạo đầy đủ `invoice_items`, `payments`, `stock_movements`.
- Điểm thưởng: xác minh `loyalty_ledgers` và `customers.loyaltyPoints` cập nhật đúng.
- Giao dịch: cố tình gây lỗi giữa chừng (ví dụ: fail ghi `payments`) → tất cả rollback, không có record mồ côi.

### 10) Tối ưu & mở rộng
- Mở rộng phương thức thanh toán: thêm `method` khác, cho phép nhiều `payments`/hóa đơn.
- CTKM nâng cao: chuẩn hóa `conditions/effects` thành các bảng/collection con để query/validate tốt hơn.
- TTL cho dọn rác (tùy chọn): có thể cân nhắc TTL index với dữ liệu tạm.

---

Nếu bạn muốn, mình có thể bổ sung sơ đồ trình tự (sequence) dạng Mermaid và ví dụ truy vấn Aggregation cho từng báo cáo, ngay trong file này.


