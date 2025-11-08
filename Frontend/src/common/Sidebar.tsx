import React from "react";

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
    if (onPageChange) onPageChange(itemId);
  };

  return (
    <aside className="fixed left-0 top-0 z-50 h-screen w-56 bg-gradient-to-br from-green-100 via-emerald-200 to-lime-100 shadow-md flex flex-col transition-all duration-300">
      {/* Header */}
      <div className="p-5 border-b border-emerald-200 text-center">
        <h2 className="text-2xl font-lobster text-emerald-700 drop-shadow-sm">
          FreshShop'UTH
        </h2>

        {user && (
          <div className="flex items-center gap-3 mt-4 bg-white/40 p-3 rounded-xl shadow-sm">
            <div className="w-10 h-10 rounded-full bg-emerald-400 flex items-center justify-center text-white font-semibold shadow-md">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="text-left">
              <div className="text-emerald-800 font-semibold text-sm">
                {user.username}
              </div>
              <div className="text-xs text-emerald-600">
                {user.role === "admin" ? "Quản trị viên" : "Người dùng"}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1 mt-4">
        <ul>
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => handleItemClick(item.id)}
                className={`w-full text-left px-5 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${activePage === item.id
                  ? "bg-emerald-400/70 text-white shadow-inner border-l-4 border-emerald-700"
                  : "text-emerald-800 hover:bg-emerald-100 hover:text-emerald-900"
                  }`}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      {user && onLogout && (
        <div className="p-5 border-t border-emerald-200">
          <button
            onClick={onLogout}
            className="w-full py-2.5 text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg shadow-md transition-all duration-200"
          >
            Đăng xuất
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
