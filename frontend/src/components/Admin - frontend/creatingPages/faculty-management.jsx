"use client"

import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Plus, Search, Edit3, Trash2, Users, X, GraduationCap, Filter } from "lucide-react"
// import { facultyAPI, DEGREE_OPTIONS, TITLE_OPTIONS, DEPARTMENT_OPTIONS } from "../../../api/faculty"
import toast from "react-hot-toast"

const DEGREE_OPTIONS = ["PhD", "M.Tech", "M.Sc", "B.Tech", "B.Sc", "MBA", "MA", "BA"]
const TITLE_OPTIONS = ["Dr.", "Prof.", "Mr.", "Ms.", "Mrs."]
const DEPARTMENT_OPTIONS = [
  "Computer Science",
  "Electronics",
  "Mechanical",
  "Civil",
  "Mathematics",
  "Physics",
  "Chemistry",
]

const facultyAPI = {
  getFaculty: async (params) => ({ data: [] }),
  createFaculty: async (data) => ({ success: true }),
  updateFaculty: async (id, data) => ({ success: true }),
  deleteFaculty: async (id) => ({ success: true }),
}

const FacultyManagement = () => {
  const [faculty, setFaculty] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingFaculty, setEditingFaculty] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("")

  const [formData, setFormData] = useState({
    title: "",
    name: "",
    initials: "",
    email: "",
    department: "",
    employeeId: "",
    phoneNumber: "",
    dateOfJoining: "",
    studies: [],
  })

  const [studyForm, setStudyForm] = useState({
    degree: "",
    specialization: "",
    institution: "",
    year: "",
  })

  useEffect(() => {
    fetchFaculty()
  }, [searchTerm, departmentFilter])

  const fetchFaculty = async () => {
    setLoading(true)
    try {
      const params = {
        ...(searchTerm && { search: searchTerm }),
        ...(departmentFilter && { department: departmentFilter }),
      }
      const response = await facultyAPI.getFaculty(params)
      setFaculty(response.data)
    } catch (error) {
      toast.error("Failed to fetch faculty: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      name: "",
      initials: "",
      email: "",
      department: "",
      employeeId: "",
      phoneNumber: "",
      dateOfJoining: "",
      studies: [],
    })
    setStudyForm({ degree: "", specialization: "", institution: "", year: "" })
    setEditingFaculty(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editingFaculty) {
        await facultyAPI.updateFaculty(editingFaculty._id, formData)
        toast.success("Faculty updated successfully!")
      } else {
        await facultyAPI.createFaculty(formData)
        toast.success("Faculty created successfully!")
      }
      setShowModal(false)
      resetForm()
      fetchFaculty()
    } catch (error) {
      toast.error(error.message || "Operation failed")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (facultyId) => {
    if (!confirm("Are you sure you want to delete this faculty member?")) return
    try {
      await facultyAPI.deleteFaculty(facultyId)
      toast.success("Faculty deleted successfully!")
      fetchFaculty()
    } catch (error) {
      toast.error("Failed to delete faculty: " + error.message)
    }
  }

  const addStudy = () => {
    if (!studyForm.degree) return toast.error("Please select a degree")
    setFormData((prev) => ({ ...prev, studies: [...prev.studies, { ...studyForm }] }))
    setStudyForm({ degree: "", specialization: "", institution: "", year: "" })
  }

  const removeStudy = (index) => {
    setFormData((prev) => ({ ...prev, studies: prev.studies.filter((_, i) => i !== index) }))
  }

  const openEditModal = (facultyMember) => {
    setEditingFaculty(facultyMember)
    setFormData({
      title: facultyMember.title,
      name: facultyMember.name,
      initials: facultyMember.initials,
      email: facultyMember.email || "",
      department: facultyMember.department,
      employeeId: facultyMember.employeeId || "",
      phoneNumber: facultyMember.phoneNumber || "",
      dateOfJoining: facultyMember.dateOfJoining ? facultyMember.dateOfJoining.split("T")[0] : "",
      studies: facultyMember.studies || [],
    })
    setShowModal(true)
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)",
        padding: "32px",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          style={{
            background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
            borderRadius: "24px",
            padding: "40px",
            marginBottom: "32px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.1)",
            border: "2px solid rgba(255, 255, 255, 0.1)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "radial-gradient(circle at 20% 80%, rgba(0, 0, 0, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(0, 0, 0, 0.05) 0%, transparent 50%)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              position: "relative",
              zIndex: 1,
            }}
          >
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                style={{
                  fontSize: "42px",
                  fontWeight: "800",
                  color: "#000000",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  margin: 0,
                  letterSpacing: "-0.02em",
                }}
              >
                <div
                  style={{
                    background: "linear-gradient(135deg, #000000 0%, #333333 100%)",
                    borderRadius: "16px",
                    padding: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Users size={32} color="#ffffff" />
                </div>
                Faculty Management
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                style={{
                  color: "#666666",
                  marginTop: "12px",
                  fontSize: "18px",
                  fontWeight: "500",
                  margin: "12px 0 0 0",
                }}
              >
                Manage faculty members and their academic credentials
              </motion.p>
            </div>
            <motion.button
              whileHover={{
                scale: 1.05,
                y: -4,
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
              }}
              whileTap={{ scale: 0.95, y: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              onClick={() => setShowModal(true)}
              style={{
                background: "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)",
                color: "#ffffff",
                padding: "18px 32px",
                borderRadius: "16px",
                border: "2px solid rgba(255, 255, 255, 0.1)",
                fontSize: "16px",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.4)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: "-100%",
                  width: "100%",
                  height: "100%",
                  background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)",
                  transition: "left 0.6s ease",
                }}
              />
              <Plus size={20} />
              Add Faculty
            </motion.button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          style={{
            background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
            borderRadius: "20px",
            padding: "32px",
            marginBottom: "32px",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
            border: "1px solid rgba(0, 0, 0, 0.1)",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
            <div style={{ position: "relative" }}>
              <Search
                style={{
                  position: "absolute",
                  left: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#666666",
                }}
                size={20}
              />
              <motion.input
                whileFocus={{ scale: 1.02, y: -2 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                type="text"
                placeholder="Search faculty members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "16px 20px 16px 48px",
                  borderRadius: "14px",
                  border: "2px solid #e5e7eb",
                  backgroundColor: "#ffffff",
                  fontSize: "16px",
                  fontWeight: "500",
                  color: "#000000",
                  outline: "none",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#000000"
                  e.target.style.boxShadow = "0 0 0 4px rgba(0, 0, 0, 0.1), 0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e5e7eb"
                  e.target.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                }}
              />
            </div>
            <div style={{ position: "relative" }}>
              <Filter
                style={{
                  position: "absolute",
                  left: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#666666",
                }}
                size={20}
              />
              <motion.select
                whileTap={{ scale: 0.98 }}
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                style={{
                  width: "100%",
                  padding: "16px 20px 16px 48px",
                  borderRadius: "14px",
                  border: "2px solid #e5e7eb",
                  backgroundColor: "#ffffff",
                  fontSize: "16px",
                  fontWeight: "500",
                  color: "#000000",
                  outline: "none",
                  cursor: "pointer",
                  appearance: "none",
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23000000' strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: "right 16px center",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "16px",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#000000"
                  e.target.style.boxShadow = "0 0 0 4px rgba(0, 0, 0, 0.1), 0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e5e7eb"
                  e.target.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                }}
              >
                <option value="">All Departments</option>
                {DEPARTMENT_OPTIONS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </motion.select>
            </div>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchFaculty}
              style={{
                padding: "16px 24px",
                background: "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)",
                color: "#000000",
                borderRadius: "14px",
                border: "2px solid #e5e7eb",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
            >
              Refresh
            </motion.button>
          </div>
        </motion.div>

        {/* Faculty List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          style={{
            background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
            border: "1px solid rgba(0, 0, 0, 0.1)",
          }}
        >
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "80px" }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  border: "4px solid #e5e7eb",
                  borderTop: "4px solid #000000",
                }}
              />
            </div>
          ) : faculty.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "80px 40px",
                color: "#666666",
              }}
            >
              <Users size={64} style={{ margin: "0 auto 24px", opacity: 0.3 }} />
              <h3 style={{ fontSize: "24px", fontWeight: "600", margin: "0 0 12px 0", color: "#000000" }}>
                No Faculty Members Found
              </h3>
              <p style={{ fontSize: "16px", margin: 0 }}>Start by adding your first faculty member to the system.</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)" }}>
                    <th
                      style={{
                        padding: "20px 24px",
                        textAlign: "left",
                        fontSize: "14px",
                        fontWeight: "700",
                        color: "#ffffff",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Faculty Details
                    </th>
                    <th
                      style={{
                        padding: "20px 24px",
                        textAlign: "left",
                        fontSize: "14px",
                        fontWeight: "700",
                        color: "#ffffff",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Department
                    </th>
                    <th
                      style={{
                        padding: "20px 24px",
                        textAlign: "left",
                        fontSize: "14px",
                        fontWeight: "700",
                        color: "#ffffff",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Qualifications
                    </th>
                    <th
                      style={{
                        padding: "20px 24px",
                        textAlign: "left",
                        fontSize: "14px",
                        fontWeight: "700",
                        color: "#ffffff",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Contact
                    </th>
                    <th
                      style={{
                        padding: "20px 24px",
                        textAlign: "left",
                        fontSize: "14px",
                        fontWeight: "700",
                        color: "#ffffff",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {faculty.map((facultyMember, index) => (
                    <motion.tr
                      key={facultyMember._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      style={{
                        borderBottom: "1px solid #e5e7eb",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)"
                        e.currentTarget.style.transform = "translateY(-2px)"
                        e.currentTarget.style.boxShadow = "0 4px 12px -2px rgba(0, 0, 0, 0.1)"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent"
                        e.currentTarget.style.transform = "translateY(0)"
                        e.currentTarget.style.boxShadow = "none"
                      }}
                    >
                      <td style={{ padding: "24px" }}>
                        <div>
                          <div style={{ fontSize: "16px", fontWeight: "700", color: "#000000", marginBottom: "4px" }}>
                            {facultyMember.title} {facultyMember.name}
                          </div>
                          <div style={{ fontSize: "14px", color: "#666666", marginBottom: "4px" }}>
                            {facultyMember.initials}
                          </div>
                          {facultyMember.employeeId && (
                            <div style={{ fontSize: "12px", color: "#000000", fontWeight: "600" }}>
                              ID: {facultyMember.employeeId}
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: "24px" }}>
                        <span
                          style={{
                            padding: "8px 16px",
                            borderRadius: "20px",
                            fontSize: "14px",
                            fontWeight: "600",
                            background: "linear-gradient(135deg, #000000 0%, #333333 100%)",
                            color: "#ffffff",
                          }}
                        >
                          {facultyMember.department}
                        </span>
                      </td>
                      <td style={{ padding: "24px" }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          {facultyMember.studies?.slice(0, 3).map((study, index) => (
                            <span
                              key={index}
                              style={{
                                padding: "6px 12px",
                                background: "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)",
                                color: "#000000",
                                fontSize: "12px",
                                fontWeight: "600",
                                borderRadius: "12px",
                                border: "1px solid #e5e7eb",
                              }}
                            >
                              {study.degree}
                            </span>
                          ))}
                          {facultyMember.studies?.length > 3 && (
                            <span
                              style={{
                                padding: "6px 12px",
                                background: "#e5e7eb",
                                color: "#666666",
                                fontSize: "12px",
                                fontWeight: "600",
                                borderRadius: "12px",
                              }}
                            >
                              +{facultyMember.studies.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: "24px" }}>
                        <div style={{ fontSize: "14px", color: "#666666" }}>
                          {facultyMember.email && <div style={{ marginBottom: "4px" }}>{facultyMember.email}</div>}
                          {facultyMember.phoneNumber && <div>{facultyMember.phoneNumber}</div>}
                        </div>
                      </td>
                      <td style={{ padding: "24px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <motion.button
                            whileHover={{ scale: 1.1, y: -2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => openEditModal(facultyMember)}
                            style={{
                              padding: "8px",
                              background: "linear-gradient(135deg, #000000 0%, #333333 100%)",
                              color: "#ffffff",
                              borderRadius: "8px",
                              border: "none",
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                            }}
                          >
                            <Edit3 size={16} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1, y: -2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDelete(facultyMember._id)}
                            style={{
                              padding: "8px",
                              background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                              color: "#ffffff",
                              borderRadius: "8px",
                              border: "none",
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                            }}
                          >
                            <Trash2 size={16} />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.8)",
              backdropFilter: "blur(12px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 50,
              padding: "24px",
            }}
            onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30, rotateX: -15 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15, rotateX: 5 }}
              transition={{ type: "spring", stiffness: 300, damping: 25, duration: 0.5 }}
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
                borderRadius: "24px",
                width: "100%",
                maxWidth: "800px",
                maxHeight: "90vh",
                overflowY: "auto",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)",
                border: "2px solid rgba(0, 0, 0, 0.1)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ padding: "40px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "32px",
                  }}
                >
                  <h2 style={{ fontSize: "32px", fontWeight: "800", color: "#000000", margin: 0 }}>
                    {editingFaculty ? "Edit Faculty" : "Add New Faculty"}
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setShowModal(false)
                      resetForm()
                    }}
                    style={{
                      padding: "12px",
                      background: "linear-gradient(135deg, #000000 0%, #333333 100%)",
                      color: "#ffffff",
                      borderRadius: "12px",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <X size={20} />
                  </motion.button>
                </div>

                <form onSubmit={handleSubmit}>
                  {/* Basic Info */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                      gap: "24px",
                      marginBottom: "40px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "14px",
                          fontWeight: "700",
                          color: "#000000",
                          marginBottom: "8px",
                        }}
                      >
                        Title *
                      </label>
                      <select
                        required
                        value={formData.title}
                        onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                        style={{
                          width: "100%",
                          padding: "16px",
                          borderRadius: "12px",
                          border: "2px solid #e5e7eb",
                          backgroundColor: "#ffffff",
                          fontSize: "16px",
                          fontWeight: "500",
                          color: "#000000",
                          outline: "none",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = "#000000"
                          e.target.style.boxShadow = "0 0 0 4px rgba(0, 0, 0, 0.1)"
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "#e5e7eb"
                          e.target.style.boxShadow = "none"
                        }}
                      >
                        <option value="">Select Title</option>
                        {TITLE_OPTIONS.map((title) => (
                          <option key={title} value={title}>
                            {title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        className="block text-sm font-medium text-gray-700 mb-2"
                        style={{
                          display: "block",
                          fontSize: "14px",
                          fontWeight: "700",
                          color: "#000000",
                          marginBottom: "8px",
                        }}
                      >
                        Name *
                      </label>
                      <motion.input
                        whileFocus={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="Full Name"
                        style={{
                          width: "100%",
                          padding: "16px",
                          borderRadius: "12px",
                          border: "2px solid #e5e7eb",
                          backgroundColor: "#ffffff",
                          fontSize: "16px",
                          fontWeight: "500",
                          color: "#000000",
                          outline: "none",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = "#000000"
                          e.target.style.boxShadow = "0 0 0 4px rgba(0, 0, 0, 0.1)"
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "#e5e7eb"
                          e.target.style.boxShadow = "none"
                        }}
                      />
                    </div>
                    <div>
                      <label
                        className="block text-sm font-medium text-gray-700 mb-2"
                        style={{
                          display: "block",
                          fontSize: "14px",
                          fontWeight: "700",
                          color: "#000000",
                          marginBottom: "8px",
                        }}
                      >
                        Initials *
                      </label>
                      <motion.input
                        whileFocus={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        type="text"
                        required
                        value={formData.initials}
                        onChange={(e) => setFormData((prev) => ({ ...prev, initials: e.target.value }))}
                        placeholder="e.g., A.B.C"
                        style={{
                          width: "100%",
                          padding: "16px",
                          borderRadius: "12px",
                          border: "2px solid #e5e7eb",
                          backgroundColor: "#ffffff",
                          fontSize: "16px",
                          fontWeight: "500",
                          color: "#000000",
                          outline: "none",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = "#000000"
                          e.target.style.boxShadow = "0 0 0 4px rgba(0, 0, 0, 0.1)"
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "#e5e7eb"
                          e.target.style.boxShadow = "none"
                        }}
                      />
                    </div>
                    <div>
                      <label
                        className="block text-sm font-medium text-gray-700 mb-2"
                        style={{
                          display: "block",
                          fontSize: "14px",
                          fontWeight: "700",
                          color: "#000000",
                          marginBottom: "8px",
                        }}
                      >
                        Department *
                      </label>
                      <select
                        required
                        value={formData.department}
                        onChange={(e) => setFormData((prev) => ({ ...prev, department: e.target.value }))}
                        style={{
                          width: "100%",
                          padding: "16px",
                          borderRadius: "12px",
                          border: "2px solid #e5e7eb",
                          backgroundColor: "#ffffff",
                          fontSize: "16px",
                          fontWeight: "500",
                          color: "#000000",
                          outline: "none",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = "#000000"
                          e.target.style.boxShadow = "0 0 0 4px rgba(0, 0, 0, 0.1)"
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "#e5e7eb"
                          e.target.style.boxShadow = "none"
                        }}
                      >
                        <option value="">Select Department</option>
                        {DEPARTMENT_OPTIONS.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        className="block text-sm font-medium text-gray-700 mb-2"
                        style={{
                          display: "block",
                          fontSize: "14px",
                          fontWeight: "700",
                          color: "#000000",
                          marginBottom: "8px",
                        }}
                      >
                        Email
                      </label>
                      <motion.input
                        whileFocus={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                        placeholder="email@example.com"
                        style={{
                          width: "100%",
                          padding: "16px",
                          borderRadius: "12px",
                          border: "2px solid #e5e7eb",
                          backgroundColor: "#ffffff",
                          fontSize: "16px",
                          fontWeight: "500",
                          color: "#000000",
                          outline: "none",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = "#000000"
                          e.target.style.boxShadow = "0 0 0 4px rgba(0, 0, 0, 0.1)"
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "#e5e7eb"
                          e.target.style.boxShadow = "none"
                        }}
                      />
                    </div>
                    <div>
                      <label
                        className="block text-sm font-medium text-gray-700 mb-2"
                        style={{
                          display: "block",
                          fontSize: "14px",
                          fontWeight: "700",
                          color: "#000000",
                          marginBottom: "8px",
                        }}
                      >
                        Employee ID
                      </label>
                      <motion.input
                        whileFocus={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        type="text"
                        value={formData.employeeId}
                        onChange={(e) => setFormData((prev) => ({ ...prev, employeeId: e.target.value }))}
                        placeholder="EMP001"
                        style={{
                          width: "100%",
                          padding: "16px",
                          borderRadius: "12px",
                          border: "2px solid #e5e7eb",
                          backgroundColor: "#ffffff",
                          fontSize: "16px",
                          fontWeight: "500",
                          color: "#000000",
                          outline: "none",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = "#000000"
                          e.target.style.boxShadow = "0 0 0 4px rgba(0, 0, 0, 0.1)"
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "#e5e7eb"
                          e.target.style.boxShadow = "none"
                        }}
                      />
                    </div>
                    <div>
                      <label
                        className="block text-sm font-medium text-gray-700 mb-2"
                        style={{
                          display: "block",
                          fontSize: "14px",
                          fontWeight: "700",
                          color: "#000000",
                          marginBottom: "8px",
                        }}
                      >
                        Phone Number
                      </label>
                      <motion.input
                        whileFocus={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                        placeholder="+91 9876543210"
                        style={{
                          width: "100%",
                          padding: "16px",
                          borderRadius: "12px",
                          border: "2px solid #e5e7eb",
                          backgroundColor: "#ffffff",
                          fontSize: "16px",
                          fontWeight: "500",
                          color: "#000000",
                          outline: "none",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = "#000000"
                          e.target.style.boxShadow = "0 0 0 4px rgba(0, 0, 0, 0.1)"
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "#e5e7eb"
                          e.target.style.boxShadow = "none"
                        }}
                      />
                    </div>
                    <div>
                      <label
                        className="block text-sm font-medium text-gray-700 mb-2"
                        style={{
                          display: "block",
                          fontSize: "14px",
                          fontWeight: "700",
                          color: "#000000",
                          marginBottom: "8px",
                        }}
                      >
                        Date of Joining
                      </label>
                      <motion.input
                        whileFocus={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        type="date"
                        value={formData.dateOfJoining}
                        onChange={(e) => setFormData((prev) => ({ ...prev, dateOfJoining: e.target.value }))}
                        style={{
                          width: "100%",
                          padding: "16px",
                          borderRadius: "12px",
                          border: "2px solid #e5e7eb",
                          backgroundColor: "#ffffff",
                          fontSize: "16px",
                          fontWeight: "500",
                          color: "#000000",
                          outline: "none",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = "#000000"
                          e.target.style.boxShadow = "0 0 0 4px rgba(0, 0, 0, 0.1)"
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "#e5e7eb"
                          e.target.style.boxShadow = "none"
                        }}
                      />
                    </div>
                  </div>

                  {/* Studies Section */}
                  <div style={{ marginBottom: "40px" }}>
                    <h3
                      style={{
                        fontSize: "24px",
                        fontWeight: "700",
                        color: "#000000",
                        marginBottom: "24px",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <div
                        style={{
                          background: "linear-gradient(135deg, #000000 0%, #333333 100%)",
                          borderRadius: "12px",
                          padding: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <GraduationCap size={20} color="#ffffff" />
                      </div>
                      Academic Qualifications
                    </h3>

                    {/* Add Study Form */}
                    <div style={{ background: "#f8f9fa", padding: "24px", borderRadius: "16px", marginBottom: "24px" }}>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                          gap: "16px",
                        }}
                      >
                        <div style={{ position: "relative" }}>
                          <label
                            style={{
                              display: "block",
                              fontSize: "14px",
                              fontWeight: "600",
                              color: "#333333",
                              marginBottom: "8px",
                            }}
                          >
                            Degree
                          </label>
                          <select
                            value={studyForm.degree}
                            onChange={(e) => setStudyForm((prev) => ({ ...prev, degree: e.target.value }))}
                            style={{
                              width: "100%",
                              padding: "12px",
                              borderRadius: "8px",
                              border: "1px solid #ced4da",
                              backgroundColor: "#ffffff",
                              fontSize: "14px",
                              fontWeight: "500",
                              color: "#495057",
                              outline: "none",
                              cursor: "pointer",
                              transition: "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out",
                            }}
                          >
                            <option value="">Select Degree</option>
                            {DEGREE_OPTIONS.map((degree) => (
                              <option key={degree} value={degree}>
                                {degree}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div style={{ position: "relative" }}>
                          <label
                            style={{
                              display: "block",
                              fontSize: "14px",
                              fontWeight: "600",
                              color: "#333333",
                              marginBottom: "8px",
                            }}
                          >
                            Specialization
                          </label>
                          <motion.input
                            whileFocus={{ scale: 1.01 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            type="text"
                            value={studyForm.specialization}
                            onChange={(e) => setStudyForm((prev) => ({ ...prev, specialization: e.target.value }))}
                            placeholder="Specialization"
                            style={{
                              width: "100%",
                              padding: "12px",
                              borderRadius: "8px",
                              border: "1px solid #ced4da",
                              backgroundColor: "#ffffff",
                              fontSize: "14px",
                              fontWeight: "500",
                              color: "#495057",
                              outline: "none",
                              transition: "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out",
                            }}
                          />
                        </div>
                        <div style={{ position: "relative" }}>
                          <label
                            style={{
                              display: "block",
                              fontSize: "14px",
                              fontWeight: "600",
                              color: "#333333",
                              marginBottom: "8px",
                            }}
                          >
                            Institution
                          </label>
                          <motion.input
                            whileFocus={{ scale: 1.01 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            type="text"
                            value={studyForm.institution}
                            onChange={(e) => setStudyForm((prev) => ({ ...prev, institution: e.target.value }))}
                            placeholder="Institution"
                            style={{
                              width: "100%",
                              padding: "12px",
                              borderRadius: "8px",
                              border: "1px solid #ced4da",
                              backgroundColor: "#ffffff",
                              fontSize: "14px",
                              fontWeight: "500",
                              color: "#495057",
                              outline: "none",
                              transition: "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out",
                            }}
                          />
                        </div>
                        <div style={{ position: "relative", display: "flex", gap: "8px" }}>
                          <label
                            style={{
                              display: "block",
                              fontSize: "14px",
                              fontWeight: "600",
                              color: "#333333",
                              marginBottom: "8px",
                            }}
                          >
                            Year
                          </label>
                          <motion.input
                            whileFocus={{ scale: 1.01 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            type="number"
                            value={studyForm.year}
                            onChange={(e) => setStudyForm((prev) => ({ ...prev, year: e.target.value }))}
                            placeholder="Year"
                            min="1950"
                            max={new Date().getFullYear()}
                            style={{
                              width: "100%",
                              padding: "12px",
                              borderRadius: "8px",
                              border: "1px solid #ced4da",
                              backgroundColor: "#ffffff",
                              fontSize: "14px",
                              fontWeight: "500",
                              color: "#495057",
                              outline: "none",
                              transition: "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out",
                            }}
                          />
                          <motion.button
                            whileHover={{ scale: 1.1, y: -2 }}
                            whileTap={{ scale: 0.9 }}
                            type="button"
                            onClick={addStudy}
                            style={{
                              padding: "8px",
                              background: "linear-gradient(135deg, #000000 0%, #333333 100%)",
                              color: "#ffffff",
                              borderRadius: "8px",
                              border: "none",
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                            }}
                          >
                            <Plus size={16} />
                          </motion.button>
                        </div>
                      </div>
                    </div>

                    {/* Studies List */}
                    {formData.studies.length > 0 && (
                      <div style={{ marginBottom: "24px" }}>
                        {formData.studies.map((study, index) => (
                          <div
                            key={index}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              background: "#ffffff",
                              padding: "16px",
                              borderRadius: "8px",
                              marginBottom: "8px",
                              border: "1px solid #e5e7eb",
                            }}
                          >
                            <span style={{ fontSize: "14px", color: "#333333" }}>
                              <strong>{study.degree}</strong>
                              {study.specialization && ` in ${study.specialization}`}
                              {study.institution && ` from ${study.institution}`}
                              {study.year && ` (${study.year})`}
                            </span>
                            <motion.button
                              whileHover={{ scale: 1.1, y: -2 }}
                              whileTap={{ scale: 0.9 }}
                              type="button"
                              onClick={() => removeStudy(index)}
                              style={{
                                padding: "8px",
                                background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                                color: "#ffffff",
                                borderRadius: "8px",
                                border: "none",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                              }}
                            >
                              <X size={16} />
                            </motion.button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: "16px",
                      paddingTop: "24px",
                      borderTop: "1px solid #e5e7eb",
                    }}
                  >
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => {
                        setShowModal(false)
                        resetForm()
                      }}
                      style={{
                        padding: "16px 32px",
                        background: "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)",
                        color: "#000000",
                        borderRadius: "12px",
                        border: "2px solid #e5e7eb",
                        fontSize: "16px",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                      }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={loading}
                      style={{
                        padding: "16px 32px",
                        background: loading ? "#666666" : "linear-gradient(135deg, #000000 0%, #333333 100%)",
                        color: "#ffffff",
                        borderRadius: "12px",
                        border: "none",
                        fontSize: "16px",
                        fontWeight: "700",
                        cursor: loading ? "not-allowed" : "pointer",
                        transition: "all 0.3s ease",
                        opacity: loading ? 0.7 : 1,
                      }}
                    >
                      {loading ? "Saving..." : editingFaculty ? "Update Faculty" : "Create Faculty"}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default FacultyManagement



