import React, { useState } from "react";

const Orders: React.FC = () => {
  const [orders] = useState([
    {
      id: "ORD-001",
      customer: "Nguyễn Văn A",
      date: "2024-01-15",
      amount: 150000,
      status: "completed",
      items: ["Cà rốt", "Cà chua", "Rau xà lách"],
    },
    {
      id: "ORD-002",
      customer: "Trần Thị B",
      date: "2024-01-15",
      amount: 85000,
      status: "processing",
      items: ["Bông cải xanh", "Hành tây"],
    },
    {
      id: "ORD-003",
      customer: "Lê Văn C",
      date: "2024-01-14",
      amount: 200000,
      status: "pending",
      items: ["Ớt chuông", "Dưa chuột", "Rau chân vịt"],
    },
    {
      id: "ORD-004",
      customer: "Phạm Thị D",
      date: "2024-01-14",
      amount: 120000,
      status: "cancelled",
      items: ["Bắp cải", "Cà tím"],
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500";
      case "processing":
        return "bg-yellow-400";
      case "pending":
        return "bg-sky-400";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Hoàn thành";
      case "processing":
        return "Đang xử lý";
      case "pending":
        return "Chờ xử lý";
      case "cancelled":
        return "Đã hủy";
      default:
        return "Không xác định";
    }
  };

  return (
    <div className="px-6 py-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-emerald-600 mb-3 font-logo">
          Quản lý đơn hàng
        </h1>
        <p className="text-gray-600 text-lg">
          Theo dõi, chỉnh sửa và quản lý các đơn hàng của cửa hàng bạn
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-white border border-emerald-100 rounded-2xl shadow-md p-6 text-center hover:shadow-lg transition">
          <h2 className="text-3xl font-bold text-emerald-600">
            {orders.length}
          </h2>
          <p className="text-gray-600 mt-2">Tổng đơn hàng</p>
        </div>
        <div className="bg-white border border-emerald-100 rounded-2xl shadow-md p-6 text-center hover:shadow-lg transition">
          <h2 className="text-3xl font-bold text-emerald-600">
            {orders.filter((o) => o.status === "completed").length}
          </h2>
          <p className="text-gray-600 mt-2">Đã hoàn thành</p>
        </div>
        <div className="bg-white border border-emerald-100 rounded-2xl shadow-md p-6 text-center hover:shadow-lg transition">
          <h2 className="text-3xl font-bold text-emerald-600">
            {orders.filter((o) => o.status === "pending").length}
          </h2>
          <p className="text-gray-600 mt-2">Chờ xử lý</p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-emerald-100 rounded-2xl shadow-md overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-emerald-50 text-emerald-700">
            <tr>
              <th className="text-left pl-8 py-4 font-semibold">Mã đơn hàng</th>
              <th className="text-left px-6 py-4 font-semibold">Khách hàng</th>
              <th className="text-left px-6 py-4 font-semibold">Ngày đặt</th>
              <th className="text-left pl-20 py-4 font-semibold">Sản phẩm</th>
              <th className="text-left px-6 py-4 font-semibold">Tổng tiền</th>
              <th className="text-left pl-10 py-4 font-semibold">Trạng thái</th>
              <th className="text-left px-6 py-4 font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="hover:bg-emerald-50 transition-colors border-t border-gray-100"
              >
                <td className="px-6 py-4 font-semibold text-emerald-600">
                  {order.id}
                </td>
                <td className="px-6 py-4">{order.customer}</td>
                <td className="px-6 py-4 text-gray-600">{order.date}</td>
                <td className="px-6 py-4 text-gray-700">
                  {order.items.join(", ")}
                </td>
                <td className="px-6 py-4 font-semibold text-emerald-600">
                  {order.amount.toLocaleString()}đ
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-block w-28 text-center text-white px-3 py-2 rounded-full text-sm font-medium ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {getStatusText(order.status)}
                  </span>
                </td>
                <td className="px-6 py-4 flex gap-2">
                  <button className="w-20 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg text-sm font-medium transition">
                    Xem
                  </button>
                  <button className="w-20 bg-yellow-400 hover:bg-yellow-500 text-white py-2 rounded-lg text-sm font-medium transition">
                    Sửa
                  </button>
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
