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
import "./App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ username: string; role: string } | null>(
    null
  );
  const [activePage, setActivePage] = useState("Home");

  const handleLogin = (username: string, _password: string) => {
    // Determine user role based on username
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

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      <Sidebar
        activePage={activePage}
        onPageChange={handlePageChange}
        user={user}
        onLogout={handleLogout}
      />
      <main className="main-content">{renderPageContent()}</main>
    </div>
  );
}

export default App;
