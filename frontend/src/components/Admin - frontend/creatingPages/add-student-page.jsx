"use client"
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowLeft, Loader2 } from "lucide-react"
import { toast } from "react-hot-toast"

const AddStudentPage = () => {
  const navigate = useNavigate()
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    rollNumber: '',
    typeOfAdmission: '',
    modeOfAdmission: 'DIRECT',
    mediumOfInstruction: '',
    registerNumber: '',
    name: '',
    gender: '',
    fatherName: '',
    motherName: '',
    community: '',
    aadaarNumber: '',
    department: '',
    joiningYear: new Date().getFullYear(),
    passOutYear: new Date().getFullYear() + 4,
    dateOfBirth: '',
    mobileNumber: ''
  })
  const gsapRef = useRef(null)

  // This useEffect is just to simulate theme changes if needed,
  // or to read a default theme from local storage/context if available.
  useEffect(() => {
    // You might want to read the theme from a global context or local storage here
    // For example: const savedTheme = localStorage.getItem('theme');
    // if (savedTheme === 'dark') setIsDarkMode(true);
    const loadGSAP = async () => {
      if (!window.gsap) {
        const gsapScript = document.createElement("script")
        gsapScript.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"
        document.head.appendChild(gsapScript)
        await new Promise((resolve) => (gsapScript.onload = resolve))
      }
      if (window.gsap) {
        const { gsap } = window
        gsapRef.current = gsap
        gsap.fromTo(".animate-form", { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: "power3.out" })
      }
    }
    loadGSAP()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // Validate required fields
      const requiredFields = ['email', 'registerNumber', 'name', 'department', 'joiningYear', 'passOutYear', 'dateOfBirth', 'mobileNumber', 'rollNumber', 'typeOfAdmission', 'aadaarNumber']
      const missingFields = requiredFields.filter(field => !formData[field])
      
      if (missingFields.length > 0) {
        toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`)
        setIsLoading(false)
        return
      }

      // Prepare the data for API call
      const studentData = {
        ...formData,
        joiningYear: parseInt(formData.joiningYear),
        passOutYear: parseInt(formData.passOutYear)
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/student`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(studentData)
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Student added successfully!')
        navigate('/admin/dashboard')
      } else {
        toast.error(data.message || 'Failed to add student')
      }
    } catch (error) {
      console.error('Error adding student:', error)
      toast.error('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&family=Orbitron:wght@400;500;600;700;800;900&family=Exo+2:wght@400;500;600;700;800;900&family=Rajdhani:wght@400;500;600;700&display=swap');
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        .mono {
          font-family: 'JetBrains Mono', monospace;
        }
        .theme-transition {
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        /* Enhanced Card Shadows - Light */
        .elevated-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(203, 213, 225, 0.2);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.8);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .elevated-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), 0 8px 20px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9);
        }
        /* Dark Theme Cards - Massive Innovation */
        .dark-elevated-card {
          background: linear-gradient(135deg, #0a0a0a 0%, #111111 50%, #1a1a1a 100%);
          backdrop-filter: blur(30px) saturate(200%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow:
            0 20px 60px rgba(0, 0, 0, 0.9),
            0 8px 25px rgba(255, 255, 255, 0.05),
            inset 0 1px 0 rgba(255, 255, 255, 0.1),
            0 0 40px rgba(139, 92, 246, 0.1);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .dark-elevated-card:hover {
          transform: translateY(-4px) scale(1.01);
          box-shadow:
            0 30px 80px rgba(0, 0, 0, 0.95),
            0 12px 35px rgba(255, 255, 255, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.15),
            0 0 60px rgba(139, 92, 246, 0.2);
        }
        /* Dark Theme Background */
        .dark-bg {
          background: linear-gradient(135deg, #000000 0%, #0a0a0a 25%, #111111 50%, #0a0a0a 75%, #000000 100%);
        }
        /* Dark Theme Text Colors */
        .dark-text-primary {
          color: #ffffff;
        }
        .dark-text-secondary {
          color: rgba(255, 255, 255, 0.8);
        }
        .dark-text-muted {
          color: rgba(255, 255, 255, 0.6);
        }
      `}</style>
      <div
        className={`min-h-screen flex flex-col items-center justify-center px-4 py-12 theme-transition ${
          isDarkMode ? "dark-bg" : "bg-white"
        }`}
      >
          <motion.div
          className={`${
            isDarkMode ? "dark-elevated-card" : "elevated-card"
          } rounded-xl p-8 sm:p-10 w-full max-w-6xl text-center animate-form`}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2 className={`text-3xl font-bold ${isDarkMode ? "dark-text-primary" : "text-slate-900"} mb-6`}
              >
            Add New Student
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6 text-left">
            {isLoading ? (
              <div className="flex justify-center">
                <Loader2 className="animate-spin" size={24} />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Email */}
                <div>
                  <label htmlFor="email" className={`block text-sm font-medium ${isDarkMode ? "dark-text-secondary" : "text-gray-700"} mb-1`}>
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className={`w-full px-4 py-2 rounded-md border ${
                      isDarkMode
                        ? "bg-gray-900 border-gray-700 text-white focus:ring-purple-500"
                        : "bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-500"
                    } focus:outline-none focus:border-transparent transition-colors duration-200`}
                    placeholder="Enter student's email"
                    onChange={handleInputChange}
                    value={formData.email}
                  />
                </div>

                {/* Roll Number */}
                <div>
                  <label htmlFor="rollNumber" className={`block text-sm font-medium ${isDarkMode ? "dark-text-secondary" : "text-gray-700"} mb-1`}>
                    Roll Number *
                  </label>
                  <input
                    type="text"
                    id="rollNumber"
                    name="rollNumber"
                    required
                    className={`w-full px-4 py-2 rounded-md border ${
                      isDarkMode
                        ? "bg-gray-900 border-gray-700 text-white focus:ring-purple-500"
                        : "bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-500"
                    } focus:outline-none focus:border-transparent transition-colors duration-200`}
                    placeholder="e.g., 2023CS001"
                    onChange={handleInputChange}
                    value={formData.rollNumber}
                  />
                </div>

                {/* Register Number */}
                <div>
                  <label htmlFor="registerNumber" className={`block text-sm font-medium ${isDarkMode ? "dark-text-secondary" : "text-gray-700"} mb-1`}>
                    Register Number *
                  </label>
                  <input
                    type="text"
                    id="registerNumber"
                    name="registerNumber"
                    required
                    className={`w-full px-4 py-2 rounded-md border ${
                      isDarkMode
                        ? "bg-gray-900 border-gray-700 text-white focus:ring-purple-500"
                        : "bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-500"
                    } focus:outline-none focus:border-transparent transition-colors duration-200`}
                    placeholder="Enter register number"
                    onChange={handleInputChange}
                    value={formData.registerNumber}
                  />
                </div>

                {/* Student Name */}
                <div>
                  <label htmlFor="name" className={`block text-sm font-medium ${isDarkMode ? "dark-text-secondary" : "text-gray-700"} mb-1`}>
                    Student Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className={`w-full px-4 py-2 rounded-md border ${
                      isDarkMode
                        ? "bg-gray-900 border-gray-700 text-white focus:ring-purple-500"
                        : "bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-500"
                    } focus:outline-none focus:border-transparent transition-colors duration-200`}
                    placeholder="Enter student's full name"
                    onChange={handleInputChange}
                    value={formData.name}
                  />
                </div>

                {/* Department */}
                <div>
                  <label htmlFor="department" className={`block text-sm font-medium ${isDarkMode ? "dark-text-secondary" : "text-gray-700"} mb-1`}>
                    Department *
                  </label>
                  <select
                    id="department"
                    name="department"
                    required
                    className={`w-full px-4 py-2 rounded-md border ${
                      isDarkMode
                        ? "bg-gray-900 border-gray-700 text-white focus:ring-purple-500"
                        : "bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-500"
                    } focus:outline-none focus:border-transparent transition-colors duration-200`}
                    onChange={handleInputChange}
                    value={formData.department}
                  >
                    <option value="">Select department</option>
                    <option value="CSE">Computer Science Engineering</option>
                    <option value="ECE">Electronics and Communication Engineering</option>
                    <option value="EEE">Electrical and Electronics Engineering</option>
                    <option value="MECH">Mechanical Engineering</option>
                    <option value="CIVIL">Civil Engineering</option>
                    <option value="IT">Information Technology</option>
                    <option value="AUTO">Automobile Engineering</option>
                    <option value="others">Others</option>
                  </select>
                </div>

                {/* Gender */}
                <div>
                  <label htmlFor="gender" className={`block text-sm font-medium ${isDarkMode ? "dark-text-secondary" : "text-gray-700"} mb-1`}>
                    Gender
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    className={`w-full px-4 py-2 rounded-md border ${
                      isDarkMode
                        ? "bg-gray-900 border-gray-700 text-white focus:ring-purple-500"
                        : "bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-500"
                    } focus:outline-none focus:border-transparent transition-colors duration-200`}
                    onChange={handleInputChange}
                    value={formData.gender}
                  >
                    <option value="">Select gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                {/* Type of Admission */}
                <div>
                  <label htmlFor="typeOfAdmission" className={`block text-sm font-medium ${isDarkMode ? "dark-text-secondary" : "text-gray-700"} mb-1`}>
                    Type of Admission *
                  </label>
                  <select
                    id="typeOfAdmission"
                    name="typeOfAdmission"
                    required
                    className={`w-full px-4 py-2 rounded-md border ${
                      isDarkMode
                        ? "bg-gray-900 border-gray-700 text-white focus:ring-purple-500"
                        : "bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-500"
                    } focus:outline-none focus:border-transparent transition-colors duration-200`}
                    onChange={handleInputChange}
                    value={formData.typeOfAdmission}
                  >
                    <option value="">Select admission type</option>
                    <option value="COUNSELLING">Counselling</option>
                    <option value="MANAGEMENT">Management</option>
                  </select>
                </div>

                {/* Medium of Instruction */}
                <div>
                  <label htmlFor="mediumOfInstruction" className={`block text-sm font-medium ${isDarkMode ? "dark-text-secondary" : "text-gray-700"} mb-1`}>
                    Medium of Instruction
                  </label>
                  <select
                    id="mediumOfInstruction"
                    name="mediumOfInstruction"
                    className={`w-full px-4 py-2 rounded-md border ${
                      isDarkMode
                        ? "bg-gray-900 border-gray-700 text-white focus:ring-purple-500"
                        : "bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-500"
                    } focus:outline-none focus:border-transparent transition-colors duration-200`}
                    onChange={handleInputChange}
                    value={formData.mediumOfInstruction}
                  >
                    <option value="">Select medium</option>
                    <option value="ENGLISH">English</option>
                    <option value="TAMIL">Tamil</option>
                  </select>
                </div>

                {/* Father's Name */}
                <div>
                  <label htmlFor="fatherName" className={`block text-sm font-medium ${isDarkMode ? "dark-text-secondary" : "text-gray-700"} mb-1`}>
                    Father's Name
                  </label>
                  <input
                    type="text"
                    id="fatherName"
                    name="fatherName"
                    className={`w-full px-4 py-2 rounded-md border ${
                      isDarkMode
                        ? "bg-gray-900 border-gray-700 text-white focus:ring-purple-500"
                        : "bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-500"
                    } focus:outline-none focus:border-transparent transition-colors duration-200`}
                    placeholder="Enter father's name"
                    onChange={handleInputChange}
                    value={formData.fatherName}
                  />
                </div>

                {/* Mother's Name */}
                <div>
                  <label htmlFor="motherName" className={`block text-sm font-medium ${isDarkMode ? "dark-text-secondary" : "text-gray-700"} mb-1`}>
                    Mother's Name
                  </label>
                  <input
                    type="text"
                    id="motherName"
                    name="motherName"
                    className={`w-full px-4 py-2 rounded-md border ${
                      isDarkMode
                        ? "bg-gray-900 border-gray-700 text-white focus:ring-purple-500"
                        : "bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-500"
                    } focus:outline-none focus:border-transparent transition-colors duration-200`}
                    placeholder="Enter mother's name"
                    onChange={handleInputChange}
                    value={formData.motherName}
                  />
                </div>

                {/* Community */}
                <div>
                  <label htmlFor="community" className={`block text-sm font-medium ${isDarkMode ? "dark-text-secondary" : "text-gray-700"} mb-1`}>
                    Community
                  </label>
                  <input
                    type="text"
                    id="community"
                    name="community"
                    className={`w-full px-4 py-2 rounded-md border ${
                      isDarkMode
                        ? "bg-gray-900 border-gray-700 text-white focus:ring-purple-500"
                        : "bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-500"
                    } focus:outline-none focus:border-transparent transition-colors duration-200`}
                    placeholder="Enter community"
                    onChange={handleInputChange}
                    value={formData.community}
                  />
                </div>

                {/* Aadhaar Number */}
                <div>
                  <label htmlFor="aadaarNumber" className={`block text-sm font-medium ${isDarkMode ? "dark-text-secondary" : "text-gray-700"} mb-1`}>
                    Aadhaar Number *
                  </label>
                  <input
                    type="text"
                    id="aadaarNumber"
                    name="aadaarNumber"
                    required
                    className={`w-full px-4 py-2 rounded-md border ${
                      isDarkMode
                        ? "bg-gray-900 border-gray-700 text-white focus:ring-purple-500"
                        : "bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-500"
                    } focus:outline-none focus:border-transparent transition-colors duration-200`}
                    placeholder="Enter 12-digit Aadhaar number"
                    onChange={handleInputChange}
                    value={formData.aadaarNumber}
                  />
                </div>

                {/* Mobile Number */}
                <div>
                  <label htmlFor="mobileNumber" className={`block text-sm font-medium ${isDarkMode ? "dark-text-secondary" : "text-gray-700"} mb-1`}>
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    id="mobileNumber"
                    name="mobileNumber"
                    required
                    className={`w-full px-4 py-2 rounded-md border ${
                      isDarkMode
                        ? "bg-gray-900 border-gray-700 text-white focus:ring-purple-500"
                        : "bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-500"
                    } focus:outline-none focus:border-transparent transition-colors duration-200`}
                    placeholder="Enter 10-digit mobile number"
                    onChange={handleInputChange}
                    value={formData.mobileNumber}
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label htmlFor="dateOfBirth" className={`block text-sm font-medium ${isDarkMode ? "dark-text-secondary" : "text-gray-700"} mb-1`}>
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    required
                    className={`w-full px-4 py-2 rounded-md border ${
                      isDarkMode
                        ? "bg-gray-900 border-gray-700 text-white focus:ring-purple-500"
                        : "bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-500"
                    } focus:outline-none focus:border-transparent transition-colors duration-200`}
                    onChange={handleInputChange}
                    value={formData.dateOfBirth}
                  />
                </div>

                {/* Joining Year */}
                <div>
                  <label htmlFor="joiningYear" className={`block text-sm font-medium ${isDarkMode ? "dark-text-secondary" : "text-gray-700"} mb-1`}>
                    Joining Year *
                  </label>
                  <input
                    type="number"
                    id="joiningYear"
                    name="joiningYear"
                    required
                    min="2000"
                    max={new Date().getFullYear() + 1}
                    className={`w-full px-4 py-2 rounded-md border ${
                      isDarkMode
                        ? "bg-gray-900 border-gray-700 text-white focus:ring-purple-500"
                        : "bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-500"
                    } focus:outline-none focus:border-transparent transition-colors duration-200`}
                    placeholder="e.g., 2023"
                    onChange={handleInputChange}
                    value={formData.joiningYear}
                  />
                </div>

                {/* Pass Out Year */}
                <div>
                  <label htmlFor="passOutYear" className={`block text-sm font-medium ${isDarkMode ? "dark-text-secondary" : "text-gray-700"} mb-1`}>
                    Pass Out Year *
                  </label>
                  <input
                    type="number"
                    id="passOutYear"
                    name="passOutYear"
                    required
                    min="2000"
                    max="2050"
                    className={`w-full px-4 py-2 rounded-md border ${
                      isDarkMode
                        ? "bg-gray-900 border-gray-700 text-white focus:ring-purple-500"
                        : "bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-500"
                    } focus:outline-none focus:border-transparent transition-colors duration-200`}
                    placeholder="e.g., 2027"
                    onChange={handleInputChange}
                    value={formData.passOutYear}
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <button
                type="submit"
                className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg active:translate-y-[1px] active:scale-[0.98]
                  ${
                    isDarkMode
                      ? "bg-purple-600 hover:bg-purple-700 text-white"
                      : "bg-pink-500 hover:bg-pink-600 text-white"
                  }`}
              >
                Add Student
              </button>
              <button
                onClick={() => window.history.back()}
                className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-md active:translate-y-[1px] active:scale-[0.98]
                  ${
                    isDarkMode
                      ? "bg-gray-700 hover:bg-gray-600 text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Go Back</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </>
  )
}

export default AddStudentPage
