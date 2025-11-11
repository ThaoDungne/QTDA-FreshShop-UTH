import React, { useState, useEffect } from "react";
import {
  customerService,
  saleService,
  type Customer as CustomerType,
  type Invoice,
  type UpdateCustomerDto,
  type CreateCustomerDto,
} from "../services";
import { IoMdSearch } from "react-icons/io";
import { TbUsersGroup } from "react-icons/tb";
import { MdOutlineCheckCircle } from "react-icons/md";
import { HiCurrencyDollar } from "react-icons/hi";

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  gender?: string;
  birthDate?: string;
  loyaltyPoints?: number;
  loyaltyTier?: string;
  note?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrder: string;
  status: "active" | "inactive";
}

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState<UpdateCustomerDto>({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    gender: undefined,
    birthDate: "",
    note: "",
  });

  // Add form state
  const [addForm, setAddForm] = useState<CreateCustomerDto>({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    gender: undefined,
    birthDate: "",
    note: "",
  });

  // Fetch customers từ API
  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Lấy customers
      const customersData = await customerService.getAll();

      // Lấy invoices (nếu lỗi thì bỏ qua, vẫn hiển thị customers)
      let invoices: Invoice[] = [];
      try {
        invoices = await saleService.getInvoices();
      } catch (invoiceError) {
        console.warn(
          "Failed to fetch invoices for stats, continuing without stats:",
          invoiceError
        );
      }

      // Tính toán stats cho mỗi customer
      const customersWithStats: Customer[] = customersData.map(
        (customer: CustomerType) => {
          // Tìm invoices của customer này
          const customerInvoices = invoices.filter((inv: Invoice) => {
            if (!inv.customer) return false;
            if (typeof inv.customer === "string") {
              return inv.customer === customer._id;
            }
            const customerObj = inv.customer as { _id?: string; id?: string };
            return (
              customerObj._id === customer._id ||
              customerObj.id === customer._id
            );
          });

          const totalSpent = customerInvoices.reduce(
            (sum, inv) =>
              sum + (inv.itemsSummary?.grandTotal || inv.paidAmount || 0),
            0
          );

          const lastInvoice =
            customerInvoices.length > 0
              ? customerInvoices.sort(
                  (a, b) =>
                    new Date(b.createdAt || 0).getTime() -
                    new Date(a.createdAt || 0).getTime()
                )[0]
              : null;

          return {
            id: customer._id,
            name: customer.fullName,
            email: customer.email,
            phone: customer.phone,
            address: customer.address,
            gender: customer.gender,
            birthDate: customer.birthDate,
            loyaltyPoints: customer.loyaltyPoints,
            loyaltyTier: customer.loyaltyTier,
            note: customer.note,
            totalOrders: customerInvoices.length,
            totalSpent: totalSpent,
            lastOrder: lastInvoice?.createdAt
              ? new Date(lastInvoice.createdAt).toLocaleDateString("vi-VN")
              : "Chưa có",
            status: "active" as const,
          };
        }
      );

      setCustomers(customersWithStats);
    } catch (err) {
      console.error("Failed to fetch customers:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Không thể tải danh sách khách hàng";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Lọc customers theo search term
  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.email &&
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Xem chi tiết
  const handleView = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowViewModal(true);
  };

  // Mở modal sửa
  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setEditForm({
      fullName: customer.name,
      phone: customer.phone,
      email: customer.email || "",
      address: customer.address || "",
      gender: customer.gender as "male" | "female" | "other" | undefined,
      birthDate: customer.birthDate || "",
      note: customer.note || "",
    });
    setShowEditModal(true);
  };

  // Lưu thay đổi
  const handleSave = async () => {
    if (!selectedCustomer) return;

    try {
      setIsSaving(true);
      await customerService.update(selectedCustomer.id, editForm);
      await fetchCustomers(); // Refresh danh sách
      setShowEditModal(false);
      setSelectedCustomer(null);
    } catch (err) {
      console.error("Failed to update customer:", err);
      alert("Không thể cập nhật khách hàng. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  // Xóa khách hàng
  const handleDelete = async () => {
    if (!selectedCustomer) return;

    try {
      setIsDeleting(true);
      await customerService.delete(selectedCustomer.id);
      await fetchCustomers(); // Refresh danh sách
      setShowDeleteConfirm(false);
      setSelectedCustomer(null);
    } catch (err) {
      console.error("Failed to delete customer:", err);
      alert("Không thể xóa khách hàng. Vui lòng thử lại.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Mở xác nhận xóa
  const handleDeleteClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDeleteConfirm(true);
  };

  // Mở modal thêm khách hàng
  const handleOpenAddModal = () => {
    setAddForm({
      fullName: "",
      phone: "",
      email: "",
      address: "",
      gender: undefined,
      birthDate: "",
      note: "",
    });
    setShowAddModal(true);
  };

  // Tạo khách hàng mới
  const handleCreate = async () => {
    if (!addForm.fullName || !addForm.phone) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc (Tên và Số điện thoại)");
      return;
    }

    // Validate email format nếu có
    if (addForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addForm.email)) {
      alert("Email không hợp lệ. Vui lòng kiểm tra lại.");
      return;
    }

    try {
      setIsCreating(true);
      // Chỉ gửi các trường có giá trị
      const payload: CreateCustomerDto = {
        fullName: addForm.fullName.trim(),
        phone: addForm.phone.trim(),
      };

      if (addForm.email?.trim()) {
        payload.email = addForm.email.trim();
      }
      if (addForm.address?.trim()) {
        payload.address = addForm.address.trim();
      }
      if (addForm.gender) {
        payload.gender = addForm.gender;
      }
      if (addForm.birthDate) {
        payload.birthDate = addForm.birthDate;
      }
      if (addForm.note?.trim()) {
        payload.note = addForm.note.trim();
      }

      await customerService.create(payload);
      await fetchCustomers(); // Refresh danh sách
      setShowAddModal(false);
      setAddForm({
        fullName: "",
        phone: "",
        email: "",
        address: "",
        gender: undefined,
        birthDate: "",
        note: "",
      });
      alert("Tạo khách hàng thành công!");
    } catch (err: unknown) {
      console.error("Failed to create customer:", err);
      let errorMessage = "Không thể tạo khách hàng. Vui lòng thử lại.";

      if (err && typeof err === "object" && "response" in err) {
        const axiosError = err as {
          response?: { data?: { message?: string | string[] } };
        };
        if (axiosError.response?.data?.message) {
          const message = axiosError.response.data.message;
          if (Array.isArray(message)) {
            errorMessage = message.join(", ");
          } else {
            errorMessage = message;
          }
        }
      }

      alert(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "active") {
      return {
        bg: "bg-emerald-100",
        text: "text-emerald-800",
        border: "border-emerald-300",
        label: "Hoạt động",
      };
    }
    return {
      bg: "bg-red-100",
      text: "text-red-800",
      border: "border-red-300",
      label: "Không hoạt động",
    };
  };

  const getGenderText = (gender?: string) => {
    switch (gender) {
      case "male":
        return "Nam";
      case "female":
        return "Nữ";
      case "other":
        return "Khác";
      default:
        return "Chưa cập nhật";
    }
  };

  return (
    <div className="px-6 py-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-emerald-600 mb-3 font-logo">
          Quản lý khách hàng
        </h1>
      </div>

      {/* Search bar và nút thêm */}
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-center gap-4">
        <div className="relative w-full sm:w-1/2">
          <IoMdSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
          <input
            type="text"
            spellCheck={false}
            placeholder="Tìm kiếm khách hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-emerald-300 rounded-xl pl-12 pr-5 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-sm transition-all duration-300"
          />
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition shadow-md hover:shadow-lg whitespace-nowrap"
        >
          + Thêm khách hàng
        </button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <p className="mt-4 text-gray-600">Đang tải danh sách khách hàng...</p>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="text-center py-20">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => fetchCustomers()}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Stats */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-emerald-200">
            <div className="mb-3 flex justify-center">
              <TbUsersGroup className="text-4xl text-emerald-600" />
            </div>
            <h3 className="text-emerald-700 font-semibold mb-2 text-sm text-center">
              Tổng khách hàng
            </h3>
            <p className="text-2xl font-bold text-emerald-600 text-center">
              {filteredCustomers.length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-blue-200">
            <div className="mb-3 flex justify-center">
              <MdOutlineCheckCircle className="text-4xl text-blue-600" />
            </div>
            <h3 className="text-blue-700 font-semibold mb-2 text-sm text-center">
              Khách hàng hoạt động
            </h3>
            <p className="text-2xl font-bold text-blue-600 text-center">
              {filteredCustomers.filter((c) => c.status === "active").length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-purple-200">
            <div className="mb-3 flex justify-center">
              <HiCurrencyDollar className="text-4xl text-purple-600" />
            </div>
            <h3 className="text-purple-700 font-semibold mb-2 text-sm text-center">
              Tổng doanh thu
            </h3>
            <p className="text-2xl font-bold text-purple-600 text-center">
              {filteredCustomers
                .reduce((sum, c) => sum + c.totalSpent, 0)
                .toLocaleString("vi-VN")}
              đ
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      {!isLoading && !error && (
        <div className="bg-white border border-emerald-100 rounded-2xl shadow-md overflow-x-auto">
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">
                {searchTerm
                  ? "Không tìm thấy khách hàng nào"
                  : "Chưa có khách hàng nào"}
              </p>
            </div>
          ) : (
            <table className="w-full border-collapse text-gray-700 min-w-[1000px]">
              <thead className="bg-emerald-50 text-emerald-700">
                <tr>
                  <th className="text-left px-8 py-4 font-semibold">Mã KH</th>
                  <th className="text-left px-6 py-4 font-semibold">
                    Tên khách hàng
                  </th>
                  <th className="text-left px-6 py-4 font-semibold">
                    Số điện thoại
                  </th>
                  <th className="text-center px-6 py-4 font-semibold">
                    Số đơn hàng
                  </th>
                  <th className="text-right px-6 py-4 font-semibold">
                    Tổng chi tiêu
                  </th>
                  <th className="text-center px-6 py-4 font-semibold">
                    Trạng thái
                  </th>
                  <th className="text-center px-6 py-4 font-semibold">
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredCustomers.map((customer) => {
                  const badge = getStatusBadge(customer.status);
                  return (
                    <tr
                      key={customer.id}
                      className="hover:bg-emerald-50 border-t border-emerald-100 transition"
                    >
                      <td className="px-8 py-4 font-semibold text-emerald-600 whitespace-nowrap">
                        {customer.id.slice(-6).toUpperCase()}
                      </td>
                      <td className="px-6 py-4 font-medium">{customer.name}</td>
                      <td className="px-6 py-4 text-gray-700">
                        {customer.phone}
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-emerald-600">
                        {customer.totalOrders}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-emerald-600">
                        {customer.totalSpent.toLocaleString("vi-VN")}đ
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold border ${badge.bg} ${badge.text} ${badge.border} shadow-sm`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleView(customer)}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-md text-sm font-medium transition shadow-sm"
                            title="Xem chi tiết"
                          >
                            Xem
                          </button>
                          <button
                            onClick={() => handleEdit(customer)}
                            className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1.5 rounded-md text-sm font-medium transition shadow-sm"
                            title="Sửa thông tin"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDeleteClick(customer)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-sm font-medium transition shadow-sm"
                            title="Xóa khách hàng"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Modal xem chi tiết */}
      {showViewModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-emerald-500 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center">
              <h2 className="text-xl font-bold">Chi tiết khách hàng</h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedCustomer(null);
                }}
                className="text-white hover:text-gray-200 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-emerald-700 mb-2">
                    Thông tin cơ bản
                  </h3>
                  <div className="bg-emerald-50 rounded-lg p-4 space-y-2">
                    <p>
                      <strong>Mã khách hàng:</strong>{" "}
                      {selectedCustomer.id.slice(-6).toUpperCase()}
                    </p>
                    <p>
                      <strong>Tên:</strong> {selectedCustomer.name}
                    </p>
                    <p>
                      <strong>Số điện thoại:</strong> {selectedCustomer.phone}
                    </p>
                    <p>
                      <strong>Email:</strong> {selectedCustomer.email || "-"}
                    </p>
                    <p>
                      <strong>Giới tính:</strong>{" "}
                      {getGenderText(selectedCustomer.gender)}
                    </p>
                    <p>
                      <strong>Ngày sinh:</strong>{" "}
                      {selectedCustomer.birthDate
                        ? new Date(
                            selectedCustomer.birthDate
                          ).toLocaleDateString("vi-VN")
                        : "Chưa cập nhật"}
                    </p>
                    <p>
                      <strong>Địa chỉ:</strong>{" "}
                      {selectedCustomer.address || "-"}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-emerald-700 mb-2">
                    Thông tin thống kê
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p>
                      <strong>Số đơn hàng:</strong>{" "}
                      {selectedCustomer.totalOrders}
                    </p>
                    <p>
                      <strong>Tổng chi tiêu:</strong>{" "}
                      {selectedCustomer.totalSpent.toLocaleString("vi-VN")}đ
                    </p>
                    <p>
                      <strong>Đơn hàng cuối:</strong>{" "}
                      {selectedCustomer.lastOrder}
                    </p>
                    <p>
                      <strong>Điểm thưởng:</strong>{" "}
                      {selectedCustomer.loyaltyPoints || 0}
                    </p>
                    <p>
                      <strong>Hạng thành viên:</strong>{" "}
                      {selectedCustomer.loyaltyTier || "Chưa có"}
                    </p>
                  </div>
                </div>
                {selectedCustomer.note && (
                  <div>
                    <h3 className="font-semibold text-emerald-700 mb-2">
                      Ghi chú
                    </h3>
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700">
                        {selectedCustomer.note}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleEdit(selectedCustomer);
                  }}
                  className="flex-1 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-white rounded-lg font-medium transition"
                >
                  Sửa thông tin
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedCustomer(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg font-medium transition"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal sửa */}
      {showEditModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-yellow-400 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center">
              <h2 className="text-xl font-bold">Sửa thông tin khách hàng</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedCustomer(null);
                }}
                className="text-white hover:text-gray-200 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên khách hàng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editForm.fullName}
                    onChange={(e) =>
                      setEditForm({ ...editForm, fullName: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) =>
                      setEditForm({ ...editForm, phone: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ
                  </label>
                  <input
                    type="text"
                    value={editForm.address}
                    onChange={(e) =>
                      setEditForm({ ...editForm, address: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giới tính
                  </label>
                  <select
                    value={editForm.gender || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        gender: e.target.value as
                          | "male"
                          | "female"
                          | "other"
                          | undefined,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    value={editForm.birthDate}
                    onChange={(e) =>
                      setEditForm({ ...editForm, birthDate: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ghi chú
                  </label>
                  <textarea
                    value={editForm.note}
                    onChange={(e) =>
                      setEditForm({ ...editForm, note: e.target.value })
                    }
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={isSaving || !editForm.fullName || !editForm.phone}
                  className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition"
                >
                  {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedCustomer(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg font-medium transition"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal thêm khách hàng */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-emerald-500 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center">
              <h2 className="text-xl font-bold">Thêm khách hàng mới</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setAddForm({
                    fullName: "",
                    phone: "",
                    email: "",
                    address: "",
                    gender: undefined,
                    birthDate: "",
                    note: "",
                  });
                }}
                className="text-white hover:text-gray-200 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên khách hàng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={addForm.fullName}
                    onChange={(e) =>
                      setAddForm({ ...addForm, fullName: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={addForm.phone}
                    onChange={(e) =>
                      setAddForm({ ...addForm, phone: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={addForm.email}
                    onChange={(e) =>
                      setAddForm({ ...addForm, email: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ
                  </label>
                  <input
                    type="text"
                    value={addForm.address}
                    onChange={(e) =>
                      setAddForm({ ...addForm, address: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giới tính
                  </label>
                  <select
                    value={addForm.gender || ""}
                    onChange={(e) =>
                      setAddForm({
                        ...addForm,
                        gender: e.target.value as
                          | "male"
                          | "female"
                          | "other"
                          | undefined,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    value={addForm.birthDate}
                    onChange={(e) =>
                      setAddForm({ ...addForm, birthDate: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ghi chú
                  </label>
                  <textarea
                    value={addForm.note}
                    onChange={(e) =>
                      setAddForm({ ...addForm, note: e.target.value })
                    }
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleCreate}
                  disabled={isCreating}
                  className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition"
                >
                  {isCreating ? "Đang tạo..." : "Tạo khách hàng"}
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setAddForm({
                      fullName: "",
                      phone: "",
                      email: "",
                      address: "",
                      gender: undefined,
                      birthDate: "",
                      note: "",
                    });
                  }}
                  className="flex-1 px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg font-medium transition"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa */}
      {showDeleteConfirm && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4">
            <div className="bg-red-500 text-white px-6 py-4 rounded-t-2xl">
              <h2 className="text-xl font-bold">Xác nhận xóa</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Bạn có chắc chắn muốn xóa khách hàng{" "}
                <strong>{selectedCustomer.name}</strong>?
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Hành động này không thể hoàn tác.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition"
                >
                  {isDeleting ? "Đang xóa..." : "Xóa"}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setSelectedCustomer(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg font-medium transition"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
