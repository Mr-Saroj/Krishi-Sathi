import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";

import PublicLayout from "../components/layout/PublicLayout";
import AdminDashboardLayout from "../features/Admin/components/AdminDashboardLayout";

// Common loader
import PageLoader from "../components/common/PageLoader";

// Landing skeleton
import HomeSkeleton from "../features/Landing/Skeleton/HomeSkeleton";

// Authentication skeletons
import RegisterSkeleton from "../features/Auth/Skeliton/RegisterSkeleton";
import LoginSkeleton from "../features/Auth/Skeliton/LoginSkeleton";

// Admin skeleton
import AdminMiddleContentSkeleton from "../features/Admin/Skeliton/AdminMiddleContentSkeleton";

// Lazy-loaded pages
const Home = lazy(() => import("../features/Landing/Home"));
const Register = lazy(() => import("../features/Auth/Register"));
const Login = lazy(() => import("../features/Auth/Login"));

const AdminMiddleContent = lazy(
  () => import("../features/Admin/components/AdminMiddleContent")
);

const router = createBrowserRouter([
  // Public routes
  {
    element: (
      <Suspense fallback={<PageLoader />}>
        <PublicLayout />
      </Suspense>
    ),
    children: [
      {
        path: "/",
        element: (
          <Suspense fallback={<HomeSkeleton />}>
            <Home />
          </Suspense>
        ),
      },
      {
        path: "/register",
        element: (
          <Suspense fallback={<RegisterSkeleton />}>
            <Register />
          </Suspense>
        ),
      },
      {
        path: "/login",
        element: (
          <Suspense fallback={<LoginSkeleton />}>
            <Login />
          </Suspense>
        ),
      },
    ],
  },

  // Admin routes
  {
    element: (
      <Suspense fallback={<PageLoader />}>
        <AdminDashboardLayout />
      </Suspense>
    ),
    children: [
      {
        path: "/admin-dashboard",
        element: (
            <AdminMiddleContent />
        ),
      },
    ],
  },
]);

export default router;