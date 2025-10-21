import React, { useState } from "react";
import "./Orders.css";

interface Order {
  id: string;
  customer: string;
  date: string;
  amount: number;
  status: "pending" | "processing" | "completed" | "cancelled";
  items: string[];
}

const Orders: React.FC = () => {
  const [orders] = useState<Order[]>([
    {
      id: "ORD-001",
      customer: "Nguyễn Văn A",
      date: "2024-01-15",
      amount: 150000,
      status: "completed",
      items: ["Cà rốt", "Cà chua", "Rau xà lách"]
    },
    {
      id: "ORD-002", 
      customer: "Trần Thị B",
      date: "2024-01-15",
      amount: 85000,
      status: "processing",
      items: ["Bông cải xanh", "Hành tây"]
    },
    {
      id: "ORD-003",
      customer: "Lê Văn C", 
      date: "2024-01-14",
      amount: 200000,
      status: "pending",
      items: ["Ớt chuông", "Dưa chuột", "Rau chân vịt"]
    },
    {
      id: "ORD-004",
      customer: "Phạm Thị D",
      date: "2024-01-14", 
      amount: 120000,
      status: "cancelled",
      items: ["Bắp cải", "Cà tím"]
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "#28a745";
      case "processing": return "#ffc107";
      case "pending": return "#17a2b8";
      case "cancelled": return "#dc3545";
      default: return "#6c757d";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed": return "Hoàn thành";
      case "processing": return "Đang xử lý";
      case "pending": return "Chờ xử lý";
      case "cancelled": return "Đã hủy";
      default: return "Không xác định";
    }
  };

  return (
    <div className="orders-container">
      <div className="orders-header">
        <h1 className="orders-title">Quản lý đơn hàng</h1>
        <div className="orders-stats">
          <div className="stat-card">
            <span className="stat-number">{orders.length}</span>
            <span className="stat-label">Tổng đơn hàng</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{orders.filter(o => o.status === "completed").length}</span>
            <span className="stat-label">Đã hoàn thành</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{orders.filter(o => o.status === "pending").length}</span>
            <span className="stat-label">Chờ xử lý</span>
          </div>
        </div>
      </div>

      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Mã đơn hàng</th>
              <th>Khách hàng</th>
              <th>Ngày đặt</th>
              <th>Sản phẩm</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="order-id">{order.id}</td>
                <td className="order-customer">{order.customer}</td>
                <td className="order-date">{order.date}</td>
                <td className="order-items">
                  {order.items.join(", ")}
                </td>
                <td className="order-amount">{order.amount.toLocaleString()}đ</td>
                <td>
                  <span 
                    className="order-status"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {getStatusText(order.status)}
                  </span>
                </td>
                <td className="order-actions">
                  <button className="btn-view">Xem</button>
                  <button className="btn-edit">Sửa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;
