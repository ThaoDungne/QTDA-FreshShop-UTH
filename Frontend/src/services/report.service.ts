import apiInstance from "./api";

export interface RevenueReport {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  data: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}

export interface RevenueReportItem {
  period: string;
  totalRevenue: number;
  totalInvoices: number;
  averageOrderValue: number;
  date: string | Date;
}

export interface TopProduct {
  productId: string;
  productName: string;
  quantitySold: number;
  revenue: number;
}

export interface LoyalCustomer {
  customerId: string;
  customerName: string;
  totalSpent: number;
  orderCount: number;
  loyaltyPoints: number;
}

class ReportService {
  /**
   * Báo cáo doanh thu
   */
  async getRevenueReport(
    startDate: string,
    endDate: string,
    groupBy: "day" | "week" | "month" = "day"
  ): Promise<RevenueReportItem[]> {
    const response = await apiInstance.get<RevenueReportItem[]>(
      `/reports/revenue?startDate=${startDate}&endDate=${endDate}&groupBy=${groupBy}`
    );
    return response.data;
  }

  /**
   * Tóm tắt doanh thu (summary)
   */
  async getRevenueSummary(
    startDate?: string,
    endDate?: string
  ): Promise<{
    totalRevenue: number;
    totalInvoices: number;
    averageOrderValue: number;
    period: string;
  }> {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    
    const url = `/reports/revenue/summary${params.toString() ? "?" + params.toString() : ""}`;
    const response = await apiInstance.get(url);
    return response.data;
  }

  /**
   * Top sản phẩm bán chạy
   */
  async getTopProducts(
    startDate: string,
    endDate: string,
    limit: number = 10
  ): Promise<TopProduct[]> {
    const response = await apiInstance.get<TopProduct[]>(
      `/reports/top-products?startDate=${startDate}&endDate=${endDate}&limit=${limit}`
    );
    return response.data;
  }

  /**
   * Khách hàng thân thiết
   */
  async getLoyalCustomers(
    startDate: string,
    endDate: string,
    limit: number = 10
  ): Promise<LoyalCustomer[]> {
    const response = await apiInstance.get<LoyalCustomer[]>(
      `/reports/loyal-customers?startDate=${startDate}&endDate=${endDate}&limit=${limit}`
    );
    return response.data;
  }

  /**
   * Báo cáo tồn kho
   */
  async getInventoryReport(
    lowStockThreshold?: number,
    expiryWarningDays?: number
  ): Promise<Record<string, unknown>> {
    const params = new URLSearchParams();
    if (lowStockThreshold)
      params.append("lowStockThreshold", lowStockThreshold.toString());
    if (expiryWarningDays)
      params.append("expiryWarningDays", expiryWarningDays.toString());

    const url = `/reports/inventory${
      params.toString() ? "?" + params.toString() : ""
    }`;
    const response = await apiInstance.get(url);
    return response.data;
  }
}

export default new ReportService();
