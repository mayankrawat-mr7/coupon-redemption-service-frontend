import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/authContext.js';

export default function Layout() {
    const { user, logout } = useAuth();
    const isAdmin = user?.role === 'admin';

    return (
        <div className="app-shell">
            <aside className="sidebar">
                <div className="brand">
                    <span className="brand-mark" aria-hidden="true">%</span>
                    <span>CouponSvc</span>
                </div>
                <nav aria-label="Main navigation">
                    <p className="nav-label">Workspace</p>
                    <NavLink to="/" end>Dashboard</NavLink>
                    <NavLink to="/redeem">Redeem</NavLink>
                    <NavLink to="/my-redemptions">My Redemptions</NavLink>
                    {isAdmin && <p className="nav-label admin-label">Administration</p>}
                    {isAdmin && <NavLink to="/admin/users">Users</NavLink>}
                    {isAdmin && <NavLink to="/admin/coupons">Coupons</NavLink>}
                    {isAdmin && <NavLink to="/admin/redemptions">Redemptions</NavLink>}
                    {isAdmin && <NavLink to="/admin/analytics">Analytics</NavLink>}
                    {isAdmin && <NavLink to="/admin/bulkimport">Bulk Import</NavLink>}
                </nav>
                <div className="sidebar-footer">Secure coupon management</div>
            </aside>

            <div className="main-col">
                <header className="topbar">
                    <div className="user-summary">
                        <span className="avatar" aria-hidden="true">{user?.name?.slice(0, 1)?.toUpperCase() || 'U'}</span>
                        <span><strong>{user?.name}</strong><small>{user?.role}</small></span>
                    </div>
                    <button className="logout-button" onClick={logout}>Logout</button>
                </header>

                <main className="content">
                    {/* Outlet is where the matched child route renders */}
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
