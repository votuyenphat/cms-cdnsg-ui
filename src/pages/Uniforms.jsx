import React, { useState, useEffect, useCallback } from "react";
import {
  Shirt,
  Import,
  ClipboardList,
  BarChart3,
  CalendarCheck,
  CalendarDays,
  ArrowRight,
  Loader2,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { uniformService } from "../services/uniformService";
import UniformCatalogTab from "../components/uniforms/UniformCatalogTab";
import UniformImportTab from "../components/uniforms/UniformImportTab";
import UniformReceiptTab from "../components/uniforms/UniformReceiptTab";
import UniformReportTab from "../components/uniforms/UniformReportTab";

// Hàm lấy chuỗi ngày hiện tại (YYYY-MM-DD) theo múi giờ địa phương
const getTodayStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Hàm định dạng ngày hiển thị (DD/MM/YYYY)
const formatDateDisplay = (dateStr) => {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

export default function Uniforms() {
  const [activeTab, setActiveTab] = useState("catalog");

  // State cho bộ đếm thống kê phiếu xuất
  const [currentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [tabDateFilter, setTabDateFilter] = useState({
    fromDate: "",
    toDate: "",
  });

  const [yearStats, setYearStats] = useState({ count: 0, totalQty: 0 });
  const [selectedStats, setSelectedStats] = useState({
    count: 0,
    totalQty: 0,
  });
  const [loadingStats, setLoadingStats] = useState(false);

  // Hàm tải dữ liệu thống kê theo khoảng ngày (năm / ngày)
  const fetchStatsByRange = async (fromDate, toDate) => {
    // 1. Thử gọi API /stats chuyên biệt siêu tốc (CSDL trả về ngay tức thì)
    try {
      const res = await uniformService.getReceiptStats({ fromDate, toDate });
      if (res?.data && res.data.count !== undefined) {
        return {
          count: res.data.count,
          totalQty: res.data.totalQuantity ?? 0,
        };
      }
    } catch {
      // Bỏ qua lỗi và chuyển sang fallback
    }

    // 2. Fallback: Lấy size=1 để lấy ngay page.totalElements trong ~1s, không bao giờ load cả nghìn bản ghi
    try {
      const fallbackRes = await uniformService.getAllReceipts({
        fromDate,
        toDate,
        page: 0,
        size: 1,
      });
      const pageObj = fallbackRes.data?.page;
      const count = pageObj?.totalElements ?? fallbackRes.data?.totalElements ?? 0;
      return { count, totalQty: 0 };
    } catch (err) {
      console.error("Lỗi tải thống kê phiếu xuất:", fromDate, toDate, err);
      return { count: 0, totalQty: 0 };
    }
  };

  const loadAllStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const [yearData, selData] = await Promise.all([
        fetchStatsByRange(`${currentYear}-01-01`, `${currentYear}-12-31`),
        fetchStatsByRange(selectedDate, selectedDate),
      ]);
      setYearStats(yearData);
      setSelectedStats(selData);
    } catch (err) {
      console.error("Lỗi tải tổng hợp thống kê:", err);
    } finally {
      setLoadingStats(false);
    }
  }, [currentYear, selectedDate]);

  useEffect(() => {
    loadAllStats();
  }, [loadAllStats]);

  // Chuyển sang tab Cấp phát và lọc theo năm nay
  const handleViewReceiptsForYear = (year) => {
    setTabDateFilter({ fromDate: `${year}-01-01`, toDate: `${year}-12-31` });
    setActiveTab("receipt");
  };

  // Chuyển sang tab Cấp phát và lọc theo ngày đã chọn
  const handleViewReceiptsForDate = (date) => {
    setTabDateFilter({ fromDate: date, toDate: date });
    setActiveTab("receipt");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* HEADER WIDGET: THỐNG KÊ PHIẾU XUẤT KHO / CẤP PHÁT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CARD 1: SỐ PHIẾU XUẤT TRONG NĂM NAY */}
        <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-white p-5 rounded-2xl border border-amber-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold uppercase tracking-wide">
                <CalendarCheck size={14} className="text-amber-700" />
                Năm {currentYear}
              </span>
              <h4 className="text-slate-600 font-semibold text-sm mt-3">
                Số phiếu xuất trong năm nay
              </h4>
            </div>
            <div className="p-3 bg-amber-500 text-white rounded-xl shadow-md shadow-amber-500/20">
              <TrendingUp size={24} />
            </div>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <div className="text-3xl font-black text-slate-800 tracking-tight">
                {loadingStats ? (
                  <Loader2
                    size={28}
                    className="animate-spin text-amber-600 inline"
                  />
                ) : (
                  yearStats.count
                )}{" "}
                <span className="text-lg font-semibold text-slate-500">
                  phiếu
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Tổng cộng:{" "}
                <span className="font-bold text-amber-700">
                  {yearStats.totalQty} cái
                </span>{" "}
                đồng phục
              </p>
            </div>
            <button
              onClick={() => handleViewReceiptsForYear(currentYear)}
              className="text-xs font-bold text-amber-700 hover:text-amber-900 bg-amber-100 hover:bg-amber-200 px-3 py-2 rounded-lg transition-colors inline-flex items-center gap-1"
            >
              Xem chi tiết <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* CARD 2: CHỌN NGÀY ĐỂ XEM SỐ PHIẾU XUẤT */}
        <div className="bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-white p-5 rounded-2xl border border-indigo-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-bold uppercase tracking-wide">
                <CalendarDays size={14} className="text-indigo-700" />
                Tra cứu theo ngày
              </span>
              <div className="mt-2.5 flex items-center gap-2">
                <label className="text-xs font-bold text-slate-600 whitespace-nowrap">
                  Chọn ngày:
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-indigo-200 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm cursor-pointer"
                />
              </div>
            </div>
            <button
              onClick={loadAllStats}
              title="Làm mới số liệu"
              className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
            >
              <RefreshCw
                size={18}
                className={loadingStats ? "animate-spin" : ""}
              />
            </button>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <div className="text-3xl font-black text-slate-800 tracking-tight">
                {loadingStats ? (
                  <Loader2
                    size={28}
                    className="animate-spin text-indigo-600 inline"
                  />
                ) : (
                  selectedStats.count
                )}{" "}
                <span className="text-lg font-semibold text-slate-500">
                  phiếu
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Ngày {formatDateDisplay(selectedDate)}:{" "}
                <span className="font-bold text-indigo-700">
                  {selectedStats.totalQty} cái
                </span>{" "}
                đồng phục
              </p>
            </div>
            <button
              onClick={() => handleViewReceiptsForDate(selectedDate)}
              className="text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-100 hover:bg-indigo-200 px-3 py-2 rounded-lg transition-colors inline-flex items-center gap-1"
            >
              Xem phiếu ngày này <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm inline-flex w-full overflow-x-auto">
        <button
          onClick={() => setActiveTab("catalog")}
          className={`flex items-center justify-center px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === "catalog"
              ? "bg-indigo-600 text-white shadow-md"
              : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          <Shirt size={18} className="mr-2" /> DANH MỤC ĐỒNG PHỤC
        </button>
        <button
          onClick={() => setActiveTab("import")}
          className={`flex items-center justify-center px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === "import"
              ? "bg-emerald-600 text-white shadow-md"
              : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          <Import size={18} className="mr-2" /> NHẬP KHO
        </button>
        <button
          onClick={() => setActiveTab("receipt")}
          className={`flex items-center justify-center px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === "receipt"
              ? "bg-amber-600 text-white shadow-md"
              : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          <ClipboardList size={18} className="mr-2" /> CẤP PHÁT / XUẤT
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          className={`flex items-center justify-center px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === "stats"
              ? "bg-slate-700 text-white shadow-md"
              : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          <BarChart3 size={18} className="mr-2" /> THỐNG KÊ TỒN
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === "catalog" && <UniformCatalogTab />}
        {activeTab === "import" && <UniformImportTab />}
        {activeTab === "receipt" && (
          <UniformReceiptTab
            onReceiptChange={loadAllStats}
            initialFromDate={tabDateFilter.fromDate}
            initialToDate={tabDateFilter.toDate}
          />
        )}
        {activeTab === "stats" && <UniformReportTab />}
      </div>
    </div>
  );
}
