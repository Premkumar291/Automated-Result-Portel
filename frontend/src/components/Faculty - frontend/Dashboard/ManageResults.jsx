
import Sidebar from "./Sidebar";
import { useState, useRef } from "react";
import {
  MdMenu,
  MdCloudUpload,
  MdFileUpload,
  MdAnalytics,
  MdTrendingUp,
  MdSchool,
  MdPeople,
  MdAssignment,
  MdDownload,
  MdRefresh,
} from "react-icons/md"
import { read, utils, writeFile } from "xlsx"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const ManageResults = () => {
  const [sidebarVisible, setSidebarVisible] = useState(false)
  const [file, setFile] = useState(null)
  const [message, setMessage] = useState("")
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef(null)

  const handlePlusClick = () => {
    fileInputRef.current?.click()
  }

  const handleUpload = () => {
    if (!file) {
      setMessage("⚠️ Please select a file.")
      return
    }

    setIsLoading(true)
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = read(data, { type: "array" })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const json = utils.sheet_to_json(sheet, { defval: "" })
        setResults(json)
        setMessage("✅ File parsed successfully!")
      } catch {
        setMessage("❌ Invalid file format.")
      }
      setIsLoading(false)
    }
    reader.readAsArrayBuffer(file)
  }

  const chartData = [
    { subject: "Math", pass: 78 },
    { subject: "DSA", pass: 84 },
    { subject: "DBMS", pass: 91 },
  ]

  const pieData = [
    { name: "Pass", value: 75, color: "#10B981" },
    { name: "Fail", value: 25, color: "#EF4444" },
  ]

  const statsCards = [
    { title: "Total Students", value: "1,247", icon: MdPeople, color: "from-blue-500 to-cyan-500", change: "+12%" },
    {
      title: "Average Score",
      value: "84.2%",
      icon: MdTrendingUp,
      color: "from-green-500 to-emerald-500",
      change: "+5.2%",
    },
    { title: "Pass Rate", value: "92.8%", icon: MdAnalytics, color: "from-purple-500 to-violet-500", change: "+8.1%" },
    { title: "Total Subjects", value: "24", icon: MdAssignment, color: "from-orange-500 to-red-500", change: "+2" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-gray-800 font-sans relative">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-all duration-500 ease-out
          ${sidebarVisible ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Sidebar onCloseSidebar={() => setSidebarVisible(false)} />
      </div>

      {/* Overlay */}
      {sidebarVisible && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setSidebarVisible(false)}
        />
      )}

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-lg">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-300 hover:scale-110"
              onClick={() => setSidebarVisible(!sidebarVisible)}
            >
              <MdMenu className="text-2xl text-gray-700" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <MdSchool className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Academic Result Portal</h1>
                <p className="text-sm text-gray-500">Student Performance Management System</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium shadow-lg">
              Academic Year 2024-25
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-10 rounded-full transform translate-x-8 -translate-y-8 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform duration-300`}
                  >
                    <stat.icon className="text-white text-xl" />
                  </div>
                  <span className="text-green-500 text-sm font-semibold bg-green-50 px-2 py-1 rounded-full">
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
                <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
            <h2 className="text-2xl font-bold text-white mb-2">Result File Upload Center</h2>
            <p className="text-indigo-100">Upload and process student result files with advanced analytics</p>
          </div>

          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Upload Area */}
              <div className="space-y-6">
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-indigo-400 hover:bg-indigo-50/50 transition-all duration-300 group">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                    <MdCloudUpload className="text-2xl text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Drop files here or click to browse</h3>
                  <p className="text-gray-500 mb-4">Supports .xlsx, .csv files up to 10MB</p>

                  <button
                    onClick={handlePlusClick}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 transition-all duration-300"
                  >
                    <MdFileUpload className="inline mr-2" />
                    Select File
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.csv"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                </div>

                {file && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 animate-fadeIn">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">📄</div>
                      <div className="flex-1">
                        <p className="font-medium text-green-800">{file.name}</p>
                        <p className="text-sm text-green-600">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleUpload}
                  disabled={!file || isLoading}
                  className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </div>
                  ) : (
                    <>
                      <MdRefresh className="inline mr-2" />
                      Process Results
                    </>
                  )}
                </button>

                {message && (
                  <div
                    className={`p-4 rounded-xl border ${
                      message.includes("✅")
                        ? "bg-green-50 border-green-200 text-green-800"
                        : message.includes("❌")
                          ? "bg-red-50 border-red-200 text-red-800"
                          : "bg-yellow-50 border-yellow-200 text-yellow-800"
                    } animate-fadeIn`}
                  >
                    <p className="font-medium">{message}</p>
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Analytics</h3>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-blue-800 font-medium">Pass Rate Distribution</span>
                    <span className="text-blue-600 text-sm">Live Data</span>
                  </div>
                  <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={25} outerRadius={50} dataKey="value">
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                  <h4 className="text-purple-800 font-medium mb-2">Recent Activity</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-gray-600">Math results uploaded - 2 min ago</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-gray-600">DSA analysis completed - 5 min ago</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                      <span className="text-gray-600">DBMS report generated - 10 min ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Performance Chart */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6">
              <h3 className="text-xl font-bold text-white">Subject Performance Analysis</h3>
              <p className="text-blue-100">Pass rates across different subjects</p>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <XAxis dataKey="subject" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #E5E7EB",
                      borderRadius: "12px",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar dataKey="pass" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#1D4ED8" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Trend Chart */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6">
              <h3 className="text-xl font-bold text-white">Performance Trends</h3>
              <p className="text-green-100">Monthly progress tracking</p>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <XAxis dataKey="subject" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #E5E7EB",
                      borderRadius: "12px",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="pass"
                    stroke="#10B981"
                    strokeWidth={3}
                    dot={{ fill: "#10B981", strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Student Results Database</h3>
                <p className="text-purple-100">Comprehensive result management and analysis</p>
              </div>
              <button className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors">
                <MdDownload className="inline mr-2" />
                Export
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Roll Number</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Student Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Subject</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Marks Obtained</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Result Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {results.length > 0 ? (
                  results.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors duration-200 group">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{row["Roll No"]}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{row["Name"]}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{row["Subject"]}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{row["Marks"]}/100</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            row["Marks"] >= 50
                              ? "bg-green-100 text-green-800 border border-green-200"
                              : "bg-red-100 text-red-800 border border-red-200"
                          }`}
                        >
                          {row["Marks"] >= 50 ? "✓ PASS" : "✗ FAIL"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center">
                          <MdAssignment className="text-3xl text-gray-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-700 mb-1">No Results Available</h3>
                          <p className="text-gray-500">Upload a result file to view student data and analytics</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}

export default ManageResults



