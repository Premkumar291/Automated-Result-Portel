import React, { useState, useEffect } from "react";
import { fetchStudents } from "src/api/student.js";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const ViewStudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [department, setDepartment] = useState("");

  const departments = ["CSE", "IT", "ECE", "EEE", "MECH", "CIVIL"];

  useEffect(() => {
    const getData = async () => {
      const data = await fetchStudents();
      setStudents(data);
      setFiltered(data);
    };
    getData();
  }, []);

  // When department is selected
  const handleDepartmentChange = (value) => {
    setDepartment(value);
    const filteredData = students.filter((student) => student.department === value);
    setFiltered(filteredData);
  };

  // When user types in search bar
  const handleSearchChange = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filteredData = students.filter((student) =>
      (student.name.toLowerCase().includes(term) ||
       student.rollNumber.toLowerCase().includes(term)) &&
      (department ? student.department === department : true)
    );
    setFiltered(filteredData);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">View Students</h2>

      <div className="flex gap-4 items-center">
        <Select onValueChange={handleDepartmentChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Department" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((dept) => (
              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="text"
          placeholder="Search by Roll No or Name"
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-[300px]"
        />
      </div>

      <div className="border rounded-lg p-4 bg-white shadow-md mt-4">
        {filtered.length === 0 ? (
          <p>No students found.</p>
        ) : (
          <table className="w-full border-collapse mt-2">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2 border">Roll No</th>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Department</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((student) => (
                <tr key={student._id} className="hover:bg-gray-50">
                  <td className="p-2 border">{student.rollNumber}</td>
                  <td className="p-2 border">{student.name}</td>
                  <td className="p-2 border">{student.email}</td>
                  <td className="p-2 border">{student.department}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ViewStudentsPage;
