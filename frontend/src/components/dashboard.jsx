import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import AnalyticsCards from "../components/AnalyticsCards";
import ResultTable from "../components/ResultTable";

const Dashboard = () => {
  const [sidebarVisible, setSidebarVisible] = useState(false);

  return (
    <div className="relative min-h-screen font-[Poppins] bg-[#f9f9fb] overflow-x-hidden">
      {/* 🟣 Sidebar with smooth transition and close option */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarVisible ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar onClose={() => setSidebarVisible(false)} />
      </div>

      {/* 🧠 Main Content */}
      <div className="ml-0">
        <Header onMenuClick={() => setSidebarVisible(!sidebarVisible)} />
        <div className="p-6">
          <AnalyticsCards />
          <ResultTable />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
