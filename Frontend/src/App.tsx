import React, { useState } from "react";
import Sidebar from "./common/Sidebar";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Sales from "./pages/Sales";
import Orders from "./pages/Orders";
import Customers from "./pages/Customers";
import Suppliers from "./pages/Suppliers";
import Inventory from "./pages/Inventory";
import Payment from "./pages/Payment";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);
  const [activePage, setActivePage] = useState("Home");

  const handleLogin = (username: string, _password: string) => {
    const role = username === "admin" ? "admin" : "user";
    setUser({ username, role });
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setActivePage("Home");
  };

  const handlePageChange = (page: string) => {
    setActivePage(page);
  };

  const renderPageContent = () => {
    switch (activePage) {
      case "Home":
        return <Home />;
      case "Sales":
        return <Sales />;
      case "Storage":
        return <Orders />;
      case "Customers":
        return <Customers />;
      case "Suppliers":
        return <Suppliers />;
      case "Inventory":
        return <Inventory />;
      case "Payment":
        return <Payment />;
      default:
        return <Home />;
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex min-h-screen bg-[#f6fdf8]">
      {/* Sidebar bên trái */}
      <Sidebar
        activePage={activePage}
        onPageChange={handlePageChange}
        user={user}
        onLogout={handleLogout}
      />

      {/* Nội dung chính */}
      <main className="flex-1 ml-[220px] p-6 bg-[#f6fdf8]">
        <div className="bg-white rounded-lg shadow-md p-6 text-gray-800 text-center mt-4">
          {renderPageContent()}
        </div>
      </main>
    </div>
  );
}

export default App;
