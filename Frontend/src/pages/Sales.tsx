import React, { useState } from "react";
import OrderPopup from "../components/OrderPopup";
import "./Sales.css";

// Import vegetable images
import carrotImg from "../assets/carrot.jpg";
import tomatoImg from "../assets/tomato.jpg";
import lettuceImg from "../assets/lettuce.jpg";
import broccoliImg from "../assets/broccoli.jpg";
import onionImg from "../assets/onion.jpg";
import pepperImg from "../assets/pepper.jpg";
import cucumberImg from "../assets/cucumber.jpg";
import spinachImg from "../assets/spinach.jpg";
import cabbageImg from "../assets/cabbage.jpg";
import eggplantImg from "../assets/eggplant.jpg";

interface Vegetable {
  id: number;
  name: string;
  image: string;
  price: string;
}

const Sales: React.FC = () => {
  const [isOrderPopupOpen, setIsOrderPopupOpen] = useState(false);
  const [preAddedItems, setPreAddedItems] = useState<any[]>([]);

  const vegetables: Vegetable[] = [
    { id: 1, name: "Cà rốt", image: carrotImg, price: "25,000đ/kg" },
    { id: 2, name: "Cà chua", image: tomatoImg, price: "30,000đ/kg" },
    { id: 3, name: "Rau xà lách", image: lettuceImg, price: "20,000đ/bó" },
    { id: 4, name: "Bông cải xanh", image: broccoliImg, price: "35,000đ/kg" },
    { id: 5, name: "Hành tây", image: onionImg, price: "28,000đ/kg" },
    { id: 6, name: "Ớt chuông", image: pepperImg, price: "40,000đ/kg" },
    { id: 7, name: "Dưa chuột", image: cucumberImg, price: "22,000đ/kg" },
    { id: 8, name: "Rau chân vịt", image: spinachImg, price: "18,000đ/bó" },
    { id: 9, name: "Bắp cải", image: cabbageImg, price: "15,000đ/kg" },
    { id: 10, name: "Cà tím", image: eggplantImg, price: "32,000đ/kg" },
  ];

  const handleCreateOrder = () => {
    setIsOrderPopupOpen(true);
  };

  const handleAddToCart = (vegetable: Vegetable) => {
    // Extract price number from string (remove "đ/kg" or "đ/bó")
    const priceStr = vegetable.price.replace(/[^\d]/g, '');
    const price = parseInt(priceStr);
    
    const newItem = {
      id: vegetable.id.toString(),
      name: vegetable.name,
      price: price,
      quantity: 1,
      total: price
    };

    setPreAddedItems(prev => {
      const existingItem = prev.find(item => item.id === newItem.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === newItem.id
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
            : item
        );
      } else {
        return [...prev, newItem];
      }
    });

    // Open popup with slide animation
    setIsOrderPopupOpen(true);
  };

  const handleOrderConfirm = (order: {
    customerName: string;
    customerPhone: string;
    items: any[];
    totalAmount: number;
  }) => {
    // Here you would typically save the order to your backend
    console.log("New order created:", order);
    alert(
      `Đơn hàng đã được tạo thành công!\nKhách hàng: ${
        order.customerName
      }\nTổng tiền: ${order.totalAmount.toLocaleString()}đ`
    );
    
    // Clear pre-added items after order confirmation
    setPreAddedItems([]);
  };

  return (
    <div className="sales-container">
      <div className="sales-header">
        <h1 className="sales-title">Bán hàng - Sản phẩm</h1>
        <p className="sales-subtitle">Chọn sản phẩm để bán</p>
        <button className="create-order-btn" onClick={handleCreateOrder}>
          Tạo đơn hàng mới
        </button>
      </div>

      <div className="vegetables-grid">
        {vegetables.map((vegetable) => (
          <div key={vegetable.id} className="vegetable-card">
            <div className="vegetable-image-container">
              <img
                src={vegetable.image}
                alt={vegetable.name}
                className="vegetable-image"
              />
            </div>
            <div className="vegetable-info">
              <h3 className="vegetable-name">{vegetable.name}</h3>
              <p className="vegetable-price">{vegetable.price}</p>
              <button 
                className="add-to-cart-btn"
                onClick={() => handleAddToCart(vegetable)}
              >
                Thêm vào giỏ
              </button>
            </div>
          </div>
        ))}
      </div>

      <OrderPopup
        isOpen={isOrderPopupOpen}
        onClose={() => setIsOrderPopupOpen(false)}
        onConfirm={handleOrderConfirm}
        preAddedItems={preAddedItems}
      />
    </div>
  );
};

export default Sales;
