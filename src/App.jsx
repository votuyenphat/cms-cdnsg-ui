import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Borrow from "./pages/Borrow";
import Transactions from "./pages/Transactions";
import { ToastProvider } from "./context/ToastContext"; // Import Provider
import "./index.css";
import Report from "./pages/Report";
import Projectors from "./pages/Projectors";
import Uniforms from "./pages/Uniforms";
import FireExtinguishers from "./pages/FireExtinguishers";
import NotFound from "./pages/NotFound";
import Docs from "./pages/Docs";
import ScanBorrow from "./pages/ScanBorrow";
import LoginPage from "./pages/Login";
import ProtectedRoute from "./components/common/ProtectedRoute";
import UserProfile from "./pages/Profile";
import UserManagement from "./pages/UserManagement";
import UserBorrow from "./pages/UserBorrow";
import UserLayout from "./components/layout/UserLayout";
import WaterImports from "./pages/WaterImports";

function App() {
  useEffect(() => {
    // Keep backend alive and warmed up while application is open
    const ping = () => {
      fetch("https://warehouse-cdnsg.onrender.com/swagger-ui/index.html", { mode: "no-cors" }).catch(() => {});
    };
    ping();
    const interval = setInterval(ping, 4 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ToastProvider>
      {" "}
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="docs" element={<Docs />} />
              <Route path="borrow" element={<Borrow />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="report" element={<Report />} />
              <Route path="projectors" element={<Projectors />} />
              <Route path="uniforms" element={<Uniforms />} />
              <Route
                path="fire-extinguishers"
                element={<FireExtinguishers />}
              />
              <Route path="profile" element={<UserProfile />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="borrow-user" element={<UserBorrow />} />
              <Route path="water-imports" element={<WaterImports />} />
            </Route>
            <Route path="/user" element={<UserLayout />}>
              <Route path="borrow" element={<UserBorrow />} />
            </Route>
            <Route path="*" element={<NotFound />} />
            <Route path="/scan-borrow" element={<ScanBorrow />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
