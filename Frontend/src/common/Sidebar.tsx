import React from "react";
import "./Sidebar.css";

interface SidebarProps {
  activePage?: string;
  onPageChange?: (page: string) => void;
  user?: { username: string; role: string } | null;
  onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activePage = "Home",
  onPageChange,
  user,
  onLogout,
}) => {
  const menuItems = [
    { id: "Home", label: "Trang chủ" },
    { id: "Sales", label: "Bán hàng" },
    { id: "Storage", label: "Đơn hàng" },
    { id: "Customers", label: "Khách hàng" },
    { id: "Suppliers", label: "Nhà cung cấp" },
    { id: "Inventory", label: "Tồn kho" },
    { id: "Payment", label: "Thanh toán" },
  ];

  const handleItemClick = (itemId: string) => {
    if (onPageChange) {
      onPageChange(itemId);
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">FreshShop</h2>
        {user && (
          <div className="user-info">
            <div className="user-avatar">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <div className="user-name">{user.username}</div>
              <div className="user-role">
                {user.role === "admin" ? "Quản trị viên" : "Người dùng"}
              </div>
            </div>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          {menuItems.map((item) => (
            <li key={item.id} className="sidebar-menu-item">
              <button
                className={`sidebar-menu-button ${
                  activePage === item.id ? "active" : ""
                }`}
                onClick={() => handleItemClick(item.id)}
              >
                <span className="sidebar-menu-label">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {user && onLogout && (
        <div className="sidebar-footer">
          <button className="logout-button" onClick={onLogout}>
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
