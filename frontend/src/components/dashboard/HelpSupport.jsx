import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { MdMenu } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown, FaChevronUp, FaEnvelope, FaPhone } from "react-icons/fa";
import { BackgroundBeamsWithCollision } from "./ui/background-beams-with-collision";
import { useTheme } from "../../context/ThemeContext";
import { cn } from "@/lib/utils";

const HelpSupport = () => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [openFAQ, setOpenFAQ] = useState(null);
  const { darkMode } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Handle hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const faqs = [
    {
      question: "How can I upload student results?",
      answer:
        "Go to the Upload Results section from the sidebar and upload a CSV or PDF file with the required structure.",
    },
    {
      question: "What if I forgot my password?",
      answer:
        "Click on 'Forgot Password' on the login page and follow the 3-step reset flow.",
    },
    {
      question: "How to contact the admin for portal access?",
      answer:
        "Reach out to your college's admin department with your staff ID to request access or email support@resultportal.edu.",
    },
    {
      question: "Why is my file upload failing?",
      answer:
        "Ensure the file is in the correct format (.csv, .pdf) and matches the column structure provided in the documentation.",
    },
  ];

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <div className="flex min-h-screen font-[Poppins] overflow-x-hidden relative">
      <BackgroundBeamsWithCollision 
        className={cn(
          "absolute inset-0 z-0 transition-all duration-500",
          darkMode ? "from-gray-950 to-gray-900" : "from-white to-neutral-100"
        )}
      />
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out ${
          sidebarVisible ? "translate-x-0" : "-translate-x-full"
        } ${darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}
        style={{
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          boxShadow: darkMode 
            ? "0 0 15px 2px rgba(76, 29, 149, 0.3)" 
            : "0 0 15px rgba(0, 0, 0, 0.1)"
        }}
      >
        <Sidebar onCloseSidebar={() => setSidebarVisible(false)} />
      </div>

      {/* Main Content */}
      <motion.div
        className="flex-1 p-6 relative z-10"
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* ☰ Icon */}
        <div className="mb-4">
          <motion.button
            onClick={() => setSidebarVisible(!sidebarVisible)}
            className={`text-2xl ${darkMode ? "text-white" : "text-gray-800"} p-2 rounded-full hover:bg-opacity-10 hover:bg-gray-500 transition-all`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <MdMenu />
          </motion.button>
        </div>

        <h2 className={`text-3xl font-bold mb-6 ${darkMode ? "text-white" : "text-gray-800"} bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500`}>🆘 Help & Support</h2>

        {/* FAQ Section */}
        <div className="mb-10">
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? "text-pink-300" : "text-indigo-600"}`}>Frequently Asked Questions</h3>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                className={cn(
                  "rounded-xl p-4 transition-all duration-300",
                  darkMode 
                    ? "bg-gray-800/50 border border-gray-700 shadow-lg backdrop-blur-sm" 
                    : "bg-white/80 border border-[#e2e8f0] shadow-sm backdrop-blur-sm"
                )}
                whileHover={{ y: -2, boxShadow: darkMode ? "0 10px 25px -5px rgba(124, 58, 237, 0.2)" : "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
              >
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleFAQ(index)}
                >
                  <h4 className={`font-semibold ${darkMode ? "text-white" : "text-[#2e1065]"}`}>{faq.question}</h4>
                  <motion.span 
                    className="text-[#ec4899] text-sm"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {openFAQ === index ? <FaChevronUp /> : <FaChevronDown />}
                  </motion.span>
                </div>
                <AnimatePresence>
                  {openFAQ === index && (
                    <motion.p 
                      className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"} mt-3`}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {faq.answer}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <motion.div 
          className="bg-gradient-to-r from-[#6d28d9] via-[#9333ea] to-[#ec4899] rounded-3xl p-1 max-w-3xl mx-auto shadow-2xl"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className={cn(
            "rounded-[28px] px-6 py-6 sm:p-8 text-center backdrop-blur-md",
            darkMode 
              ? "bg-gray-900/70 text-white border border-gray-800" 
              : "bg-white/90 text-gray-900"
          )}>
            <h3 className={`text-xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500`}>Need More Help?</h3>
            <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"} mb-4`}>
              Feel free to contact us for personalized support.
            </p>

            <div className={`flex flex-col sm:flex-row justify-center gap-6 text-sm font-medium ${darkMode ? "text-gray-200" : "text-[#2e1065]"}`}>
              <motion.div 
                className="flex items-center gap-2 justify-center"
                whileHover={{ y: -2 }}
              >
                <FaEnvelope className="text-[#ec4899]" />
                support@resultportal.edu
              </motion.div>
              <motion.div 
                className="flex items-center gap-2 justify-center"
                whileHover={{ y: -2 }}
              >
                <FaPhone className="text-[#ec4899]" />
                +91 99999 12345
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default HelpSupport;
