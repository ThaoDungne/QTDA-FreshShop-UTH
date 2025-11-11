import React, { useState, useEffect } from "react";
import { saleService, type Invoice } from "../services";
import { customerService } from "../services";
import { IoMdSearch } from "react-icons/io";

interface Payment {
  id: string;
  orderId: string;
  customer: string;
  amount: number;
  method: "cash";
  status: "completed" | "pending" | "failed" | "refunded";
  date: string;
  description: string;
}

const Payment: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch payments từ API (từ invoices)
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const invoices = await saleService.getInvoices();

        // Convert invoices sang Payment format
        const paymentsData: Payment[] = await Promise.all(
          invoices.map(async (invoice: Invoice) => {
            // Lấy tên khách hàng
            let customerName = "Khách lẻ";
            if (invoice.customer && typeof invoice.customer === 'object' && 'fullName' in invoice.customer) {
              customerName = (invoice.customer as any).fullName || "Khách lẻ";
            } else if (invoice.customer && typeof invoice.customer === 'string') {
              try {
                const customer = await customerService.getById(invoice.customer);
                customerName = customer.fullName;
              } catch {
                customerName = "Khách lẻ";
              }
            }

            // Xác định status từ invoice status
            let paymentStatus: "completed" | "pending" | "failed" | "refunded";
            if (invoice.status === "completed") {
              paymentStatus = "completed";
            } else if (invoice.status === "void") {
              paymentStatus = "refunded";
            } else {
              paymentStatus = "pending";
            }

            return {
              id: invoice._id,
              orderId: invoice.code,
              customer: customerName,
              amount: invoice.paidAmount || invoice.itemsSummary?.grandTotal || 0,
              method: (invoice.paymentMethod as "cash") || "cash", // Chỉ có tiền mặt
              status: paymentStatus,
              date: invoice.createdAt
                ? new Date(invoice.createdAt).toLocaleString("vi-VN")
                : new Date().toLocaleString("vi-VN"),
              description: invoice.note || "Thanh toán tiền mặt",
            };
          })
        );

        setPayments(paymentsData);
      } catch (err) {
        console.error("Failed to fetch payments:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Không thể tải danh sách thanh toán";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, []);

  // Lọc payments theo search term
  const filteredPayments = payments.filter(
    (payment) =>
      payment.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500 text-white";
      case "pending":
        return "bg-yellow-400 text-white";
      case "failed":
        return "bg-red-500 text-white";
      case "refunded":
        return "bg-gray-400 text-white";
      default:
        return "bg-gray-300 text-white";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Thành công";
      case "pending":
        return "Chờ xử lý";
      case "failed":
        return "Thất bại";
      case "refunded":
        return "Đã hoàn";
      default:
        return "Không xác định";
    }
  };

  const getMethodText = () => {
    return "Tiền mặt";
  };

  if (isLoading) {
    return (
      <div className="px-6 py-10 max-w-7xl mx-auto">
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <p className="mt-4 text-gray-600">Đang tải danh sách thanh toán...</p>
        </div>
      </div>
    );
  }

  if (error && !isLoading) {
    return (
      <div className="px-6 py-10 max-w-7xl mx-auto">
        <div className="text-center py-20">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-emerald-600 mb-3 font-logo">
          Quản lý thanh toán
        </h1> 
      </div>

      {/* Search bar */}
      <div className="mb-6 flex justify-center">
        <div className="relative w-full sm:w-1/2">
          <IoMdSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
          <input
            type="text"
            spellCheck={false}
            placeholder="Tìm kiếm thanh toán..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-emerald-300 rounded-xl pl-12 pr-5 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-sm transition-all duration-300"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-10">
        <div className="bg-white rounded-2xl shadow-md p-6 text-center border border-emerald-100 hover:shadow-lg transition">
          <p className="text-3xl font-bold text-emerald-600 mb-1">
            {filteredPayments.length}
          </p>
          <p className="text-gray-600 font-medium">Tổng giao dịch</p>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-6 text-center border border-emerald-100 hover:shadow-lg transition">
          <p className="text-3xl font-bold text-emerald-600 mb-1">
            {filteredPayments.filter((p) => p.status === "completed").length}
          </p>
          <p className="text-gray-600 font-medium">Thành công</p>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-6 text-center border border-emerald-100 hover:shadow-lg transition">
          <p className="text-3xl font-bold text-emerald-600 mb-1">
            {filteredPayments
              .reduce(
                (sum, p) => sum + (p.status === "completed" ? p.amount : 0),
                0
              )
              .toLocaleString("vi-VN")}
            đ
          </p>
          <p className="text-gray-600 font-medium">Tổng thu</p>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-6 text-center border border-emerald-100 hover:shadow-lg transition">
          <p className="text-3xl font-bold text-yellow-500 mb-1">
            {filteredPayments.filter((p) => p.status === "pending").length}
          </p>
          <p className="text-gray-600 font-medium">Chờ xử lý</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-emerald-100 rounded-2xl shadow-md overflow-x-auto">
        {filteredPayments.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">
              {searchTerm ? "Không tìm thấy giao dịch nào" : "Chưa có giao dịch thanh toán nào"}
            </p>
          </div>
        ) : (
          <table className="w-full border-collapse text-gray-700 min-w-[900px]">
            <thead className="bg-emerald-50 text-emerald-700">
              <tr>
                <th className="text-left px-8 py-4 font-semibold">Mã GD</th>
                <th className="text-left px-6 py-4 font-semibold">Đơn hàng</th>
                <th className="text-left px-6 py-4 font-semibold">Khách hàng</th>
                <th className="text-right px-6 py-4 font-semibold">Số tiền</th>
                <th className="text-left px-6 py-4 font-semibold">
                  Phương thức
                </th>
                <th className="text-center px-6 py-4 font-semibold">Trạng thái</th>
                <th className="text-center px-6 py-4 font-semibold">Ngày giờ</th>
                <th className="text-center px-6 py-4 font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr
                  key={payment.id}
                  className="hover:bg-emerald-50 border-t border-emerald-100 transition"
                >
                  <td className="px-8 py-4 font-semibold text-emerald-600">
                    {payment.id.slice(-6).toUpperCase()}
                  </td>
                  <td className="px-6 py-4 font-medium">{payment.orderId}</td>
                  <td className="px-6 py-4">{payment.customer}</td>
                  <td className="px-6 py-4 text-right font-semibold text-emerald-600">
                    {payment.amount.toLocaleString("vi-VN")}đ
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-700 text-sm">
                      {getMethodText()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-block w-[100px] py-1.5 rounded-full text-xs font-semibold ${getStatusColor(
                        payment.status
                      )}`}
                    >
                      {getStatusText(payment.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">
                    {payment.date}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => {
                        // Có thể mở modal chi tiết hoặc điều hướng
                        window.location.hash = `#orders`;
                      }}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-1.5 rounded-md text-sm font-medium transition"
                    >
                      Xem
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Payment;
