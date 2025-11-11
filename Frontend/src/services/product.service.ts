import apiInstance from "./api";

export interface Product {
  _id: string;
  name: string;
  sku?: string;
  category: string;
  unit: string;
  price: number;
  expiryDays?: number;
  supplier?: string;
  barcode?: string;
  imageUrl?: string;
  status: "active" | "inactive";
  attributes?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductDto {
  name: string;
  sku?: string;
  category: string;
  unit: string;
  price: number;
  expiryDays?: number;
  supplier?: string;
  barcode?: string;
  status?: "active" | "inactive";
  attributes?: Record<string, unknown>;
}

export interface UpdateProductDto {
  name?: string;
  sku?: string;
  category?: string;
  unit?: string;
  price?: number;
  expiryDays?: number;
  supplier?: string;
  barcode?: string;
  status?: "active" | "inactive";
  attributes?: Record<string, unknown>;
}

class ProductService {
  /**
   * Lấy danh sách tất cả sản phẩm
   */
  async getAll(): Promise<Product[]> {
    const response = await apiInstance.get<Product[]>("/products");
    return response.data;
  }

  /**
   * Lấy sản phẩm theo ID
   */
  async getById(id: string): Promise<Product> {
    const response = await apiInstance.get<Product>(`/products/${id}`);
    return response.data;
  }

  /**
   * Lấy danh sách sản phẩm đang hoạt động
   */
  async getActiveProducts(): Promise<Product[]> {
    const response = await apiInstance.get<Product[]>("/products/active");
    return response.data;
  }

  /**
   * Tìm kiếm sản phẩm
   */
  async search(query: string): Promise<Product[]> {
    const response = await apiInstance.get<Product[]>(
      `/products/search?q=${encodeURIComponent(query)}`
    );
    return response.data;
  }

  /**
   * Lấy sản phẩm theo danh mục
   */
  async getByCategory(category: string): Promise<Product[]> {
    const response = await apiInstance.get<Product[]>(
      `/products/category/${category}`
    );
    return response.data;
  }

  /**
   * Tạo sản phẩm mới
   */
  async create(product: CreateProductDto): Promise<Product> {
    const response = await apiInstance.post<Product>("/products", product);
    return response.data;
  }

  /**
   * Cập nhật sản phẩm
   */
  async update(id: string, product: UpdateProductDto): Promise<Product> {
    const response = await apiInstance.patch<Product>(
      `/products/${id}`,
      product
    );
    return response.data;
  }

  /**
   * Xóa sản phẩm (soft delete)
   */
  async delete(id: string): Promise<void> {
    await apiInstance.delete(`/products/${id}`);
  }
}

export default new ProductService();
