import React, { useState } from "react";
import "./OrderPopup.css";

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
}

const OrderPopup: React.FC<OrderPopupProps> = ({ isOpen, onClose, onConfirm, preAddedItems = [] }) => {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  // Initialize order items with pre-added items when popup opens
  React.useEffect(() => {
    if (isOpen && preAddedItems.length > 0) {
      setOrderItems(preAddedItems);
    }
  }, [isOpen, preAddedItems]);

  const availableProducts = [
    { id: "1", name: "Cà rốt", price: 25000 },
    { id: "2", name: "Cà chua", price: 30000 },
    { id: "3", name: "Rau xà lách", price: 20000 },
    { id: "4", name: "Bông cải xanh", price: 35000 },
    { id: "5", name: "Hành tây", price: 28000 },
    { id: "6", name: "Ớt chuông", price: 40000 },
    { id: "7", name: "Dưa chuột", price: 22000 },
    { id: "8", name: "Rau chân vịt", price: 18000 },
    { id: "9", name: "Bắp cải", price: 15000 },
    { id: "10", name: "Cà tím", price: 32000 },
  ];

  const addItem = (product: { id: string; name: string; price: number }) => {
    const existingItem = orderItems.find(item => item.id === product.id);
    
    if (existingItem) {
      setOrderItems(items =>
        items.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
            : item
        )
      );
    } else {
      setOrderItems(items => [
        ...items,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          total: product.price
        }
      ]);
    }
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setOrderItems(items => items.filter(item => item.id !== id));
    } else {
      setOrderItems(items =>
        items.map(item =>
          item.id === id
            ? { ...item, quantity, total: quantity * item.price }
            : item
        )
      );
    }
  };

  const removeItem = (id: string) => {
    setOrderItems(items => items.filter(item => item.id !== id));
  };

  const getTotalAmount = () => {
    return orderItems.reduce((sum, item) => sum + item.total, 0);
  };

  const handleConfirm = () => {
    if (!customerName.trim() || !customerPhone.trim() || orderItems.length === 0) {
      alert("Vui lòng điền đầy đủ thông tin khách hàng và chọn ít nhất một sản phẩm");
      return;
    }

    onConfirm({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      items: orderItems,
      totalAmount: getTotalAmount()
    });

    // Reset form
    setCustomerName("");
    setCustomerPhone("");
    setOrderItems([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="order-popup-overlay">
      <div className="order-popup">
        <div className="order-popup-header">
          <h2>Tạo đơn hàng mới</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="order-popup-content">
          <div className="customer-info">
            <h3>Thông tin khách hàng</h3>
            <div className="form-group">
              <label>Tên khách hàng:</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nhập tên khách hàng"
              />
            </div>
            <div className="form-group">
              <label>Số điện thoại:</label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Nhập số điện thoại"
              />
            </div>
          </div>

          <div className="products-section">
            <h3>Chọn sản phẩm</h3>
            <div className="products-grid">
              {availableProducts.map((product) => (
                <div key={product.id} className="product-item">
                  <span className="product-name">{product.name}</span>
                  <span className="product-price">{product.price.toLocaleString()}đ</span>
                  <button 
                    className="add-product-btn"
                    onClick={() => addItem(product)}
                  >
                    Thêm
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="order-items">
            <h3>Đơn hàng</h3>
            {orderItems.length === 0 ? (
              <p className="empty-cart">Chưa có sản phẩm nào trong đơn hàng</p>
            ) : (
              <div className="items-list">
                {orderItems.map((item) => (
                  <div key={item.id} className="order-item">
                    <div className="item-info">
                      <span className="item-name">{item.name}</span>
                      <span className="item-price">{item.price.toLocaleString()}đ</span>
                    </div>
                    <div className="item-controls">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="quantity-btn"
                      >
                        -
                      </button>
                      <span className="quantity">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="quantity-btn"
                      >
                        +
                      </button>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="remove-btn"
                      >
                        Xóa
                      </button>
                    </div>
                    <div className="item-total">
                      {item.total.toLocaleString()}đ
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="order-total">
            <h3>Tổng cộng: {getTotalAmount().toLocaleString()}đ</h3>
          </div>
        </div>

        <div className="order-popup-footer">
          <button className="cancel-btn" onClick={onClose}>
            Hủy
          </button>
          <button className="confirm-btn" onClick={handleConfirm}>
            Tạo đơn hàng
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderPopup;
