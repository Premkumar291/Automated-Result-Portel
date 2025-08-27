"use client"

import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Plus, Search, Edit3, Trash2, BookOpen, X, Filter } from "lucide-react"
import toast from "react-hot-toast"

const DEPARTMENT_OPTIONS = [
  "Computer Science",
  "Electronics",
  "Mechanical",
  "Civil",
  "Mathematics",
  "Physics",
  "Chemistry",
]

const SEMESTER_OPTIONS = ["1", "2", "3", "4", "5", "6", "7", "8"]
const SUBJECT_TYPE_OPTIONS = ["Theory", "Practical", "Project"]

const subjectAPI = {
  getSubjects: async (params) => ({ data: [] }),
  createSubject: async (data) => ({ success: true }),
  updateSubject: async (id, data) => ({ success: true }),
  deleteSubject: async (id) => ({ success: true }),
}

const SubjectManagement = () => {
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingSubject, setEditingSubject] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("")

  const [formData, setFormData] = useState({
    subjectCode: "",
    subjectName: "",
    department: "",
    semester: "",
    credits: "",
    subjectType: "",
  })

  const fetchSubjects = async () => {
    try {
      setLoading(true)
      const response = await subjectAPI.getSubjects({
        search: searchTerm,
        department: departmentFilter,
      })
      setSubjects(response.data || [])
    } catch (error) {
      toast.error("Failed to fetch subjects")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubjects()
  }, [searchTerm, departmentFilter])

  const resetForm = () => {
    setFormData({
      subjectCode: "",
      subjectName: "",
      department: "",
      semester: "",
      credits: "",
      subjectType: "",
    })
    setEditingSubject(null)
  }

  const openEditModal = (subject) => {
    setFormData({
      subjectCode: subject.subjectCode || "",
      subjectName: subject.subjectName || "",
      department: subject.department || "",
      semester: subject.semester || "",
      credits: subject.credits?.toString() || "",
      subjectType: subject.subjectType || "",
    })
    setEditingSubject(subject)
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const subjectData = {
        ...formData,
        credits: Number.parseInt(formData.credits),
      }

      if (editingSubject) {
        await subjectAPI.updateSubject(editingSubject._id, subjectData)
        toast.success("Subject updated successfully!")
      } else {
        await subjectAPI.createSubject(subjectData)
        toast.success("Subject created successfully!")
      }

      setShowModal(false)
      resetForm()
      fetchSubjects()
    } catch (error) {
      toast.error(`Failed to ${editingSubject ? "update" : "create"} subject`)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this subject?")) {
      try {
        await subjectAPI.deleteSubject(id)
        toast.success("Subject deleted successfully!")
        fetchSubjects()
      } catch (error) {
        toast.error("Failed to delete subject")
      }
    }
  }

  const filteredSubjects = subjects.filter((subject) => {
    const matchesSearch =
      subject.subjectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.subjectCode?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = !departmentFilter || subject.department === departmentFilter
    return matchesSearch && matchesDepartment
  })

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
                  <BookOpen size={32} color="#ffffff" />
                </div>
                Subject Management
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
                Manage academic subjects and their details
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
              Add Subject
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
                placeholder="Search subjects..."
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
              onClick={fetchSubjects}
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

        {/* Subject List */}
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
          ) : filteredSubjects.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "80px 40px",
                color: "#666666",
              }}
            >
              <BookOpen size={64} style={{ margin: "0 auto 24px", opacity: 0.3 }} />
              <h3 style={{ fontSize: "24px", fontWeight: "600", margin: "0 0 12px 0", color: "#000000" }}>
                No Subjects Found
              </h3>
              <p style={{ fontSize: "16px", margin: 0 }}>Start by adding your first subject to the system.</p>
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
                      Subject Details
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
                      Semester
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
                      Credits & Type
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
                  {filteredSubjects.map((subject, index) => (
                    <motion.tr
                      key={subject._id}
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
                            {subject.subjectName}
                          </div>
                          <div style={{ fontSize: "14px", color: "#666666", marginBottom: "4px" }}>
                            Code: {subject.subjectCode}
                          </div>
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
                          {subject.department}
                        </span>
                      </td>
                      <td style={{ padding: "24px" }}>
                        <span
                          style={{
                            padding: "6px 12px",
                            background: "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)",
                            color: "#000000",
                            fontSize: "14px",
                            fontWeight: "600",
                            borderRadius: "12px",
                            border: "1px solid #e5e7eb",
                          }}
                        >
                          Semester {subject.semester}
                        </span>
                      </td>
                      <td style={{ padding: "24px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <span
                            style={{
                              padding: "4px 8px",
                              background: "linear-gradient(135deg, #000000 0%, #333333 100%)",
                              color: "#ffffff",
                              fontSize: "12px",
                              fontWeight: "600",
                              borderRadius: "8px",
                              width: "fit-content",
                            }}
                          >
                            {subject.credits} Credits
                          </span>
                          <span
                            style={{
                              padding: "4px 8px",
                              background: "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)",
                              color: "#000000",
                              fontSize: "12px",
                              fontWeight: "600",
                              borderRadius: "8px",
                              border: "1px solid #e5e7eb",
                              width: "fit-content",
                            }}
                          >
                            {subject.subjectType}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "24px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <motion.button
                            whileHover={{ scale: 1.1, y: -2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => openEditModal(subject)}
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
                            onClick={() => handleDelete(subject._id)}
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
                maxWidth: "600px",
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
                    {editingSubject ? "Edit Subject" : "Add New Subject"}
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
                        Subject Code *
                      </label>
                      <motion.input
                        whileFocus={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        type="text"
                        required
                        value={formData.subjectCode}
                        onChange={(e) => setFormData((prev) => ({ ...prev, subjectCode: e.target.value }))}
                        placeholder="e.g., CS101"
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
                        style={{
                          display: "block",
                          fontSize: "14px",
                          fontWeight: "700",
                          color: "#000000",
                          marginBottom: "8px",
                        }}
                      >
                        Subject Name *
                      </label>
                      <motion.input
                        whileFocus={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        type="text"
                        required
                        value={formData.subjectName}
                        onChange={(e) => setFormData((prev) => ({ ...prev, subjectName: e.target.value }))}
                        placeholder="Subject Name"
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
                        style={{
                          display: "block",
                          fontSize: "14px",
                          fontWeight: "700",
                          color: "#000000",
                          marginBottom: "8px",
                        }}
                      >
                        Semester *
                      </label>
                      <select
                        required
                        value={formData.semester}
                        onChange={(e) => setFormData((prev) => ({ ...prev, semester: e.target.value }))}
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
                        <option value="">Select Semester</option>
                        {SEMESTER_OPTIONS.map((sem) => (
                          <option key={sem} value={sem}>
                            Semester {sem}
                          </option>
                        ))}
                      </select>
                    </div>
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
                        Credits *
                      </label>
                      <motion.input
                        whileFocus={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        type="number"
                        required
                        min="1"
                        max="10"
                        value={formData.credits}
                        onChange={(e) => setFormData((prev) => ({ ...prev, credits: e.target.value }))}
                        placeholder="Credits"
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
                        style={{
                          display: "block",
                          fontSize: "14px",
                          fontWeight: "700",
                          color: "#000000",
                          marginBottom: "8px",
                        }}
                      >
                        Subject Type *
                      </label>
                      <select
                        required
                        value={formData.subjectType}
                        onChange={(e) => setFormData((prev) => ({ ...prev, subjectType: e.target.value }))}
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
                        <option value="">Select Type</option>
                        {SUBJECT_TYPE_OPTIONS.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
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
                      style={{
                        padding: "16px 32px",
                        background: "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)",
                        color: "#ffffff",
                        borderRadius: "12px",
                        border: "none",
                        fontSize: "16px",
                        fontWeight: "700",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        boxShadow: "0 4px 12px -2px rgba(0, 0, 0, 0.3)",
                      }}
                    >
                      {editingSubject ? "Update Subject" : "Create Subject"}
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

export default SubjectManagement

