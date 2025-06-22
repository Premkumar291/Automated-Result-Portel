import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import AnalyticsCards from "./AnalyticsCards";
import ResultTable from "./ResultTable";

const Dashboard = () => {
  const [sidebarVisible, setSidebarVisible] = useState(false);

  return (
    <div className="relative min-h-screen font-[Poppins] bg-[#f9f9fb] overflow-x-hidden">
      {/* Sidebar with smooth transition */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarVisible ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar onCloseSidebar={() => setSidebarVisible(false)} />
      </div>

      {/* Main Dashboard Content */}
      <div className="ml-0">
        {/* Header with ☰ menu toggle */}
        <Header onMenuClick={() => setSidebarVisible(!sidebarVisible)} />

        {/* Body Content */}
        <div className="p-6 space-y-8">
          <AnalyticsCards />
          <ResultTable />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
