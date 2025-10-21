import React from "react";
import "./Home.css";

const Home: React.FC = () => {
  return (
    <div className="home-container">
      <div className="home-header">
        <h1 className="home-title">Dashboard FreshShop</h1>
        <p className="home-subtitle">Tổng quan hệ thống quản lý cửa hàng</p>
      </div>
      
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-icon">💰</div>
          <h3>Doanh thu hôm nay</h3>
          <p className="card-value">2,450,000đ</p>
        </div>
        
        <div className="dashboard-card">
          <div className="card-icon">📦</div>
          <h3>Đơn hàng mới</h3>
          <p className="card-value">15 đơn</p>
        </div>
        
        <div className="dashboard-card">
          <div className="card-icon">👥</div>
          <h3>Khách hàng</h3>
          <p className="card-value">128 người</p>
        </div>
        
        <div className="dashboard-card">
          <div className="card-icon">📊</div>
          <h3>Tồn kho</h3>
          <p className="card-value">45 sản phẩm</p>
        </div>
      </div>
      
      <div className="recent-orders">
        <h2>Đơn hàng gần đây</h2>
        <div className="orders-list">
          <div className="order-item">
            <span className="order-id">#001</span>
            <span className="order-customer">Nguyễn Văn A</span>
            <span className="order-amount">150,000đ</span>
            <span className="order-status completed">Hoàn thành</span>
          </div>
          <div className="order-item">
            <span className="order-id">#002</span>
            <span className="order-customer">Trần Thị B</span>
            <span className="order-amount">85,000đ</span>
            <span className="order-status pending">Đang xử lý</span>
          </div>
          <div className="order-item">
            <span className="order-id">#003</span>
            <span className="order-customer">Lê Văn C</span>
            <span className="order-amount">200,000đ</span>
            <span className="order-status completed">Hoàn thành</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
