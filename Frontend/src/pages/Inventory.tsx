import React, { useState, useEffect, useCallback } from "react";
import {
  productService,
  inventoryService,
  supplierService,
  type Product,
  type Supplier,
  type CreateInventoryLotDto,
  type StockAdjustmentDto,
} from "../services";
import { IoMdSearch } from "react-icons/io";
import { GiFruitBowl } from "react-icons/gi";
import { MdOutlineCheckCircle } from "react-icons/md";
import { HiExclamationCircle } from "react-icons/hi";
import { HiXCircle } from "react-icons/hi";
import { HiEye } from "react-icons/hi";
import { MdEdit } from "react-icons/md";
import { HiPlusCircle } from "react-icons/hi";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  price: number;
  supplier?: string;
  lastUpdated: string;
  status: "in_stock" | "low_stock" | "out_of_stock";
}

const Inventory: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddLotModal, setShowAddLotModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [stockDetails, setStockDetails] = useState<{
    totalAvailable: number;
    lots: {
      lotId: string;
      lotCode: string;
      quantityAvailable: number;
      expiryDate?: string;
      costPerUnit: number;
    }[];
  } | null>(null);

  // Form states
  const [lotForm, setLotForm] = useState<CreateInventoryLotDto>({
    productId: "",
    quantityIn: 0,
    costPerUnit: 0,
    supplierId: "",
    receivedDate: new Date().toISOString().split("T")[0],
    expiryDate: "",
    note: "",
  });

  const [adjustForm, setAdjustForm] = useState<StockAdjustmentDto>({
    productId: "",
    quantity: 0,
    reason: "ADJUSTMENT",
    note: "",
  });

  // Fetch suppliers
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const suppliersData = await supplierService.getAll();
        setSuppliers(suppliersData);
      } catch (err) {
        console.error("Failed to fetch suppliers:", err);
      }
    };
    fetchSuppliers();
  }, []);

  // Fetch inventory data từ API
  const fetchInventory = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Lấy tất cả products
      const products = await productService.getAll();

      // Với mỗi product, lấy stock information
      const inventoryItems: InventoryItem[] = await Promise.all(
        products.map(async (product: Product) => {
          try {
            const stockInfo = await inventoryService.getStock(product._id);
            const totalStock = stockInfo.totalAvailable || 0;

            // Tính status dựa trên stock (giả sử minStock = 10% của giá trị mặc định)
            const minStock = 10; // Có thể lấy từ product attributes hoặc config
            const maxStock = 100; // Có thể lấy từ product attributes hoặc config
            let status: "in_stock" | "low_stock" | "out_of_stock";
            if (totalStock === 0) {
              status = "out_of_stock";
            } else if (totalStock < minStock) {
              status = "low_stock";
            } else {
              status = "in_stock";
            }

            return {
              id: product._id,
              name: product.name,
              category: product.category,
              currentStock: totalStock,
              minStock: minStock,
              maxStock: maxStock,
              unit: product.unit,
              price: product.price,
              supplier: undefined, // Có thể lấy từ inventory lot
              lastUpdated: formatDateOnly(
                product.updatedAt || product.createdAt
              ),
              status: status,
            };
          } catch {
            // Nếu không lấy được stock, coi như out of stock
            return {
              id: product._id,
              name: product.name,
              category: product.category,
              currentStock: 0,
              minStock: 10,
              maxStock: 100,
              unit: product.unit,
              price: product.price,
              supplier: undefined,
              lastUpdated: formatDateOnly(
                product.updatedAt || product.createdAt
              ),
              status: "out_of_stock" as const,
            };
          }
        })
      );

      setInventory(inventoryItems);
    } catch (err) {
      console.error("Failed to fetch inventory:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Không thể tải danh sách tồn kho";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Lấy danh sách categories từ inventory
  const categories = React.useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(inventory.map((item) => item.category))
    ).sort();
    return uniqueCategories;
  }, [inventory]);

  // Lọc inventory theo search term và category
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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

  // Format date to only show date (no time)
  const formatDateOnly = (dateString: string | undefined): string => {
    if (!dateString) return new Date().toISOString().split("T")[0];
    // If it's already in YYYY-MM-DD format, return as is
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString;
    }
    // Otherwise, extract date part from ISO string
    return dateString.split("T")[0];
  };

  // Handle view details
  const handleView = async (item: InventoryItem) => {
    try {
      setSelectedItem(item);
      setError(null);
      const details = await inventoryService.getStock(item.id);
      setStockDetails(details);
      setShowViewModal(true);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Không thể tải thông tin chi tiết";
      setError(errorMessage);
    }
  };

  // Handle add lot
  const handleOpenAddLotModal = (item: InventoryItem) => {
    setSelectedItem(item);
    setLotForm({
      productId: item.id,
      quantityIn: 0,
      costPerUnit: item.price,
      supplierId: "",
      receivedDate: new Date().toISOString().split("T")[0],
      expiryDate: "",
      note: "",
    });
    setShowAddLotModal(true);
  };

  const handleCreateLot = async () => {
    if (
      !lotForm.productId ||
      lotForm.quantityIn <= 0 ||
      lotForm.costPerUnit <= 0
    ) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      setIsCreating(true);
      setError(null);

      const lotData: CreateInventoryLotDto = {
        ...lotForm,
        supplierId: lotForm.supplierId || undefined,
        expiryDate: lotForm.expiryDate || undefined,
        note: lotForm.note || undefined,
      };

      await inventoryService.createLot(lotData);
      setShowAddLotModal(false);
      await fetchInventory();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "Không thể tạo lô hàng";
      setError(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  // Handle adjust stock
  const handleOpenAdjustModal = (item: InventoryItem) => {
    setSelectedItem(item);
    setAdjustForm({
      productId: item.id,
      quantity: 0,
      reason: "ADJUSTMENT",
      note: "",
    });
    setShowAdjustModal(true);
  };

  const handleAdjustStock = async () => {
    if (!adjustForm.productId || adjustForm.quantity === 0) {
      setError("Vui lòng nhập số lượng điều chỉnh");
      return;
    }

    try {
      setIsAdjusting(true);
      setError(null);

      await inventoryService.adjustStock(adjustForm);
      setShowAdjustModal(false);
      await fetchInventory();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Không thể điều chỉnh tồn kho";
      setError(errorMessage);
    } finally {
      setIsAdjusting(false);
    }
  };

  return (
    <div className="px-6 py-10 max-w-7xl mx-auto font-body">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-emerald-600 mb-6 font-logo">
          Quản lý tồn kho
        </h1>

        {/* Search bar và bộ lọc category */}
        <div className="mb-6 space-y-4">
          {/* Thanh tìm kiếm */}
          <div className="flex justify-center">
            <div className="relative w-full sm:w-1/2">
              <IoMdSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
              <input
                type="text"
                spellCheck={false}
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-emerald-300 rounded-xl pl-12 pr-5 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-sm transition-all duration-300"
              />
            </div>
          </div>

          {/* Bộ lọc category */}
          {categories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => setSelectedCategory("")}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  selectedCategory === ""
                    ? "bg-emerald-500 text-white shadow-md"
                    : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                }`}
              >
                Tất cả
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    selectedCategory === category
                      ? "bg-emerald-500 text-white shadow-md"
                      : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl shadow-md border border-emerald-200 p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-center mb-3">
              <GiFruitBowl className="text-4xl text-emerald-600" />
            </div>
            <div className="text-center">
              <span className="block text-3xl font-bold text-emerald-700 mb-1">
                {filteredInventory.length.toString().padStart(2, "0")}
              </span>
              <span className="text-gray-700 font-medium">Tổng sản phẩm</span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl shadow-md border border-emerald-200 p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-center mb-3">
              <MdOutlineCheckCircle className="text-4xl text-emerald-600" />
            </div>
            <div className="text-center">
              <span className="block text-3xl font-bold text-emerald-700 mb-1">
                {filteredInventory
                  .filter((i) => i.status === "in_stock")
                  .length.toString()
                  .padStart(2, "0")}
              </span>
              <span className="text-gray-700 font-medium">Còn hàng</span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl shadow-md border border-yellow-200 p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-center mb-3">
              <HiExclamationCircle className="text-4xl text-yellow-600" />
            </div>
            <div className="text-center">
              <span className="block text-3xl font-bold text-yellow-700 mb-1">
                {filteredInventory
                  .filter((i) => i.status === "low_stock")
                  .length.toString()
                  .padStart(2, "0")}
              </span>
              <span className="text-gray-700 font-medium">Sắp hết</span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-rose-50 to-red-50 rounded-xl shadow-md border border-rose-200 p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-center mb-3">
              <HiXCircle className="text-4xl text-rose-600" />
            </div>
            <div className="text-center">
              <span className="block text-3xl font-bold text-rose-700 mb-1">
                {filteredInventory
                  .filter((i) => i.status === "out_of_stock")
                  .length.toString()
                  .padStart(2, "0")}
              </span>
              <span className="text-gray-700 font-medium">Hết hàng</span>
            </div>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu tồn kho...</p>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 text-center">
          <p className="font-semibold">Lỗi: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm underline hover:text-red-900"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Inventory cards */}
      {!isLoading && !error && (
        <>
          {filteredInventory.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">
                {searchTerm
                  ? "Không tìm thấy sản phẩm nào"
                  : "Chưa có sản phẩm nào trong tồn kho"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredInventory.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl shadow-md border border-emerald-100 p-6 hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 flex-1 pr-2">
                      {item.name}
                    </h3>
                    <span
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm whitespace-nowrap ${getStatusColor(
                        item.status
                      )}`}
                    >
                      {getStatusText(item.status)}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="mb-5 space-y-3 text-sm">
                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-gray-600 font-medium">
                        Danh mục:
                      </span>
                      <span className="font-semibold text-gray-800">
                        {item.category}
                      </span>
                    </div>
                    {item.supplier && (
                      <div className="flex justify-between items-center py-1.5">
                        <span className="text-gray-600 font-medium">
                          Nhà cung cấp:
                        </span>
                        <span className="font-semibold text-gray-800">
                          {item.supplier}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-gray-600 font-medium">
                        Giá bán:
                      </span>
                      <span className="font-bold text-emerald-600 text-base">
                        {item.price.toLocaleString()}đ/{item.unit}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-gray-600 font-medium">
                        Cập nhật:
                      </span>
                      <span className="font-semibold text-gray-700">
                        {item.lastUpdated
                          ? new Date(item.lastUpdated).toLocaleDateString(
                              "vi-VN"
                            )
                          : "N/A"}
                      </span>
                    </div>
                  </div>

                  {/* Stock info */}
                  <div className="mb-5 bg-gray-50 rounded-xl p-4">
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="bg-white rounded-lg p-3 text-center border border-emerald-100 shadow-sm">
                        <span className="block text-xs text-gray-600 mb-1.5 font-medium">
                          Tồn kho
                        </span>
                        <span className="font-bold text-emerald-700 text-base">
                          {item.currentStock}
                        </span>
                        <span className="text-xs text-gray-500 block mt-0.5">
                          {item.unit}
                        </span>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center border border-yellow-100 shadow-sm">
                        <span className="block text-xs text-gray-600 mb-1.5 font-medium">
                          Tối thiểu
                        </span>
                        <span className="font-bold text-yellow-600 text-base">
                          {item.minStock}
                        </span>
                        <span className="text-xs text-gray-500 block mt-0.5">
                          {item.unit}
                        </span>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center border border-lime-100 shadow-sm">
                        <span className="block text-xs text-gray-600 mb-1.5 font-medium">
                          Tối đa
                        </span>
                        <span className="font-bold text-lime-600 text-base">
                          {item.maxStock}
                        </span>
                        <span className="text-xs text-gray-500 block mt-0.5">
                          {item.unit}
                        </span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 font-medium">
                          Mức tồn kho
                        </span>
                        <span className="font-bold text-gray-700">
                          {getStockPercentage(item.currentStock, item.maxStock)}
                          %
                        </span>
                      </div>
                      <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                        <div
                          className={`h-full ${getBarColor(
                            item.status
                          )} transition-all duration-500 rounded-full`}
                          style={{
                            width: `${getStockPercentage(
                              item.currentStock,
                              item.maxStock
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleView(item)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all text-sm"
                      title="Xem chi tiết"
                    >
                      <HiEye className="text-base" />
                      <span>Xem</span>
                    </button>
                    <button
                      onClick={() => handleOpenAdjustModal(item)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all text-sm"
                      title="Điều chỉnh tồn kho"
                    >
                      <MdEdit className="text-base" />
                      <span>Sửa</span>
                    </button>
                    <button
                      onClick={() => handleOpenAddLotModal(item)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-lime-500 hover:bg-lime-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all text-sm"
                      title="Nhập hàng mới"
                    >
                      <HiPlusCircle className="text-base" />
                      <span>Nhập</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* View Details Modal */}
      {showViewModal && selectedItem && stockDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-emerald-700">
                  Chi tiết tồn kho
                </h2>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedItem(null);
                    setStockDetails(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {selectedItem.name}
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Danh mục:</span>
                    <span className="ml-2 font-medium text-gray-800">
                      {selectedItem.category}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Đơn vị:</span>
                    <span className="ml-2 font-medium text-gray-800">
                      {selectedItem.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Giá bán:</span>
                    <span className="ml-2 font-medium text-emerald-600">
                      {selectedItem.price.toLocaleString()}đ/{selectedItem.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Tổng tồn kho:</span>
                    <span className="ml-2 font-bold text-emerald-700 text-lg">
                      {stockDetails.totalAvailable} {selectedItem.unit}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-3">
                  Danh sách lô hàng ({stockDetails.lots.length})
                </h4>
                {stockDetails.lots.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    Chưa có lô hàng nào
                  </p>
                ) : (
                  <div className="space-y-3">
                    {stockDetails.lots.map((lot) => (
                      <div
                        key={lot.lotId}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
                      >
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <span className="text-gray-600 block mb-1">
                              Mã lô:
                            </span>
                            <span className="font-medium text-gray-800">
                              {lot.lotCode}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600 block mb-1">
                              Số lượng:
                            </span>
                            <span className="font-semibold text-emerald-700">
                              {lot.quantityAvailable} {selectedItem.unit}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600 block mb-1">
                              Giá nhập:
                            </span>
                            <span className="font-medium text-gray-800">
                              {lot.costPerUnit.toLocaleString()}đ
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600 block mb-1">
                              Hạn sử dụng:
                            </span>
                            <span className="font-medium text-gray-800">
                              {lot.expiryDate
                                ? new Date(lot.expiryDate).toLocaleDateString(
                                    "vi-VN"
                                  )
                                : "Không có"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedItem(null);
                    setStockDetails(null);
                  }}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Lot Modal */}
      {showAddLotModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-emerald-700 mb-4">
                Nhập hàng mới
              </h2>
              <p className="text-gray-600 mb-4">
                Sản phẩm: {selectedItem.name}
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Số lượng nhập *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={lotForm.quantityIn}
                    onChange={(e) =>
                      setLotForm({
                        ...lotForm,
                        quantityIn: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Giá nhập (đ/{selectedItem.unit}) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={lotForm.costPerUnit}
                    onChange={(e) =>
                      setLotForm({
                        ...lotForm,
                        costPerUnit: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nhà cung cấp
                  </label>
                  <select
                    value={lotForm.supplierId}
                    onChange={(e) =>
                      setLotForm({ ...lotForm, supplierId: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  >
                    <option value="">Chọn nhà cung cấp</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier._id} value={supplier._id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ngày nhập
                  </label>
                  <input
                    type="date"
                    value={lotForm.receivedDate}
                    onChange={(e) =>
                      setLotForm({ ...lotForm, receivedDate: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Hạn sử dụng
                  </label>
                  <input
                    type="date"
                    value={lotForm.expiryDate}
                    onChange={(e) =>
                      setLotForm({ ...lotForm, expiryDate: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ghi chú
                  </label>
                  <textarea
                    value={lotForm.note}
                    onChange={(e) =>
                      setLotForm({ ...lotForm, note: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
              </div>

              {error && (
                <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddLotModal(false);
                    setError(null);
                  }}
                  className="flex-1 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-all"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreateLot}
                  disabled={isCreating}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isCreating ? "Đang tạo..." : "Tạo lô hàng"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {showAdjustModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-emerald-700 mb-4">
                Điều chỉnh tồn kho
              </h2>
              <p className="text-gray-600 mb-4">
                Sản phẩm: {selectedItem.name}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Tồn kho hiện tại: {selectedItem.currentStock}{" "}
                {selectedItem.unit}
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Số lượng điều chỉnh *
                  </label>
                  <input
                    type="number"
                    value={adjustForm.quantity}
                    onChange={(e) =>
                      setAdjustForm({
                        ...adjustForm,
                        quantity: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="Dương để tăng, âm để giảm"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Nhập số dương để tăng, số âm để giảm tồn kho
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Lý do *
                  </label>
                  <select
                    value={adjustForm.reason}
                    onChange={(e) =>
                      setAdjustForm({
                        ...adjustForm,
                        reason: e.target.value as "WASTE" | "ADJUSTMENT",
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    required
                  >
                    <option value="ADJUSTMENT">Điều chỉnh</option>
                    <option value="WASTE">Hao hụt</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ghi chú
                  </label>
                  <textarea
                    value={adjustForm.note}
                    onChange={(e) =>
                      setAdjustForm({ ...adjustForm, note: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
              </div>

              {error && (
                <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAdjustModal(false);
                    setError(null);
                  }}
                  className="flex-1 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-all"
                >
                  Hủy
                </button>
                <button
                  onClick={handleAdjustStock}
                  disabled={isAdjusting}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isAdjusting ? "Đang xử lý..." : "Điều chỉnh"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
