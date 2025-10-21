import React from "react";
import "./Sales.css";

// Import vegetable images
import carrotImg from "../assets/carrot.svg";
import tomatoImg from "../assets/tomato.svg";
import lettuceImg from "../assets/lettuce.svg";
import broccoliImg from "../assets/broccoli.svg";
import onionImg from "../assets/onion.svg";
import pepperImg from "../assets/pepper.svg";
import cucumberImg from "../assets/cucumber.svg";
import spinachImg from "../assets/spinach.svg";
import cabbageImg from "../assets/cabbage.svg";
import eggplantImg from "../assets/eggplant.svg";

interface Vegetable {
  id: number;
  name: string;
  image: string;
  price: string;
}

const Sales: React.FC = () => {
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

  return (
    <div className="sales-container">
      <div className="sales-header">
        <h1 className="sales-title">Bán hàng - Sản phẩm</h1>
        <p className="sales-subtitle">Chọn sản phẩm để bán</p>
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
              <button className="add-to-cart-btn">Thêm vào giỏ</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sales;
