import React, { useState, useEffect } from "react";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
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
  onUpdateCart?: (updatedItems: OrderItem[]) => void; // 👈 thêm props mới
}

const OrderPopup: React.FC<OrderPopupProps> = ({
  isOpen,
  onClose,
  onConfirm,
  preAddedItems = [],
  onUpdateCart,
}) => {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  // Khi mở popup, nạp giỏ hàng hiện tại
  useEffect(() => {
    if (isOpen) {
      setOrderItems(preAddedItems);
    }
  }, [isOpen, preAddedItems]);

  // Danh sách sản phẩm có sẵn
  const availableProducts = [
    { id: "1", name: "Cà rốt", price: 29000 },
    { id: "2", name: "Cà chua", price: 45000 },
    { id: "3", name: "Rau xà lách", price: 20000 },
    { id: "4", name: "Bông cải xanh", price: 35000 },
    { id: "5", name: "Hành tây", price: 35000 },
    { id: "6", name: "Ớt chuông", price: 70000 },
    { id: "7", name: "Dưa chuột", price: 21000 },
    { id: "8", name: "Rau chân vịt", price: 18000 },
  ];

  // Thêm sản phẩm
  const addItem = (product: { id: string; name: string; price: number }) => {
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
              price: product.price,
              quantity: 1,
              total: product.price,
            },
          ];
      onUpdateCart?.(updated); // 👈 đồng bộ về Sales
      return updated;
    });
  };

  // Cập nhật số lượng
  const updateQuantity = (id: string, quantity: number) => {
    setOrderItems((items) => {
      let updated;
      if (quantity <= 0) {
        updated = items.filter((i) => i.id !== id);
      } else {
        updated = items.map((i) =>
          i.id === id ? { ...i, quantity, total: quantity * i.price } : i
        );
      }
      onUpdateCart?.(updated);
      return updated;
    });
  };

  // Xóa sản phẩm
  const removeItem = (id: string) => {
    setOrderItems((items) => {
      const updated = items.filter((i) => i.id !== id);
      onUpdateCart?.(updated); // 👈 báo về Sales để xóa thật
      return updated;
    });
  };

  // Tổng tiền
  const getTotalAmount = () =>
    orderItems.reduce((sum, i) => sum + i.total, 0);

  // Xác nhận đơn hàng
  const handleConfirm = () => {
    if (!customerName.trim() || !customerPhone.trim() || orderItems.length === 0) {
      alert("Vui lòng điền đầy đủ thông tin và chọn sản phẩm!");
      return;
    }

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
    onUpdateCart?.([]); // 👈 làm trống luôn bên Sales
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-end items-center animate-fadeIn p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl h-[90vh] flex flex-col border-2 border-emerald-100 animate-slideIn">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 bg-emerald-50 border-b border-emerald-100">
          <h2 className="text-xl font-bold text-emerald-700">
            Tạo đơn hàng mới
          </h2>
          <button
            onClick={onClose}
            className="text-2xl text-emerald-600 hover:bg-emerald-100 px-2 rounded transition"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
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
                className="w-full border border-emerald-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400"
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
                className="w-full border border-emerald-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
          </div>

          {/* Chọn sản phẩm */}
          <div className="mb-6">
            <h3 className="text-emerald-700 font-semibold mb-4">
              Chọn sản phẩm
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {availableProducts.map((product) => (
                <div
                  key={product.id}
                  className="border border-emerald-100 bg-emerald-50 rounded-xl p-3 text-center hover:bg-emerald-100 transition"
                >
                  <p className="font-semibold text-gray-800">{product.name}</p>
                  <p className="text-emerald-600 text-sm mb-2">
                    {product.price.toLocaleString()}đ
                  </p>
                  <button
                    onClick={() => addItem(product)}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-sm py-1.5 rounded-lg transition"
                  >
                    Thêm
                  </button>
                </div>
              ))}
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

        {/* Footer */}
        <div className="flex justify-end gap-3 p-5 bg-emerald-50 border-t border-emerald-100">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg"
          >
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg shadow-sm"
          >
            Tạo đơn hàng
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderPopup;
