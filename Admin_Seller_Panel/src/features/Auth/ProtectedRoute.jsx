
import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import api from "../../services/api";
import PageLoader from "../../components/common/PageLoader";
import Home from "../Landing/Home";

export default function ProtectedRoute() {
    const location = useLocation();
    const isHomePage = location.pathname === "/";

    const [status, setStatus] = useState("checking");

    useEffect(() => {
        let active = true;

        const checkAuth = async () => {
            try {
                const response = await api.get("/auth/me");

                if (!active) return;

                const { fullName, role } = response.data;

                // Store user details for later use
                localStorage.setItem("fullName", fullName);
                localStorage.setItem("role", role);

                if (role === "ADMIN") {
                    setStatus("admin");
                } else if (role === "SELLER") {
                    setStatus("seller");
                } else {
                    setStatus("denied");
                }
            } catch (error) {
                if (!active) return;

                // Clear stale user details when authentication fails
                localStorage.removeItem("fullName");
                localStorage.removeItem("role");

                setStatus("guest");
            }
        };

        checkAuth();

        return () => {
            active = false;
        };
    }, []);

    if (status === "checking") {
        return <PageLoader />;
    }

    // Redirect logged-in users from home to their dashboard
    if (isHomePage && status === "admin") {
        return <Navigate to="/admin-dashboard" replace />;
    }

    if (isHomePage && status === "seller") {
        return <Navigate to="/seller-dashboard" replace />;
    }

    // Guests can access the home page
    if (isHomePage) {
        return <Home />;
    }

    // Protect dashboard routes
    if (status === "guest" || status === "denied") {
        return <Navigate to="/login" replace />;
    }

    // Ensure users access only their own dashboard
    if (
        location.pathname.startsWith("/admin-dashboard") &&
        status !== "admin"
    ) {
        return <Navigate to="/seller-dashboard" replace />;
    }

    if (
        location.pathname.startsWith("/seller-dashboard") &&
        status !== "seller"
    ) {
        return <Navigate to="/admin-dashboard" replace />;
    }

    return <Outlet />;
}
