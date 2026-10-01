import axiosClient from "./axiosClient";

export const uniformService = {
  // --- DANH MỤC ĐỒNG PHỤC ---
  getAllUniforms: (page = 0, size = 10, keyword = "") =>
    axiosClient.get("/uniforms", { params: { page, size, keyword } }),

  createUniform: (data) => axiosClient.post("/uniforms", data),

  updateUniform: (id, data) => axiosClient.put(`/uniforms/${id}`, data),

  deleteUniform: (id) => axiosClient.delete(`/uniforms/${id}`),

  // --- NHẬP KHO ĐỒNG PHỤC ---
  getAllImports: (params) => axiosClient.get("/uniform-imports", { params }), // params gồm: page, size, fromDate, toDate, note, name

  createImport: (data) => axiosClient.post("/uniform-imports", data),

  updateImport: (id, data) => axiosClient.put(`/uniform-imports/${id}`, data),

  deleteImport: (id) => axiosClient.delete(`/uniform-imports/${id}`),

  // --- XUẤT KHO / CẤP PHÁT ĐỒNG PHỤC ---
  getReceiptStats: (params) => axiosClient.get("/uniform-receipts/stats", { params }), // params gồm: fromDate, toDate

  getAllReceipts: (params) => axiosClient.get("/uniform-receipts", { params }), // params gồm: page, size, fromDate, toDate, cusName

  createReceipt: (data) => axiosClient.post("/uniform-receipts", data),

  updateReceipt: (id, data) => axiosClient.put(`/uniform-receipts/${id}`, data),

  deleteReceipt: (id) => axiosClient.delete(`/uniform-receipts/${id}`),
};
