import React from "react";
import { Outlet } from "react-router-dom";
import useSidebarResponsive from "../../hooks/useSidebarResponsive";

import {
  LAYOUT_GLOBAL_CSS,
  getRootContainerClasses,
  getContentMarginClasses,
  getMainContentClasses,
} from "../../utils/layoutUtils";

const DashboardLayout = ({ SidebarComponent, TopNavbarComponent }) => {
  const { sidebarOpen, setSidebarOpen } = useSidebarResponsive();

  return (
    <div className={getRootContainerClasses()}>
      <SidebarComponent
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className={getContentMarginClasses(sidebarOpen)}>
        <TopNavbarComponent
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        <main className={getMainContentClasses()}>
          <div className="mx-auto w-full min-w-0 max-w-full">
            <Outlet />
          </div>
        </main>
      </div>

      <style>{LAYOUT_GLOBAL_CSS}</style>
    </div>
  );
};

export default DashboardLayout;