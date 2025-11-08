import React, { useState } from "react";

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
      status: "active",
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
      status: "active",
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
      status: "inactive",
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

  const getRatingStars = (rating: number) => {
    return "★".repeat(Math.floor(rating)) + "☆".repeat(5 - Math.floor(rating));
  };

  return (
    <div className="px-6 py-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-emerald-600 mb-3 font-logo">
          Quản lý nhà cung cấp
        </h1>
        <p className="text-gray-600 text-lg mb-6">
          Theo dõi và quản lý thông tin các nhà cung cấp sản phẩm của cửa hàng bạn
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-2xl shadow-md p-6 text-center border border-emerald-100 hover:shadow-lg transition">
          <p className="text-3xl font-bold text-emerald-600 mb-1">
            {suppliers.length}
          </p>
          <p className="text-gray-600 font-medium">Tổng nhà cung cấp</p>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-6 text-center border border-emerald-100 hover:shadow-lg transition">
          <p className="text-3xl font-bold text-emerald-600 mb-1">
            {suppliers.filter((s) => s.status === "active").length}
          </p>
          <p className="text-gray-600 font-medium">Đang hoạt động</p>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-6 text-center border border-emerald-100 hover:shadow-lg transition">
          <p className="text-3xl font-bold text-emerald-600 mb-1">
            {(
              suppliers.reduce((sum, s) => sum + s.rating, 0) / suppliers.length
            ).toFixed(1)}
          </p>
          <p className="text-gray-600 font-medium">Đánh giá trung bình</p>
        </div>
      </div>

      {/* Supplier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {suppliers.map((supplier) => (
          <div
            key={supplier.id}
            className="bg-white border border-emerald-100 rounded-2xl shadow-md p-6 hover:shadow-lg transition transform hover:-translate-y-1"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {supplier.name}
              </h3>
              <span
                className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(
                  supplier.status
                )}`}
              >
                {getStatusText(supplier.status)}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <p className="text-sm text-gray-700">
                <span className="font-medium text-gray-600">Liên hệ:</span>{" "}
                {supplier.contact}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium text-gray-600">Điện thoại:</span>{" "}
                {supplier.phone}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium text-gray-600">Email:</span>{" "}
                {supplier.email}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium text-gray-600">Địa chỉ:</span>{" "}
                {supplier.address}
              </p>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium text-gray-600 mb-2">
                Sản phẩm:
              </p>
              <div className="flex flex-wrap gap-2">
                {supplier.products.map((product, index) => (
                  <span
                    key={index}
                    className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-medium"
                  >
                    {product}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center mb-5">
              <span className="font-medium text-gray-600 mr-2">Đánh giá:</span>
              <span className="text-yellow-400 text-lg mr-2">
                {getRatingStars(supplier.rating)}
              </span>
              <span className="text-gray-600 text-sm">({supplier.rating})</span>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 rounded-lg text-sm transition">
                Xem
              </button>
              <button className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-white font-medium py-2 rounded-lg text-sm transition">
                Sửa
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Suppliers;
