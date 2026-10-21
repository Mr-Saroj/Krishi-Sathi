// src/layouts/PublicLayout.jsx

import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";


export default function PublicLayout() {
  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface antialiased">
      <Header />

      {/* The current public page renders here */}
      <Outlet />

      <Footer />
    </div>
  );
}