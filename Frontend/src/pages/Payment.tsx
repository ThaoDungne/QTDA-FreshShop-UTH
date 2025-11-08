import React, { useState } from "react";

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
      description: "Thanh toán tiền mặt",
    },
    {
      id: "PAY-002",
      orderId: "ORD-002",
      customer: "Trần Thị B",
      amount: 85000,
      method: "card",
      status: "completed",
      date: "2024-01-15 16:45",
      description: "Thanh toán thẻ tín dụng",
    },
    {
      id: "PAY-003",
      orderId: "ORD-003",
      customer: "Lê Văn C",
      amount: 200000,
      method: "bank_transfer",
      status: "pending",
      date: "2024-01-15 18:20",
      description: "Chuyển khoản ngân hàng",
    },
    {
      id: "PAY-004",
      orderId: "ORD-004",
      customer: "Phạm Thị D",
      amount: 120000,
      method: "digital_wallet",
      status: "failed",
      date: "2024-01-14 10:15",
      description: "Ví điện tử - Giao dịch thất bại",
    },
    {
      id: "PAY-005",
      orderId: "ORD-005",
      customer: "Hoàng Văn E",
      amount: 95000,
      method: "card",
      status: "refunded",
      date: "2024-01-13 15:30",
      description: "Hoàn tiền thẻ tín dụng",
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500 text-white";
      case "pending":
        return "bg-yellow-400 text-white";
      case "failed":
        return "bg-red-500 text-white";
      case "refunded":
        return "bg-gray-400 text-white";
      default:
        return "bg-gray-300 text-white";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Thành công";
      case "pending":
        return "Chờ xử lý";
      case "failed":
        return "Thất bại";
      case "refunded":
        return "Đã hoàn";
      default:
        return "Không xác định";
    }
  };

  const getMethodText = (method: string) => {
    switch (method) {
      case "cash":
        return "Tiền mặt";
      case "card":
        return "Thẻ tín dụng";
      case "bank_transfer":
        return "Chuyển khoản";
      case "digital_wallet":
        return "Ví điện tử";
      default:
        return "Không xác định";
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "cash":
        return "💵";
      case "card":
        return "💳";
      case "bank_transfer":
        return "🏦";
      case "digital_wallet":
        return "📱";
      default:
        return "❓";
    }
  };

  return (
    <div className="px-6 py-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-emerald-600 mb-3 font-logo">
          Quản lý thanh toán
        </h1>
        <p className="text-gray-600 text-lg mb-6">
          Theo dõi, xử lý và quản lý các giao dịch thanh toán của cửa hàng bạn
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-10">
        <div className="bg-white rounded-2xl shadow-md p-6 text-center border border-emerald-100 hover:shadow-lg transition">
          <p className="text-3xl font-bold text-emerald-600 mb-1">
            {payments.length}
          </p>
          <p className="text-gray-600 font-medium">Tổng giao dịch</p>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-6 text-center border border-emerald-100 hover:shadow-lg transition">
          <p className="text-3xl font-bold text-emerald-600 mb-1">
            {payments.filter((p) => p.status === "completed").length}
          </p>
          <p className="text-gray-600 font-medium">Thành công</p>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-6 text-center border border-emerald-100 hover:shadow-lg transition">
          <p className="text-3xl font-bold text-emerald-600 mb-1">
            {payments
              .reduce(
                (sum, p) => sum + (p.status === "completed" ? p.amount : 0),
                0
              )
              .toLocaleString()}
            đ
          </p>
          <p className="text-gray-600 font-medium">Tổng thu</p>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-6 text-center border border-emerald-100 hover:shadow-lg transition">
          <p className="text-3xl font-bold text-yellow-500 mb-1">
            {payments.filter((p) => p.status === "pending").length}
          </p>
          <p className="text-gray-600 font-medium">Chờ xử lý</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-emerald-100 rounded-2xl shadow-md overflow-x-auto">
        <table className="w-full border-collapse text-gray-700 min-w-[1100px]">
          <thead className="bg-emerald-50 text-emerald-700">
            <tr>
              <th className="text-left px-8 py-4 font-semibold">Mã GD</th>
              <th className="text-left px-6 py-4 font-semibold">Đơn hàng</th>
              <th className="text-left px-6 py-4 font-semibold">Khách hàng</th>
              <th className="text-right px-6 py-4 font-semibold">Số tiền</th>
              <th className="text-left px-6 py-4 font-semibold">
                Phương thức
              </th>
              <th className="text-center px-6 py-4 font-semibold">Trạng thái</th>
              <th className="text-center px-6 py-4 font-semibold">Ngày giờ</th>
              <th className="text-left px-6 py-4 font-semibold">Mô tả</th>
              <th className="text-center px-6 py-4 font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr
                key={payment.id}
                className="hover:bg-emerald-50 border-t border-emerald-100 transition"
              >
                <td className="px-8 py-4 font-semibold text-emerald-600">
                  {payment.id}
                </td>
                <td className="px-6 py-4 font-medium">{payment.orderId}</td>
                <td className="px-6 py-4">{payment.customer}</td>
                <td className="px-6 py-4 text-right font-semibold text-emerald-600">
                  {payment.amount.toLocaleString()}đ
                </td>
                <td className="px-6 py-4 flex items-center gap-2">
                  <span className="text-lg">{getMethodIcon(payment.method)}</span>
                  <span className="text-gray-700 text-sm">
                    {getMethodText(payment.method)}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span
                    className={`inline-block w-[100px] py-1.5 rounded-full text-xs font-semibold ${getStatusColor(
                      payment.status
                    )}`}
                  >
                    {getStatusText(payment.status)}
                  </span>
                </td>
                <td className="px-6 py-4 text-center text-sm text-gray-600">
                  {payment.date}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 max-w-[200px] truncate">
                  {payment.description}
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center gap-3">
                    <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-1.5 rounded-md text-sm font-medium transition w-[60px]">
                      Xem
                    </button>
                    <button className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-1.5 rounded-md text-sm font-medium transition w-[70px]">
                      Xử lý
                    </button>
                  </div>
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
