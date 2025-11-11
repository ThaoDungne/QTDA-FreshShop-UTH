import React, { useState } from "react";
import OrderPopup from "../components/OrderPopup";

// Import vegetable images
import carotImg from "../assets/carot.jpg";
import cachuaImg from "../assets/cachua.jpg";
import rauxalachImg from "../assets/rauxalach.jpg";
import bongcaixanhImg from "../assets/bongcaixanh.jpg";
import hanhtayImg from "../assets/hanhtay.jpg";
import otchuongImg from "../assets/otchuong.jpg";
import dualeoImg from "../assets/dualeo.jpg";
import rauchanvitImg from "../assets/rauchanvit.jpg";
import bapcaiImg from "../assets/bapcai.jpg";
import catimImg from "../assets/catim.jpg";
import khoaitayImg from "../assets/khoaitay.jpg";
import luuImg from "../assets/luu.jpg";
import camImg from "../assets/cam.jpg";
import duahauImg from "../assets/duahau.jpg";
import chuoiImg from "../assets/chuoi.jpg";
import dualuoiImg from "../assets/dualuoi.jpg";
import bidoImg from "../assets/bido.jpg";
import mongtoiImg from "../assets/mongtoi.jpg";
import dautayImg from "../assets/dautay.jpg";
import bapImg from "../assets/bap.jpg";
import raumuongImg from "../assets/raumuong.jpg";
import susuImg from "../assets/susu.jpg";
import oiImg from "../assets/oi.jpg";
import nhoImg from "../assets/nho.jpg";

interface Vegetable {
  id: number;
  name: string;
  image: string;
  price: string;
}

const Sales: React.FC = () => {
  const [isOrderPopupOpen, setIsOrderPopupOpen] = useState(false);
  const [preAddedItems, setPreAddedItems] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(""); //  thêm state tìm kiếm

  const vegetables: Vegetable[] = [
    { id: 1, name: "Cà rốt", image: carotImg, price: "29,000đ/kg" },
    { id: 2, name: "Cà chua", image: cachuaImg, price: "45,000đ/kg" },
    { id: 3, name: "Rau xà lách", image: rauxalachImg, price: "20,000đ/kg" },
    { id: 4, name: "Bông cải xanh", image: bongcaixanhImg, price: "35,000đ/kg" },
    { id: 5, name: "Hành tây", image: hanhtayImg, price: "35,000đ/kg" },
    { id: 6, name: "Ớt chuông", image: otchuongImg, price: "70,000đ/kg" },
    { id: 7, name: "Dưa chuột", image: dualeoImg, price: "21,000đ/kg" },
    { id: 8, name: "Rau chân vịt", image: rauchanvitImg, price: "18,000đ/bó" },
    { id: 9, name: "Bắp cải", image: bapcaiImg, price: "20,000đ/kg" },
    { id: 10, name: "Cà tím", image: catimImg, price: "26,000đ/kg" },
    { id: 11, name: "Khoai tây", image: khoaitayImg, price: "30,000đ/kg" },
    { id: 12, name: "Lựu", image: luuImg, price: "65,000đ/kg" },
    { id: 13, name: "Cam", image: camImg, price: "15,000đ/kg" },
    { id: 14, name: "Dưa hấu", image: duahauImg, price: "20,000đ/kg" },
    { id: 15, name: "Chuối", image: chuoiImg, price: "27,000đ/kg" },
    { id: 16, name: "Dưa lưới", image: dualuoiImg, price: "40,000đ/kg" },
    { id: 17, name: "Bí Đỏ", image: bidoImg, price: "18,000đ/kg" },
    { id: 18, name: "Mồng tơi", image: mongtoiImg, price: "25,000đ/kg" },
    { id: 19, name: "Dâu tây", image: dautayImg, price: "90,000đ/kg" },
    { id: 20, name: "Bắp", image: bapImg, price: "24,000đ/kg" },
    { id: 21, name: "Rau muống", image: raumuongImg, price: "23,000đ/kg" },
    { id: 22, name: "Su su", image: susuImg, price: "27,000đ/kg" },
    { id: 23, name: "Ổi", image: oiImg, price: "20,000đ/kg" },
    { id: 24, name: "Nho", image: nhoImg, price: "120,000đ/kg" },
  ];

  // Lọc theo tên tìm kiếm
  const filteredVegetables = vegetables.filter((v) =>
    v.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredVegetables.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleVegetables = filteredVegetables.slice(startIndex, startIndex + itemsPerPage);

  const handleAddToCart = (vegetable: Vegetable) => {
    const priceStr = vegetable.price.replace(/[^\d]/g, "");
    const price = parseInt(priceStr);

    const newItem = {
      id: vegetable.id.toString(),
      name: vegetable.name,
      price: price,
      quantity: 1,
      total: price,
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
    items: any[];
    totalAmount: number;
  }) => {
    alert(
      `Đơn hàng đã được tạo!\nKhách hàng: ${order.customerName}\nTổng tiền: ${order.totalAmount.toLocaleString()}đ`
    );
    setPreAddedItems([]);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="px-6 py-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-emerald-600 mb-2 font-logo">
          Bán hàng - Sản phẩm
        </h1>
        <p className="text-gray-600 text-lg">
          Chọn sản phẩm để thêm vào đơn hàng
        </p>
      </div>

      {/* Thanh tìm kiếm */}
      <div className="flex justify-center mb-10">
        <input
          type="text"
          spellCheck={false}
          placeholder="🔍 Tìm kiếm rau củ quả..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // reset về trang đầu khi tìm kiếm
          }}
          className="w-full sm:w-1/2 border border-emerald-300 rounded-xl px-5 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-sm transition-all duration-300"
        />
      </div>

      {/* Grid hiển thị sản phẩm */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 transition-all duration-300">
        {visibleVegetables.map((vegetable) => (
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
        ))}
      </div>

      {/* Phân trang */}
      <div className="flex justify-center items-center mt-10 gap-3">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-lg font-semibold ${currentPage === 1
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : "bg-emerald-500 hover:bg-emerald-600 text-white"
            } transition-all`}
        >
          ← Trước
        </button>

        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => handlePageChange(i + 1)}
            className={`w-9 h-9 rounded-full font-medium ${currentPage === i + 1
              ? "bg-emerald-500 text-white shadow-md"
              : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
              } transition-all`}
          >
            {i + 1}
          </button>
        ))}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded-lg font-semibold ${currentPage === totalPages
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : "bg-emerald-500 hover:bg-emerald-600 text-white"
            } transition-all`}
        >
          Sau →
        </button>
      </div>

      {/* Popup */}
      <OrderPopup
        isOpen={isOrderPopupOpen}
        onClose={() => setIsOrderPopupOpen(false)}
        onConfirm={handleOrderConfirm}
        preAddedItems={preAddedItems}
        onUpdateCart={setPreAddedItems}
      />
    </div>
  );
};

export default Sales;
