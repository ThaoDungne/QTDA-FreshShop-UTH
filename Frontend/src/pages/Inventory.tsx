import React, { useState } from "react";
import "./Inventory.css";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  price: number;
  supplier: string;
  lastUpdated: string;
  status: "in_stock" | "low_stock" | "out_of_stock";
}

const Inventory: React.FC = () => {
  const [inventory] = useState<InventoryItem[]>([
    {
      id: "INV-001",
      name: "Cà rốt",
      category: "Rau củ",
      currentStock: 150,
      minStock: 50,
      maxStock: 300,
      unit: "kg",
      price: 25000,
      supplier: "Công ty Rau sạch ABC",
      lastUpdated: "2024-01-15",
      status: "in_stock"
    },
    {
      id: "INV-002",
      name: "Cà chua",
      category: "Rau củ",
      currentStock: 25,
      minStock: 30,
      maxStock: 200,
      unit: "kg",
      price: 30000,
      supplier: "Công ty Rau sạch ABC",
      lastUpdated: "2024-01-14",
      status: "low_stock"
    },
    {
      id: "INV-003",
      name: "Rau xà lách",
      category: "Rau lá",
      currentStock: 0,
      minStock: 20,
      maxStock: 100,
      unit: "bó",
      price: 20000,
      supplier: "Trang trại Organic XYZ",
      lastUpdated: "2024-01-13",
      status: "out_of_stock"
    },
    {
      id: "INV-004",
      name: "Bông cải xanh",
      category: "Rau củ",
      currentStock: 80,
      minStock: 40,
      maxStock: 150,
      unit: "kg",
      price: 35000,
      supplier: "Trang trại Organic XYZ",
      lastUpdated: "2024-01-15",
      status: "in_stock"
    },
    {
      id: "INV-005",
      name: "Hành tây",
      category: "Rau củ",
      currentStock: 200,
      minStock: 60,
      maxStock: 400,
      unit: "kg",
      price: 28000,
      supplier: "Nhà vườn DEF",
      lastUpdated: "2024-01-15",
      status: "in_stock"
    },
    {
      id: "INV-006",
      name: "Ớt chuông",
      category: "Rau củ",
      currentStock: 15,
      minStock: 25,
      maxStock: 120,
      unit: "kg",
      price: 40000,
      supplier: "Trang trại Organic XYZ",
      lastUpdated: "2024-01-14",
      status: "low_stock"
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_stock": return "#28a745";
      case "low_stock": return "#ffc107";
      case "out_of_stock": return "#dc3545";
      default: return "#6c757d";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "in_stock": return "Còn hàng";
      case "low_stock": return "Sắp hết";
      case "out_of_stock": return "Hết hàng";
      default: return "Không xác định";
    }
  };

  const getStockPercentage = (current: number, max: number) => {
    return Math.round((current / max) * 100);
  };

  return (
    <div className="inventory-container">
      <div className="inventory-header">
        <h1 className="inventory-title">Quản lý tồn kho</h1>
        <div className="inventory-stats">
          <div className="stat-card">
            <span className="stat-number">{inventory.length}</span>
            <span className="stat-label">Tổng sản phẩm</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{inventory.filter(item => item.status === "in_stock").length}</span>
            <span className="stat-label">Còn hàng</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{inventory.filter(item => item.status === "low_stock").length}</span>
            <span className="stat-label">Sắp hết</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{inventory.filter(item => item.status === "out_of_stock").length}</span>
            <span className="stat-label">Hết hàng</span>
          </div>
        </div>
      </div>

      <div className="inventory-grid">
        {inventory.map((item) => (
          <div key={item.id} className="inventory-card">
            <div className="card-header">
              <h3 className="item-name">{item.name}</h3>
              <span 
                className="item-status"
                style={{ backgroundColor: getStatusColor(item.status) }}
              >
                {getStatusText(item.status)}
              </span>
            </div>

            <div className="item-info">
              <div className="info-row">
                <span className="info-label">Danh mục:</span>
                <span className="info-value">{item.category}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Nhà cung cấp:</span>
                <span className="info-value">{item.supplier}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Giá:</span>
                <span className="info-value">{item.price.toLocaleString()}đ/{item.unit}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Cập nhật:</span>
                <span className="info-value">{item.lastUpdated}</span>
              </div>
            </div>

            <div className="stock-info">
              <div className="stock-levels">
                <div className="stock-item">
                  <span className="stock-label">Tồn kho:</span>
                  <span className="stock-value">{item.currentStock} {item.unit}</span>
                </div>
                <div className="stock-item">
                  <span className="stock-label">Tối thiểu:</span>
                  <span className="stock-value">{item.minStock} {item.unit}</span>
                </div>
                <div className="stock-item">
                  <span className="stock-label">Tối đa:</span>
                  <span className="stock-value">{item.maxStock} {item.unit}</span>
                </div>
              </div>
              
              <div className="stock-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${getStockPercentage(item.currentStock, item.maxStock)}%`,
                      backgroundColor: getStatusColor(item.status)
                    }}
                  ></div>
                </div>
                <span className="progress-text">{getStockPercentage(item.currentStock, item.maxStock)}%</span>
              </div>
            </div>

            <div className="item-actions">
              <button className="btn-update">Cập nhật</button>
              <button className="btn-reorder">Đặt hàng</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Inventory;
