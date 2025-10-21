import React, { useState } from "react";
import "./Payment.css";

interface Payment {
  id: string;
  orderId: string;
  customer: string;
  amount: number;
  method: "cash" | "card" | "bank_transfer" | "digital_wallet";
  status: "pending" | "completed" | "failed" | "refunded";
  date: string;
  description: string;
}

const Payment: React.FC = () => {
  const [payments] = useState<Payment[]>([
    {
      id: "PAY-001",
      orderId: "ORD-001",
      customer: "Nguyễn Văn A",
      amount: 150000,
      method: "cash",
      status: "completed",
      date: "2024-01-15 14:30",
      description: "Thanh toán tiền mặt"
    },
    {
      id: "PAY-002",
      orderId: "ORD-002",
      customer: "Trần Thị B",
      amount: 85000,
      method: "card",
      status: "completed",
      date: "2024-01-15 16:45",
      description: "Thanh toán thẻ tín dụng"
    },
    {
      id: "PAY-003",
      orderId: "ORD-003",
      customer: "Lê Văn C",
      amount: 200000,
      method: "bank_transfer",
      status: "pending",
      date: "2024-01-15 18:20",
      description: "Chuyển khoản ngân hàng"
    },
    {
      id: "PAY-004",
      orderId: "ORD-004",
      customer: "Phạm Thị D",
      amount: 120000,
      method: "digital_wallet",
      status: "failed",
      date: "2024-01-14 10:15",
      description: "Ví điện tử - Giao dịch thất bại"
    },
    {
      id: "PAY-005",
      orderId: "ORD-005",
      customer: "Hoàng Văn E",
      amount: 95000,
      method: "card",
      status: "refunded",
      date: "2024-01-13 15:30",
      description: "Hoàn tiền thẻ tín dụng"
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "#28a745";
      case "pending": return "#ffc107";
      case "failed": return "#dc3545";
      case "refunded": return "#6c757d";
      default: return "#6c757d";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed": return "Thành công";
      case "pending": return "Chờ xử lý";
      case "failed": return "Thất bại";
      case "refunded": return "Đã hoàn";
      default: return "Không xác định";
    }
  };

  const getMethodText = (method: string) => {
    switch (method) {
      case "cash": return "Tiền mặt";
      case "card": return "Thẻ tín dụng";
      case "bank_transfer": return "Chuyển khoản";
      case "digital_wallet": return "Ví điện tử";
      default: return "Không xác định";
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "cash": return "💵";
      case "card": return "💳";
      case "bank_transfer": return "🏦";
      case "digital_wallet": return "📱";
      default: return "❓";
    }
  };

  return (
    <div className="payment-container">
      <div className="payment-header">
        <h1 className="payment-title">Quản lý thanh toán</h1>
        <div className="payment-stats">
          <div className="stat-card">
            <span className="stat-number">{payments.length}</span>
            <span className="stat-label">Tổng giao dịch</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{payments.filter(p => p.status === "completed").length}</span>
            <span className="stat-label">Thành công</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{payments.reduce((sum, p) => sum + (p.status === "completed" ? p.amount : 0), 0).toLocaleString()}đ</span>
            <span className="stat-label">Tổng thu</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{payments.filter(p => p.status === "pending").length}</span>
            <span className="stat-label">Chờ xử lý</span>
          </div>
        </div>
      </div>

      <div className="payment-table-container">
        <table className="payment-table">
          <thead>
            <tr>
              <th>Mã GD</th>
              <th>Đơn hàng</th>
              <th>Khách hàng</th>
              <th>Số tiền</th>
              <th>Phương thức</th>
              <th>Trạng thái</th>
              <th>Ngày giờ</th>
              <th>Mô tả</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td className="payment-id">{payment.id}</td>
                <td className="payment-order">{payment.orderId}</td>
                <td className="payment-customer">{payment.customer}</td>
                <td className="payment-amount">{payment.amount.toLocaleString()}đ</td>
                <td className="payment-method">
                  <span className="method-icon">{getMethodIcon(payment.method)}</span>
                  <span className="method-text">{getMethodText(payment.method)}</span>
                </td>
                <td>
                  <span 
                    className="payment-status"
                    style={{ backgroundColor: getStatusColor(payment.status) }}
                  >
                    {getStatusText(payment.status)}
                  </span>
                </td>
                <td className="payment-date">{payment.date}</td>
                <td className="payment-description">{payment.description}</td>
                <td className="payment-actions">
                  <button className="btn-view">Xem</button>
                  <button className="btn-process">Xử lý</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Payment;
