import apiInstance from "./api";

export interface InvoiceItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
}

export interface CreateInvoiceDto {
  customerId?: string;
  cashierId: string;
  items: InvoiceItem[];
  paidAmount: number;
  paymentMethod: "cash" | "card" | "bank_transfer" | "digital_wallet";
  note?: string;
}

export interface Invoice {
  _id: string;
  code: string;
  customer?: string;
  cashier: string;
  itemsSummary: {
    itemCount: number;
    subtotal: number;
    discountTotal: number;
    taxTotal: number;
    grandTotal: number;
  };
  paidAmount: number;
  changeAmount: number;
  paymentMethod: string;
  status: "completed" | "void";
  createdAt?: string;
  updatedAt?: string;
}

class SaleService {
  /**
   * Tạo hóa đơn mới (POS)
   */
  async createInvoice(invoice: CreateInvoiceDto): Promise<Invoice> {
    const response = await apiInstance.post<Invoice>("/pos/invoices", invoice);
    return response.data;
  }

  /**
   * Lấy danh sách hóa đơn
   */
  async getInvoices(): Promise<Invoice[]> {
    const response = await apiInstance.get<Invoice[]>("/pos/invoices");
    return response.data;
  }

  /**
   * Lấy hóa đơn theo ID
   */
  async getInvoiceById(id: string): Promise<Invoice> {
    const response = await apiInstance.get<Invoice>(`/pos/invoices/${id}`);
    return response.data;
  }

  /**
   * Cập nhật trạng thái hóa đơn
   */
  async updateInvoiceStatus(
    id: string,
    status: "completed" | "void"
  ): Promise<Invoice> {
    const response = await apiInstance.patch<Invoice>(
      `/pos/invoices/${id}/status`,
      {
        status,
      }
    );
    return response.data;
  }

  /**
   * Hủy hóa đơn (void)
   */
  async voidInvoice(
    id: string,
    reason: string,
    actorId?: string
  ): Promise<Invoice> {
    const response = await apiInstance.patch<Invoice>(
      `/pos/invoices/${id}/void`,
      {
        reason,
        actorId,
      }
    );
    return response.data;
  }
}

export default new SaleService();
