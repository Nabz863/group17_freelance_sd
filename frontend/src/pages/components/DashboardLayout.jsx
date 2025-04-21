import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import "../styles/theme.css";

export default function DashboardLayout({ role = "User", menuItems = [] }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <main className="flex h-screen bg-[#0e0e0e] text-white font-sans">
      {/* Hamburger for mobile */}
      <button
        onClick={toggleSidebar}
        className="absolute top-4 left-4 z-50 flex flex-col justify-between w-9 h-7 md:hidden"
        aria-label="Toggle navigation menu"
      >
        <span className="block h-1 bg-white rounded"></span>
        <span className="block h-1 bg-white rounded"></span>
        <span className="block h-1 bg-white rounded"></span>
      </button>

      {/* Sidebar */}
      <nav
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out fixed md:relative z-40 md:w-64 w-60 bg-[#132d28] p-6 flex flex-col items-center shadow-lg`}
        aria-label="Sidebar"
      >
        <h2 className="text-2xl uppercase font-bold tracking-widest border-b-2 border-[#1abc9c] pb-2 mb-6">
          {role}
        </h2>
        {menuItems.map((label, index) => (
          <button
            key={index}
            className="relative w-32 h-10 my-2 font-medium border-2 border-[#1abc9c] text-[#1abc9c] rounded-lg transition-all overflow-hidden z-10 hover:text-white group"
          >
            {label}
            <span className="absolute z-[-1] w-full h-full bg-[#1abc9c] left-0 top-full group-hover:top-0 transition-all duration-500 ease-in-out rounded-b-full group-hover:rounded-b-none"></span>
          </button>
        ))}
      </nav>

      {/* Main content */}
      <section className="flex-1 overflow-y-auto p-6 animate-fadeInUp">
        <Outlet />
      </section>
    </main>
  );
}
