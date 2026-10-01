import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  Eye,
} from "lucide-react";
import { projectorService } from "../../services/projectorService";
import { useToast } from "../../context/ToastContext";
import ProjectorHistoryModal from "../modals/ProjectorHistoryModal";

const statusConfig = {
  AVAILABLE: {
    label: "SẴN SÀNG",
    color: "bg-green-50 text-green-600 border-green-200",
  },
  BORROWED: {
    label: "ĐANG MƯỢN",
    color: "bg-blue-50 text-blue-600 border-blue-200",
  },
  UNDER_MAINTENANCE: {
    label: "ĐANG BẢO TRÌ",
    color: "bg-amber-50 text-amber-600 border-amber-200",
  },
  BROKEN: { label: "ĐÃ HỎNG", color: "bg-red-50 text-red-600 border-red-200" },
};

export default function ProjectorTab() {
  const { showToast } = useToast();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedProjector, setSelectedProjector] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    serialNumber: "",
    note: "",
  });

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
      const res = await projectorService.getAllProjectors(
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
      showToast("Lỗi tải danh sách máy chiếu", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.serialNumber)
      return showToast("Vui lòng nhập đủ thông tin bắt buộc!", "error");
    setIsSaving(true);
    try {
      if (selectedProjector) {
        await projectorService.updateProjector(selectedProjector.id, formData);
        showToast("Cập nhật thành công!");
      } else {
        await projectorService.createProjector(formData);
        showToast("Thêm mới thành công!");
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      showToast(
        error.response?.data?.message || "Lỗi khi lưu dữ liệu!",
        "error",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa máy chiếu này?")) {
      try {
        await projectorService.deleteProjector(id);
        showToast("Đã xóa thành công!");
        fetchData();
      } catch (error) {
        showToast(
          "Không thể xóa do máy chiếu đang có dữ liệu liên quan.",
          "error",
        );
      }
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
              placeholder="Tên máy, Serial..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1a237e] outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1a237e] text-sm text-slate-600 font-medium"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="AVAILABLE">Sẵn sàng</option>
            <option value="BORROWED">Đang mượn</option>
            <option value="UNDER_MAINTENANCE">Đang bảo trì</option>
            <option value="BROKEN">Đã hỏng</option>
          </select>
        </div>
        <button
          onClick={() => {
            setSelectedProjector(null);
            setFormData({ name: "", serialNumber: "", note: "" });
            setIsModalOpen(true);
          }}
          className="bg-[#1a237e] text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center hover:bg-[#0d145e] w-full md:w-auto justify-center shadow-md transition-transform active:scale-95"
        >
          <Plus size={18} className="mr-2" /> THÊM MÁY MỚI
        </button>
      </div>

      <div className="overflow-x-auto min-h-[400px] flex-1 flex flex-col">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <Loader2 size={32} className="animate-spin text-[#1a237e] mb-3" />
            <p>Đang tải danh sách...</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Tên Máy Chiếu</th>
                <th className="px-6 py-4">Số Serial</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((item) => {
                const status = statusConfig[item.status];
                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="px-6 py-4 font-bold text-[#1a237e]">
                      {item.name}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-2.5 py-1 text-xs font-mono font-bold text-slate-800 bg-slate-100 border border-slate-300 rounded-md shadow-xs">
                        S/N: {item.serialNumber || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border ${status.color}`}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          setSelectedProjector(item);
                          setIsHistoryOpen(true);
                        }}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Lịch sử"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedProjector(item);
                          setFormData({
                            name: item.name,
                            serialNumber: item.serialNumber,
                            note: item.note || "",
                          });
                          setIsModalOpen(true);
                        }}
                        className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Sửa"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
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
              className="p-1.5 border border-slate-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-[#1a237e]/50 cursor-pointer mr-4"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <button
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              className="p-2 border border-slate-200 rounded-lg bg-white text-slate-600 disabled:opacity-40 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="px-4 py-2 font-bold text-slate-700">
              Trang {page + 1} / {totalPages || 1}
            </span>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage(page + 1)}
              className="p-2 border border-slate-200 rounded-lg bg-white text-slate-600 disabled:opacity-40 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* CÁC MODAL HIỆN CÓ CỦA BẠN GIỮ NGUYÊN BÊN DƯỚI ... */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-5 border-b flex justify-between items-center bg-[#1a237e] text-white">
              <h3 className="font-bold text-lg">
                {selectedProjector
                  ? "Cập nhật máy chiếu"
                  : "Thêm máy chiếu mới"}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">
                  Tên Máy Chiếu *
                </label>
                <input
                  type="text"
                  className="w-full p-3 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-[#1a237e] outline-none"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">
                  Số Serial *
                </label>
                <input
                  type="text"
                  className="w-full p-3 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-[#1a237e] outline-none"
                  value={formData.serialNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, serialNumber: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="p-5 border-t bg-slate-50 flex space-x-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 bg-white border font-bold text-slate-600 rounded-lg"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 py-3 bg-[#1a237e] text-white font-bold rounded-lg flex justify-center"
              >
                {isSaving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  "Lưu dữ liệu"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <ProjectorHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        projector={selectedProjector}
      />
    </div>
  );
}
