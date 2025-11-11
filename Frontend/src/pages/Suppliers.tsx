import React, { useState, useEffect } from "react";
import {
  supplierService,
  type Supplier,
  type CreateSupplierDto,
  type UpdateSupplierDto,
} from "../services";
import { IoMdSearch } from "react-icons/io";
import { HiBuildingOffice2 } from "react-icons/hi2";
import { HiPhone, HiMail, HiLocationMarker } from "react-icons/hi";
import { MdPerson, MdDescription, MdReceipt } from "react-icons/md";
import { HiEye, HiPencil, HiTrash } from "react-icons/hi";

const Suppliers: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null
  );
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Add form state
  const [addForm, setAddForm] = useState<CreateSupplierDto>({
    name: "",
    contactName: "",
    phone: "",
    email: "",
    address: "",
    taxCode: "",
    note: "",
  });

  // Edit form state
  const [editForm, setEditForm] = useState<UpdateSupplierDto>({
    name: "",
    contactName: "",
    phone: "",
    email: "",
    address: "",
    taxCode: "",
    note: "",
  });

  // Fetch suppliers từ API
  const fetchSuppliers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await supplierService.getAll();
      setSuppliers(data);
    } catch (err) {
      console.error("Failed to fetch suppliers:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Không thể tải danh sách nhà cung cấp";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Lọc suppliers theo search term
  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contactName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mở modal thêm nhà cung cấp
  const handleOpenAddModal = () => {
    setAddForm({
      name: "",
      contactName: "",
      phone: "",
      email: "",
      address: "",
      taxCode: "",
      note: "",
    });
    setShowAddModal(true);
  };

  // Tạo nhà cung cấp mới
  const handleCreate = async () => {
    if (!addForm.name) {
      alert("Vui lòng điền tên nhà cung cấp");
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
      const payload: Partial<CreateSupplierDto> & { name: string } = {
        name: addForm.name.trim(),
      };

      if (addForm.contactName?.trim()) {
        payload.contactName = addForm.contactName.trim();
      }
      if (addForm.phone?.trim()) {
        payload.phone = addForm.phone.trim();
      }
      if (addForm.email?.trim()) {
        payload.email = addForm.email.trim();
      }
      if (addForm.address?.trim()) {
        payload.address = addForm.address.trim();
      }
      if (addForm.taxCode?.trim()) {
        payload.taxCode = addForm.taxCode.trim();
      }
      if (addForm.note?.trim()) {
        payload.note = addForm.note.trim();
      }

      await supplierService.create(payload);
      await fetchSuppliers(); // Refresh danh sách
      setShowAddModal(false);
      setAddForm({
        name: "",
        contactName: "",
        phone: "",
        email: "",
        address: "",
        taxCode: "",
        note: "",
      });
      alert("Tạo nhà cung cấp thành công!");
    } catch (err: unknown) {
      console.error("Failed to create supplier:", err);
      let errorMessage = "Không thể tạo nhà cung cấp. Vui lòng thử lại.";

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

  // Xem chi tiết
  const handleView = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setShowViewModal(true);
  };

  // Mở modal sửa
  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setEditForm({
      name: supplier.name,
      contactName: supplier.contactName || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      address: supplier.address || "",
      taxCode: supplier.taxCode || "",
      note: supplier.note || "",
    });
    setShowEditModal(true);
  };

  // Cập nhật nhà cung cấp
  const handleUpdate = async () => {
    if (!selectedSupplier) return;

    // Validate email format nếu có
    if (editForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) {
      alert("Email không hợp lệ. Vui lòng kiểm tra lại.");
      return;
    }

    try {
      setIsSaving(true);
      // Chỉ gửi các trường có giá trị
      const payload: Partial<UpdateSupplierDto> = {};

      if (editForm.name?.trim()) {
        payload.name = editForm.name.trim();
      }
      if (editForm.contactName?.trim()) {
        payload.contactName = editForm.contactName.trim();
      }
      if (editForm.phone?.trim()) {
        payload.phone = editForm.phone.trim();
      }
      if (editForm.email?.trim()) {
        payload.email = editForm.email.trim();
      }
      if (editForm.address?.trim()) {
        payload.address = editForm.address.trim();
      }
      if (editForm.taxCode?.trim()) {
        payload.taxCode = editForm.taxCode.trim();
      }
      if (editForm.note?.trim()) {
        payload.note = editForm.note.trim();
      }

      await supplierService.update(selectedSupplier._id, payload);
      await fetchSuppliers(); // Refresh danh sách
      setShowEditModal(false);
      setSelectedSupplier(null);
      alert("Cập nhật nhà cung cấp thành công!");
    } catch (err: unknown) {
      console.error("Failed to update supplier:", err);
      let errorMessage = "Không thể cập nhật nhà cung cấp. Vui lòng thử lại.";

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
      setIsSaving(false);
    }
  };

  // Xóa nhà cung cấp
  const handleDelete = async () => {
    if (!selectedSupplier) return;

    try {
      setIsDeleting(true);
      await supplierService.delete(selectedSupplier._id);
      await fetchSuppliers(); // Refresh danh sách
      setShowDeleteConfirm(false);
      setSelectedSupplier(null);
      alert("Xóa nhà cung cấp thành công!");
    } catch (err: unknown) {
      console.error("Failed to delete supplier:", err);
      let errorMessage = "Không thể xóa nhà cung cấp. Vui lòng thử lại.";

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
      setIsDeleting(false);
    }
  };

  // Mở xác nhận xóa
  const handleDeleteClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setShowDeleteConfirm(true);
  };

  return (
    <div className="px-6 py-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-emerald-600 mb-3 font-logo">
          Quản lý nhà cung cấp
        </h1>
      </div>

      {/* Search bar và nút thêm */}
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-center gap-4">
        <div className="relative w-full sm:w-1/2">
          <IoMdSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
          <input
            type="text"
            spellCheck={false}
            placeholder="Tìm kiếm nhà cung cấp..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-emerald-300 rounded-xl pl-12 pr-5 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-sm transition-all duration-300"
          />
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition shadow-md hover:shadow-lg whitespace-nowrap"
        >
          + Thêm nhà cung cấp
        </button>
      </div>

      {/* Stats */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-emerald-200">
            <h3 className="text-emerald-700 font-semibold mb-2 text-sm text-center">
              Tổng nhà cung cấp
            </h3>
            <p className="text-2xl font-bold text-emerald-600 text-center">
              {suppliers.length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-blue-200">
            <h3 className="text-blue-700 font-semibold mb-2 text-sm text-center">
              Kết quả tìm kiếm
            </h3>
            <p className="text-2xl font-bold text-blue-600 text-center">
              {filteredSuppliers.length}
            </p>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <p className="mt-4 text-gray-600">Đang tải nhà cung cấp...</p>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 text-center">
          <p className="font-semibold">Lỗi: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm underline hover:text-red-900"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Supplier Cards */}
      {!isLoading && !error && (
        <>
          {filteredSuppliers.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">
                {searchTerm
                  ? "Không tìm thấy nhà cung cấp nào"
                  : "Chưa có nhà cung cấp nào"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredSuppliers.map((supplier) => (
                <div
                  key={supplier._id}
                  className="bg-white border border-emerald-100 rounded-2xl shadow-md p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                    <div className="bg-gradient-to-br from-emerald-100 to-green-100 p-3 rounded-xl">
                      <HiBuildingOffice2 className="text-2xl text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 flex-1">
                      {supplier.name}
                    </h3>
                  </div>

                  {/* Info */}
                  <div className="space-y-3 mb-5">
                    {supplier.contactName && (
                      <div className="flex items-start gap-3">
                        <MdPerson className="text-gray-400 text-lg mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <span className="text-xs text-gray-500 block mb-0.5">
                            Người liên hệ
                          </span>
                          <span className="text-sm font-semibold text-gray-800">
                            {supplier.contactName}
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <HiPhone className="text-gray-400 text-lg mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="text-xs text-gray-500 block mb-0.5">
                          Điện thoại
                        </span>
                        <span className="text-sm font-semibold text-gray-800">
                          {supplier.phone}
                        </span>
                      </div>
                    </div>
                    {supplier.email && (
                      <div className="flex items-start gap-3">
                        <HiMail className="text-gray-400 text-lg mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <span className="text-xs text-gray-500 block mb-0.5">
                            Email
                          </span>
                          <span className="text-sm font-semibold text-gray-800 break-all">
                            {supplier.email}
                          </span>
                        </div>
                      </div>
                    )}
                    {supplier.address && (
                      <div className="flex items-start gap-3">
                        <HiLocationMarker className="text-gray-400 text-lg mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <span className="text-xs text-gray-500 block mb-0.5">
                            Địa chỉ
                          </span>
                          <span className="text-sm font-semibold text-gray-800">
                            {supplier.address}
                          </span>
                        </div>
                      </div>
                    )}
                    {supplier.taxCode && (
                      <div className="flex items-start gap-3">
                        <MdReceipt className="text-gray-400 text-lg mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <span className="text-xs text-gray-500 block mb-0.5">
                            Mã số thuế
                          </span>
                          <span className="text-sm font-semibold text-gray-800">
                            {supplier.taxCode}
                          </span>
                        </div>
                      </div>
                    )}
                    {supplier.note && (
                      <div className="flex items-start gap-3 pt-2 border-t border-gray-100">
                        <MdDescription className="text-gray-400 text-lg mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <span className="text-xs text-gray-500 block mb-0.5">
                            Ghi chú
                          </span>
                          <span className="text-sm text-gray-700 leading-relaxed">
                            {supplier.note}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleView(supplier)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2.5 rounded-lg text-sm shadow-md hover:shadow-lg transition-all"
                      title="Xem chi tiết"
                    >
                      <HiEye className="text-base" />
                      <span>Xem</span>
                    </button>
                    <button
                      onClick={() => handleEdit(supplier)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-2.5 rounded-lg text-sm shadow-md hover:shadow-lg transition-all"
                      title="Sửa thông tin"
                    >
                      <HiPencil className="text-base" />
                      <span>Sửa</span>
                    </button>
                    <button
                      onClick={() => handleDeleteClick(supplier)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-lg text-sm shadow-md hover:shadow-lg transition-all"
                      title="Xóa nhà cung cấp"
                    >
                      <HiTrash className="text-base" />
                      <span>Xóa</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal thêm nhà cung cấp */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-emerald-500 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center">
              <h2 className="text-xl font-bold">Thêm nhà cung cấp mới</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setAddForm({
                    name: "",
                    contactName: "",
                    phone: "",
                    email: "",
                    address: "",
                    taxCode: "",
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
                    Tên nhà cung cấp <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={addForm.name}
                    onChange={(e) =>
                      setAddForm({ ...addForm, name: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Người liên hệ
                  </label>
                  <input
                    type="text"
                    value={addForm.contactName}
                    onChange={(e) =>
                      setAddForm({ ...addForm, contactName: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={addForm.phone}
                    onChange={(e) =>
                      setAddForm({ ...addForm, phone: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
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
                    Mã số thuế
                  </label>
                  <input
                    type="text"
                    value={addForm.taxCode}
                    onChange={(e) =>
                      setAddForm({ ...addForm, taxCode: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ghi chú
                  </label>
                  <textarea
                    style={{ resize: "none" }}
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
                  {isCreating ? "Đang thêm..." : "Thêm nhà cung cấp"}
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setAddForm({
                      name: "",
                      contactName: "",
                      phone: "",
                      email: "",
                      address: "",
                      taxCode: "",
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

      {/* Modal xem chi tiết */}
      {showViewModal && selectedSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-emerald-500 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center">
              <h2 className="text-xl font-bold">Chi tiết nhà cung cấp</h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedSupplier(null);
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
                    Tên nhà cung cấp
                  </label>
                  <p className="text-gray-900 font-semibold text-lg">
                    {selectedSupplier.name}
                  </p>
                </div>
                {selectedSupplier.contactName && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Người liên hệ
                    </label>
                    <p className="text-gray-900">
                      {selectedSupplier.contactName}
                    </p>
                  </div>
                )}
                {selectedSupplier.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại
                    </label>
                    <p className="text-gray-900">{selectedSupplier.phone}</p>
                  </div>
                )}
                {selectedSupplier.email && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <p className="text-gray-900">{selectedSupplier.email}</p>
                  </div>
                )}
                {selectedSupplier.address && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Địa chỉ
                    </label>
                    <p className="text-gray-900">{selectedSupplier.address}</p>
                  </div>
                )}
                {selectedSupplier.taxCode && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mã số thuế
                    </label>
                    <p className="text-gray-900">{selectedSupplier.taxCode}</p>
                  </div>
                )}
                {selectedSupplier.note && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ghi chú
                    </label>
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {selectedSupplier.note}
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleEdit(selectedSupplier);
                  }}
                  className="flex-1 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-white rounded-lg font-medium transition"
                >
                  Sửa thông tin
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedSupplier(null);
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
      {showEditModal && selectedSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-yellow-400 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center">
              <h2 className="text-xl font-bold">Sửa thông tin nhà cung cấp</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedSupplier(null);
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
                    Tên nhà cung cấp <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Người liên hệ
                  </label>
                  <input
                    type="text"
                    value={editForm.contactName}
                    onChange={(e) =>
                      setEditForm({ ...editForm, contactName: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) =>
                      setEditForm({ ...editForm, phone: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
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
                    Mã số thuế
                  </label>
                  <input
                    type="text"
                    value={editForm.taxCode}
                    onChange={(e) =>
                      setEditForm({ ...editForm, taxCode: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ghi chú
                  </label>
                  <textarea
                    style={{ resize: "none" }}
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
                  onClick={handleUpdate}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition"
                >
                  {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedSupplier(null);
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
      {showDeleteConfirm && selectedSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4">
            <div className="bg-red-500 text-white px-6 py-4 rounded-t-2xl">
              <h2 className="text-xl font-bold">Xác nhận xóa</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Bạn có chắc chắn muốn xóa nhà cung cấp{" "}
                <strong>{selectedSupplier.name}</strong>?
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
                    setSelectedSupplier(null);
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

export default Suppliers;
