// src/layouts/PublisherLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../pages/publisher/Sidebar";
import Header from "../pages/publisher/Header";
import Footer from "../pages/publisher/Footer";

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
        <div className="flex-1 bg-[#0c0c0c] overflow-y-auto p-6 lg:ml-0">
          {/* Outlet renders page content */}
          <div className="min-h-full pb-6 pt-16 lg:pt-0">
            <Outlet />
          </div>

          {/* Footer renders below page content */}
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default PublisherLayout;