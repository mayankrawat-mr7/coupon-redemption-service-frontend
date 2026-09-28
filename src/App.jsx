import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import UserManagement from './pages/admin/UserManagement.jsx';
import CouponManagement from './pages/admin/CouponManagement.jsx';
import Redeem from './pages/Redeem.jsx';
import MyRedemptions from './pages/MyRedemptions.jsx';
import Dashboard from './pages/Dashboard.jsx';
import RedemptionManagement from './pages/admin/RedemptionManagement.jsx';
import Analytics from './pages/admin/Analytics.jsx';
import BulkImport from './pages/admin/BulkImport.jsx';


export default function App() {
  return (
    <Routes>
      {/* Public routes — no Layout, no protection */}
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<h2>Not authorized</h2>} />

      {/* Everything below shares one ProtectedRoute + Layout wrap */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/redeem" element={<Redeem />} />
        <Route path="/my-redemptions" element={<MyRedemptions />} />

        {/* Admin-only — nested ProtectedRoute adds the role check
            on top of the "logged in" check already done above */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/coupons"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <CouponManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/redemptions"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <RedemptionManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/bulkimport"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <BulkImport />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<h2>404 — page not found</h2>} />
    </Routes>
  );
}
