// Export tất cả services
export { default as apiInstance } from "./api";
export { default as authService } from "./auth.service";
export { default as productService } from "./product.service";
export { default as customerService } from "./customer.service";
export { default as supplierService } from "./supplier.service";
export { default as saleService } from "./sale.service";
export { default as inventoryService } from "./inventory.service";
export { default as reportService } from "./report.service";

// Export types
export type { LoginRequest, LoginResponse, AdminProfile } from "./auth.service";
export type {
  Product,
  CreateProductDto,
  UpdateProductDto,
} from "./product.service";
export type {
  Customer,
  CreateCustomerDto,
  UpdateCustomerDto,
} from "./customer.service";
export type {
  Supplier,
  CreateSupplierDto,
  UpdateSupplierDto,
} from "./supplier.service";
export type { Invoice, CreateInvoiceDto, InvoiceItem } from "./sale.service";
export type {
  InventoryLot,
  CreateInventoryLotDto,
  StockAdjustmentDto,
} from "./inventory.service";
export type {
  RevenueReport,
  RevenueReportItem,
  TopProduct,
  LoyalCustomer,
} from "./report.service";
