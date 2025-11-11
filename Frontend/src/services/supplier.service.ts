import apiInstance from "./api";

export interface Supplier {
  _id: string;
  name: string;
  contactName?: string;
  phone: string;
  email?: string;
  address?: string;
  taxCode?: string;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSupplierDto {
  name: string;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
  taxCode?: string;
  note?: string;
}

export interface UpdateSupplierDto {
  name?: string;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
  taxCode?: string;
  note?: string;
}

class SupplierService {
  /**
   * Lấy danh sách tất cả nhà cung cấp
   */
  async getAll(): Promise<Supplier[]> {
    const response = await apiInstance.get<Supplier[]>("/suppliers");
    return response.data;
  }

  /**
   * Lấy nhà cung cấp theo ID
   */
  async getById(id: string): Promise<Supplier> {
    const response = await apiInstance.get<Supplier>(`/suppliers/${id}`);
    return response.data;
  }

  /**
   * Tìm kiếm nhà cung cấp
   */
  async search(query: string): Promise<Supplier[]> {
    const response = await apiInstance.get<Supplier[]>(
      `/suppliers/search?q=${encodeURIComponent(query)}`
    );
    return response.data;
  }

  /**
   * Tạo nhà cung cấp mới
   */
  async create(supplier: CreateSupplierDto): Promise<Supplier> {
    const response = await apiInstance.post<Supplier>("/suppliers", supplier);
    return response.data;
  }

  /**
   * Cập nhật nhà cung cấp
   */
  async update(id: string, supplier: UpdateSupplierDto): Promise<Supplier> {
    const response = await apiInstance.patch<Supplier>(
      `/suppliers/${id}`,
      supplier
    );
    return response.data;
  }

  /**
   * Xóa nhà cung cấp (soft delete)
   */
  async delete(id: string): Promise<void> {
    await apiInstance.delete(`/suppliers/${id}`);
  }
}

export default new SupplierService();
