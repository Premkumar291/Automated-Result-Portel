import React, { useState } from "react";
import {
  MdSchool,
  MdAdd,
  MdCheckCircle,
  MdPersonAdd,
  MdSubject,
} from "react-icons/md";

const AdminPanel = () => {
  const [students, setStudents] = useState([]);
  const [name, setName] = useState("");
  const [roll, setRoll] = useState("");
  const [studentClass, setStudentClass] = useState("");

  const [subjectName, setSubjectName] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [subjectYear, setSubjectYear] = useState("");

  const [confirmAccess, setConfirmAccess] = useState(false);
  const [subjectList, setSubjectList] = useState([]);

  const handleAddStudent = () => {
    if (name && roll && studentClass) {
      setStudents([...students, { name, roll, studentClass }]);
      setName("");
      setRoll("");
      setStudentClass("");
    }
  };

  const handleAddSubject = () => {
    if (subjectName && subjectCode && subjectYear) {
      setSubjectList([
        ...subjectList,
        { subjectName, subjectCode, subjectYear },
      ]);
      setSubjectName("");
      setSubjectCode("");
      setSubjectYear("");
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-gray-800 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-lg">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <MdSchool className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
              <p className="text-sm text-gray-500">
                Portal Management & Access Control
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 md:p-10 lg:px-20 space-y-10">
        {/* Admin Access */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <MdCheckCircle className="text-green-500" /> Confirm Admin Access
          </h2>
          <button
            onClick={() => setConfirmAccess(true)}
            disabled={confirmAccess}
            className="px-6 py-3 bg-green-500 text-white rounded-xl font-semibold shadow-md hover:bg-green-600 transition-all disabled:opacity-50"
          >
            {confirmAccess ? "✔ Verified" : "Click to Confirm"}
          </button>
        </div>

        {/* Student Entry */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <MdPersonAdd className="text-blue-500" /> Add Student
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border p-3 rounded-xl w-full"
              placeholder="Student Name"
            />
            <input
              value={roll}
              onChange={(e) => setRoll(e.target.value)}
              className="border p-3 rounded-xl w-full"
              placeholder="Roll Number"
            />
            <input
              value={studentClass}
              onChange={(e) => setStudentClass(e.target.value)}
              className="border p-3 rounded-xl w-full"
              placeholder="Class (e.g., CSE A)"
            />
            <button
              onClick={handleAddStudent}
              className="bg-indigo-500 text-white px-6 py-3 rounded-xl hover:bg-indigo-600 transition-all"
            >
              <MdAdd className="inline mr-2" /> Add
            </button>
          </div>

          {students.length > 0 && (
            <div className="mt-4 bg-indigo-50 p-4 rounded-xl border border-indigo-100">
              <h3 className="font-semibold text-indigo-800 mb-2">Student List</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                {students.map((s, i) => (
                  <li key={i}>
                    <strong>{s.roll}</strong> — {s.name} ({s.studentClass})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Subject Entry */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <MdSubject className="text-purple-500" /> Add Subjects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <input
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              className="border p-3 rounded-xl w-full"
              placeholder="Subject Name"
            />
            <input
              value={subjectCode}
              onChange={(e) => setSubjectCode(e.target.value)}
              className="border p-3 rounded-xl w-full"
              placeholder="Subject Code"
            />
            <input
              value={subjectYear}
              onChange={(e) => setSubjectYear(e.target.value)}
              className="border p-3 rounded-xl w-full"
              placeholder="Year (e.g., 2nd Year)"
            />
            <button
              onClick={handleAddSubject}
              className="bg-purple-500 text-white px-6 py-3 rounded-xl hover:bg-purple-600 transition-all"
            >
              <MdAdd className="inline mr-2" /> Add
            </button>
          </div>

          {subjectList.length > 0 && (
            <div className="mt-4 bg-purple-50 p-4 rounded-xl border border-purple-100">
              <h3 className="font-semibold text-purple-800 mb-2">Subject List</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                {subjectList.map((subj, i) => (
                  <li key={i}>
                    <strong>{subj.subjectCode}</strong> — {subj.subjectName} ({subj.subjectYear})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;



