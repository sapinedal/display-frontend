import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoadingOverlay from "./components/ui/LoadingOverlay";
// import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import LoadingOverlay from "./components/LoadingOverlay";
import AuthPage from "./pages/AuthPage";
import DefaultLayout from "./layout/Default";
import DashboardPage from "./pages/DashboardPage";
import DisplayPage from "./pages/DisplayPage";
import VideosPage from "./pages/VideosPage";

function AppContent() {
  const { isPostLoginLoading } = useAuth();

  return (
    <>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DefaultLayout>
                <DashboardPage />
              </DefaultLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/display"
          element={
            <ProtectedRoute>
              <DisplayPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/videos"
          element={
            <ProtectedRoute>
              <DefaultLayout>
                <VideosPage />
              </DefaultLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="*"
          element={<div className="p-6">Página no encontrada</div>}
        />
      </Routes>
      <LoadingOverlay isVisible={isPostLoginLoading} />
      {/* <ToastContainer /> */}
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
