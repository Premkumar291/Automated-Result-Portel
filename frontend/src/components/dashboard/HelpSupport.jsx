import { useState } from "react";
import Sidebar from "./Sidebar";
import { MdMenu } from "react-icons/md";
import { motion } from "framer-motion";
import { FaChevronDown, FaChevronUp, FaEnvelope, FaPhone } from "react-icons/fa";

const HelpSupport = () => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [openFAQ, setOpenFAQ] = useState(null);

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
    <div className="flex min-h-screen font-[Poppins] bg-[#f9fafb] text-[#2e1065] overflow-x-hidden">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarVisible ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar onCloseSidebar={() => setSidebarVisible(false)} />
      </div>

      {/* Main Content */}
      <motion.div
        className="flex-1 p-6"
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* ☰ Icon */}
        <div className="mb-4">
          <button
            onClick={() => setSidebarVisible(!sidebarVisible)}
            className="text-2xl text-[#2e1065]"
          >
            <MdMenu />
          </button>
        </div>

        <h2 className="text-2xl font-bold mb-6">🆘 Help & Support</h2>

        {/* FAQ Section */}
        <div className="mb-10">
          <h3 className="text-lg font-semibold mb-4 text-[#ec4899]">Frequently Asked Questions</h3>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm p-4"
              >
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleFAQ(index)}
                >
                  <h4 className="font-semibold text-[#2e1065]">{faq.question}</h4>
                  <span className="text-[#ec4899] text-sm">
                    {openFAQ === index ? <FaChevronUp /> : <FaChevronDown />}
                  </span>
                </div>
                {openFAQ === index && (
                  <p className="text-sm text-gray-700 mt-3">{faq.answer}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Section — Profile Style Card */}
        <div className="bg-gradient-to-r from-[#6d28d9] via-[#9333ea] to-[#ec4899] rounded-3xl p-1 max-w-3xl mx-auto shadow-2xl">
          <div className="bg-white rounded-[28px] px-6 py-6 sm:p-8 text-center">
            <h3 className="text-xl font-bold text-[#2e1065] mb-3">Need More Help?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Feel free to contact us for personalized support.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-6 text-sm text-[#2e1065] font-medium">
              <div className="flex items-center gap-2 justify-center">
                <FaEnvelope className="text-[#ec4899]" />
                support@resultportal.edu
              </div>
              <div className="flex items-center gap-2 justify-center">
                <FaPhone className="text-[#ec4899]" />
                +91 99999 12345
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default HelpSupport;
