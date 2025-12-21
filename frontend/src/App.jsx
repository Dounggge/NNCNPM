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
import DonXinVaoHoList from './pages/Dashboard/DonXinVaoHoList';

// FORMS
import KhoanThuForm from "./pages/Forms/KhoanThuForm";
import PhieuThuForm from "./pages/Forms/PhieuThuForm";
import ProfileSetupForm from "./pages/Forms/ProfileSetupForm";
import NhanKhauForm from "./pages/Forms/NhanKhauForm";
import HoKhauForm from "./pages/Forms/HoKhauForm";
import TamTruForm from "./pages/Forms/TamTruForm";
import TamVangForm from "./pages/Forms/TamVangForm"; 
import DonXinVaoHoForm from './pages/Forms/DonXinVaoHoForm';
import HoKhauCreateForm from './pages/Forms/HoKhauCreateForm'; // ← SỬA TÊN FILE

import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import Landing from "./pages/AuthPages/Landing"; 
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { AppWrapper } from "./components/common/PageMeta";
import RequireProfile from "./components/common/RequireProfile";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/signin" replace />;
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
              
              {/* ROOT */}
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
              
              {/* DASHBOARD ROUTES */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Home />} />
                <Route path="profile-setup" element={<ProfileSetupForm />} />
                <Route path="admin" element={<AdminDashboard />} />

                {/* ← ĐƠN XIN VÀO HỘ */}
                <Route path="donxinvaoho" element={<DonXinVaoHoList />} />
                <Route path="donxinvaoho/create" element={<DonXinVaoHoForm />} />
                
                {/* QUẢN LÝ NHÂN KHẨU */}
                <Route path="nhankhau" element={<RequireProfile><NhanKhauList /></RequireProfile>} />
                <Route path="nhankhau/create" element={<RequireProfile><NhanKhauForm /></RequireProfile>} />
                <Route path="nhankhau/:id" element={<RequireProfile><NhanKhauDetail /></RequireProfile>} />
                <Route path="nhankhau/:id/edit" element={<RequireProfile><NhanKhauForm /></RequireProfile>} />
                
                {/* QUẢN LÝ HỘ KHẨU */}
                <Route path="hokhau" element={<RequireProfile><HoKhauList /></RequireProfile>} />
                <Route path="hokhau/create" element={<HoKhauCreateForm />} /> {/* ← SỬA: ĐỔI TÊN COMPONENT */}
                <Route path="hokhau/:id" element={<RequireProfile><HoKhauDetail /></RequireProfile>} />
                <Route path="hokhau/:id/edit" element={<RequireProfile><HoKhauForm /></RequireProfile>} />

                {/* TẠM TRÚ / TẠM VẮNG */}
                <Route path="tamtru-tamvang" element={<RequireProfile><TamTruTamVang /></RequireProfile>} />
                <Route path="tamtru" element={<RequireProfile><TamTruList /></RequireProfile>} />
                <Route path="tamtru/create" element={<RequireProfile><TamTruForm /></RequireProfile>} />
                <Route path="tamvang" element={<RequireProfile><TamVangList /></RequireProfile>} />
                <Route path="tamvang/create" element={<RequireProfile><TamVangForm /></RequireProfile>} />
                
                {/* QUẢN LÝ THU PHÍ */}
                <Route path="khoanthu" element={<RequireProfile><KhoanThuList /></RequireProfile>} />
                <Route path="khoanthu/create" element={<RequireProfile><KhoanThuForm /></RequireProfile>} />
                <Route path="khoanthu/:id/edit" element={<RequireProfile><KhoanThuForm /></RequireProfile>} />
                
                <Route path="phieuthu" element={<RequireProfile><PhieuThuList /></RequireProfile>} />
                <Route path="phieuthu/create" element={<RequireProfile><PhieuThuForm /></RequireProfile>} />

                {/* QUẢN LÝ USER */}
                <Route path="users" element={<RequireProfile><UserList /></RequireProfile>} />
                <Route path="users/:userId/profile-setup" element={<RequireProfile><ProfileSetupForm /></RequireProfile>} />
              </Route>

              {/* 404 */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </AppWrapper>
  );
}

export default App;