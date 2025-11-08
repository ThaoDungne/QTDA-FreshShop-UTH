import React, { useState } from "react";

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
      status: "in_stock",
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
      status: "low_stock",
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
      status: "out_of_stock",
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
      status: "in_stock",
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
      status: "in_stock",
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
      status: "low_stock",
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_stock":
        return "bg-emerald-400 text-white";
      case "low_stock":
        return "bg-yellow-400 text-white";
      case "out_of_stock":
        return "bg-rose-500 text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "in_stock":
        return "Còn hàng";
      case "low_stock":
        return "Sắp hết";
      case "out_of_stock":
        return "Hết hàng";
      default:
        return "Không xác định";
    }
  };

  const getBarColor = (status: string) => {
    switch (status) {
      case "in_stock":
        return "bg-emerald-400";
      case "low_stock":
        return "bg-yellow-400";
      case "out_of_stock":
        return "bg-rose-500";
      default:
        return "bg-gray-400";
    }
  };

  const getStockPercentage = (current: number, max: number) => {
    return Math.round((current / max) * 100);
  };

  return (
    <div className="px-6 py-10 max-w-7xl mx-auto font-body">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-emerald-600 mb-6 font-logo">
          Quản lý tồn kho
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white rounded-xl shadow-sm border border-emerald-100 p-5">
            <span className="block text-3xl font-bold text-emerald-600 mb-1">
              {inventory.length}
            </span>
            <span className="text-gray-600 font-medium">Tổng sản phẩm</span>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-emerald-100 p-5">
            <span className="block text-3xl font-bold text-emerald-600 mb-1">
              {inventory.filter((i) => i.status === "in_stock").length}
            </span>
            <span className="text-gray-600 font-medium">Còn hàng</span>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-emerald-100 p-5">
            <span className="block text-3xl font-bold text-yellow-500 mb-1">
              {inventory.filter((i) => i.status === "low_stock").length}
            </span>
            <span className="text-gray-600 font-medium">Sắp hết</span>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-emerald-100 p-5">
            <span className="block text-3xl font-bold text-rose-500 mb-1">
              {inventory.filter((i) => i.status === "out_of_stock").length}
            </span>
            <span className="text-gray-600 font-medium">Hết hàng</span>
          </div>
        </div>
      </div>

      {/* Inventory cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {inventory.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl shadow-md border border-emerald-100 p-6 hover:-translate-y-1 hover:shadow-lg transition-all"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-emerald-700">
                {item.name}
              </h3>
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full shadow-sm ${getStatusColor(
                  item.status
                )}`}
              >
                {getStatusText(item.status)}
              </span>
            </div>

            {/* Info */}
            <div className="mb-5 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Danh mục:</span>
                <span className="font-medium text-gray-800">
                  {item.category}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Nhà cung cấp:</span>
                <span className="font-medium text-gray-800">
                  {item.supplier}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Giá:</span>
                <span className="font-medium text-emerald-600">
                  {item.price.toLocaleString()}đ/{item.unit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Cập nhật:</span>
                <span className="font-medium text-gray-800">
                  {item.lastUpdated}
                </span>
              </div>
            </div>

            {/* Stock info */}
            <div className="mb-5">
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="bg-emerald-50 rounded-lg p-3 text-center">
                  <span className="block text-xs text-gray-500 mb-1">
                    Tồn kho
                  </span>
                  <span className="font-semibold text-emerald-700">
                    {item.currentStock} {item.unit}
                  </span>
                </div>
                <div className="bg-yellow-50 rounded-lg p-3 text-center">
                  <span className="block text-xs text-gray-500 mb-1">
                    Tối thiểu
                  </span>
                  <span className="font-semibold text-yellow-600">
                    {item.minStock} {item.unit}
                  </span>
                </div>
                <div className="bg-lime-50 rounded-lg p-3 text-center">
                  <span className="block text-xs text-gray-500 mb-1">
                    Tối đa
                  </span>
                  <span className="font-semibold text-lime-600">
                    {item.maxStock} {item.unit}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-emerald-50 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getBarColor(item.status)} transition-all`}
                    style={{
                      width: `${getStockPercentage(
                        item.currentStock,
                        item.maxStock
                      )}%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-semibold text-gray-600 min-w-[40px] text-right">
                  {getStockPercentage(item.currentStock, item.maxStock)}%
                </span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg shadow-sm transition-all">
                Cập nhật
              </button>
              <button className="flex-1 py-2.5 bg-lime-500 hover:bg-lime-600 text-white font-medium rounded-lg shadow-sm transition-all">
                Đặt hàng
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Inventory;
