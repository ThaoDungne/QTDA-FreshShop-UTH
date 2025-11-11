import React, { useState, useEffect } from "react";
import { TbUsersGroup } from "react-icons/tb";
import { LuShoppingBasket } from "react-icons/lu";
import { MdOutlineInsertChartOutlined } from "react-icons/md";
import { GiFruitBowl } from "react-icons/gi";
import { HiShoppingCart } from "react-icons/hi";
import { saleService, type Invoice } from "../services";
import { customerService } from "../services";
import { productService } from "../services";
import { reportService } from "../services";

const Home: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [todayOrders, setTodayOrders] = useState(0);
  const [yesterdayRevenue, setYesterdayRevenue] = useState(0);
  const [yesterdayOrders, setYesterdayOrders] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [recentOrders, setRecentOrders] = useState<Invoice[]>([]);
  const [revenueData, setRevenueData] = useState<
    Array<{ date: string; revenue: number; orders: number }>
  >([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Lấy ngày hôm nay (start và end của ngày)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStart = today.toISOString().split("T")[0];
        const todayEnd = new Date(today);
        todayEnd.setHours(23, 59, 59, 999);
        const todayEndStr = todayEnd.toISOString().split("T")[0];

        // Lấy ngày hôm qua
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStart = yesterday.toISOString().split("T")[0];
        const yesterdayEnd = new Date(yesterday);
        yesterdayEnd.setHours(23, 59, 59, 999);
        const yesterdayEndStr = yesterdayEnd.toISOString().split("T")[0];

        // Fetch tất cả dữ liệu song song
        const [
          todayRevenueSummary,
          yesterdayRevenueSummary,
          weekRevenueData,
          invoices,
          customers,
          products,
        ] = await Promise.all([
          // Doanh thu hôm nay từ API summary
          reportService
            .getRevenueSummary(todayStart, todayEndStr)
            .catch(() => ({
              totalRevenue: 0,
              totalInvoices: 0,
              period: "",
            })),
          // Doanh thu hôm qua từ API summary
          reportService
            .getRevenueSummary(yesterdayStart, yesterdayEndStr)
            .catch(() => ({
              totalRevenue: 0,
              totalInvoices: 0,
              period: "",
            })),
          // Dữ liệu doanh thu 7 ngày gần đây
          (async () => {
            try {
              const weekAgo = new Date(today);
              weekAgo.setDate(weekAgo.getDate() - 7);
              const weekAgoStr = weekAgo.toISOString().split("T")[0];
              return await reportService.getRevenueReport(
                weekAgoStr,
                todayEndStr,
                "day"
              );
            } catch {
              return [];
            }
          })(),
          // Đơn hàng hôm nay và gần đây
          saleService.getInvoices().catch(() => []),
          // Tổng số khách hàng
          customerService.getAll().catch(() => []),
          // Tổng số sản phẩm
          productService.getAll().catch(() => []),
        ]);

        // Lấy doanh thu hôm nay từ API summary
        const todayRev = todayRevenueSummary.totalRevenue || 0;
        const todayOrd = todayRevenueSummary.totalInvoices || 0;

        // Lấy doanh thu hôm qua từ API summary
        const yesterdayRev = yesterdayRevenueSummary.totalRevenue || 0;
        const yesterdayOrd = yesterdayRevenueSummary.totalInvoices || 0;

        // Đếm đơn hàng đang chờ xử lý (giống logic trong Orders.tsx)
        // Đơn hàng có status không phải "completed" và không phải "void" được coi là pending
        const pending = invoices.filter((inv: Invoice) => {
          const status = inv.status;
          return status !== "completed" && status !== "void";
        }).length;

        // Chuyển đổi dữ liệu doanh thu 7 ngày
        const revenueDataFormatted = weekRevenueData.map((item) => ({
          date:
            typeof item.date === "string" ? item.date : item.date.toISOString(),
          revenue: item.totalRevenue || 0,
          orders: item.totalInvoices || 0,
        }));
        setRevenueData(revenueDataFormatted);

        setTodayRevenue(todayRev);
        setTodayOrders(todayOrd);
        setYesterdayRevenue(yesterdayRev);
        setYesterdayOrders(yesterdayOrd);
        setTotalCustomers(customers.length);
        setTotalProducts(products.length);
        setPendingOrders(pending);

        // Lấy 5 đơn hàng gần đây nhất
        const sortedInvoices = [...invoices].sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        setRecentOrders(sortedInvoices.slice(0, 5));
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Không thể tải dữ liệu dashboard";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getCustomerName = (invoice: Invoice): string => {
    if (!invoice.customer) return "Khách lẻ";
    if (
      typeof invoice.customer === "object" &&
      "fullName" in invoice.customer
    ) {
      return (invoice.customer as { fullName?: string }).fullName || "Khách lẻ";
    }
    return "Khách lẻ";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return {
          bg: "bg-emerald-100",
          text: "text-emerald-800",
          border: "border-emerald-300",
          label: "Hoàn thành",
        };
      case "void":
        return {
          bg: "bg-red-100",
          text: "text-red-800",
          border: "border-red-300",
          label: "Đã hủy",
        };
      default:
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-800",
          border: "border-yellow-300",
          label: "Đang xử lý",
        };
    }
  };

  const getRevenueChange = () => {
    if (yesterdayRevenue === 0) {
      if (todayRevenue > 0) return { percent: 100, isPositive: true };
      return { percent: 0, isPositive: false };
    }
    const change = ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100;
    return { percent: Math.abs(change), isPositive: change >= 0 };
  };

  if (isLoading) {
    return (
      <div className="px-6 py-10 max-w-6xl mx-auto font-body">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-6 py-10 max-w-6xl mx-auto font-body">
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold">Lỗi: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-10 max-w-6xl mx-auto font-body">
      {/* Header */}
      <div className="text-center mb-16 relative">
        <h1 className="text-5xl font-lobster text-emerald-600 mb-2 font-logo drop-shadow-sm">
          FreshShop'UTH
        </h1>
        {/* Cart icon với badge số đơn hàng */}
        {pendingOrders > 0 && (
          <div className="absolute top-0 right-0 flex items-center justify-center">
            <div className="relative">
              <HiShoppingCart className="text-3xl text-emerald-600" />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-md">
                {pendingOrders}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Dashboard summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Card Doanh thu */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-emerald-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex justify-center">
              <MdOutlineInsertChartOutlined className="text-4xl text-emerald-600" />
            </div>
            {(() => {
              const change = getRevenueChange();
              if (change.percent > 0) {
                return (
                  <div
                    className={`text-sm font-semibold mt-3 ${
                      change.isPositive ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {change.isPositive ? "↑" : "↓"} {change.percent.toFixed(1)}%
                  </div>
                );
              }
              return null;
            })()}
          </div>
          <h3 className="text-emerald-700 font-semibold mb-2 text-sm">
            Doanh thu
          </h3>
          <p className="text-2xl font-bold text-emerald-600 mb-2">
            {todayRevenue.toLocaleString("vi-VN")}đ
          </p>
          {yesterdayRevenue > 0 && (
            <p className="text-xs text-gray-500">
              Hôm qua: {yesterdayRevenue.toLocaleString("vi-VN")}đ
            </p>
          )}
        </div>

        {/* Card Đơn hàng */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-blue-200">
          <div className="mb-3 flex justify-center">
            <LuShoppingBasket className="text-4xl text-blue-600" />
          </div>
          {yesterdayOrders > 0 && (
            <div className="mb-3 flex justify-end">
              <div
                className={`text-sm font-semibold ${
                  todayOrders >= yesterdayOrders
                    ? "text-blue-600"
                    : "text-red-600"
                }`}
              >
                {todayOrders >= yesterdayOrders ? "↑" : "↓"}{" "}
                {Math.abs(
                  ((todayOrders - yesterdayOrders) / yesterdayOrders) * 100
                ).toFixed(0)}
                %
              </div>
            </div>
          )}
          <h3 className="text-blue-700 font-semibold mb-2 text-sm">Đơn hàng</h3>
          <p className="text-2xl font-bold text-blue-600 mb-2">
            {todayOrders.toString().padStart(2, "0")}
          </p>
          {yesterdayOrders > 0 && (
            <p className="text-xs text-gray-500">
              Hôm qua: {yesterdayOrders.toString().padStart(2, "0")}
            </p>
          )}
          {pendingOrders > 0 && (
            <p className="text-xs text-yellow-600 mt-1 font-medium">
              {pendingOrders.toString().padStart(2, "0")} đơn đang chờ xử lý
            </p>
          )}
        </div>

        {/* Card Khách hàng */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-purple-200">
          <div className="mb-3 flex justify-center">
            <TbUsersGroup className="text-4xl text-purple-600" />
          </div>
          <h3 className="text-purple-700 font-semibold mb-2 text-sm text-center">
            Tổng khách hàng
          </h3>
          <p className="text-2xl font-bold text-purple-600 text-center">
            {totalCustomers.toString().padStart(2, "0")}
          </p>
        </div>

        {/* Card Sản phẩm */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-orange-200">
          <div className="mb-3 flex justify-center">
            <GiFruitBowl className="text-4xl text-orange-600" />
          </div>
          <h3 className="text-orange-700 font-semibold mb-2 text-sm text-center">
            Tổng sản phẩm
          </h3>
          <p className="text-2xl font-bold text-orange-600 text-center">
            {totalProducts.toString().padStart(2, "0")}
          </p>
        </div>
      </div>

      {/* Revenue Chart - 7 ngày gần đây */}
      {revenueData.length > 0 && (
        <div className="bg-white rounded-2xl shadow-md p-8 border border-emerald-100 mb-8">
          <h2 className="text-xl font-semibold text-emerald-700 mb-6">
            Doanh thu 7 ngày gần đây
          </h2>
          <div className="space-y-4">
            {revenueData.slice(-7).map((item, index) => {
              const maxRevenue = Math.max(
                ...revenueData.map((d) => d.revenue || 0),
                1
              );
              const percentage =
                maxRevenue > 0 ? ((item.revenue || 0) / maxRevenue) * 100 : 0;
              let dateStr = "N/A";
              try {
                const date =
                  typeof item.date === "string"
                    ? new Date(item.date)
                    : item.date;
                if (date && !isNaN(date.getTime())) {
                  dateStr = date.toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                  });
                }
              } catch (e) {
                console.error("Error parsing date:", e);
              }

              return (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-20 text-sm text-gray-600 font-medium">
                    {dateStr}
                  </div>
                  <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-full rounded-full flex items-center justify-end pr-3 transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        minWidth: percentage > 0 ? "2%" : "0%",
                      }}
                    >
                      {percentage > 15 && (
                        <span className="text-white text-xs font-semibold">
                          {(item.revenue || 0).toLocaleString("vi-VN")}đ
                        </span>
                      )}
                    </div>
                    {percentage <= 15 && percentage > 0 && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 text-xs font-semibold">
                        {(item.revenue || 0).toLocaleString("vi-VN")}đ
                      </span>
                    )}
                  </div>
                  <div className="w-16 text-right text-sm font-semibold text-emerald-600">
                    {item.orders || 0} đơn
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent orders */}
      <div className="bg-white rounded-2xl shadow-md p-8 border border-emerald-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-emerald-700">
            Đơn hàng gần đây
          </h2>
          {recentOrders.length > 0 && (
            <button
              onClick={() => {
                // Navigate to Orders page - có thể dùng router nếu có
                window.location.hash = "#orders";
              }}
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Xem tất cả →
            </button>
          )}
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">Chưa có đơn hàng nào</p>
            <p className="text-sm mt-2">Đơn hàng mới sẽ hiển thị ở đây</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {recentOrders.map((order) => {
              const badge = getStatusBadge(order.status);
              return (
                <div
                  key={order._id}
                  className="grid grid-cols-5 gap-4 items-center bg-gradient-to-r from-emerald-50 to-white rounded-xl p-4 hover:from-emerald-100 hover:shadow-md transition-all duration-200 border border-emerald-100"
                >
                  <span className="font-semibold text-emerald-700 text-sm">
                    {order.code}
                  </span>
                  <span className="text-gray-800 text-sm truncate">
                    {getCustomerName(order)}
                  </span>
                  <span className="text-gray-600 text-xs">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "N/A"}
                  </span>
                  <span className="font-semibold text-emerald-600 text-sm">
                    {(
                      order.itemsSummary?.grandTotal ||
                      order.paidAmount ||
                      0
                    ).toLocaleString("vi-VN")}
                    đ
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${badge.bg} ${badge.text} ${badge.border} shadow-sm`}
                  >
                    {badge.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
