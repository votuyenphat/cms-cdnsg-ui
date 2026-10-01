import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  AlertTriangle,
  MonitorPlay,
  Flame,
  ArrowRight,
  ShieldAlert,
  Timer,
  CheckCircle,
  PackageOpen,
  Loader2,
  ShieldCheck,
  TrendingUp,
  ArrowDownLeft, // Icon cho Nhập kho
  ArrowUpRight, // Icon cho Xuất kho
  History, // Icon cho Lịch sử
  CalendarDays,
} from "lucide-react";
import { materialService } from "../services/materialService";
import { projectorService } from "../services/projectorService";
import { fireExtinguisherService } from "../services/fireExtinguisherService";

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // States chứa dữ liệu
  const [materialStats, setMaterialStats] = useState({
    totalTypes: 0,
    totalItems: 0,
    lowStockCount: 0,
  });
  const [projectorStats, setProjectorStats] = useState({
    total: 0,
    available: 0,
    borrowed: 0,
    under_maintenance: 0,
    broken: 0,
  });
  const [fireStats, setFireStats] = useState({ ok: 0, warning: 0, expired: 0 });

  // Danh sách chi tiết cho phần Cảnh báo
  const [topMaterials, setTopMaterials] = useState([]);
  const [fireWarningList, setFireWarningList] = useState([]);
  const [recentActivities, setRecentActivities] = useState({
    recentImports: [],
    recentExports: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = () => {
    setLoading(true);

    const pMat = materialService.getMaterialStats()
      .then((res) => { if (res.data) setMaterialStats(res.data); })
      .catch((err) => console.error("Lỗi getMaterialStats:", err));

    const pProj = projectorService.getProjectorStats()
      .then((res) => { if (res.data) setProjectorStats(res.data); })
      .catch((err) => console.error("Lỗi getProjectorStats:", err));

    const pFire = fireExtinguisherService.getStats()
      .then((res) => { if (res.data) setFireStats(res.data); })
      .catch((err) => console.error("Lỗi getStats PCCC:", err));

    const pTop = materialService.getTopExportedMaterials()
      .then((res) => { if (res.data) setTopMaterials(res.data); })
      .catch((err) => console.error("Lỗi getTopExportedMaterials:", err));

    const pFireAdv = fireExtinguisherService.getAdvancedStats()
      .then((res) => {
        const warnings = (res.data || []).filter((item) => {
          if (!item.minNextRechargeDate) return false;
          return (
            new Date(item.minNextRechargeDate) <
            new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000)
          );
        });
        setFireWarningList(warnings);
      })
      .catch((err) => console.error("Lỗi getAdvancedStats PCCC:", err));

    const pActs = materialService.getRecentActivities()
      .then((res) => { if (res.data) setRecentActivities(res.data); })
      .catch((err) => console.error("Lỗi getRecentActivities:", err));

    Promise.allSettled([pMat, pProj, pFire, pTop, pFireAdv, pActs]).finally(() => {
      setLoading(false);
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 slide-in-from-bottom-4">
      {loading && (
        <div className="flex items-center text-xs text-indigo-600 bg-indigo-50/80 border border-indigo-100 px-3 py-1.5 rounded-lg w-fit animate-pulse">
          <Loader2 size={13} className="animate-spin mr-2" /> Đang cập nhật dữ liệu mới nhất...
        </div>
      )}
      {/* KHU VỰC 1: CARD TỔNG QUAN (THỐNG KÊ VẬT TƯ) */}
      <h2 className="text-lg font-bold text-slate-800 flex items-center">
        <Package className="mr-2 text-indigo-600" /> Tổng quan Vật tư
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Thẻ: Tổng số lượng vật tư */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Tổng Số Lượng Hàng
            </p>
            <p className="text-3xl font-black text-slate-800">
              {materialStats.totalItems}
            </p>
          </div>
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-xl">
            <PackageOpen size={32} />
          </div>
        </div>

        {/* Thẻ: Tổng số loại vật tư */}
        <div
          onClick={() => navigate("/inventory")}
          className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group"
        >
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Tổng Số Mã Hàng
            </p>
            <p className="text-3xl font-black text-slate-800">
              {materialStats.totalTypes}
            </p>
          </div>
          <div className="p-4 bg-slate-50 text-slate-600 rounded-xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
            <Package size={32} />
          </div>
        </div>

        {/* Thẻ: Cảnh báo sắp hết */}
        <div
          onClick={() => navigate("/inventory")}
          className="bg-gradient-to-br from-orange-50 to-red-50 p-5 rounded-2xl shadow-sm border border-orange-100 flex items-center justify-between hover:shadow-md hover:border-orange-300 transition-all cursor-pointer group"
        >
          <div>
            <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">
              Vật tư sắp hết / Cần nhập
            </p>
            <p className="text-3xl font-black text-red-600">
              {materialStats.lowStockCount}
            </p>
          </div>
          <div className="p-4 bg-white text-orange-500 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
            <AlertTriangle size={32} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* KHU VỰC 2: CẢNH BÁO VẬT TƯ SẮP HẾT */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800 flex items-center">
              <TrendingUp size={18} className="mr-2 text-indigo-500" /> Top 10
              Vật Tư Sử Dụng Nhiều
            </h3>
            <button
              onClick={() => navigate("/inventory")}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center"
            >
              Xem kho <ArrowRight size={14} className="ml-1" />
            </button>
          </div>
          <div className="p-0 flex-1">
            {topMaterials.length === 0 ? (
              <div className="p-10 text-center text-slate-400 flex flex-col items-center">
                <PackageOpen size={40} className="text-slate-300 mb-2" />
                <p className="font-medium text-sm">Chưa có dữ liệu xuất kho.</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {topMaterials.map((item, index) => (
                  <li
                    key={item.material.id}
                    className="p-4 flex justify-between items-center hover:bg-indigo-50/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {/* Số thứ tự xếp hạng */}
                      <span className="text-lg font-black text-slate-300 w-5 text-center">
                        #{index + 1}
                      </span>
                      <div>
                        <p className="font-bold text-slate-800">
                          {item.material.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          Đơn vị: {item.material.unit?.name || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {/* Tổng số lượng đã xuất */}
                      <p className="text-lg font-black text-indigo-600">
                        {item.totalExportedQuantity}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">
                        Đã xuất
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* KHU VỰC 4: LỊCH SỬ GIAO DỊCH (NHẬP/XUẤT GẦN NHẤT) */}
        <div className="mt-8 space-y-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center">
            <History className="mr-2 text-indigo-600" /> Hoạt động Nhập/Xuất gần
            đây
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CỘT 1: 10 VẬT TƯ NHẬP GẦN NHẤT */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100 flex items-center bg-emerald-50/50">
                <ArrowDownLeft size={18} className="mr-2 text-emerald-600" />
                <h3 className="font-bold text-emerald-800">
                  10 Vật tư Nhập gần nhất
                </h3>
              </div>
              <div className="p-0 flex-1">
                {recentActivities.recentImports.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-sm">
                    Chưa có giao dịch nhập kho.
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {recentActivities.recentImports.map((item, idx) => (
                      <li
                        key={idx}
                        className="p-4 hover:bg-slate-50 transition-colors flex justify-between items-center"
                      >
                        <div>
                          <p className="font-bold text-slate-800">
                            {item.materialName}
                          </p>
                          <p className="text-xs text-slate-500 mt-1 flex items-center">
                            <CalendarDays size={12} className="mr-1" />{" "}
                            {item.transactionDate}
                            <span className="mx-2 text-slate-300">|</span>
                            Mã:{" "}
                            <span className="font-semibold text-slate-600 ml-1">
                              {item.receiptCode}
                            </span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-emerald-600">
                            +{item.quantity}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">
                            {item.unitName}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* CỘT 2: 10 VẬT TƯ XUẤT GẦN NHẤT */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100 flex items-center bg-amber-50/50">
                <ArrowUpRight size={18} className="mr-2 text-amber-600" />
                <h3 className="font-bold text-amber-800">
                  10 Vật tư Xuất gần nhất
                </h3>
              </div>
              <div className="p-0 flex-1">
                {recentActivities.recentExports.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-sm">
                    Chưa có giao dịch xuất kho.
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {recentActivities.recentExports.map((item, idx) => (
                      <li
                        key={idx}
                        className="p-4 hover:bg-slate-50 transition-colors flex justify-between items-center"
                      >
                        <div>
                          <p className="font-bold text-slate-800">
                            {item.materialName}
                          </p>
                          <p className="text-xs text-slate-500 mt-1 flex items-center">
                            <CalendarDays size={12} className="mr-1" />{" "}
                            {item.transactionDate}
                            <span className="mx-2 text-slate-300">|</span>
                            Mã:{" "}
                            <span className="font-semibold text-slate-600 ml-1">
                              {item.receiptCode}
                            </span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-amber-600">
                            -{item.quantity}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">
                            {item.unitName}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* KHU VỰC 3: TRẠNG THÁI THIẾT BỊ (MÁY CHIẾU & PCCC) */}
        <div className="space-y-6">
          {/* Máy chiếu */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800 flex items-center">
                <MonitorPlay size={18} className="mr-2 text-blue-500" /> Quản lý
                Máy Chiếu
              </h3>
              <button
                onClick={() => navigate("/projectors")}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center"
              >
                Quản lý <ArrowRight size={14} className="ml-1" />
              </button>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4">
              <div
                className="bg-green-50 p-4 rounded-xl border border-green-100 text-center cursor-pointer hover:bg-green-100 transition-colors"
                onClick={() => navigate("/projectors")}
              >
                <p className="text-2xl font-black text-green-700">
                  {projectorStats.available}
                </p>
                <p className="text-xs font-bold text-green-600 uppercase mt-1">
                  Sẵn sàng
                </p>
              </div>
              <div
                className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center cursor-pointer hover:bg-blue-100 transition-colors"
                onClick={() => navigate("/projectors")}
              >
                <p className="text-2xl font-black text-blue-700">
                  {projectorStats.borrowed}
                </p>
                <p className="text-xs font-bold text-blue-600 uppercase mt-1">
                  Đang Mượn
                </p>
              </div>
              <div
                className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-center cursor-pointer hover:bg-amber-100 transition-colors"
                onClick={() => navigate("/projectors")}
              >
                <p className="text-2xl font-black text-amber-700">
                  {projectorStats.under_maintenance}
                </p>
                <p className="text-xs font-bold text-amber-600 uppercase mt-1">
                  Bảo trì
                </p>
              </div>
              <div
                className="bg-red-50 p-4 rounded-xl border border-red-100 text-center cursor-pointer hover:bg-red-100 transition-colors"
                onClick={() => navigate("/projectors")}
              >
                <p className="text-2xl font-black text-red-700">
                  {projectorStats.broken}
                </p>
                <p className="text-xs font-bold text-red-600 uppercase mt-1">
                  Hư hỏng
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Bình chữa cháy */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800 flex items-center">
                <Flame size={18} className="mr-2 text-red-500" /> Bình Chữa Cháy
                (PCCC)
              </h3>
              <button
                onClick={() => navigate("/fire-extinguishers")}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center"
              >
                Báo cáo <ArrowRight size={14} className="ml-1" />
              </button>
            </div>

            {/* ---> BẮT ĐẦU: KHU VỰC THỐNG KÊ PCCC THÊM MỚI <--- */}
            <div className="p-5 grid grid-cols-3 gap-3 border-b border-slate-100">
              <div
                className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-center cursor-pointer hover:bg-emerald-100 transition-colors"
                onClick={() => navigate("/fire-extinguishers")}
              >
                <ShieldCheck
                  size={24}
                  className="mx-auto text-emerald-600 mb-1"
                />
                <p className="text-2xl font-black text-emerald-700">
                  {fireStats.ok}
                </p>
                <p className="text-[10px] font-bold text-emerald-600 uppercase mt-1">
                  An Toàn
                </p>
              </div>
              <div
                className="bg-amber-50 p-3 rounded-xl border border-amber-100 text-center cursor-pointer hover:bg-amber-100 transition-colors"
                onClick={() => navigate("/fire-extinguishers")}
              >
                <Timer size={24} className="mx-auto text-amber-600 mb-1" />
                <p className="text-2xl font-black text-amber-700">
                  {fireStats.warning}
                </p>
                <p className="text-[10px] font-bold text-amber-600 uppercase mt-1">
                  Sắp Hết Hạn
                </p>
              </div>
              <div
                className="bg-red-50 p-3 rounded-xl border border-red-100 text-center cursor-pointer hover:bg-red-100 transition-colors"
                onClick={() => navigate("/fire-extinguishers")}
              >
                <AlertTriangle
                  size={24}
                  className="mx-auto text-red-600 mb-1"
                />
                <p className="text-2xl font-black text-red-700">
                  {fireStats.expired}
                </p>
                <p className="text-[10px] font-bold text-red-600 uppercase mt-1">
                  Quá Hạn
                </p>
              </div>
            </div>
            {/* ---> KẾT THÚC: KHU VỰC THỐNG KÊ PCCC <--- */}

            {/* DANH SÁCH CẢNH BÁO GIỮ NGUYÊN NHƯ CŨ */}
            <div className="p-0">
              {fireWarningList.length === 0 ? (
                <div className="p-6 text-center text-slate-400">
                  <ShieldAlert
                    size={32}
                    className="mx-auto text-green-400 mb-2"
                  />
                  <p className="text-sm font-medium">
                    Tất cả bình PCCC đều còn hạn sử dụng an toàn.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {fireWarningList.slice(0, 3).map((fw, idx) => {
                    const isExpired =
                      new Date(fw.minNextRechargeDate) < new Date();
                    return (
                      <li
                        key={idx}
                        className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={() => navigate("/fire-extinguishers")}
                      >
                        <div>
                          <p className="font-bold text-slate-800 text-sm">
                            {fw.zoneName}
                          </p>
                          <p className="text-xs text-slate-500">
                            Loại: {fw.type} ({fw.totalQuantity} bình)
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className={`text-sm font-bold flex items-center justify-end ${isExpired ? "text-red-600" : "text-orange-500"}`}
                          >
                            <Timer size={14} className="mr-1" />{" "}
                            {fw.minNextRechargeDate}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                            {isExpired ? "Đã quá hạn" : "Sắp đến hạn nạp"}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
