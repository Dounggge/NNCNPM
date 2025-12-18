import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import Home from "./pages/Dashboard/Home";
import AdminDashboard from "./pages/Dashboard/AdminDashboard";
import NhanKhauList from "./pages/Dashboard/NhanKhauList";
import NhanKhauDetail from "./pages/Dashboard/NhanKhauDetail";
import HoKhauList from "./pages/Dashboard/HoKhauList";
import HoKhauDetail from "./pages/Dashboard/HoKhauDetail";
import TamTruTamVang from "./pages/Dashboard/TamTruTamVang"; 
import TamTruList from "./pages/Dashboard/TamTruList"; 
import TamVangList from "./pages/Dashboard/TamVangList";
import KhoanThuList from "./pages/Dashboard/KhoanThuList";
import PhieuThuList from "./pages/Dashboard/PhieuThuList";
import UserList from "./pages/Dashboard/UserList";

// FORMS
import KhoanThuForm from "./pages/Forms/KhoanThuForm";
import PhieuThuForm from "./pages/Forms/PhieuThuForm";
import ProfileSetupForm from "./pages/Forms/ProfileSetupForm";
import NhanKhauForm from "./pages/Forms/NhanKhauForm";
import HoKhauForm from "./pages/Forms/HoKhauForm";
import TamTruForm from "./pages/Forms/TamTruForm";
import TamVangForm from "./pages/Forms/TamVangForm"; 

import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import Landing from "./pages/AuthPages/Landing"; 
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { AppWrapper } from "./components/common/PageMeta";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/signin" replace />; // ← SỬA: redirect về signin thay vì landing
  }
  return children;
}

function App() {
  return (
    <AppWrapper>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* PUBLIC ROUTES */}
              <Route path="/landing" element={<Landing />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              
              {/* ROOT - Redirect dựa vào token */}
              <Route 
                path="/" 
                element={
                  localStorage.getItem('token') ? (
                    <Navigate to="/dashboard" replace />
                  ) : (
                    <Navigate to="/signin" replace />
                  )
                } 
              />
              
              {/* DASHBOARD ROUTES - Protected */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Home />} />
                <Route path="admin" element={<AdminDashboard />} />
                
                {/* NHÂN KHẨU */}
                <Route path="nhankhau" element={<NhanKhauList />} />
                <Route path="nhankhau/create" element={<NhanKhauForm />} />
                <Route path="nhankhau/:id" element={<NhanKhauDetail />} />
                <Route path="nhankhau/:id/edit" element={<NhanKhauForm />} />
                
                {/* HỘ KHẨU */}
                <Route path="hokhau" element={<HoKhauList />} />
                <Route path="hokhau/create" element={<HoKhauForm />} />
                <Route path="hokhau/:id" element={<HoKhauDetail />} />
                <Route path="hokhau/:id/edit" element={<HoKhauForm />} />

                {/* TẠM TRÚ/TẠM VẮNG */}
                <Route path="tamtru-tamvang" element={<TamTruTamVang />} />
                <Route path="tamtru" element={<TamTruList />} />
                <Route path="tamtru/create" element={<TamTruForm />} />
                <Route path="tamvang" element={<TamVangList />} />
                <Route path="tamvang/create" element={<TamVangForm />} />

                {/* KHOẢN THU/PHIẾU THU */}
                <Route path="khoanthu" element={<KhoanThuList />} />
                <Route path="khoanthu/create" element={<KhoanThuForm />} />
                <Route path="khoanthu/:id/edit" element={<KhoanThuForm />} />
                
                <Route path="phieuthu" element={<PhieuThuList />} />
                <Route path="phieuthu/create" element={<PhieuThuForm />} />

                {/* NGƯỜI DÙNG */}
                <Route path="users" element={<UserList />} />
                <Route path="users/:userId/profile-setup" element={<ProfileSetupForm />} />
                <Route path="profile-setup" element={<ProfileSetupForm />} />
              </Route>

              {/* 404 - Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </AppWrapper>
  );
}

export default App;