import React, { useState } from "react";
import "./Suppliers.css";

interface Supplier {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  products: string[];
  rating: number;
  status: "active" | "inactive";
}

const Suppliers: React.FC = () => {
  const [suppliers] = useState<Supplier[]>([
    {
      id: "SUP-001",
      name: "Công ty Rau sạch ABC",
      contact: "Nguyễn Văn A",
      phone: "0123456789",
      email: "contact@rausachabc.com",
      address: "123 Đường Nông nghiệp, Quận 9, TP.HCM",
      products: ["Cà rốt", "Cà chua", "Rau xà lách"],
      rating: 4.8,
      status: "active"
    },
    {
      id: "SUP-002", 
      name: "Trang trại Organic XYZ",
      contact: "Trần Thị B",
      phone: "0987654321",
      email: "info@organicxyz.com",
      address: "456 Đường Hữu cơ, Quận 2, TP.HCM",
      products: ["Bông cải xanh", "Hành tây", "Ớt chuông"],
      rating: 4.6,
      status: "active"
    },
    {
      id: "SUP-003",
      name: "Nhà vườn DEF",
      contact: "Lê Văn C", 
      phone: "0369258147",
      email: "nhavuon@def.com",
      address: "789 Đường Vườn, Quận 3, TP.HCM",
      products: ["Dưa chuột", "Rau chân vịt", "Bắp cải"],
      rating: 4.2,
      status: "inactive"
    },
    {
      id: "SUP-004",
      name: "Hợp tác xã GHI",
      contact: "Phạm Thị D",
      phone: "0741852963", 
      email: "htx@ghi.com",
      address: "321 Đường Hợp tác, Quận 4, TP.HCM",
      products: ["Cà tím", "Rau muống", "Cải ngọt"],
      rating: 4.9,
      status: "active"
    }
  ]);

  const getStatusColor = (status: string) => {
    return status === "active" ? "#28a745" : "#dc3545";
  };

  const getStatusText = (status: string) => {
    return status === "active" ? "Hoạt động" : "Không hoạt động";
  };

  const getRatingStars = (rating: number) => {
    return "★".repeat(Math.floor(rating)) + "☆".repeat(5 - Math.floor(rating));
  };

  return (
    <div className="suppliers-container">
      <div className="suppliers-header">
        <h1 className="suppliers-title">Quản lý nhà cung cấp</h1>
        <div className="suppliers-stats">
          <div className="stat-card">
            <span className="stat-number">{suppliers.length}</span>
            <span className="stat-label">Tổng nhà cung cấp</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{suppliers.filter(s => s.status === "active").length}</span>
            <span className="stat-label">Đang hoạt động</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{(suppliers.reduce((sum, s) => sum + s.rating, 0) / suppliers.length).toFixed(1)}</span>
            <span className="stat-label">Đánh giá trung bình</span>
          </div>
        </div>
      </div>

      <div className="suppliers-grid">
        {suppliers.map((supplier) => (
          <div key={supplier.id} className="supplier-card">
            <div className="supplier-header">
              <h3 className="supplier-name">{supplier.name}</h3>
              <span 
                className="supplier-status"
                style={{ backgroundColor: getStatusColor(supplier.status) }}
              >
                {getStatusText(supplier.status)}
              </span>
            </div>
            
            <div className="supplier-info">
              <div className="info-row">
                <span className="info-label">Liên hệ:</span>
                <span className="info-value">{supplier.contact}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Điện thoại:</span>
                <span className="info-value">{supplier.phone}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Email:</span>
                <span className="info-value">{supplier.email}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Địa chỉ:</span>
                <span className="info-value">{supplier.address}</span>
              </div>
            </div>

            <div className="supplier-products">
              <span className="products-label">Sản phẩm:</span>
              <div className="products-list">
                {supplier.products.map((product, index) => (
                  <span key={index} className="product-tag">{product}</span>
                ))}
              </div>
            </div>

            <div className="supplier-rating">
              <span className="rating-label">Đánh giá:</span>
              <span className="rating-stars">{getRatingStars(supplier.rating)}</span>
              <span className="rating-number">({supplier.rating})</span>
            </div>

            <div className="supplier-actions">
              <button className="btn-view">Xem chi tiết</button>
              <button className="btn-edit">Chỉnh sửa</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Suppliers;
