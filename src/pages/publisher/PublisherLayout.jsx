// src/pages/publisher/PublisherLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

function PublisherLayout() {
  return (
    <div className="flex flex-col h-screen bg-[#0c0c0c] relative">
      {/* Header top full width */}
      <div className="relative z-30">
        <Header />
      </div>

      {/* Page Content */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <Sidebar />

        {/* Page Content + Footer (scroll together) */}
        <div className="flex-1 bg-[#0c0c0c] overflow-y-auto ">
          {/* Outlet renders page content */}
          <div className="min-h-full   ">
            <Outlet />
          </div>

          {/* Footer renders below page content */}
        </div>
      </div>
    </div>
  );
}

export default PublisherLayout;