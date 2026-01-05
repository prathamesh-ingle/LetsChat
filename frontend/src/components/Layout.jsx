// src/components/Layout.jsx
import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const Layout = ({ children, showSidebar = false }) => {
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);

  return (
    // Full viewport height, horizontal flex: sidebar | (navbar + main)
    <div className="h-screen flex">
      {/* Left: full-height sidebar (desktop) */}
      {showSidebar && (
        <Sidebar
          isOpenMobile={isSidebarOpenMobile}
          onCloseMobile={() => setIsSidebarOpenMobile(false)}
        />
      )}

      {/* Right: column with navbar on top and scrollable page content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar starts just after sidebar, stays visible because parent doesn't scroll */}
        <Navbar
          onToggleSidebar={() =>
            setIsSidebarOpenMobile((prev) => !prev)
          }
          isSidebarOpen={isSidebarOpenMobile}
        />

        {/* Only this area scrolls */}
        <main className="flex-1 overflow-y-auto min-h-0">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
