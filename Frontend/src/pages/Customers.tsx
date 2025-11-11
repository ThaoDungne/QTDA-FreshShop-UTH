import React, { useState } from "react";

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
      status: "active",
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
      status: "active",
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
      status: "inactive",
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
      status: "active",
    },
  ]);

  const getStatusColor = (status: string) => {
    return status === "active"
      ? "bg-emerald-500 text-white"
      : "bg-red-500 text-white";
  };

  const getStatusText = (status: string) => {
    return status === "active" ? "Hoạt động" : "Không hoạt động";
  };

  return (
    <div className="px-6 py-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-emerald-600 mb-3 font-logo">
          Quản lý khách hàng
        </h1>
        <p className="text-gray-600 text-lg mb-6">
          Theo dõi và quản lý danh sách khách hàng của cửa hàng bạn
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-2xl shadow-md p-6 text-center border border-emerald-100 hover:shadow-lg transition">
          <p className="text-3xl font-bold text-emerald-600 mb-1">
            {customers.length}
          </p>
          <p className="text-gray-600 font-medium">Tổng khách hàng</p>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-6 text-center border border-emerald-100 hover:shadow-lg transition">
          <p className="text-3xl font-bold text-emerald-600 mb-1">
            {customers.filter((c) => c.status === "active").length}
          </p>
          <p className="text-gray-600 font-medium">Khách hàng hoạt động</p>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-6 text-center border border-emerald-100 hover:shadow-lg transition">
          <p className="text-3xl font-bold text-emerald-600 mb-1">
            {customers
              .reduce((sum, c) => sum + c.totalSpent, 0)
              .toLocaleString()}đ
          </p>
          <p className="text-gray-600 font-medium">Tổng doanh thu</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-emerald-100 rounded-2xl shadow-md overflow-x-auto">
        <table className="w-full border-collapse text-gray-700 min-w-[1100px]">
          <thead className="bg-emerald-50 text-emerald-700">
            <tr>
              <th className="text-left px-8 py-4 font-semibold">Mã KH</th>
              <th className="text-left px-6 py-4 font-semibold">Tên khách hàng</th>
              <th className="text-left px-6 py-4 font-semibold">Email</th>
              <th className="text-left px-6 py-4 font-semibold">Số điện thoại</th>
              <th className="text-left px-6 py-4 font-semibold">Địa chỉ</th>
              <th className="text-center px-6 py-4 font-semibold">Số đơn hàng</th>
              <th className="text-right px-6 py-4 font-semibold">Tổng chi tiêu</th>
              <th className="text-center px-6 py-4 font-semibold">Đơn hàng cuối</th>
              <th className="text-center px-6 py-4 font-semibold">Trạng thái</th>
              <th className="text-center px-6 py-4 font-semibold">Thao tác</th>
            </tr>
          </thead>

          <tbody>
            {customers.map((customer) => (
              <tr
                key={customer.id}
                className="hover:bg-emerald-50 border-t border-emerald-100 transition"
              >
                <td className="px-8 py-4 font-semibold text-emerald-600 whitespace-nowrap">
                  {customer.id}
                </td>
                <td className="px-6 py-4 font-medium">{customer.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {customer.email}
                </td>
                <td className="px-6 py-4 text-gray-700">{customer.phone}</td>
                <td className="px-6 py-4 text-sm text-gray-600 max-w-[200px] truncate">
                  {customer.address}
                </td>
                <td className="px-6 py-4 text-center font-semibold text-emerald-600">
                  {customer.totalOrders}
                </td>
                <td className="px-6 py-4 text-right font-semibold text-emerald-600">
                  {customer.totalSpent.toLocaleString()}đ
                </td>
                <td className="px-6 py-4 text-center text-sm text-gray-600">
                  {customer.lastOrder}
                </td>

                {/* Trạng thái */}
                <td className="px-6 py-4 text-center">
                  <span
                    className={`inline-block w-[110px] text-center py-1.5 rounded-full text-xs font-semibold ${getStatusColor(
                      customer.status
                    )}`}
                  >
                    {getStatusText(customer.status)}
                  </span>
                </td>

                {/* Nút thao tác */}
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center gap-3">
                    <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-1.5 rounded-md text-sm font-medium transition w-[60px]">
                      Xem
                    </button>
                    <button className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-1.5 rounded-md text-sm font-medium transition w-[60px]">
                      Sửa
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

export default Customers;
