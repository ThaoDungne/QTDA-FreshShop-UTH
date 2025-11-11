import React, { useState, useEffect, useRef } from "react";
import { IoMdSearch } from "react-icons/io";
import { saleService } from "../services";
import { customerService } from "../services";
import { authService } from "../services";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

interface Product {
  id: string;
  name: string;
  image: string;
  price: string;
  priceNumber: number;
  unit: string;
  category: string;
}

interface OrderPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (order: {
    customerName: string;
    customerPhone: string;
    items: OrderItem[];
    totalAmount: number;
  }) => void;
  preAddedItems?: OrderItem[];
  onUpdateCart?: (updatedItems: OrderItem[]) => void;
  availableProducts?: Product[]; // Danh sách sản phẩm từ Sales page
}

const OrderPopup: React.FC<OrderPopupProps> = ({
  isOpen,
  onClose,
  onConfirm,
  preAddedItems = [],
  onUpdateCart,
  availableProducts = [],
}) => {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isInitialMount = useRef(true);

  // Khi mở popup, nạp giỏ hàng hiện tại
  useEffect(() => {
    if (isOpen) {
      isInitialMount.current = true;
      setOrderItems(preAddedItems);
    }
  }, [isOpen, preAddedItems]);

  // Đồng bộ orderItems với parent component (Sales) khi thay đổi
  // Nhưng không gọi khi mới mở popup (tránh vòng lặp)
  useEffect(() => {
    if (isOpen && onUpdateCart && !isInitialMount.current) {
      onUpdateCart(orderItems);
    }
    if (isInitialMount.current) {
      isInitialMount.current = false;
    }
  }, [orderItems, isOpen, onUpdateCart]); // Chỉ chạy khi orderItems thay đổi và popup đang mở

  // Lọc sản phẩm theo search term
  const filteredProducts = availableProducts.filter((product) =>
    product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(productSearchTerm.toLowerCase())
  );

  // Thêm sản phẩm
  const addItem = (product: Product) => {
    setOrderItems((items) => {
      const existing = items.find((i) => i.id === product.id);
      const updated =
        existing
          ? items.map((i) =>
            i.id === product.id
              ? {
                ...i,
                quantity: i.quantity + 1,
                total: (i.quantity + 1) * i.price,
              }
              : i
          )
          : [
            ...items,
            {
              id: product.id,
              name: product.name,
              price: product.priceNumber,
              quantity: 1,
              total: product.priceNumber,
            },
          ];
      return updated;
    });
  };

  // Cập nhật số lượng
  const updateQuantity = (id: string, quantity: number) => {
    setOrderItems((items) => {
      if (quantity <= 0) {
        return items.filter((i) => i.id !== id);
      } else {
        return items.map((i) =>
          i.id === id ? { ...i, quantity, total: quantity * i.price } : i
        );
      }
    });
  };

  // Xóa sản phẩm
  const removeItem = (id: string) => {
    setOrderItems((items) => items.filter((i) => i.id !== id));
  };

  // Tổng tiền
  const getTotalAmount = () =>
    orderItems.reduce((sum, i) => sum + i.total, 0);

  // Xác nhận đơn hàng
  const handleConfirm = async () => {
    if (!customerName.trim() || !customerPhone.trim() || orderItems.length === 0) {
      alert("Vui lòng điền đầy đủ thông tin và chọn sản phẩm!");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // 1. Lấy thông tin user hiện tại (cashierId)
      const currentUser = authService.getCurrentUser();
      if (!currentUser || !currentUser.id) {
        throw new Error("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
      }
      const cashierId = currentUser.id;

      // 2. Tìm hoặc tạo customer từ name và phone
      let customerId: string | undefined;
      try {
        // Tìm customer theo phone
        const customers = await customerService.search(customerPhone);
        const existingCustomer = customers.find(
          (c) => c.phone === customerPhone.trim()
        );

        if (existingCustomer) {
          customerId = existingCustomer._id;
        } else {
          // Tạo customer mới
          const newCustomer = await customerService.create({
            fullName: customerName.trim(),
            phone: customerPhone.trim(),
          });
          customerId = newCustomer._id;
        }
      } catch (err) {
        console.error("Error finding/creating customer:", err);
        // Nếu không tìm/tạo được customer, vẫn tiếp tục với customerId = undefined
      }

      // 3. Chuyển đổi items sang format API
      const invoiceItems = orderItems.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        unitPrice: item.price,
        discount: 0, // Có thể thêm discount sau
      }));

      // 4. Gọi API tạo đơn hàng
      const invoice = await saleService.createInvoice({
        cashierId,
        customerId,
        items: invoiceItems,
        paidAmount: getTotalAmount(),
        paymentMethod: "cash",
        note: `Khách hàng: ${customerName} - ${customerPhone}`,
      });

      // 5. Thành công - gọi callback và reset
      onConfirm({
        customerName,
        customerPhone,
        items: orderItems,
        totalAmount: getTotalAmount(),
      });

      // Reset popup & giỏ hàng
      setCustomerName("");
      setCustomerPhone("");
      setOrderItems([]);
      onUpdateCart?.([]);
      onClose();

      // Hiển thị thông báo thành công
      alert(`Đơn hàng đã được tạo thành công!\nMã hóa đơn: ${invoice.code}`);
    } catch (err: any) {
      console.error("Error creating invoice:", err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể tạo đơn hàng. Vui lòng thử lại.";
      setError(errorMessage);
      alert(`Lỗi: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xử lý đóng popup (Hủy hoặc click nút X)
  const handleClose = () => {
    // Xóa tất cả sản phẩm trong giỏ hàng khi hủy
    setOrderItems([]);
    onUpdateCart?.([]); // Xóa giỏ hàng trong Sales
    setCustomerName("");
    setCustomerPhone("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed left-56 top-0 right-0 bottom-0 z-40 bg-white flex flex-col h-screen">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 bg-emerald-50 border-b border-emerald-100 flex-shrink-0">
        <h2 className="text-xl font-bold text-emerald-700">
          Tạo đơn hàng mới
        </h2>
        <button
          onClick={handleClose}
          className="text-2xl text-emerald-600 hover:bg-emerald-100 px-2 rounded transition"
        >
          ×
        </button>
      </div>

      {/* Content - Layout 2 cột - có thể scroll */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Cột trái: Danh sách sản phẩm */}
        <div className="w-2/3 border-r border-emerald-100 overflow-y-auto p-6">
          <h3 className="text-emerald-700 font-semibold mb-4 text-lg">
            Chọn sản phẩm
          </h3>

          {/* Search bar cho sản phẩm */}
          <div className="mb-4">
            <div className="relative">
              <IoMdSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
              <input
                type="text"
                spellCheck={false}
                placeholder="Tìm kiếm sản phẩm..."
                value={productSearchTerm}
                onChange={(e) => setProductSearchTerm(e.target.value)}
                className="w-full border border-emerald-300 rounded-xl pl-12 pr-5 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-sm transition-all duration-300"
              />
            </div>
          </div>

          {/* Grid sản phẩm - 3 cột */}
          <div className="grid grid-cols-3 gap-4">
            {filteredProducts.length === 0 ? (
              <div className="col-span-3 text-center py-10">
                <p className="text-gray-500">Không tìm thấy sản phẩm nào</p>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-emerald-100 overflow-hidden cursor-pointer"
                  onClick={() => addItem(product)}
                >
                  <div className="h-40 flex items-center justify-center bg-gradient-to-br from-lime-50 to-emerald-50 p-4">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="max-h-full object-contain rounded-xl"
                    />
                  </div>
                  <div className="p-4 text-center">
                    <h4 className="text-sm font-semibold text-gray-800 mb-1 line-clamp-2">
                      {product.name}
                    </h4>
                    <p className="text-emerald-600 font-medium text-sm mb-3">
                      {product.price}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addItem(product);
                      }}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium py-2 rounded-lg transition"
                    >
                      Thêm
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Cột phải: Form đơn hàng */}
        <div className="w-1/3 overflow-y-auto p-6 bg-emerald-50">
          {/* Thông tin khách hàng */}
          <div className="mb-6">
            <h3 className="text-emerald-700 font-semibold mb-4">
              Thông tin khách hàng
            </h3>
            <div className="mb-4">
              <label className="block font-medium text-gray-700 mb-1">
                Tên khách hàng
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nhập tên khách hàng"
                className="w-full border border-emerald-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Số điện thoại
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Nhập số điện thoại"
                className="w-full border border-emerald-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
              />
            </div>
          </div>

          {/* Giỏ hàng */}
          <div>
            <h3 className="text-emerald-700 font-semibold mb-4">
              Sản phẩm trong đơn
            </h3>
            {orderItems.length === 0 ? (
              <p className="text-gray-500 italic text-center py-4">
                Chưa có sản phẩm nào trong đơn hàng
              </p>
            ) : (
              <div className="flex flex-col divide-y divide-emerald-100 rounded-xl overflow-hidden">
                {orderItems.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-[1fr_auto_auto] items-center bg-emerald-50 p-3 gap-4"
                  >
                    {/* Cột 1: Tên + giá */}
                    <div>
                      <span className="block font-semibold text-gray-800">
                        {item.name}
                      </span>
                      <span className="block text-sm text-emerald-600">
                        {item.price.toLocaleString()}đ
                      </span>
                    </div>

                    {/* Cột 2: Nút số lượng */}
                    <div className="flex items-center gap-2 justify-center">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 border border-emerald-200 rounded text-emerald-700 hover:bg-emerald-100"
                      >
                        −
                      </button>
                      <span className="font-medium w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 border border-emerald-200 rounded text-emerald-700 hover:bg-emerald-100"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-md text-xs"
                      >
                        Xóa
                      </button>
                    </div>

                    {/* Cột 3: Thành tiền */}
                    <div className="text-emerald-700 font-semibold text-right min-w-[90px]">
                      {item.total.toLocaleString()}đ
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tổng cộng */}
          <div className="mt-6 bg-emerald-100 rounded-lg py-3 text-center">
            <h3 className="text-lg font-bold text-emerald-700">
              Tổng cộng: {getTotalAmount().toLocaleString()}đ
            </h3>
          </div>
        </div>
      </div>

      {/* Footer - Nằm dưới cùng, không scroll */}
      <div className="flex justify-end gap-3 p-5 bg-emerald-50 border-t border-emerald-100 flex-shrink-0">
        {error && (
          <div className="flex-1 text-red-600 text-sm mr-4">
            {error}
          </div>
        )}
        <button
          onClick={handleClose}
          disabled={isSubmitting}
          className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Hủy
        </button>
        <button
          onClick={handleConfirm}
          disabled={isSubmitting}
          className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <span className="animate-spin">⏳</span>
              <span>Đang tạo...</span>
            </>
          ) : (
            "Tạo đơn hàng"
          )}
        </button>
      </div>
    </div>
  );
};

export default OrderPopup;
