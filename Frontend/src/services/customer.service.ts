import apiInstance from "./api";

export interface Customer {
  _id: string;
  fullName: string;
  phone: string;
  email?: string;
  gender?: "male" | "female" | "other";
  birthDate?: string;
  address?: string;
  loyaltyPoints: number;
  loyaltyTier?: string;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCustomerDto {
  fullName: string;
  phone: string;
  email?: string;
  gender?: "male" | "female" | "other";
  birthDate?: string;
  address?: string;
  loyaltyTier?: string;
  note?: string;
}

export interface UpdateCustomerDto {
  fullName?: string;
  phone?: string;
  email?: string;
  gender?: "male" | "female" | "other";
  birthDate?: string;
  address?: string;
  loyaltyTier?: string;
  note?: string;
}

class CustomerService {
  /**
   * Lấy danh sách tất cả khách hàng
   */
  async getAll(): Promise<Customer[]> {
    const response = await apiInstance.get<Customer[]>("/customers");
    return response.data;
  }

  /**
   * Lấy khách hàng theo ID
   */
  async getById(id: string): Promise<Customer> {
    const response = await apiInstance.get<Customer>(`/customers/${id}`);
    return response.data;
  }

  /**
   * Tìm kiếm khách hàng
   */
  async search(query: string): Promise<Customer[]> {
    const response = await apiInstance.get<Customer[]>(
      `/customers/search?q=${encodeURIComponent(query)}`
    );
    return response.data;
  }

  /**
   * Tạo khách hàng mới
   */
  async create(customer: CreateCustomerDto): Promise<Customer> {
    const response = await apiInstance.post<Customer>("/customers", customer);
    return response.data;
  }

  /**
   * Cập nhật khách hàng
   */
  async update(id: string, customer: UpdateCustomerDto): Promise<Customer> {
    const response = await apiInstance.patch<Customer>(
      `/customers/${id}`,
      customer
    );
    return response.data;
  }

  /**
   * Điều chỉnh điểm thưởng
   */
  async adjustLoyaltyPoints(
    id: string,
    points: number,
    reason?: string
  ): Promise<Customer> {
    const response = await apiInstance.patch<Customer>(
      `/customers/${id}/loyalty-points`,
      {
        points,
        reason,
      }
    );
    return response.data;
  }

  /**
   * Xóa khách hàng (soft delete)
   */
  async delete(id: string): Promise<void> {
    await apiInstance.delete(`/customers/${id}`);
  }
}

export default new CustomerService();
