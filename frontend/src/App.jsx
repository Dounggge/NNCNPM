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
import TamTruDetail from "./pages/Dashboard/TamTruDetail"; // ⭐ THÊM
import TamVangList from "./pages/Dashboard/TamVangList";
import TamVangDetail from "./pages/Dashboard/TamVangDetail"; // ⭐ THÊM
import KhoanThuList from "./pages/Dashboard/KhoanThuList";
import KhoanThuDetail from "./pages/Dashboard/KhoanThuDetail";//Thêm
import PhieuThuList from "./pages/Dashboard/PhieuThuList";
import PhieuThuDetail from "./pages/Dashboard/PhieuThuDetail"; // Thêm
import UserList from "./pages/Dashboard/UserList";
import DonXinVaoHoList from './pages/Dashboard/DonXinVaoHoList';
import DonTamTruList from './pages/Dashboard/DonTamTruList';
import DonTamVangList from './pages/Dashboard/DonTamVangList';
import NotificationList from './pages/Dashboard/NotificationList';
import DonTamTruDetail from './pages/Dashboard/DonTamTruDetail'; // ← THÊM
import DonTamVangDetail from './pages/Dashboard/DonTamVangDetail'; // ← THÊM

// FORMS
import KhoanThuForm from "./pages/Forms/KhoanThuForm";
import PhieuThuForm from "./pages/Forms/PhieuThuForm";
import ProfileSetupForm from "./pages/Forms/ProfileSetupForm";
import NhanKhauForm from "./pages/Forms/NhanKhauForm";
import HoKhauForm from "./pages/Forms/HoKhauForm";
import TamTruForm from "./pages/Forms/TamTruForm";
import TamVangForm from "./pages/Forms/TamVangForm"; 
import DonXinVaoHoForm from './pages/Forms/DonXinVaoHoForm';
import HoKhauCreateForm from './pages/Forms/HoKhauCreateForm';
import HoKhauAddMemberForm from './pages/Forms/HoKhauAddMemberForm';
import FeedbackForm from './pages/Forms/FeedbackForm';
import FeedbackList from './pages/Dashboard/FeedbackList';
import FeedbackDetail from './pages/Dashboard/FeedbackDetail';
import DonXinVaoHoDetail from './pages/Dashboard/DonXinVaoHoDetail'; 

import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import Landing from "./pages/AuthPages/Landing"; 
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import RequireProfile from "./components/common/RequireProfile";
import AccountSettings from './pages/Dashboard/AccountSettings';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/signin" replace />;
  }
  return children;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* PUBLIC ROUTES */}
            <Route path="/landing" element={<Landing />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            
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

              {/* THÔNG BÁO */}
              <Route path="notifications" element={<NotificationList />} />

              {/* CÀI ĐẶT TÀI KHOẢN */}
              <Route path="account" element={<AccountSettings />} />

              {/* ĐƠN XIN VÀO HỘ */}
              <Route path="donxinvaoho" element={<DonXinVaoHoList />} />
              <Route path="donxinvaoho/create" element={<DonXinVaoHoForm />} />
              <Route path="donxinvaoho/:id" element={<DonXinVaoHoDetail />} />

              {/* ĐƠN TẠM TRÚ */}
              <Route path="don-tam-tru" element={<DonTamTruList />} />
              <Route path="don-tam-tru/:id" element={<DonTamTruDetail />} />

              {/* ĐƠN TẠM VẮNG */}
              <Route path="don-tam-vang" element={<DonTamVangList />} />
              <Route path="don-tam-vang/:id" element={<DonTamVangDetail />} />

              {/* PHẢN HỒI */}
              <Route path="feedback" element={<FeedbackForm />} />
              <Route path="feedbacks" element={<FeedbackList />} />
              <Route path="feedbacks/:id" element={<FeedbackDetail />} />
              
              {/* QUẢN LÝ NHÂN KHẨU */}
              <Route path="nhankhau" element={<RequireProfile><NhanKhauList /></RequireProfile>} />
              <Route path="nhankhau/create" element={<RequireProfile><NhanKhauForm /></RequireProfile>} />
              <Route path="nhankhau/:id" element={<RequireProfile><NhanKhauDetail /></RequireProfile>} />
              <Route path="nhankhau/:id/edit" element={<RequireProfile><NhanKhauForm /></RequireProfile>} />
              
              {/* QUẢN LÝ HỘ KHẨU */}
              <Route path="hokhau" element={<RequireProfile><HoKhauList /></RequireProfile>} />
              <Route path="hokhau/create" element={<HoKhauCreateForm />} />
              <Route path="hokhau/:id" element={<RequireProfile><HoKhauDetail /></RequireProfile>} />
              <Route path="hokhau/:id/edit" element={<RequireProfile><HoKhauForm /></RequireProfile>} />
              <Route path="hokhau/:id/add-member" element={<HoKhauAddMemberForm />} />

              {/* ⭐ TẠM TRÚ / TẠM VẮNG - SỬA LẠI */}
              <Route path="tamtru-tamvang" element={<RequireProfile><TamTruTamVang /></RequireProfile>} />
              
              {/* ⭐ TẠM TRÚ (3 ROUTES) */}
              <Route path="tamtru" element={<RequireProfile><TamTruList /></RequireProfile>} />
              <Route path="tamtru/create" element={<RequireProfile><TamTruForm /></RequireProfile>} />
              <Route path="tamtru/:id" element={<RequireProfile><TamTruDetail /></RequireProfile>} /> {/* ⭐ THÊM */}
              
              {/* ⭐ TẠM VẮNG (3 ROUTES) */}
              <Route path="tamvang" element={<RequireProfile><TamVangList /></RequireProfile>} />
              <Route path="tamvang/create" element={<RequireProfile><TamVangForm /></RequireProfile>} />
              <Route path="tamvang/:id" element={<RequireProfile><TamVangDetail /></RequireProfile>} /> {/* ⭐ THÊM */}
              
              {/* QUẢN LÝ THU PHÍ */}
              <Route path="khoanthu" element={<RequireProfile><KhoanThuList /></RequireProfile>} />
              <Route path="khoanthu/create" element={<RequireProfile><KhoanThuForm /></RequireProfile>} />
              <Route path="khoanthu/:id" element={<RequireProfile><KhoanThuDetail /></RequireProfile>} />{/*Thêm*/}
              <Route path="khoanthu/:id/edit" element={<RequireProfile><KhoanThuForm /></RequireProfile>} />
              
              <Route path="phieuthu" element={<RequireProfile><PhieuThuList /></RequireProfile>} />
              <Route path="phieuthu/create" element={<RequireProfile><PhieuThuForm /></RequireProfile>} />
              <Route path="/dashboard/phieuthu/:id" element={<PhieuThuDetail />} />

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
  );
}

export default App;