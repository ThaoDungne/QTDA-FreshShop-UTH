import React, { useState } from "react";
import "./Customers.css";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  lastOrder: string;
  status: "active" | "inactive";
}

const Customers: React.FC = () => {
  const [customers] = useState<Customer[]>([
    {
      id: "CUS-001",
      name: "Nguyễn Văn A",
      email: "nguyenvana@email.com",
      phone: "0123456789",
      address: "123 Đường ABC, Quận 1, TP.HCM",
      totalOrders: 15,
      totalSpent: 2500000,
      lastOrder: "2024-01-15",
      status: "active"
    },
    {
      id: "CUS-002",
      name: "Trần Thị B",
      email: "tranthib@email.com", 
      phone: "0987654321",
      address: "456 Đường XYZ, Quận 2, TP.HCM",
      totalOrders: 8,
      totalSpent: 1200000,
      lastOrder: "2024-01-10",
      status: "active"
    },
    {
      id: "CUS-003",
      name: "Lê Văn C",
      email: "levanc@email.com",
      phone: "0369258147",
      address: "789 Đường DEF, Quận 3, TP.HCM", 
      totalOrders: 3,
      totalSpent: 450000,
      lastOrder: "2024-01-05",
      status: "inactive"
    },
    {
      id: "CUS-004",
      name: "Phạm Thị D",
      email: "phamthid@email.com",
      phone: "0741852963",
      address: "321 Đường GHI, Quận 4, TP.HCM",
      totalOrders: 12,
      totalSpent: 1800000,
      lastOrder: "2024-01-12",
      status: "active"
    }
  ]);

  const getStatusColor = (status: string) => {
    return status === "active" ? "#28a745" : "#dc3545";
  };

  const getStatusText = (status: string) => {
    return status === "active" ? "Hoạt động" : "Không hoạt động";
  };

  return (
    <div className="customers-container">
      <div className="customers-header">
        <h1 className="customers-title">Quản lý khách hàng</h1>
        <div className="customers-stats">
          <div className="stat-card">
            <span className="stat-number">{customers.length}</span>
            <span className="stat-label">Tổng khách hàng</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{customers.filter(c => c.status === "active").length}</span>
            <span className="stat-label">Khách hàng hoạt động</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{customers.reduce((sum, c) => sum + c.totalSpent, 0).toLocaleString()}đ</span>
            <span className="stat-label">Tổng doanh thu</span>
          </div>
        </div>
      </div>

      <div className="customers-table-container">
        <table className="customers-table">
          <thead>
            <tr>
              <th>Mã KH</th>
              <th>Tên khách hàng</th>
              <th>Email</th>
              <th>Số điện thoại</th>
              <th>Địa chỉ</th>
              <th>Số đơn hàng</th>
              <th>Tổng chi tiêu</th>
              <th>Đơn hàng cuối</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td className="customer-id">{customer.id}</td>
                <td className="customer-name">{customer.name}</td>
                <td className="customer-email">{customer.email}</td>
                <td className="customer-phone">{customer.phone}</td>
                <td className="customer-address">{customer.address}</td>
                <td className="customer-orders">{customer.totalOrders}</td>
                <td className="customer-spent">{customer.totalSpent.toLocaleString()}đ</td>
                <td className="customer-last-order">{customer.lastOrder}</td>
                <td>
                  <span 
                    className="customer-status"
                    style={{ backgroundColor: getStatusColor(customer.status) }}
                  >
                    {getStatusText(customer.status)}
                  </span>
                </td>
                <td className="customer-actions">
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

export default Customers;
