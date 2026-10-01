import React, { useState, useEffect } from "react";
import { X, Loader2, CalendarClock, History, Wrench } from "lucide-react";
import { projectorService } from "../../services/projectorService";

export default function ProjectorHistoryModal({ isOpen, onClose, projector }) {
  const [loans, setLoans] = useState([]);
  const [maintenances, setMaintenances] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  useEffect(() => {
    if (isOpen && projector?.id) {
      setLoading(true);
      Promise.all([
        projectorService.getLoanHistoryByProjector(projector.id),
        projectorService.getMaintenanceHistory(projector.id),
      ])
        .then(([loanRes, maintRes]) => {
          const loanData = loanRes?.data ?? (Array.isArray(loanRes) ? loanRes : []);
          const maintData = maintRes?.data ?? (Array.isArray(maintRes) ? maintRes : []);
          setLoans(Array.isArray(loanData) ? loanData : []);
          setMaintenances(Array.isArray(maintData) ? maintData : []);
        })
        .catch((err) => {
          console.error("Lỗi khi tải lịch sử máy chiếu:", err);
          setLoans([]);
          setMaintenances([]);
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, projector]);

  if (!isOpen || !projector) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
        <div className="p-5 border-b bg-[#1a237e] text-white flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2">
              <CalendarClock size={22} className="text-amber-400" />
              Lịch sử thiết bị: {projector.name}
            </h3>
            <p className="text-xs text-indigo-200 mt-0.5">
              Số serial: <span className="font-mono font-semibold text-white">{projector.serialNumber || "N/A"}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/80 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto bg-slate-50 flex flex-col md:flex-row gap-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center w-full py-16 text-slate-400">
              <Loader2 className="animate-spin text-[#1a237e] mb-3" size={36} />
              <p className="text-sm font-medium">Đang tải lịch sử mượn trả & bảo trì...</p>
            </div>
          ) : (
            <>
              {/* LỊCH SỬ MƯỢN TRẢ */}
              <div className="flex-1 bg-white p-5 rounded-xl shadow-sm border border-slate-200/80">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                  <h4 className="font-bold text-indigo-800 flex items-center text-sm uppercase tracking-wide">
                    <History size={18} className="mr-2 text-indigo-600" /> Lịch sử mượn trả
                  </h4>
                  <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full">
                    {loans.length} lượt
                  </span>
                </div>
                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                  {loans.map((l) => (
                    <div
                      key={l.id}
                      className="text-sm border-l-4 border-indigo-500 bg-indigo-50/30 p-3 rounded-r-lg space-y-1"
                    >
                      <div className="flex justify-between items-start">
                        <p className="font-bold text-slate-800">
                          {l.borrower || "Chưa rõ người mượn"}
                        </p>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            l.status === "BORROWING" || !l.returnDate
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {l.status === "BORROWING" || !l.returnDate ? "Đang mượn" : "Đã trả"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        <span className="font-medium text-slate-700">Mượn:</span> {formatDate(l.borrowDate) || "N/A"}
                      </p>
                      {l.returnDate && (
                        <p className="text-xs text-slate-600">
                          <span className="font-medium text-slate-700">Trả:</span> {formatDate(l.returnDate)}
                        </p>
                      )}
                      {l.note && (
                        <p className="text-xs text-slate-500 italic pt-1 border-t border-slate-100">
                          {l.note}
                        </p>
                      )}
                    </div>
                  ))}
                  {loans.length === 0 && (
                    <div className="text-center py-8 text-slate-400">
                      <p className="text-xs">Thiết bị chưa từng có lịch sử mượn trả.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* LỊCH SỬ BẢO TRÌ */}
              <div className="flex-1 bg-white p-5 rounded-xl shadow-sm border border-slate-200/80">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                  <h4 className="font-bold text-amber-800 flex items-center text-sm uppercase tracking-wide">
                    <Wrench size={18} className="mr-2 text-amber-600" /> Lịch sử bảo trì
                  </h4>
                  <span className="text-xs bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-full">
                    {maintenances.length} đợt
                  </span>
                </div>
                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                  {maintenances.map((m) => (
                    <div
                      key={m.id}
                      className="text-sm border-l-4 border-amber-500 bg-amber-50/30 p-3 rounded-r-lg space-y-1"
                    >
                      <div className="flex justify-between items-start">
                        <p className="font-bold text-slate-800">
                          {m.ticket?.startDate ? formatDate(m.ticket.startDate) : "N/A"}
                        </p>
                        {m.ticket?.ticketCode && (
                          <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                            {m.ticket.ticketCode}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600">
                        {m.description || "Bảo trì định kỳ thiết bị"}
                      </p>
                      {m.ticket?.technician && (
                        <p className="text-xs text-slate-500">
                          Kỹ thuật viên: <span className="font-medium text-slate-700">{m.ticket.technician}</span>
                        </p>
                      )}
                    </div>
                  ))}
                  {maintenances.length === 0 && (
                    <div className="text-center py-8 text-slate-400">
                      <p className="text-xs">Thiết bị chưa từng qua bảo trì, sửa chữa.</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
