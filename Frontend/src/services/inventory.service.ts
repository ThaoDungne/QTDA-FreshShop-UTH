import apiInstance from "./api";

export interface InventoryLot {
  _id: string;
  product: string;
  lotCode: string;
  receivedDate: string;
  expiryDate?: string;
  quantityIn: number;
  quantityAvailable: number;
  costPerUnit: number;
  supplier?: string;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateInventoryLotDto {
  productId: string;
  quantityIn: number;
  costPerUnit: number;
  supplierId?: string;
  receivedDate?: string;
  expiryDate?: string;
  note?: string;
}

export interface StockAdjustmentDto {
  productId: string;
  lotId?: string;
  quantity: number;
  reason: "WASTE" | "ADJUSTMENT";
  note?: string;
}

class InventoryService {
  /**
   * Tạo lô hàng mới
   */
  async createLot(lot: CreateInventoryLotDto): Promise<InventoryLot> {
    const response = await apiInstance.post<InventoryLot>(
      "/inventory/lots",
      lot
    );
    return response.data;
  }

  /**
   * Điều chỉnh tồn kho
   */
  async adjustStock(adjustment: StockAdjustmentDto): Promise<void> {
    await apiInstance.post("/inventory/adjust", adjustment);
  }

  /**
   * Kiểm tra tồn kho của sản phẩm
   */
  async getStock(productId: string): Promise<{
    totalAvailable: number;
    lots: {
      lotId: string;
      lotCode: string;
      quantityAvailable: number;
      expiryDate?: string;
      costPerUnit: number;
    }[];
  }> {
    const response = await apiInstance.get(`/inventory/stock/${productId}`);
    return response.data;
  }

  /**
   * Lấy danh sách hàng sắp hết hạn
   */
  async getExpiringProducts(days?: number): Promise<InventoryLot[]> {
    const url = days
      ? `/inventory/expiring?days=${days}`
      : "/inventory/expiring";
    const response = await apiInstance.get<InventoryLot[]>(url);
    return response.data;
  }

  /**
   * Lấy báo cáo tồn kho
   */
  async getInventoryReport(): Promise<Record<string, unknown>> {
    const response = await apiInstance.get("/inventory/report");
    return response.data;
  }
}

export default new InventoryService();
