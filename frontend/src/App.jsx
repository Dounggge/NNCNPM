import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import AppLayout from "./layout/AppLayout";
import Home from "./pages/Dashboard/Home";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import Landing from "./pages/AuthPages/Landing"; // ← Import Landing
import { ThemeProvider } from "./context/ThemeContext";
import { AppWrapper } from "./components/common/PageMeta";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/landing" replace />; // ← Đổi từ "/signin"
  }
  return children;
}

function App() {
  return (
    <AppWrapper>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            {/* Landing Page */}
            <Route path="/landing" element={<Landing />} />
            
            {/* Public Routes */}
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            
            {/* Root redirect */}
            <Route 
              path="/" 
              element={
                localStorage.getItem('token') ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Navigate to="/landing" replace /> // ← Đổi từ "/signin"
                )
              } 
            />
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Home />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AppWrapper>
  );
}

export default App;