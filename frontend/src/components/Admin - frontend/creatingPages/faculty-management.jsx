import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit3, Trash2, Users, X, GraduationCap, Filter } from 'lucide-react';
import { facultyAPI, DEGREE_OPTIONS, TITLE_OPTIONS, DEPARTMENT_OPTIONS } from '../../../api/faculty';
import toast from 'react-hot-toast';

const FacultyManagement = () => {
    const [faculty, setFaculty] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingFaculty, setEditingFaculty] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        name: '',
        initials: '',
        email: '',
        department: '',
        employeeId: '',
        phoneNumber: '',
        dateOfJoining: '',
        studies: []
    });

    const [studyForm, setStudyForm] = useState({
        degree: '',
        specialization: '',
        institution: '',
        year: ''
    });

    useEffect(() => {
        fetchFaculty();
    }, [searchTerm, departmentFilter]);

    const fetchFaculty = async () => {
        setLoading(true);
        try {
            const params = {
                ...(searchTerm && { search: searchTerm }),
                ...(departmentFilter && { department: departmentFilter })
            };
            const response = await facultyAPI.getFaculty(params);
            setFaculty(response.data);
        } catch (error) {
            toast.error('Failed to fetch faculty',error.message);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            name: '',
            initials: '',
            email: '',
            department: '',
            employeeId: '',
            phoneNumber: '',
            dateOfJoining: '',
            studies: []
        });
        setStudyForm({
            degree: '',
            specialization: '',
            institution: '',
            year: ''
        });
        setEditingFaculty(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingFaculty) {
                await facultyAPI.updateFaculty(editingFaculty._id, formData);
                toast.success('Faculty updated successfully!');
            } else {
                await facultyAPI.createFaculty(formData);
                toast.success('Faculty created successfully!');
            }
            setShowModal(false);
            resetForm();
            fetchFaculty();
        } catch (error) {
            toast.error(error.message || 'Operation failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (facultyId) => {
        if (!confirm('Are you sure you want to delete this faculty member?')) return;
        try {
            await facultyAPI.deleteFaculty(facultyId);
            toast.success('Faculty deleted successfully!');
            fetchFaculty();
        } catch (error) {
            toast.error('Failed to delete faculty', error.message);
        }
    };

    const addStudy = () => {
        if (!studyForm.degree) return toast.error('Please select a degree');
        setFormData(prev => ({ ...prev, studies: [...prev.studies, { ...studyForm }] }));
        setStudyForm({ degree: '', specialization: '', institution: '', year: '' });
    };

    const removeStudy = (index) => {
        setFormData(prev => ({ ...prev, studies: prev.studies.filter((_, i) => i !== index) }));
    };

    const openEditModal = (facultyMember) => {
        setEditingFaculty(facultyMember);
        setFormData({
            title: facultyMember.title,
            name: facultyMember.name,
            initials: facultyMember.initials,
            email: facultyMember.email || '',
            department: facultyMember.department,
            employeeId: facultyMember.employeeId || '',
            phoneNumber: facultyMember.phoneNumber || '',
            dateOfJoining: facultyMember.dateOfJoining ? facultyMember.dateOfJoining.split('T')[0] : '',
            studies: facultyMember.studies || []
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
                            <Users className="text-blue-600" />
                            Faculty Management
                        </h1>
                        <p className="text-gray-600 mt-2">Manage faculty members and their academic credentials</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={20} />
                        Add Faculty
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search faculty..."
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
                            onClick={fetchFaculty}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Faculty List */}
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
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Faculty Details</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qualifications</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {faculty.map((facultyMember) => (
                                        <motion.tr
                                            key={facultyMember._id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {facultyMember.title} {facultyMember.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {facultyMember.initials}
                                                    </div>
                                                    {facultyMember.employeeId && (
                                                        <div className="text-xs text-blue-600">
                                                            ID: {facultyMember.employeeId}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    {facultyMember.department}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {facultyMember.studies?.slice(0, 3).map((study, index) => (
                                                        <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                                                            {study.degree}
                                                        </span>
                                                    ))}
                                                    {facultyMember.studies?.length > 3 && (
                                                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                                            +{facultyMember.studies.length - 3} more
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-500">
                                                    {facultyMember.email && (
                                                        <div>{facultyMember.email}</div>
                                                    )}
                                                    {facultyMember.phoneNumber && (
                                                        <div>{facultyMember.phoneNumber}</div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => openEditModal(facultyMember)}
                                                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                                                    >
                                                        <Edit3 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(facultyMember._id)}
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
                            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        {editingFaculty ? 'Edit Faculty' : 'Add New Faculty'}
                                    </h2>
                                    <button
                                        onClick={() => { setShowModal(false); resetForm(); }}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    {/* Basic Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Title *
                                            </label>
                                            <select
                                                required
                                                value={formData.title}
                                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="">Select Title</option>
                                                {TITLE_OPTIONS.map(title => (
                                                    <option key={title} value={title}>{title}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Name *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                                placeholder="Full Name"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Initials *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.initials}
                                                onChange={(e) => setFormData(prev => ({ ...prev, initials: e.target.value }))}
                                                placeholder="e.g., A.B.C"
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
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                                placeholder="email@example.com"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Employee ID
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.employeeId}
                                                onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                                                placeholder="EMP001"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Phone Number
                                            </label>
                                            <input
                                                type="tel"
                                                value={formData.phoneNumber}
                                                onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                                                placeholder="+91 9876543210"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Date of Joining
                                            </label>
                                            <input
                                                type="date"
                                                value={formData.dateOfJoining}
                                                onChange={(e) => setFormData(prev => ({ ...prev, dateOfJoining: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    {/* Studies Section */}
                                    <div className="mb-8">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <GraduationCap className="text-blue-600" />
                                            Academic Qualifications
                                        </h3>

                                        {/* Add Study Form */}
                                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                                                <select
                                                    value={studyForm.degree}
                                                    onChange={(e) => setStudyForm(prev => ({ ...prev, degree: e.target.value }))}
                                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    <option value="">Select Degree</option>
                                                    {DEGREE_OPTIONS.map(degree => (
                                                        <option key={degree} value={degree}>{degree}</option>
                                                    ))}
                                                </select>
                                                <input
                                                    type="text"
                                                    value={studyForm.specialization}
                                                    onChange={(e) => setStudyForm(prev => ({ ...prev, specialization: e.target.value }))}
                                                    placeholder="Specialization"
                                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                                <input
                                                    type="text"
                                                    value={studyForm.institution}
                                                    onChange={(e) => setStudyForm(prev => ({ ...prev, institution: e.target.value }))}
                                                    placeholder="Institution"
                                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                                <div className="flex gap-2">
                                                    <input
                                                        type="number"
                                                        value={studyForm.year}
                                                        onChange={(e) => setStudyForm(prev => ({ ...prev, year: e.target.value }))}
                                                        placeholder="Year"
                                                        min="1950"
                                                        max={new Date().getFullYear()}
                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={addStudy}
                                                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Studies List */}
                                        {formData.studies.length > 0 && (
                                            <div className="space-y-2 mb-4">
                                                {formData.studies.map((study, index) => (
                                                    <div key={index} className="flex items-center justify-between bg-white p-3 rounded border">
                                                        <span className="text-sm">
                                                            <strong>{study.degree}</strong>
                                                            {study.specialization && ` in ${study.specialization}`}
                                                            {study.institution && ` from ${study.institution}`}
                                                            {study.year && ` (${study.year})`}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeStudy(index)}
                                                            className="text-red-600 hover:text-red-800"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
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
                                            {loading ? 'Saving...' : (editingFaculty ? 'Update' : 'Create')}
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

export default FacultyManagement;
