import React, { useState, useEffect } from "react";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  Edit,
  ArrowRightLeft,
  Search,
  Eye,
  Trash2, // Thêm icon Trash2 để làm nút Xóa
  MonitorPlay,
} from "lucide-react";
import { projectorService } from "../../services/projectorService";
import { useToast } from "../../context/ToastContext";

export default function BorrowTab() {
  const { showToast } = useToast();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectors, setProjectors] = useState([]);

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [isBorrowOpen, setIsBorrowOpen] = useState(false);
  const [isViewEditOpen, setIsViewEditOpen] = useState(false);
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false); // Thêm state cho Modal Sửa

  const [selectedLoan, setSelectedLoan] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const getCurrentDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const [borrowForm, setBorrowForm] = useState({
    projectorIds: [],
    borrower: "",
    borrowDate: getCurrentDateTime(), // Cập nhật ở đây
    note: "",
  });

  // Form dành cho việc Edit
  const [editForm, setEditForm] = useState({
    borrower: "",
    borrowDate: "", // Thêm trường này vào editForm
    note: "",
  });

  const [returnNote, setReturnNote] = useState("");
  const [returnNextStatus, setReturnNextStatus] = useState("AVAILABLE");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    setPage(0);
  }, [filterStatus, size]);

  useEffect(() => {
    fetchData();
  }, [page, size, debouncedSearch, filterStatus]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await projectorService.getAllLoans(
        page,
        size,
        "id",
        "desc",
        debouncedSearch,
        filterStatus,
      );
      setData(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setTotalElements(res.data.totalElements || 0);
    } catch (error) {
      showToast("Lỗi tải danh sách mượn trả", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableProjectors = async () => {
    try {
      const res = await projectorService.getAllProjectors(
        0,
        1000,
        "id",
        "desc",
        "",
        "AVAILABLE",
      );
      setProjectors(res.data.content || []);
    } catch (error) {
      console.log(error);
    }
  };

  const openBorrowModal = () => {
    loadAvailableProjectors();
    setBorrowForm({
      projectorIds: [],
      borrower: "",
      borrowDate: new Date().toISOString().split("T")[0],
      note: "",
    });
    setIsBorrowOpen(true);
  };

  // --- HÀM MỚI: Mở modal Sửa ---
  const openEditModal = (loan) => {
    setSelectedLoan(loan);
    setEditForm({
      borrower: loan.borrower || "",
      note: loan.note || "",
    });
    setIsEditOpen(true);
  };

  // --- HÀM MỚI: Submit Sửa ---
  const submitEdit = async () => {
    setIsSaving(true);
    try {
      // Giả định service có hàm updateLoan
      await projectorService.updateLoan(selectedLoan.id, editForm);
      showToast("Cập nhật phiếu mượn thành công!");
      setIsEditOpen(false);
      fetchData();
    } catch (error) {
      showToast("Lỗi khi cập nhật phiếu mượn", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // --- HÀM MỚI: Xóa phiếu mượn ---
  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn xóa phiếu mượn này? Hành động này không thể hoàn tác.",
      )
    )
      return;
    try {
      // Giả định service có hàm deleteLoan
      await projectorService.deleteLoan(id);
      showToast("Đã xóa phiếu mượn thành công!");
      fetchData();
    } catch (error) {
      showToast("Lỗi khi xóa phiếu mượn", "error");
    }
  };

  const submitBorrow = async () => {
    if (borrowForm.projectorIds.length === 0 || !borrowForm.borrower)
      return showToast("Vui lòng chọn máy chiếu và người mượn!", "error");
    setIsSaving(true);
    try {
      await projectorService.borrowProjector(borrowForm);
      showToast("Đã tạo phiếu mượn thành công!");
      setIsBorrowOpen(false);
      fetchData();
    } catch (error) {
      showToast(error.response?.data?.message || "Lỗi tạo phiếu mượn", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const openReturnModal = (loan) => {
    setSelectedLoan(loan);
    setReturnNote("");
    setReturnNextStatus("AVAILABLE");
    setIsReturnOpen(true);
  };

  const openViewModal = (loan) => {
    setSelectedLoan(loan);
    setIsViewEditOpen(true);
  };

  const submitReturn = async () => {
    setIsSaving(true);
    try {
      await projectorService.returnProjector(
        selectedLoan.id,
        returnNote,
        returnNextStatus,
      );
      showToast("Đã thu hồi máy chiếu thành công!");
      setIsReturnOpen(false);
      fetchData();
    } catch (error) {
      showToast("Lỗi thu hồi", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full animate-in fade-in duration-300">
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Người mượn, tên máy..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-600 font-medium"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="BORROWED">Đang cho mượn</option>
            <option value="RETURNED">Đã trả</option>
          </select>
        </div>
        <button
          onClick={openBorrowModal}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center hover:bg-blue-700 justify-center shadow-md transition-transform active:scale-95"
        >
          <ArrowRightLeft size={18} className="mr-2" /> TẠO PHIẾU MƯỢN
        </button>
      </div>

      <div className="overflow-x-auto min-h-[400px] flex-1 flex flex-col">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <Loader2 size={32} className="animate-spin text-blue-600 mb-3" />
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Mã Phiếu</th>
                <th className="px-6 py-4">Máy chiếu</th>
                <th className="px-6 py-4">Người mượn</th>
                <th className="px-6 py-4 text-center">Tình trạng</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50 transition-colors group"
                >
                  <td className="px-6 py-4 font-bold text-slate-500">
                    #{item.id}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-[#1a237e] text-sm">{item.projector.name}</span>
                    <br />
                    <span className="inline-block mt-0.5 px-2 py-0.5 text-xs font-mono font-bold text-slate-800 bg-slate-100 border border-slate-300 rounded shadow-xs">
                      S/N: {item.projector.serialNumber || "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-700">
                    {item.borrower} <br />
                    <span className="text-[10px] text-slate-400 font-normal">
                      Ngày: {item.borrowDate}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {/* Bắt chuẩn cả 2 trường hợp tên status để tránh lỗi */}
                    {item.status === "BORROWING" ||
                    item.status === "BORROWED" ? (
                      <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg border bg-blue-50 text-blue-600 border-blue-200">
                        ĐANG MƯỢN
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg border bg-green-50 text-green-600 border-green-200">
                        ĐÃ TRẢ
                      </span>
                    )}
                  </td>

                  {/* FIX LỖI: Đã gộp 2 thẻ <td> thao tác thành 1 */}
                  <td className="px-6 py-4 flex justify-end items-center space-x-2">
                    <button
                      onClick={() => openViewModal(item)}
                      className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors flex items-center justify-center"
                      title="Xem chi tiết"
                    >
                      <Eye size={18} />
                    </button>

                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 text-amber-500 hover:bg-amber-100 rounded-lg transition-colors flex items-center justify-center"
                      title="Sửa thông tin"
                    >
                      <Edit size={18} />
                    </button>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors flex items-center justify-center"
                      title="Xóa phiếu"
                    >
                      <Trash2 size={18} />
                    </button>

                    {(item.status === "BORROWED" ||
                      item.status === "BORROWING") && (
                      <button
                        onClick={() => openReturnModal(item)}
                        className="px-3 py-1.5 bg-green-100 text-green-700 font-bold text-xs rounded-lg hover:bg-green-200 transition-colors ml-2"
                      >
                        THU HỒI
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* THANH PHÂN TRANG */}
      {!loading && data.length > 0 && (
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm mt-auto">
          <span className="text-slate-500 font-medium">
            Hiển thị{" "}
            <span className="font-bold text-slate-800">{data.length}</span>{" "}
            trong tổng số{" "}
            <span className="font-bold text-slate-800">{totalElements}</span>{" "}
            bản ghi
          </span>
          <div className="flex items-center gap-2">
            <span className="mr-2 text-slate-500">Số dòng/trang:</span>
            <select
              value={size}
              onChange={(e) => {
                setSize(Number(e.target.value));
                setPage(0);
              }}
              className="p-1.5 border border-slate-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer mr-4"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <button
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              className="p-2 border border-slate-200 rounded-lg bg-white text-slate-600 disabled:opacity-40 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="px-4 py-2 font-bold text-slate-700">
              Trang {page + 1} / {totalPages || 1}
            </span>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage(page + 1)}
              className="p-2 border border-slate-200 rounded-lg bg-white text-slate-600 disabled:opacity-40 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* MODAL TẠO PHIẾU MƯỢN */}
      {isBorrowOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-5 border-b flex justify-between items-center bg-blue-600 text-white">
              <h3 className="font-bold text-lg flex items-center">
                <ArrowRightLeft className="mr-2" size={20} /> Tạo Phiếu Mượn
              </h3>
              <button onClick={() => setIsBorrowOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">
                  Chọn Máy Chiếu * (Có thể chọn nhiều)
                </label>
                <div className="bg-slate-50 p-3 rounded-xl border max-h-48 overflow-y-auto space-y-2">
                  {projectors.length === 0 ? (
                    <p className="text-sm text-red-500 italic">
                      Không có máy chiếu nào đang SẴN SÀNG.
                    </p>
                  ) : (
                    projectors.map((p) => (
                      <label
                        key={p.id}
                        className="flex items-center space-x-3 p-2 hover:bg-white rounded-lg cursor-pointer border border-transparent hover:border-slate-200 transition-all"
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-blue-600"
                          checked={borrowForm.projectorIds.includes(p.id)}
                          onChange={(e) => {
                            const ids = e.target.checked
                              ? [...borrowForm.projectorIds, p.id]
                              : borrowForm.projectorIds.filter(
                                  (id) => id !== p.id,
                                );
                            setBorrowForm({ ...borrowForm, projectorIds: ids });
                          }}
                        />
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-sm">{p.name}</span>
                          <span className="px-2 py-0.5 text-xs font-mono font-bold bg-slate-200 text-slate-800 rounded border border-slate-300">
                            S/N: {p.serialNumber || "N/A"}
                          </span>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">
                    Người mượn *
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 bg-slate-50 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    value={borrowForm.borrower}
                    onChange={(e) =>
                      setBorrowForm({ ...borrowForm, borrower: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">
                    Ngày mượn *
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full p-3 bg-slate-50 border rounded-lg outline-none"
                    value={borrowForm.borrowDate}
                    onChange={(e) =>
                      setBorrowForm({
                        ...borrowForm,
                        borrowDate: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>
            <div className="p-4 border-t bg-slate-50 flex space-x-3">
              <button
                onClick={() => setIsBorrowOpen(false)}
                className="flex-1 py-3 border font-bold text-slate-600 rounded-lg hover:bg-white"
              >
                Hủy
              </button>
              <button
                onClick={submitBorrow}
                disabled={isSaving || borrowForm.projectorIds.length === 0}
                className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 flex justify-center items-center shadow-md"
              >
                {isSaving ? (
                  <Loader2 size={18} className="animate-spin mr-2" />
                ) : (
                  "Tạo phiếu mượn"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL THU HỒI */}
      {isReturnOpen && selectedLoan && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b flex justify-between items-center bg-green-600 text-white">
              <h3 className="font-bold text-lg">Thu hồi máy chiếu</h3>
              <button onClick={() => setIsReturnOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-sm">
                <p>
                  Thu hồi máy:{" "}
                  <span className="font-bold text-green-700">
                    {selectedLoan.projector.name}
                  </span>
                </p>
                <p>
                  Từ người mượn:{" "}
                  <span className="font-bold text-green-700">
                    {selectedLoan.borrower}
                  </span>
                </p>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">
                  Tình trạng sau khi trả *
                </label>
                <select
                  className="w-full p-3 bg-slate-50 border rounded-lg outline-none focus:ring-2 focus:ring-green-500 font-medium"
                  value={returnNextStatus}
                  onChange={(e) => setReturnNextStatus(e.target.value)}
                >
                  <option value="AVAILABLE">Tốt - Đưa về kho (Sẵn sàng)</option>
                  <option value="UNDER_MAINTENANCE">
                    Lỗi nhẹ - Chuyển sang Bảo trì
                  </option>
                  <option value="BROKEN">Hư hỏng nặng - Báo hỏng</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">
                  Ghi chú tình trạng
                </label>
                <textarea
                  className="w-full p-3 bg-slate-50 border rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                  rows="3"
                  value={returnNote}
                  onChange={(e) => setReturnNote(e.target.value)}
                  placeholder="Máy xước vỏ..."
                />
              </div>
            </div>
            <div className="p-4 border-t bg-slate-50 flex space-x-3">
              <button
                onClick={() => setIsReturnOpen(false)}
                className="flex-1 py-2.5 border font-bold text-slate-600 rounded-xl hover:bg-white"
              >
                Hủy
              </button>
              <button
                onClick={submitReturn}
                disabled={isSaving}
                className="flex-1 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 flex justify-center items-center shadow-md"
              >
                {isSaving ? (
                  <Loader2 size={18} className="animate-spin mr-2" />
                ) : (
                  "Hoàn tất thu hồi"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SỬA PHIẾU MƯỢN */}
      {isEditOpen && selectedLoan && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b flex justify-between items-center bg-amber-500 text-white">
              <h3 className="font-bold text-lg flex items-center">
                <Edit className="mr-2" size={20} /> Sửa Phiếu Mượn #
                {selectedLoan.id}
              </h3>
              <button onClick={() => setIsEditOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">
                  Người mượn *
                </label>
                <input
                  type="text"
                  className="w-full p-3 bg-slate-50 border rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
                  value={editForm.borrower}
                  onChange={(e) =>
                    setEditForm({ ...editForm, borrower: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">
                  Ngày & Giờ mượn *
                </label>
                <input
                  type="datetime-local"
                  className="w-full p-3 bg-slate-50 border rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
                  value={editForm.borrowDate}
                  onChange={(e) =>
                    setEditForm({ ...editForm, borrowDate: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">
                  Ghi chú
                </label>
                <textarea
                  className="w-full p-3 bg-slate-50 border rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
                  rows="3"
                  value={editForm.note}
                  onChange={(e) =>
                    setEditForm({ ...editForm, note: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="p-4 border-t bg-slate-50 flex space-x-3">
              <button
                onClick={() => setIsEditOpen(false)}
                className="flex-1 py-2.5 border font-bold text-slate-600 rounded-xl hover:bg-white"
              >
                Hủy
              </button>
              <button
                onClick={submitEdit}
                disabled={isSaving}
                className="flex-1 py-2.5 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 shadow-md flex justify-center items-center"
              >
                {isSaving ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  "Lưu thay đổi"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL XEM CHI TIẾT */}
      {isViewEditOpen && selectedLoan && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b flex justify-between items-center bg-slate-100 text-slate-800">
              <h3 className="font-bold text-lg flex items-center">
                <Eye className="mr-2 text-slate-600" size={20} /> Chi tiết Phiếu
                Mượn #{selectedLoan.id}
              </h3>
              <button
                onClick={() => setIsViewEditOpen(false)}
                className="hover:text-red-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm text-slate-700">
              <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-4">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">
                    Máy chiếu
                  </p>
                  <p className="font-bold text-[#1a237e]">
                    {selectedLoan.projector.name}
                  </p>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    SN: {selectedLoan.projector.numberSerial}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">
                    Người mượn
                  </p>
                  <p className="font-bold">{selectedLoan.borrower}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Ngày mượn: {selectedLoan.borrowDate}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">
                  Trạng thái hiện tại
                </p>
                {selectedLoan.status === "BORROWED" ||
                selectedLoan.status === "BORROWING" ? (
                  <span className="inline-block px-2.5 py-1 text-[11px] font-bold rounded-lg border bg-blue-50 text-blue-600 border-blue-200">
                    ĐANG MƯỢN
                  </span>
                ) : (
                  <span className="inline-block px-2.5 py-1 text-[11px] font-bold rounded-lg border bg-green-50 text-green-600 border-green-200">
                    ĐÃ TRẢ
                  </span>
                )}
              </div>

              {/* Nếu đã trả thì hiển thị thêm thông tin thu hồi */}
              {selectedLoan.status === "RETURNED" && (
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mt-2 space-y-2">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">
                      Ngày trả
                    </p>
                    <p className="font-medium">
                      {selectedLoan.returnDate || "Chưa cập nhật"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">
                      Ghi chú lúc trả
                    </p>
                    <p className="italic text-slate-600">
                      {selectedLoan.returnNote || "Không có ghi chú"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t bg-slate-50 flex justify-end">
              <button
                onClick={() => setIsViewEditOpen(false)}
                className="px-5 py-2 bg-slate-200 font-bold text-slate-600 rounded-xl hover:bg-slate-300 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
