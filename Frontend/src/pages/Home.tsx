import React from "react";

const Home: React.FC = () => {
  return (
    <div className="px-6 py-10 max-w-6xl mx-auto font-body">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-lobster text-emerald-600 mb-2 font-logo drop-shadow-sm">
          FreshShop'UTH
        </h1>
        <p className="text-gray-600 text-lg">
          Tổng quan hệ thống quản lý cửa hàng rau củ quả
        </p>
      </div>

      {/* Dashboard summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white rounded-2xl p-6 text-center shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-emerald-100">
          <div className="text-4xl mb-3">💰</div>
          <h3 className="text-emerald-700 font-semibold mb-1">
            Doanh thu hôm nay
          </h3>
          <p className="text-2xl font-bold text-emerald-600">2,450,000đ</p>
        </div>

        <div className="bg-white rounded-2xl p-6 text-center shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-emerald-100">
          <div className="text-4xl mb-3">📦</div>
          <h3 className="text-emerald-700 font-semibold mb-1">Đơn hàng mới</h3>
          <p className="text-2xl font-bold text-emerald-600">15 đơn</p>
        </div>

        <div className="bg-white rounded-2xl p-6 text-center shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-emerald-100">
          <div className="text-4xl mb-3">👥</div>
          <h3 className="text-emerald-700 font-semibold mb-1">Khách hàng</h3>
          <p className="text-2xl font-bold text-emerald-600">128 người</p>
        </div>

        <div className="bg-white rounded-2xl p-6 text-center shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-emerald-100">
          <div className="text-4xl mb-3">📊</div>
          <h3 className="text-emerald-700 font-semibold mb-1">Tồn kho</h3>
          <p className="text-2xl font-bold text-emerald-600">45 sản phẩm</p>
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl shadow-md p-8 border border-emerald-100">
        <h2 className="text-xl font-semibold text-emerald-700 mb-6">
          Đơn hàng gần đây
        </h2>

        <div className="flex flex-col gap-4">
          {/* Order 1 */}
          <div className="grid grid-cols-4 gap-4 items-center bg-emerald-50 rounded-xl p-4 hover:bg-emerald-100 transition-all duration-200">
            <span className="font-semibold text-emerald-700">#001</span>
            <span className="text-gray-800">Nguyễn Văn A</span>
            <span className="font-semibold text-emerald-600">150,000đ</span>
            <span className="bg-emerald-200 text-emerald-800 border text-sm font-semibold px-3.5 py-1.5 rounded-full text-center shadow-sm">
              Hoàn thành
            </span>
          </div>

          {/* Order 2 */}
          <div className="grid grid-cols-4 gap-4 items-center bg-emerald-50 rounded-xl p-4 hover:bg-emerald-100 transition-all duration-200">
            <span className="font-semibold text-emerald-700">#002</span>
            <span className="text-gray-800">Trần Thị B</span>
            <span className="font-semibold text-emerald-600">85,000đ</span>
            <span className="bg-yellow-200 text-yellow-800 text-sm font-medium px-3.5 py-1.5 rounded-full text-center">
              Đang xử lý
            </span>
          </div>

          {/* Order 3 */}
          <div className="grid grid-cols-4 gap-4 items-center bg-emerald-50 rounded-xl p-4 hover:bg-emerald-100 transition-all duration-200">
            <span className="font-semibold text-emerald-700">#003</span>
            <span className="text-gray-800">Lê Văn C</span>
            <span className="font-semibold text-emerald-600">200,000đ</span>
            <span className="bg-emerald-200 text-emerald-800 border text-sm font-semibold px-3.5 py-1.5 rounded-full text-center shadow-sm">
              Hoàn thành
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
