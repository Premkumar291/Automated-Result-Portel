import { FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const LogoutModal = ({ onClose, onConfirm }) => {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-40 z-[999] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 relative shadow-xl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* ✖ Close */}
          <button
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
            onClick={onClose}
          >
            <FaTimes />
          </button>

          {/* Title */}
          <h2 className="text-lg font-bold mb-3">Confirm Logout</h2>
          <p className="text-sm text-gray-700 mb-6">
            Are you sure you want to log out of your account?
          </p>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-1 rounded-lg bg-gray-200 text-sm text-[#2e1065] hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-1 rounded-lg bg-[#ec4899] text-white text-sm hover:bg-pink-600"
            >
              Logout
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LogoutModal;
