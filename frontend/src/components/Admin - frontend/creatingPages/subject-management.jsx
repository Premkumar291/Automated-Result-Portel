import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit3, Trash2, BookOpen, X, Filter } from 'lucide-react';
import { subjectAPI, DEPARTMENT_OPTIONS } from '../../../api/subjects';
import toast from 'react-hot-toast';

const SubjectManagement = () => {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingSubject, setEditingSubject] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('');

    const [formData, setFormData] = useState({
        subjectCode: '',
        subjectName: '',
        department: '',
        semester: '',
        credits: '',
        subjectType: 'Theory'
    });

    useEffect(() => {
        fetchSubjects();
    }, [searchTerm, departmentFilter]);

    const fetchSubjects = async () => {
        setLoading(true);
        try {
            const params = {
                ...(searchTerm && { search: searchTerm }),
                ...(departmentFilter && { department: departmentFilter })
            };
            const response = await subjectAPI.getSubjects(params);
            setSubjects(response.data);
        } catch (error) {
            toast.error('Failed to fetch subjects');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            subjectCode: '',
            subjectName: '',
            department: '',
            semester: '',
            credits: '',
            subjectType: 'Theory'
        });
        setEditingSubject(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingSubject) {
                await subjectAPI.updateSubject(editingSubject._id, formData);
                toast.success('Subject updated successfully!');
            } else {
                await subjectAPI.createSubject(formData);
                toast.success('Subject created successfully!');
            }
            setShowModal(false);
            resetForm();
            fetchSubjects();
        } catch (error) {
            toast.error(error.message || 'Operation failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (subjectId) => {
        if (!confirm('Are you sure you want to delete this subject?')) return;
        try {
            await subjectAPI.deleteSubject(subjectId);
            toast.success('Subject deleted successfully!');
            fetchSubjects();
        } catch (error) {
            toast.error('Failed to delete subject');
        }
    };

    const openEditModal = (subject) => {
        setEditingSubject(subject);
        setFormData({
            subjectCode: subject.subjectCode,
            subjectName: subject.subjectName,
            department: subject.department,
            semester: subject.semester || '',
            credits: subject.credits || '',
            subjectType: subject.subjectType || 'Theory'
        });
        setShowModal(true);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <BookOpen className="text-blue-600" />
                            Subject Management
                        </h1>
                        <p className="text-gray-600 mt-2">Manage academic subjects and their details</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={20} />
                        Add Subject
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search subjects..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <select
                                value={departmentFilter}
                                onChange={(e) => setDepartmentFilter(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                            >
                                <option value="">All Departments</option>
                                {DEPARTMENT_OPTIONS.map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={fetchSubjects}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Subjects List */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject Code</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {subjects.map((subject) => (
                                        <motion.tr
                                            key={subject._id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{subject.subjectCode}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">{subject.subjectName}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {subject.department}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">
                                                    {subject.semester && `Sem ${subject.semester}`}
                                                    {subject.credits && ` • ${subject.credits} Credits`}
                                                    {subject.subjectType && ` • ${subject.subjectType}`}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => openEditModal(subject)}
                                                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                                                    >
                                                        <Edit3 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(subject._id)}
                                                        className="text-red-600 hover:text-red-900 p-1 rounded"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            className="bg-white rounded-lg shadow-xl max-w-2xl w-full"
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        {editingSubject ? 'Edit Subject' : 'Create New Subject'}
                                    </h2>
                                    <button
                                        onClick={() => { setShowModal(false); resetForm(); }}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Subject Code *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.subjectCode}
                                                onChange={(e) => setFormData(prev => ({ ...prev, subjectCode: e.target.value.toUpperCase() }))}
                                                placeholder="e.g., CS101, MATH201"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Department *
                                            </label>
                                            <select
                                                required
                                                value={formData.department}
                                                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="">Select Department</option>
                                                {DEPARTMENT_OPTIONS.map(dept => (
                                                    <option key={dept} value={dept}>{dept}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Subject Name *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.subjectName}
                                                onChange={(e) => setFormData(prev => ({ ...prev, subjectName: e.target.value }))}
                                                placeholder="e.g., Data Structures, Calculus"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Semester
                                            </label>
                                            <select
                                                value={formData.semester}
                                                onChange={(e) => setFormData(prev => ({ ...prev, semester: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="">Select Semester</option>
                                                {[1,2,3,4,5,6,7,8].map(sem => (
                                                    <option key={sem} value={sem}>Semester {sem}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Credits
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="6"
                                                value={formData.credits}
                                                onChange={(e) => setFormData(prev => ({ ...prev, credits: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Subject Type
                                            </label>
                                            <select
                                                value={formData.subjectType}
                                                onChange={(e) => setFormData(prev => ({ ...prev, subjectType: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="Theory">Theory</option>
                                                <option value="Practical">Practical</option>
                                                <option value="Lab">Lab</option>
                                                <option value="Project">Project</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-4">
                                        <button
                                            type="button"
                                            onClick={() => { setShowModal(false); resetForm(); }}
                                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                        >
                                            {loading ? 'Saving...' : (editingSubject ? 'Update' : 'Create')}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SubjectManagement;
