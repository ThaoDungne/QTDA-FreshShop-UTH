import React, { useState, useEffect } from "react";
import OrderPopup from "../components/OrderPopup";
import { productService, type Product } from "../services";
import { IoMdSearch } from "react-icons/io";

interface Vegetable {
  id: string;
  name: string;
  image: string;
  price: string;
  priceNumber: number;
  unit: string;
  category: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

// Placeholder image URL nếu sản phẩm không có imageUrl
const PLACEHOLDER_IMAGE = "https://via.placeholder.com/300x300?text=No+Image";

// Hàm format giá
const formatPrice = (price: number, unit: string): string => {
  return `${price.toLocaleString("vi-VN")}đ/${unit}`;
};

// Convert Product từ API sang Vegetable
const convertProductToVegetable = (product: Product): Vegetable => {
  return {
    id: product._id,
    name: product.name,
    // Dùng imageUrl từ API, nếu không có thì dùng placeholder
    image: product.imageUrl || PLACEHOLDER_IMAGE,
    price: formatPrice(product.price, product.unit),
    priceNumber: product.price,
    unit: product.unit,
    category: product.category,
  };
};

const Sales: React.FC = () => {
  const [isOrderPopupOpen, setIsOrderPopupOpen] = useState(false);
  const [preAddedItems, setPreAddedItems] = useState<CartItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [vegetables, setVegetables] = useState<Vegetable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch products từ API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Lấy sản phẩm đang hoạt động
        const products = await productService.getActiveProducts();
        // Convert sang Vegetable format
        const convertedProducts = products.map(convertProductToVegetable);
        setVegetables(convertedProducts);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Không thể tải danh sách sản phẩm";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Lấy danh sách categories từ products
  const categories = React.useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(vegetables.map((v) => v.category))
    ).sort();
    return uniqueCategories;
  }, [vegetables]);

  // Lọc theo tên tìm kiếm và category
  const filteredVegetables = vegetables.filter((v) => {
    const matchesSearch = v.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      !selectedCategory || v.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredVegetables.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleVegetables = filteredVegetables.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleAddToCart = (vegetable: Vegetable) => {
    const newItem = {
      id: vegetable.id,
      name: vegetable.name,
      price: vegetable.priceNumber,
      quantity: 1,
      total: vegetable.priceNumber,
    };

    setPreAddedItems((prev) => {
      const existingItem = prev.find((item) => item.id === newItem.id);
      if (existingItem) {
        return prev.map((item) =>
          item.id === newItem.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                total: (item.quantity + 1) * item.price,
              }
            : item
        );
      } else {
        return [...prev, newItem];
      }
    });

    setIsOrderPopupOpen(true);
  };

  const handleOrderConfirm = (order: {
    customerName: string;
    customerPhone: string;
    items: CartItem[];
    totalAmount: number;
  }) => {
    alert(
      `Đơn hàng đã được tạo!\nKhách hàng: ${
        order.customerName
      }\nTổng tiền: ${order.totalAmount.toLocaleString()}đ`
    );
    setPreAddedItems([]);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // Tính toán các trang cần hiển thị (thu gọn phân trang)
  const getVisiblePages = () => {
    const delta = 2; // Số trang hiển thị mỗi bên trang hiện tại
    const pages: (number | string)[] = [];

    // Luôn hiển thị trang đầu
    pages.push(1);

    // Tính toán các trang xung quanh trang hiện tại
    const start = Math.max(2, currentPage - delta);
    const end = Math.min(totalPages - 1, currentPage + delta);

    // Thêm "..." nếu có khoảng trống
    if (start > 2) {
      pages.push("...");
    }

    // Thêm các trang trong khoảng
    for (let i = start; i <= end; i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push(i);
      }
    }

    // Thêm "..." nếu có khoảng trống
    if (end < totalPages - 1) {
      pages.push("...");
    }

    // Luôn hiển thị trang cuối (nếu có nhiều hơn 1 trang)
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="px-6 py-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-emerald-600 mb-2 font-logo">
          Bán hàng - Sản phẩm
        </h1>
      </div>

      {/* Thanh tìm kiếm và lọc category */}
      <div className="mb-10 space-y-4">
        {/* Thanh tìm kiếm */}
        <div className="flex justify-center">
          <div className="relative w-full sm:w-1/2">
            <IoMdSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type="text"
              spellCheck={false}
              placeholder="Tìm kiếm rau củ quả..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // reset về trang đầu khi tìm kiếm
              }}
              className="w-full border border-emerald-300 rounded-xl pl-12 pr-5 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-sm transition-all duration-300"
            />
          </div>
        </div>

        {/* Bộ lọc category */}
        {categories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => {
                setSelectedCategory("");
                setCurrentPage(1);
              }}
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
                onClick={() => {
                  setSelectedCategory(category);
                  setCurrentPage(1);
                }}
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

      {/* Loading state */}
      {isLoading && (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <p className="mt-4 text-gray-600">Đang tải sản phẩm...</p>
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

      {/* Grid hiển thị sản phẩm */}
      {!isLoading && !error && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-300">
            {visibleVegetables.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <p className="text-gray-500 text-lg">
                  {searchTerm || selectedCategory
                    ? "Không tìm thấy sản phẩm nào"
                    : "Chưa có sản phẩm nào"}
                </p>
              </div>
            ) : (
              visibleVegetables.map((vegetable) => (
                <div
                  key={vegetable.id}
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-emerald-100 overflow-hidden"
                >
                  <div className="h-48 flex items-center justify-center bg-gradient-to-br from-lime-50 to-emerald-50 p-4">
                    <img
                      src={vegetable.image}
                      alt={vegetable.name}
                      className="max-h-full object-contain rounded-xl transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  <div className="p-5 text-center">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                      {vegetable.name}
                    </h3>
                    <p className="text-emerald-600 font-medium mb-4">
                      {vegetable.price}
                    </p>
                    <button
                      onClick={() => handleAddToCart(vegetable)}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      Thêm vào giỏ
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Phân trang */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-10 gap-3">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  currentPage === 1
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-emerald-500 hover:bg-emerald-600 text-white"
                } transition-all`}
              >
                ←
              </button>

              {getVisiblePages().map((page, index) => {
                if (page === "...") {
                  return (
                    <span
                      key={`ellipsis-${index}`}
                      className="px-2 text-gray-500"
                    >
                      ...
                    </span>
                  );
                }
                const pageNum = page as number;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-9 h-9 rounded-full font-medium ${
                      currentPage === pageNum
                        ? "bg-emerald-500 text-white shadow-md"
                        : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                    } transition-all`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  currentPage === totalPages
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-emerald-500 hover:bg-emerald-600 text-white"
                } transition-all`}
              >
                →
              </button>
            </div>
          )}
        </>
      )}

      {/* Popup */}
      <OrderPopup
        isOpen={isOrderPopupOpen}
        onClose={() => setIsOrderPopupOpen(false)}
        onConfirm={handleOrderConfirm}
        preAddedItems={preAddedItems}
        onUpdateCart={setPreAddedItems}
        availableProducts={vegetables}
      />
    </div>
  );
};

export default Sales;
