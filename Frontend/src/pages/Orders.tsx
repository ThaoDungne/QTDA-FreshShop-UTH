import React, { useState, useEffect } from "react";
import { saleService, customerService, type Invoice } from "../services";
import { IoMdSearch } from "react-icons/io";
import { authService } from "../services";
import { LuShoppingBasket } from "react-icons/lu";
import { MdOutlineCheckCircle } from "react-icons/md";

interface Order {
  id: string;
  code: string;
  customer: string;
  customerId?: string;
  date: string;
  amount: number;
  status: string;
  items: string[];
  paymentMethod?: string;
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isVoiding, setIsVoiding] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Fetch orders từ API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const invoices = await saleService.getInvoices();

        // Convert invoices sang Order format
        const ordersData: Order[] = await Promise.all(
          invoices.map(async (invoice: Invoice) => {
            // Lấy tên khách hàng nếu có customerId
            let customerName = "Khách lẻ";
            if (
              invoice.customer &&
              typeof invoice.customer === "object" &&
              "fullName" in invoice.customer
            ) {
              customerName = (invoice.customer as any).fullName || "Khách lẻ";
            } else if (
              invoice.customer &&
              typeof invoice.customer === "string"
            ) {
              try {
                const customer = await customerService.getById(
                  invoice.customer
                );
                customerName = customer.fullName;
              } catch {
                customerName = "Khách lẻ";
              }
            }

            return {
              id: invoice._id,
              code: invoice.code,
              customer: customerName,
              customerId:
                typeof invoice.customer === "string"
                  ? invoice.customer
                  : undefined,
              date: invoice.createdAt
                ? new Date(invoice.createdAt).toLocaleDateString("vi-VN")
                : new Date().toLocaleDateString("vi-VN"),
              amount:
                invoice.itemsSummary?.grandTotal || invoice.paidAmount || 0,
              status:
                invoice.status === "void"
                  ? "cancelled"
                  : invoice.status === "completed"
                  ? "completed"
                  : "pending",
              items: [`${invoice.itemsSummary?.itemCount || 0} sản phẩm`],
              paymentMethod: invoice.paymentMethod,
            };
          })
        );

        setOrders(ordersData);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Không thể tải danh sách đơn hàng";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Lọc orders theo search term
  const filteredOrders = orders.filter(
    (order) =>
      order.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return {
          bg: "bg-emerald-100",
          text: "text-emerald-800",
          border: "border-emerald-300",
          icon: "✓",
          label: "Hoàn thành",
        };
      case "processing":
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-800",
          border: "border-yellow-300",
          icon: "⏳",
          label: "Đang xử lý",
        };
      case "cancelled":
        return {
          bg: "bg-red-100",
          text: "text-red-800",
          border: "border-red-300",
          icon: "✕",
          label: "Đã hủy",
        };
      default:
        return {
          bg: "bg-gray-100",
          text: "text-gray-800",
          border: "border-gray-300",
          icon: "?",
          label: "Không xác định",
        };
    }
  };

  // Xem chi tiết đơn hàng
  const handleViewOrder = async (orderId: string) => {
    try {
      const order = orders.find((o) => o.id === orderId);
      if (order) {
        setSelectedOrder(order);
        setShowDetailModal(true);
      }
    } catch (err) {
      console.error("Failed to fetch order details:", err);
      alert("Không thể tải chi tiết đơn hàng");
    }
  };

  // Đổi trạng thái đơn hàng từ chưa xử lý thành đã xử lý
  const handleUpdateStatus = async (orderId: string) => {
    if (!confirm("Bạn có chắc chắn muốn đánh dấu đơn hàng này là đã xử lý?")) {
      return;
    }

    try {
      setIsUpdatingStatus(true);
      await saleService.updateInvoiceStatus(orderId, "completed");

      // Refresh danh sách đơn hàng
      const invoices = await saleService.getInvoices();
      const ordersData: Order[] = await Promise.all(
        invoices.map(async (invoice: Invoice) => {
          let customerName = "Khách lẻ";
          if (
            invoice.customer &&
            typeof invoice.customer === "object" &&
            "fullName" in invoice.customer
          ) {
            customerName = (invoice.customer as any).fullName || "Khách lẻ";
          } else if (invoice.customer && typeof invoice.customer === "string") {
            try {
              const customer = await customerService.getById(invoice.customer);
              customerName = customer.fullName;
            } catch {
              customerName = "Khách lẻ";
            }
          }

          return {
            id: invoice._id,
            code: invoice.code,
            customer: customerName,
            customerId:
              typeof invoice.customer === "string"
                ? invoice.customer
                : undefined,
            date: invoice.createdAt
              ? new Date(invoice.createdAt).toLocaleDateString("vi-VN")
              : new Date().toLocaleDateString("vi-VN"),
            amount: invoice.itemsSummary?.grandTotal || invoice.paidAmount || 0,
            status:
              invoice.status === "void"
                ? "cancelled"
                : invoice.status === "completed"
                ? "completed"
                : "processing",
            items: [`${invoice.itemsSummary?.itemCount || 0} sản phẩm`],
            paymentMethod: invoice.paymentMethod,
          };
        })
      );

      setOrders(ordersData);

      // Cập nhật selectedOrder nếu đang mở modal
      if (selectedOrder && selectedOrder.id === orderId) {
        const updatedOrder = ordersData.find((o) => o.id === orderId);
        if (updatedOrder) {
          setSelectedOrder(updatedOrder);
        }
      }

      alert("Đã cập nhật trạng thái đơn hàng thành công");
    } catch (err: any) {
      console.error("Failed to update order status:", err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể cập nhật trạng thái";
      alert(`Lỗi: ${errorMessage}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Hủy đơn hàng
  const handleVoidOrder = async (orderId: string, orderCode: string) => {
    if (!confirm(`Bạn có chắc chắn muốn hủy đơn hàng ${orderCode}?`)) {
      return;
    }

    const reason = prompt("Nhập lý do hủy đơn hàng:");
    if (!reason || !reason.trim()) {
      alert("Vui lòng nhập lý do hủy đơn hàng");
      return;
    }

    try {
      setIsVoiding(orderId);
      const currentUser = authService.getCurrentUser();
      const actorId = currentUser?.id;

      await saleService.voidInvoice(orderId, reason.trim(), actorId);

      // Refresh danh sách đơn hàng
      const invoices = await saleService.getInvoices();
      const ordersData: Order[] = await Promise.all(
        invoices.map(async (invoice: Invoice) => {
          let customerName = "Khách lẻ";
          if (
            invoice.customer &&
            typeof invoice.customer === "object" &&
            "fullName" in invoice.customer
          ) {
            customerName = (invoice.customer as any).fullName || "Khách lẻ";
          } else if (invoice.customer && typeof invoice.customer === "string") {
            try {
              const customer = await customerService.getById(invoice.customer);
              customerName = customer.fullName;
            } catch {
              customerName = "Khách lẻ";
            }
          }

          return {
            id: invoice._id,
            code: invoice.code,
            customer: customerName,
            customerId:
              typeof invoice.customer === "string"
                ? invoice.customer
                : undefined,
            date: invoice.createdAt
              ? new Date(invoice.createdAt).toLocaleDateString("vi-VN")
              : new Date().toLocaleDateString("vi-VN"),
            amount: invoice.itemsSummary?.grandTotal || invoice.paidAmount || 0,
            status:
              invoice.status === "void"
                ? "cancelled"
                : invoice.status === "completed"
                ? "completed"
                : "processing",
            items: [`${invoice.itemsSummary?.itemCount || 0} sản phẩm`],
            paymentMethod: invoice.paymentMethod,
          };
        })
      );

      setOrders(ordersData);
      alert("Đơn hàng đã được hủy thành công");
    } catch (err: any) {
      console.error("Failed to void order:", err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể hủy đơn hàng";
      alert(`Lỗi: ${errorMessage}`);
    } finally {
      setIsVoiding(null);
    }
  };

  // In hóa đơn
  const handlePrintOrder = async (orderId: string) => {
    try {
      const invoice = await saleService.getInvoiceById(orderId);
      // Mở cửa sổ in với nội dung hóa đơn
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Hóa đơn ${invoice.code}</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .header { text-align: center; margin-bottom: 20px; }
                .info { margin-bottom: 10px; }
                .items { margin-top: 20px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                .total { font-weight: bold; font-size: 18px; margin-top: 20px; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>FreshShop'UTH</h1>
                <h2>Hóa đơn bán hàng</h2>
              </div>
              <div class="info">
                <p><strong>Mã hóa đơn:</strong> ${invoice.code}</p>
                <p><strong>Ngày:</strong> ${
                  invoice.createdAt
                    ? new Date(invoice.createdAt).toLocaleString("vi-VN")
                    : "N/A"
                }</p>
                <p><strong>Khách hàng:</strong> ${
                  invoice.customer &&
                  typeof invoice.customer === "object" &&
                  "fullName" in invoice.customer
                    ? (invoice.customer as any).fullName
                    : "Khách lẻ"
                }</p>
              </div>
              <div class="items">
                <p><strong>Số lượng sản phẩm:</strong> ${
                  invoice.itemsSummary?.itemCount || 0
                }</p>
                <p><strong>Tổng tiền:</strong> ${(
                  invoice.itemsSummary?.grandTotal ||
                  invoice.paidAmount ||
                  0
                ).toLocaleString("vi-VN")}đ</p>
                <p><strong>Phương thức thanh toán:</strong> ${
                  invoice.paymentMethod || "Tiền mặt"
                }</p>
              </div>
              <div class="total">
                <p>Tổng cộng: ${(
                  invoice.itemsSummary?.grandTotal ||
                  invoice.paidAmount ||
                  0
                ).toLocaleString("vi-VN")}đ</p>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    } catch (err) {
      console.error("Failed to print order:", err);
      alert("Không thể in hóa đơn");
    }
  };

  return (
    <div className="px-6 py-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-emerald-600 mb-3 font-logo">
          Quản lý đơn hàng
        </h1>
      </div>

      {/* Search bar */}
      <div className="mb-6 flex justify-center">
        <div className="relative w-full sm:w-1/2">
          <IoMdSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
          <input
            type="text"
            spellCheck={false}
            placeholder="Tìm kiếm đơn hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-emerald-300 rounded-xl pl-12 pr-5 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-sm transition-all duration-300"
          />
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <p className="mt-4 text-gray-600">Đang tải danh sách đơn hàng...</p>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="text-center py-20">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Stats */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-emerald-200">
            <div className="mb-3 flex justify-center">
              <LuShoppingBasket className="text-4xl text-emerald-600" />
            </div>
            <h3 className="text-emerald-700 font-semibold mb-2 text-sm text-center">
              Tổng đơn hàng
            </h3>
            <p className="text-2xl font-bold text-emerald-600 text-center">
              {filteredOrders.length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-blue-200">
            <div className="mb-3 flex justify-center">
              <MdOutlineCheckCircle className="text-4xl text-blue-600" />
            </div>
            <h3 className="text-blue-700 font-semibold mb-2 text-sm text-center">
              Đã hoàn thành
            </h3>
            <p className="text-2xl font-bold text-blue-600 text-center">
              {filteredOrders.filter((o) => o.status === "completed").length}
            </p>
          </div>
        </div>
      )}

      {/* Orders Table */}
      {!isLoading && !error && (
        <div className="bg-white border border-emerald-100 rounded-2xl shadow-md overflow-x-auto">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">
                {searchTerm
                  ? "Không tìm thấy đơn hàng nào"
                  : "Chưa có đơn hàng nào"}
              </p>
            </div>
          ) : (
            <table className="w-full border-collapse text-gray-700 min-w-[1100px]">
              <thead className="bg-emerald-50 text-emerald-700">
                <tr>
                  <th className="text-left pl-8 py-4 font-semibold">
                    Mã đơn hàng
                  </th>
                  <th className="text-left px-6 py-4 font-semibold">
                    Khách hàng
                  </th>
                  <th className="text-left px-6 py-4 font-semibold">
                    Ngày đặt
                  </th>
                  <th className="text-left pl-20 py-4 font-semibold">
                    Sản phẩm
                  </th>
                  <th className="text-left px-6 py-4 font-semibold">
                    Tổng tiền
                  </th>
                  <th className="text-left pl-10 py-4 font-semibold">
                    Trạng thái
                  </th>
                  <th className="text-left px-6 py-4 font-semibold">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-emerald-50 transition-colors border-t border-gray-100"
                  >
                    <td className="px-6 py-4 font-semibold text-emerald-600">
                      {order.code}
                    </td>
                    <td className="px-6 py-4">{order.customer}</td>
                    <td className="px-6 py-4 text-gray-600">{order.date}</td>
                    <td className="px-6 py-4 text-gray-700">
                      {order.items.join(", ")}
                    </td>
                    <td className="px-6 py-4 font-semibold text-emerald-600">
                      {order.amount.toLocaleString()}đ
                    </td>
                    <td className="px-6 py-4">
                      {(() => {
                        const badge = getStatusBadge(order.status);
                        return (
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${badge.bg} ${badge.text} ${badge.border} shadow-sm`}
                          >
                            <span className="text-sm">{badge.icon}</span>
                            <span>{badge.label}</span>
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewOrder(order.id)}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition shadow-sm"
                        title="Xem chi tiết"
                      >
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Modal chi tiết đơn hàng */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-emerald-500 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center">
              <h2 className="text-xl font-bold">Chi tiết đơn hàng</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-white hover:text-gray-200 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-emerald-700 mb-2">
                    Thông tin đơn hàng
                  </h3>
                  <div className="bg-emerald-50 rounded-lg p-4 space-y-2">
                    <p>
                      <strong>Mã đơn hàng:</strong> {selectedOrder.code}
                    </p>
                    <p>
                      <strong>Khách hàng:</strong> {selectedOrder.customer}
                    </p>
                    <p>
                      <strong>Ngày đặt:</strong> {selectedOrder.date}
                    </p>
                    <p>
                      <strong>Trạng thái:</strong>
                      {(() => {
                        const badge = getStatusBadge(selectedOrder.status);
                        return (
                          <span
                            className={`ml-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${badge.bg} ${badge.text} ${badge.border} shadow-sm`}
                          >
                            <span className="text-sm">{badge.icon}</span>
                            <span>{badge.label}</span>
                          </span>
                        );
                      })()}
                    </p>
                    <p>
                      <strong>Phương thức thanh toán:</strong>{" "}
                      {selectedOrder.paymentMethod || "Tiền mặt"}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-emerald-700 mb-2">
                    Sản phẩm
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p>{selectedOrder.items.join(", ")}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-emerald-700 mb-2">
                    Tổng tiền
                  </h3>
                  <div className="bg-emerald-50 rounded-lg p-4">
                    <p className="text-2xl font-bold text-emerald-600">
                      {selectedOrder.amount.toLocaleString("vi-VN")}đ
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                {selectedOrder.status === "processing" && (
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.id)}
                    disabled={isUpdatingStatus}
                    className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition"
                  >
                    {isUpdatingStatus ? "Đang xử lý..." : "Đánh dấu đã xử lý"}
                  </button>
                )}
                <button
                  onClick={() => handlePrintOrder(selectedOrder.id)}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition"
                >
                  In hóa đơn
                </button>
                {selectedOrder.status !== "cancelled" &&
                  selectedOrder.status !== "processing" && (
                    <button
                      onClick={() =>
                        handleVoidOrder(selectedOrder.id, selectedOrder.code)
                      }
                      disabled={isVoiding === selectedOrder.id}
                      className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition"
                    >
                      {isVoiding === selectedOrder.id
                        ? "Đang hủy..."
                        : "Hủy đơn"}
                    </button>
                  )}
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg font-medium transition"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
