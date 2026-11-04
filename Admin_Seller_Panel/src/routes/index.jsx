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
import ProtectedRoute from "../features/Auth/ProtectedRoute";





// Auth part
const Home = lazy(() => import("../features/Landing/Home"));
const Register = lazy(() => import("../features/Auth/Register"));
const Login = lazy(() => import("../features/Auth/Login"));

// Admin Dashboard part
const AdminMiddleContent = lazy(
  () => import("../features/Admin/components/AdminMiddleContent")
);
const SellerManagement = lazy(
  () => import("../features/Admin/components/SellerManagement")
);
const ProductManagement = lazy(
  () => import("../features/Admin/components/ProductManagement")
);
const OrderManagement = lazy(
  () => import("../features/Admin/components/OrderManagement")
);
const DeliveryManagement = lazy(
  () => import("../features/Admin/components/DeliveryManagement")
);
const FinanceCommission = lazy(
  () => import("../features/Admin/components/FinanceCommission")
);
const CustomerManagement = lazy(
  () => import("../features/Admin/components/CustomerManagement")
);

//Seller Dashboard part
const SellerDashboardLayout = lazy(
  () => import("../features/Seller/components/SellerDashboardLayout")
);
const SellerMiddleContent = lazy(
  () => import("../features/Seller/components/SellerMiddleContent")
);
const SellerInventory = lazy(
  () => import("../features/Seller/components/SellerInventory")
);
const AddProductCatalog = lazy(
  () => import("../features/Seller/components/AddProductCatalog")
);

// 404 page (unavailable routes)
const NotFound = lazy(() => import("../components/common/NotFound"));

const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      {
        path: "/",
        element: (
          <Suspense fallback={<PageLoader />}>
            <ProtectedRoute />
          </Suspense>
        ),
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
      },


      // Any unknown public URL, e.g. /abc
      {
        path: "*",
        element: (
          <Suspense fallback={<PageLoader />}>
            <NotFound />
          </Suspense>
        ),
      },
    ],
  },


  // Admin routes - protected
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/admin-dashboard",
        element: (
          <Suspense fallback={<PageLoader />}>
            <AdminDashboardLayout />
          </Suspense>
        ),
        children: [
          { index: true, element: <AdminMiddleContent /> },
          { path: "sellers", element: <SellerManagement /> },
          { path: "product", element: <ProductManagement /> },
          { path: "waiting-orders", element: <OrderManagement /> },
          {
            path: "delivery-management",
            element: <DeliveryManagement />,
          },
          { path: "finance", element: <FinanceCommission /> },
          { path: "customers", element: <CustomerManagement /> },
        ],
      },
    ],
  },
  // Admin routes - protected
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/seller-dashboard",
        element: (
          <Suspense fallback={<PageLoader />}>
            <SellerDashboardLayout />
          </Suspense>
        ),
        children: [
          { index: true, element: <SellerMiddleContent /> },
          { path: "inventory", element: <SellerInventory /> },
          { path: "add-new product", element: <AddProductCatalog /> },


        ],
      },
    ],
  },

]);

export default router;