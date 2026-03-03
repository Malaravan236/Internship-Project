// import { useState, useEffect } from 'react';
// import { 
//   Calendar,
//   Clock,
//   MapPin,
//   DollarSign,
//   Edit,
//   Trash2,
//   Plus,
//   Search,
//   Loader2,
//   Check,
//   X,
//   ChevronDown,
//   ChevronUp,
//   Mail,
//   Phone,
//   FileText,
//   Save,
//   ChevronLeft
// } from "lucide-react";
// import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
// import { db } from '../../firebase/firebaseConfig';


// interface Internship {
//   id: string;
//   internshipTitle: string;
//   description: string;
//   requiredSkills: string[];
//   numberOfPositions: string;
//   department: string;
//   eligibilityCriteria: string;
//   startDate: string;
//   endDate: string;
//   duration: string;
//   workHours: string;
//   locationType: 'onsite' | 'remote' | 'hybrid';
//   city: string;
//   state: string;
//   address: string;
//   isPaid: boolean;
//   stipendAmount: string;
//   paymentMode: string;
//   applicationStartDate: string;
//   applicationDeadline: string;
//   coordinatorName: string;
//   coordinatorEmail: string;
//   coordinatorPhone: string;
//   requireResume: boolean;
//   internshipImageUrl: string;
//   isActive: boolean;
//   createdAt: Date;
//   updatedAt: Date;
// }

// const departmentOptions = ['CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT', 'Other'];
// const durationOptions = ['1 month', '2 months', '3 months', '4 months', '5 months', '6 months', '6+ months'];
// const paymentModeOptions = ['Bank Transfer', 'UPI', 'Cheque', 'Cash', 'Other'];
// const locationTypeOptions = ['onsite', 'remote', 'hybrid'];

// export default function InternshipListingsAdmin() {
//   const [internships, setInternships] = useState<Internship[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [expandedInternship, setExpandedInternship] = useState<string | null>(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [processingId, setProcessingId] = useState<string | null>(null);
//   const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
//   const [editingInternship, setEditingInternship] = useState<Internship | null>(null);
//   const [editFormData, setEditFormData] = useState<Partial<Internship>>({});

//   // Fetch internships from Firestore
//   const fetchInternships = async () => {
//     setLoading(true);
//     try {
//       const querySnapshot = await getDocs(collection(db, 'internships'));
//       const internshipsData = querySnapshot.docs.map(doc => {
//         const data = doc.data();
//         return {
//           id: doc.id,
//           ...data,
//           createdAt: data.createdAt?.toDate() || new Date(),
//           updatedAt: data.updatedAt?.toDate() || new Date()
//         } as Internship;
//       });
      
//       setInternships(internshipsData);
//       setLoading(false);
//     } catch (err) {
//       console.error("Error fetching internships:", err);
//       setError("Failed to load internships. Please try again later.");
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchInternships();
//   }, []);

//   // Toggle internship active status
//   const toggleInternshipStatus = async (internshipId: string, currentStatus: boolean) => {
//     setProcessingId(internshipId);
//     try {
//       const internshipRef = doc(db, 'internships', internshipId);
//       await updateDoc(internshipRef, {
//         isActive: !currentStatus,
//         updatedAt: new Date()
//       });
      
//       setInternships(internships.map(internship => 
//         internship.id === internshipId ? { 
//           ...internship, 
//           isActive: !currentStatus,
//           updatedAt: new Date()
//         } : internship
//       ));
      
//       setProcessingId(null);
//     } catch (err) {
//       console.error("Error updating internship status:", err);
//       setError("Failed to update internship status.");
//       setProcessingId(null);
//     }
//   };

//   // Delete internship
//   const handleDeleteInternship = async (internshipId: string) => {
//     if (!window.confirm("Are you sure you want to delete this internship? This action cannot be undone.")) {
//       return;
//     }
    
//     setProcessingId(internshipId);
//     try {
//       await deleteDoc(doc(db, 'internships', internshipId));
//       setInternships(internships.filter(internship => internship.id !== internshipId));
//       setProcessingId(null);
//     } catch (err) {
//       console.error("Error deleting internship:", err);
//       setError("Failed to delete internship.");
//       setProcessingId(null);
//     }
//   };

//   // Start editing an internship
//   const startEditing = (internship: Internship) => {
//     setEditingInternship(internship);
//     setEditFormData({ ...internship });
//     setExpandedInternship(internship.id);
//   };

//   // Cancel editing
//   const cancelEditing = () => {
//     setEditingInternship(null);
//     setEditFormData({});
//   };

//   // Handle form field changes
//   const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
//     const { name, value, type } = e.target;
//     const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
//     setEditFormData(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value
//     }));
//   };

//   // Handle array field changes (like requiredSkills)
//   // const handleArrayChange = (field: string, index: number, value: string) => {
//   //   setEditFormData(prev => {
//   //     const currentArray = [...(prev[field as keyof Internship] || [])] as string[];
//   //     currentArray[index] = value;
//   //     return { ...prev, [field]: currentArray };
//   //   });
//   // };

//   const handleArrayChange = (field: keyof Internship, index: number, value: string) => {
//     setEditFormData(prev => {
//       // Ensure we're only working with array fields
//       if (field !== 'requiredSkills') {
//         console.error(`Field ${field} is not an array`);
//         return prev;
//       }
  
//       // Type-safe way to handle the array
//       const currentArray = Array.isArray(prev[field]) ? [...prev[field] as string[]] : [];
//       currentArray[index] = value;
      
//       return { 
//         ...prev, 
//         [field]: currentArray 
//       };
//     });
//   };

//   // Add new skill to requiredSkills
//   const addSkill = () => {
//     setEditFormData(prev => {
//       const currentSkills = [...(prev.requiredSkills || [])] as string[];
//       return { ...prev, requiredSkills: [...currentSkills, ''] };
//     });
//   };

//   // Remove skill from requiredSkills
//   const removeSkill = (index: number) => {
//     setEditFormData(prev => {
//       const currentSkills = [...(prev.requiredSkills || [])] as string[];
//       currentSkills.splice(index, 1);
//       return { ...prev, requiredSkills: currentSkills };
//     });
//   };

//   // Save edited internship
//   const saveEditedInternship = async () => {
//     if (!editingInternship) return;
    
//     setProcessingId(editingInternship.id);
//     try {
//       const internshipRef = doc(db, 'internships', editingInternship.id);
//       await updateDoc(internshipRef, {
//         ...editFormData,
//         updatedAt: new Date()
//       });
      
//       setInternships(internships.map(internship => 
//         internship.id === editingInternship.id ? { 
//           ...internship, 
//           ...editFormData,
//           updatedAt: new Date()
//         } : internship
//       ));
      
//       setEditingInternship(null);
//       setEditFormData({});
//       setProcessingId(null);
//     } catch (err) {
//       console.error("Error updating internship:", err);
//       setError("Failed to update internship.");
//       setProcessingId(null);
//     }
//   };

//   // Format date string
//   const formatDate = (dateStr: string | Date) => {
//     if (!dateStr) return 'Not specified';
//     const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
//     return date.toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     });
//   };

//   // Format datetime string
//   const formatDateTime = (dateStr: string | Date) => {
//     if (!dateStr) return 'Not specified';
//     const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
//     return date.toLocaleString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   // Filter internships based on search term and status
//   const filteredInternships = internships.filter(internship => {
//     // Apply status filter
//     if (statusFilter === 'active' && !internship.isActive) return false;
//     if (statusFilter === 'inactive' && internship.isActive) return false;
    
//     // Apply search term filter
//     if (!searchTerm) return true;
    
//     const searchLower = searchTerm.toLowerCase();
//     return (
//       internship.internshipTitle.toLowerCase().includes(searchLower) ||
//       internship.department.toLowerCase().includes(searchLower) ||
//       internship.description.toLowerCase().includes(searchLower) ||
//       (internship.coordinatorName && internship.coordinatorName.toLowerCase().includes(searchLower)) ||
//       internship.requiredSkills.some(skill => skill.toLowerCase().includes(searchLower))
//     );
//   });

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <Loader2 size={40} className="animate-spin text-emerald-600" />
//         <span className="ml-2 text-gray-600 text-lg">Loading internships...</span>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-center">
//         <p>{error}</p>
//         <button 
//           onClick={fetchInternships}
//           className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
//         >
//           Try Again
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto py-8 px-4">
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 mt-16">
//         <h1 className="text-3xl font-bold text-emerald-800 mb-4 md:mb-0">Manage Internships</h1>
        
//         <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
//           {/* Search */}
//           <div className="relative">
//             <input
//               type="text"
//               placeholder="Search internships..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg w-full text-lg"
//             />
//             <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//           </div>
          
//           {/* Status Filter */}
//           <select
//             value={statusFilter}
//             onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
//             className="px-4 py-3 border border-gray-300 rounded-lg bg-white text-lg"
//           >
//             <option value="all">All Statuses</option>
//             <option value="active">Active</option>
//             <option value="inactive">Inactive</option>
//           </select>
//         </div>
//       </div>
      
//       {filteredInternships.length === 0 ? (
//         <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
//           <p className="text-gray-600 text-xl">No internships found.</p>
//         </div>
//       ) : (
//         <div className="bg-white shadow rounded-lg overflow-hidden">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th scope="col" className="px-6 py-4 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">
//                   Internship
//                 </th>
//                 <th scope="col" className="px-6 py-4 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">
//                   Department
//                 </th>
//                 <th scope="col" className="px-6 py-4 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">
//                   Dates
//                 </th>
//                 <th scope="col" className="px-6 py-4 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">
//                   Status
//                 </th>
//                 <th scope="col" className="px-6 py-4 text-right text-lg font-medium text-gray-500 uppercase tracking-wider">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {filteredInternships.map((internship) => (
//                 <>
//                   <tr key={internship.id} className="hover:bg-gray-50">
//                     <td className="px-6 py-5">
//                       <div className="flex items-center">
//                         {internship.internshipImageUrl && (
//                           <img 
//                             src={internship.internshipImageUrl} 
//                             alt={internship.internshipTitle}
//                             className="w-16 h-16 rounded-md object-cover mr-4"
//                           />
//                         )}
//                         <div>
//                           <div className="text-xl font-medium text-gray-900">
//                             {editingInternship?.id === internship.id ? (
//                               <input
//                                 type="text"
//                                 name="internshipTitle"
//                                 value={editFormData.internshipTitle || ''}
//                                 onChange={handleEditChange}
//                                 className="w-full p-3 border border-gray-300 rounded text-lg"
//                               />
//                             ) : (
//                               internship.internshipTitle
//                             )}
//                           </div>
//                           <div className="text-lg text-gray-500 line-clamp-1">
//                             {editingInternship?.id === internship.id ? (
//                               <textarea
//                                 name="description"
//                                 value={editFormData.description || ''}
//                                 onChange={handleEditChange}
//                                 className="w-full p-3 border border-gray-300 rounded text-lg"
//                                 rows={2}
//                               />
//                             ) : (
//                               internship.description
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-5 whitespace-nowrap text-lg text-gray-500">
//                       {editingInternship?.id === internship.id ? (
//                         <select
//                           name="department"
//                           value={editFormData.department || ''}
//                           onChange={handleEditChange}
//                           className="w-full p-3 border border-gray-300 rounded text-lg"
//                         >
//                           {departmentOptions.map(option => (
//                             <option key={option} value={option}>{option}</option>
//                           ))}
//                         </select>
//                       ) : (
//                         internship.department
//                       )}
//                     </td>
//                     <td className="px-6 py-5 whitespace-nowrap text-lg text-gray-500">
//                       {formatDate(internship.startDate)} - {formatDate(internship.endDate)}
//                     </td>
//                     <td className="px-6 py-5 whitespace-nowrap">
//                       <span className={`px-3 py-2 inline-flex text-base leading-5 font-semibold rounded-full ${
//                         internship.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
//                       }`}>
//                         {internship.isActive ? 'Active' : 'Inactive'}
//                       </span>
//                     </td>
//                     <td className="px-6 py-5 whitespace-nowrap text-right text-lg font-medium">
//                       {editingInternship?.id === internship.id ? (
//                         <div className="flex justify-end gap-3">
//                           <button
//                             onClick={saveEditedInternship}
//                             disabled={processingId === internship.id}
//                             className="text-emerald-600 hover:text-emerald-800 flex items-center text-lg"
//                           >
//                             {processingId === internship.id ? (
//                               <Loader2 size={20} className="animate-spin mr-2" />
//                             ) : (
//                               <Save size={20} className="mr-2" />
//                             )}
//                             Save
//                           </button>
//                           <button
//                             onClick={cancelEditing}
//                             className="text-gray-600 hover:text-gray-800 flex items-center text-lg"
//                           >
//                             <ChevronLeft size={20} className="mr-2" />
//                             Cancel
//                           </button>
//                         </div>
//                       ) : (
//                         <button
//                           onClick={() => {
//                             if (expandedInternship === internship.id) {
//                               setExpandedInternship(null);
//                             } else {
//                               setExpandedInternship(internship.id);
//                             }
//                           }}
//                           className="text-emerald-600 hover:text-emerald-900 mr-4 text-lg"
//                         >
//                           {expandedInternship === internship.id ? 'Hide' : 'Details'}
//                           {expandedInternship === internship.id ? 
//                             <ChevronUp size={20} className="inline ml-2" /> : 
//                             <ChevronDown size={20} className="inline ml-2" />
//                           }
//                         </button>
//                       )}
//                     </td>
//                   </tr>
                  
//                   {/* Expanded View */}
//                   {expandedInternship === internship.id && (
//                     <tr className="bg-gray-50">
//                       <td colSpan={5} className="px-6 py-5">
//                         {editingInternship?.id === internship.id ? (
//                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                             {/* Left Column */}
//                             <div className="space-y-5">
//                               {/* Basic Details */}
//                               <div className="bg-white p-5 rounded-lg border border-gray-200">
//                                 <h3 className="text-xl font-medium text-gray-900 mb-4">Basic Details</h3>
//                                 <div className="space-y-5">
//                                   <div>
//                                     <label className="block text-lg font-medium text-gray-700 mb-2">Eligibility Criteria</label>
//                                     <input
//                                       type="text"
//                                       name="eligibilityCriteria"
//                                       value={editFormData.eligibilityCriteria || ''}
//                                       onChange={handleEditChange}
//                                       className="w-full p-3 border border-gray-300 rounded text-lg"
//                                     />
//                                   </div>
//                                   <div>
//                                     <label className="block text-lg font-medium text-gray-700 mb-2">Number of Positions</label>
//                                     <input
//                                       type="text"
//                                       name="numberOfPositions"
//                                       value={editFormData.numberOfPositions || ''}
//                                       onChange={handleEditChange}
//                                       className="w-full p-3 border border-gray-300 rounded text-lg"
//                                     />
//                                   </div>
//                                   <div>
//                                     <label className="block text-lg font-medium text-gray-700 mb-2">Duration</label>
//                                     <select
//                                       name="duration"
//                                       value={editFormData.duration || ''}
//                                       onChange={handleEditChange}
//                                       className="w-full p-3 border border-gray-300 rounded text-lg"
//                                     >
//                                       {durationOptions.map(option => (
//                                         <option key={option} value={option}>{option}</option>
//                                       ))}
//                                     </select>
//                                   </div>
//                                 </div>
//                               </div>

//                               {/* Schedule */}
//                               <div className="bg-white p-5 rounded-lg border border-gray-200">
//                                 <h3 className="text-xl font-medium text-gray-900 mb-4">Schedule</h3>
//                                 <div className="grid grid-cols-1 gap-5">
//                                   <div>
//                                     <label className="block text-lg font-medium text-gray-700 mb-2">Work Hours</label>
//                                     <input
//                                       type="text"
//                                       name="workHours"
//                                       value={editFormData.workHours || ''}
//                                       onChange={handleEditChange}
//                                       className="w-full p-3 border border-gray-300 rounded text-lg"
//                                     />
//                                   </div>
//                                   <div>
//                                     <label className="block text-lg font-medium text-gray-700 mb-2">Location Type</label>
//                                     <select
//                                       name="locationType"
//                                       value={editFormData.locationType || 'onsite'}
//                                       onChange={handleEditChange}
//                                       className="w-full p-3 border border-gray-300 rounded text-lg"
//                                     >
//                                       {locationTypeOptions.map(option => (
//                                         <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
//                                       ))}
//                                     </select>
//                                   </div>
//                                   {editFormData.locationType !== 'remote' && (
//                                     <>
//                                       <div>
//                                         <label className="block text-lg font-medium text-gray-700 mb-2">City</label>
//                                         <input
//                                           type="text"
//                                           name="city"
//                                           value={editFormData.city || ''}
//                                           onChange={handleEditChange}
//                                           className="w-full p-3 border border-gray-300 rounded text-lg"
//                                         />
//                                       </div>
//                                       <div>
//                                         <label className="block text-lg font-medium text-gray-700 mb-2">State</label>
//                                         <input
//                                           type="text"
//                                           name="state"
//                                           value={editFormData.state || ''}
//                                           onChange={handleEditChange}
//                                           className="w-full p-3 border border-gray-300 rounded text-lg"
//                                         />
//                                       </div>
//                                       <div>
//                                         <label className="block text-lg font-medium text-gray-700 mb-2">Address</label>
//                                         <input
//                                           type="text"
//                                           name="address"
//                                           value={editFormData.address || ''}
//                                           onChange={handleEditChange}
//                                           className="w-full p-3 border border-gray-300 rounded text-lg"
//                                         />
//                                       </div>
//                                     </>
//                                   )}
//                                 </div>
//                               </div>
//                             </div>

//                             {/* Right Column */}
//                             <div className="space-y-5">
//                               {/* Payment Details */}
//                               <div className="bg-white p-5 rounded-lg border border-gray-200">
//                                 <h3 className="text-xl font-medium text-gray-900 mb-4">Payment Details</h3>
//                                 <div className="space-y-5">
//                                   <div className="flex items-center">
//                                     <input
//                                       type="checkbox"
//                                       id="isPaid"
//                                       name="isPaid"
//                                       checked={editFormData.isPaid || false}
//                                       onChange={handleEditChange}
//                                       className="h-5 w-5 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
//                                     />
//                                     <label htmlFor="isPaid" className="ml-3 block text-lg text-gray-700">
//                                       Paid Internship
//                                     </label>
//                                   </div>
//                                   {editFormData.isPaid && (
//                                     <>
//                                       <div>
//                                         <label className="block text-lg font-medium text-gray-700 mb-2">Stipend Amount</label>
//                                         <input
//                                           type="text"
//                                           name="stipendAmount"
//                                           value={editFormData.stipendAmount || ''}
//                                           onChange={handleEditChange}
//                                           className="w-full p-3 border border-gray-300 rounded text-lg"
//                                         />
//                                       </div>
//                                       <div>
//                                         <label className="block text-lg font-medium text-gray-700 mb-2">Payment Mode</label>
//                                         <select
//                                           name="paymentMode"
//                                           value={editFormData.paymentMode || ''}
//                                           onChange={handleEditChange}
//                                           className="w-full p-3 border border-gray-300 rounded text-lg"
//                                         >
//                                           {paymentModeOptions.map(option => (
//                                             <option key={option} value={option}>{option}</option>
//                                           ))}
//                                         </select>
//                                       </div>
//                                     </>
//                                   )}
//                                 </div>
//                               </div>

//                               {/* Required Skills */}
//                               <div className="bg-white p-5 rounded-lg border border-gray-200">
//                                 <h3 className="text-xl font-medium text-gray-900 mb-4">Required Skills</h3>
//                                 <div className="space-y-3">
//                                   {(editFormData.requiredSkills || []).map((skill, index) => (
//                                     <div key={index} className="flex items-center gap-3">
//                                       <input
//                                         type="text"
//                                         value={skill}
//                                         onChange={(e) => handleArrayChange('requiredSkills', index, e.target.value)}
//                                         className="flex-1 p-3 border border-gray-300 rounded text-lg"
//                                       />
//                                       <button
//                                         type="button"
//                                         onClick={() => removeSkill(index)}
//                                         className="text-red-500 hover:text-red-700"
//                                       >
//                                         <X size={20} />
//                                       </button>
//                                     </div>
//                                   ))}
//                                   <button
//                                     type="button"
//                                     onClick={addSkill}
//                                     className="text-emerald-600 hover:text-emerald-800 text-lg flex items-center"
//                                   >
//                                     <Plus size={18} className="mr-2" />
//                                     Add Skill
//                                   </button>
//                                 </div>
//                               </div>

//                               {/* Application Details */}
//                               <div className="bg-white p-5 rounded-lg border border-gray-200">
//                                 <h3 className="text-xl font-medium text-gray-900 mb-4">Application Details</h3>
//                                 <div className="space-y-5">
//                                   <div>
//                                     <label className="block text-lg font-medium text-gray-700 mb-2">Application Start Date</label>
//                                     <input
//                                       type="date"
//                                       name="applicationStartDate"
//                                       value={editFormData.applicationStartDate || ''}
//                                       onChange={handleEditChange}
//                                       className="w-full p-3 border border-gray-300 rounded text-lg"
//                                     />
//                                   </div>
//                                   <div>
//                                     <label className="block text-lg font-medium text-gray-700 mb-2">Application Deadline</label>
//                                     <input
//                                       type="date"
//                                       name="applicationDeadline"
//                                       value={editFormData.applicationDeadline || ''}
//                                       onChange={handleEditChange}
//                                       className="w-full p-3 border border-gray-300 rounded text-lg"
//                                     />
//                                   </div>
//                                   <div className="flex items-center">
//                                     <input
//                                       type="checkbox"
//                                       id="requireResume"
//                                       name="requireResume"
//                                       checked={editFormData.requireResume || false}
//                                       onChange={handleEditChange}
//                                       className="h-5 w-5 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
//                                     />
//                                     <label htmlFor="requireResume" className="ml-3 block text-lg text-gray-700">
//                                       Require Resume
//                                     </label>
//                                   </div>
//                                 </div>
//                               </div>

//                               {/* Coordinator Details */}
//                               <div className="bg-white p-5 rounded-lg border border-gray-200">
//                                 <h3 className="text-xl font-medium text-gray-900 mb-4">Coordinator Details</h3>
//                                 <div className="space-y-5">
//                                   <div>
//                                     <label className="block text-lg font-medium text-gray-700 mb-2">Name</label>
//                                     <input
//                                       type="text"
//                                       name="coordinatorName"
//                                       value={editFormData.coordinatorName || ''}
//                                       onChange={handleEditChange}
//                                       className="w-full p-3 border border-gray-300 rounded text-lg"
//                                     />
//                                   </div>
//                                   <div>
//                                     <label className="block text-lg font-medium text-gray-700 mb-2">Email</label>
//                                     <input
//                                       type="email"
//                                       name="coordinatorEmail"
//                                       value={editFormData.coordinatorEmail || ''}
//                                       onChange={handleEditChange}
//                                       className="w-full p-3 border border-gray-300 rounded text-lg"
//                                     />
//                                   </div>
//                                   <div>
//                                     <label className="block text-lg font-medium text-gray-700 mb-2">Phone</label>
//                                     <input
//                                       type="tel"
//                                       name="coordinatorPhone"
//                                       value={editFormData.coordinatorPhone || ''}
//                                       onChange={handleEditChange}
//                                       className="w-full p-3 border border-gray-300 rounded text-lg"
//                                     />
//                                   </div>
//                                 </div>
//                               </div>
//                             </div>
//                           </div>
//                         ) : (
//                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                             {/* Left Column */}
//                             <div className="space-y-5">
//                               {/* Basic Details */}
//                               <div className="bg-white p-5 rounded-lg border border-gray-200">
//                                 <h3 className="text-xl font-medium text-gray-900 mb-4">Internship Details</h3>
//                                 <div className="space-y-5">
//                                   <div className="flex items-start">
//                                     <div className="w-1/3 text-lg text-gray-500">Description:</div>
//                                     <div className="w-2/3 text-lg">{internship.description}</div>
//                                   </div>
//                                   <div className="flex items-start">
//                                     <div className="w-1/3 text-lg text-gray-500">Eligibility:</div>
//                                     <div className="w-2/3 text-lg">{internship.eligibilityCriteria || 'Not specified'}</div>
//                                   </div>
//                                   <div className="flex items-start">
//                                     <div className="w-1/3 text-lg text-gray-500">Positions:</div>
//                                     <div className="w-2/3 text-lg">{internship.numberOfPositions}</div>
//                                   </div>
//                                   <div className="flex items-start">
//                                     <div className="w-1/3 text-lg text-gray-500">Duration:</div>
//                                     <div className="w-2/3 text-lg">{internship.duration}</div>
//                                   </div>
//                                 </div>
//                               </div>
                              
//                               {/* Schedule */}
//                               <div className="bg-white p-5 rounded-lg border border-gray-200">
//                                 <h3 className="text-xl font-medium text-gray-900 mb-4">Schedule</h3>
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//                                   <div className="flex items-center text-lg">
//                                     <Calendar size={20} className="mr-3 text-emerald-600" />
//                                     <span>Start: {formatDate(internship.startDate)}</span>
//                                   </div>
//                                   <div className="flex items-center text-lg">
//                                     <Calendar size={20} className="mr-3 text-emerald-600" />
//                                     <span>End: {formatDate(internship.endDate)}</span>
//                                   </div>
//                                   <div className="flex items-center text-lg">
//                                     <Clock size={20} className="mr-3 text-emerald-600" />
//                                     <span>Work Hours: {internship.workHours}</span>
//                                   </div>
//                                   <div className="flex items-center text-lg">
//                                     <MapPin size={20} className="mr-3 text-emerald-600" />
//                                     <span>
//                                       {internship.locationType === 'remote' ? 'Remote' : 
//                                        internship.locationType === 'onsite' ? `${internship.city}, ${internship.state}` : 
//                                        'Hybrid'}
//                                       {internship.address && internship.locationType !== 'remote' && (
//                                         <span className="block text-gray-500 text-base mt-2">{internship.address}</span>
//                                       )}
//                                     </span>
//                                   </div>
//                                 </div>
//                               </div>

//                               {/* Payment Details */}
//                               <div className="bg-white p-5 rounded-lg border border-gray-200">
//                                 <h3 className="text-xl font-medium text-gray-900 mb-4">Payment Details</h3>
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//                                   <div className="flex items-center text-lg">
//                                     <DollarSign size={20} className="mr-3 text-emerald-600" />
//                                     <span>
//                                       {internship.isPaid ? `Stipend: ${internship.stipendAmount}` : 'Unpaid'}
//                                     </span>
//                                   </div>
//                                   {internship.isPaid && (
//                                     <div className="flex items-center text-lg">
//                                       <span className="mr-3 text-gray-500">Payment Mode:</span>
//                                       <span>{internship.paymentMode}</span>
//                                     </div>
//                                   )}
//                                 </div>
//                               </div>
//                             </div>
                            
//                             {/* Right Column */}
//                             <div className="space-y-5">
//                               {/* Required Skills */}
//                               <div className="bg-white p-5 rounded-lg border border-gray-200">
//                                 <h3 className="text-xl font-medium text-gray-900 mb-4">Required Skills</h3>
//                                 <div className="flex flex-wrap gap-3">
//                                   {internship.requiredSkills?.map((skill, index) => (
//                                     <span key={index} className="px-3 py-2 bg-emerald-50 text-emerald-700 text-base rounded-full">
//                                       {skill}
//                                     </span>
//                                   ))}
//                                 </div>
//                               </div>
                              
//                               {/* Application Details */}
//                               <div className="bg-white p-5 rounded-lg border border-gray-200">
//                                 <h3 className="text-xl font-medium text-gray-900 mb-4">Application Details</h3>
//                                 <div className="space-y-4">
//                                   <div className="flex justify-between text-lg">
//                                     <span className="text-gray-500">Start Date:</span>
//                                     <span>{formatDate(internship.applicationStartDate)}</span>
//                                   </div>
//                                   <div className="flex justify-between text-lg">
//                                     <span className="text-gray-500">Deadline:</span>
//                                     <span>{formatDate(internship.applicationDeadline)}</span>
//                                   </div>
//                                   <div className="flex items-center text-lg">
//                                     <FileText size={20} className="mr-3 text-emerald-600" />
//                                     <span>Resume Required: {internship.requireResume ? 'Yes' : 'No'}</span>
//                                   </div>
//                                 </div>
//                               </div>

//                               {/* Coordinator Details */}
//                               <div className="bg-white p-5 rounded-lg border border-gray-200">
//                                 <h3 className="text-xl font-medium text-gray-900 mb-4">Coordinator Details</h3>
//                                 <div className="space-y-4">
//                                   <div className="flex items-center text-lg">
//                                     <span className="w-1/3 text-gray-500">Name:</span>
//                                     <span className="w-2/3">{internship.coordinatorName}</span>
//                                   </div>
//                                   <div className="flex items-center text-lg">
//                                     <Mail size={20} className="mr-3 text-emerald-600" />
//                                     <span>{internship.coordinatorEmail}</span>
//                                   </div>
//                                   {internship.coordinatorPhone && (
//                                     <div className="flex items-center text-lg">
//                                       <Phone size={20} className="mr-3 text-emerald-600" />
//                                       <span>{internship.coordinatorPhone}</span>
//                                     </div>
//                                   )}
//                                 </div>
//                               </div>

//                               {/* System Info */}
//                               <div className="bg-white p-5 rounded-lg border border-gray-200">
//                                 <h3 className="text-xl font-medium text-gray-900 mb-4">System Information</h3>
//                                 <div className="space-y-4">
//                                   <div className="flex justify-between text-lg">
//                                     <span className="text-gray-500">Created:</span>
//                                     <span>{formatDateTime(internship.createdAt)}</span>
//                                   </div>
//                                   <div className="flex justify-between text-lg">
//                                     <span className="text-gray-500">Last Updated:</span>
//                                     <span>{formatDateTime(internship.updatedAt)}</span>
//                                   </div>
//                                 </div>
//                               </div>
//                             </div>
//                           </div>
//                         )}

//                         {/* Actions */}
//                         <div className="mt-8 bg-white p-5 rounded-lg border border-gray-200">
//                           <div className="flex flex-col sm:flex-row justify-between gap-5">
//                             <div className="space-y-3">
//                               {editingInternship?.id === internship.id ? null : (
//                                 <button
//                                   onClick={() => startEditing(internship)}
//                                   className="flex items-center px-5 py-3 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 w-full sm:w-auto text-lg"
//                                 >
//                                   <Edit size={20} className="mr-3" />
//                                   Edit
//                                 </button>
//                               )}
//                               <button
//                                 onClick={() => handleDeleteInternship(internship.id)}
//                                 disabled={processingId === internship.id}
//                                 className="flex items-center px-5 py-3 border border-red-300 text-red-700 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-50 w-full sm:w-auto text-lg"
//                               >
//                                 {processingId === internship.id ? 
//                                   <Loader2 size={20} className="animate-spin mr-3" /> : 
//                                   <Trash2 size={20} className="mr-3" />
//                                 }
//                                 Delete
//                               </button>
//                             </div>
                            
//                             <button
//                               onClick={() => toggleInternshipStatus(internship.id, internship.isActive)}
//                               className={`flex items-center px-5 py-3 rounded-lg text-lg ${
//                                 internship.isActive ? 
//                                   'bg-yellow-100 text-yellow-800 border border-yellow-300 hover:bg-yellow-200' : 
//                                   'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
//                               }`}
//                             >
//                               {processingId === internship.id ? 
//                                 <Loader2 size={20} className="animate-spin mr-3" /> : 
//                                 internship.isActive ? <X size={20} className="mr-3" /> : <Check size={20} className="mr-3" />
//                               }
//                               {internship.isActive ? 'Deactivate' : 'Activate'}
//                             </button>
//                           </div>
//                         </div>
//                       </td>
//                     </tr>
//                   )}
//                 </>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// }











import { useState, useEffect } from 'react';
import { 
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Edit,
  Trash2,
  Plus,
  Search,
  Loader2,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  Save,
  ChevronLeft
} from "lucide-react";
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';

interface Internship {
  id: string;
  internshipTitle: string;
  description: string;
  requiredSkills: string[];
  numberOfPositions: string;
  department: string;
  eligibilityCriteria: string;
  startDate: string;
  endDate: string;
  duration: string;
  workHours: string;
  locationType: 'onsite' | 'remote' | 'hybrid';
  city: string;
  state: string;
  address: string;
  isPaid: boolean;
  stipendAmount: string;
  paymentMode: string;
  applicationStartDate: string;
  applicationDeadline: string;
  coordinatorName: string;
  coordinatorEmail: string;
  coordinatorPhone: string;
  requireResume: boolean;
  internshipImageUrl: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const departmentOptions = ['CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT', 'Other'];
const durationOptions = ['1 month', '2 months', '3 months', '4 months', '5 months', '6 months', '6+ months'];
const paymentModeOptions = ['Bank Transfer', 'UPI', 'Cheque', 'Cash', 'Other'];
const locationTypeOptions = ['onsite', 'remote', 'hybrid'];

export default function InternshipListingsAdmin() {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedInternship, setExpandedInternship] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [editingInternship, setEditingInternship] = useState<Internship | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Internship>>({});

  // Fetch internships from Firestore
  const fetchInternships = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'internships'));
      const internshipsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Internship;
      });
      
      setInternships(internshipsData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching internships:", err);
      setError("Failed to load internships. Please try again later.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInternships();
  }, []);

  // Toggle internship active status
  const toggleInternshipStatus = async (internshipId: string, currentStatus: boolean) => {
    setProcessingId(internshipId);
    try {
      const internshipRef = doc(db, 'internships', internshipId);
      await updateDoc(internshipRef, {
        isActive: !currentStatus,
        updatedAt: new Date()
      });
      
      setInternships(internships.map(internship => 
        internship.id === internshipId ? { 
          ...internship, 
          isActive: !currentStatus,
          updatedAt: new Date()
        } : internship
      ));
      
      setProcessingId(null);
    } catch (err) {
      console.error("Error updating internship status:", err);
      setError("Failed to update internship status.");
      setProcessingId(null);
    }
  };

  // Delete internship
  const handleDeleteInternship = async (internshipId: string) => {
    if (!window.confirm("Are you sure you want to delete this internship? This action cannot be undone.")) {
      return;
    }
    
    setProcessingId(internshipId);
    try {
      await deleteDoc(doc(db, 'internships', internshipId));
      setInternships(internships.filter(internship => internship.id !== internshipId));
      setProcessingId(null);
    } catch (err) {
      console.error("Error deleting internship:", err);
      setError("Failed to delete internship.");
      setProcessingId(null);
    }
  };

  // Start editing an internship
  const startEditing = (internship: Internship) => {
    setEditingInternship(internship);
    setEditFormData({ ...internship });
    setExpandedInternship(internship.id);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingInternship(null);
    setEditFormData({});
  };

  // Handle form field changes
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleArrayChange = (field: keyof Internship, index: number, value: string) => {
    setEditFormData(prev => {
      if (field !== 'requiredSkills') {
        console.error(`Field ${field} is not an array`);
        return prev;
      }
  
      const currentArray = Array.isArray(prev[field]) ? [...prev[field] as string[]] : [];
      currentArray[index] = value;
      
      return { 
        ...prev, 
        [field]: currentArray 
      };
    });
  };

  // Add new skill to requiredSkills
  const addSkill = () => {
    setEditFormData(prev => {
      const currentSkills = [...(prev.requiredSkills || [])] as string[];
      return { ...prev, requiredSkills: [...currentSkills, ''] };
    });
  };

  // Remove skill from requiredSkills
  const removeSkill = (index: number) => {
    setEditFormData(prev => {
      const currentSkills = [...(prev.requiredSkills || [])] as string[];
      currentSkills.splice(index, 1);
      return { ...prev, requiredSkills: currentSkills };
    });
  };

  // Save edited internship
  const saveEditedInternship = async () => {
    if (!editingInternship) return;
    
    setProcessingId(editingInternship.id);
    try {
      const internshipRef = doc(db, 'internships', editingInternship.id);
      await updateDoc(internshipRef, {
        ...editFormData,
        updatedAt: new Date()
      });
      
      setInternships(internships.map(internship => 
        internship.id === editingInternship.id ? { 
          ...internship, 
          ...editFormData,
          updatedAt: new Date()
        } : internship
      ));
      
      setEditingInternship(null);
      setEditFormData({});
      setProcessingId(null);
    } catch (err) {
      console.error("Error updating internship:", err);
      setError("Failed to update internship.");
      setProcessingId(null);
    }
  };

  // Format date string
  const formatDate = (dateStr: string | Date) => {
    if (!dateStr) return 'Not specified';
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format datetime string
  const formatDateTime = (dateStr: string | Date) => {
    if (!dateStr) return 'Not specified';
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter internships based on search term and status
  const filteredInternships = internships.filter(internship => {
    if (statusFilter === 'active' && !internship.isActive) return false;
    if (statusFilter === 'inactive' && internship.isActive) return false;
    
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      internship.internshipTitle.toLowerCase().includes(searchLower) ||
      internship.department.toLowerCase().includes(searchLower) ||
      internship.description.toLowerCase().includes(searchLower) ||
      (internship.coordinatorName && internship.coordinatorName.toLowerCase().includes(searchLower)) ||
      internship.requiredSkills.some(skill => skill.toLowerCase().includes(searchLower))
    );
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 size={40} className="animate-spin text-emerald-600" />
        <span className="ml-2 text-gray-600 text-lg">Loading internships...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-center max-w-md mx-auto">
        <p className="text-lg">{error}</p>
        <button 
          onClick={fetchInternships}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 mt-10 px-2 sm:py-6 sm:px-4 lg:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 mt-8 sm:mt-12">
        <h1 className="text-1xl sm:text-2xl font-bold text-emerald-800">Manage Internships</h1>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search internships..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg w-full text-base sm:text-lg"
            />
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
            className="px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg bg-white text-base sm:text-lg"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
      
      {filteredInternships.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 sm:p-8 text-center">
          <p className="text-gray-600 text-lg sm:text-xl">No internships found.</p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Mobile Cards View */}
          <div className="md:hidden space-y-4 p-2 sm:p-4">
            {filteredInternships.map((internship) => (
              <div key={internship.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    {internship.internshipImageUrl && (
                      <img 
                        src={internship.internshipImageUrl} 
                        alt={internship.internshipTitle}
                        className="w-12 h-12 rounded-md object-cover"
                      />
                    )}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{internship.internshipTitle}</h3>
                      <p className="text-sm text-gray-500">{internship.department}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs leading-4 font-semibold rounded-full ${
                    internship.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {internship.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Calendar size={14} className="mr-1 text-emerald-600" />
                    <span>{formatDate(internship.startDate)}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar size={14} className="mr-1 text-emerald-600" />
                    <span>{formatDate(internship.endDate)}</span>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                  <button
                    onClick={() => {
                      if (expandedInternship === internship.id) {
                        setExpandedInternship(null);
                      } else {
                        setExpandedInternship(internship.id);
                      }
                    }}
                    className="text-emerald-600 hover:text-emerald-900 text-sm flex items-center"
                  >
                    {expandedInternship === internship.id ? 'Hide Details' : 'View Details'}
                    {expandedInternship === internship.id ? 
                      <ChevronUp size={16} className="ml-1" /> : 
                      <ChevronDown size={16} className="ml-1" />
                    }
                  </button>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEditing(internship)}
                      className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteInternship(internship.id)}
                      disabled={processingId === internship.id}
                      className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded disabled:opacity-50"
                    >
                      {processingId === internship.id ? 
                        <Loader2 size={16} className="animate-spin" /> : 
                        <Trash2 size={16} />
                      }
                    </button>
                  </div>
                </div>
                
                {/* Expanded Mobile View */}
                {expandedInternship === internship.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    {editingInternship?.id === internship.id ? (
                      <div className="space-y-4">
                        {/* Basic Details */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                          <input
                            type="text"
                            name="internshipTitle"
                            value={editFormData.internshipTitle || ''}
                            onChange={handleEditChange}
                            className="w-full p-2 border border-gray-300 rounded text-base"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <textarea
                            name="description"
                            value={editFormData.description || ''}
                            onChange={handleEditChange}
                            className="w-full p-2 border border-gray-300 rounded text-base"
                            rows={3}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                          <select
                            name="department"
                            value={editFormData.department || ''}
                            onChange={handleEditChange}
                            className="w-full p-2 border border-gray-300 rounded text-base"
                          >
                            {departmentOptions.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                            <input
                              type="date"
                              name="startDate"
                              value={editFormData.startDate || ''}
                              onChange={handleEditChange}
                              className="w-full p-2 border border-gray-300 rounded text-base"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                            <input
                              type="date"
                              name="endDate"
                              value={editFormData.endDate || ''}
                              onChange={handleEditChange}
                              className="w-full p-2 border border-gray-300 rounded text-base"
                            />
                          </div>
                        </div>
                        
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={saveEditedInternship}
                            disabled={processingId === internship.id}
                            className="px-3 py-1.5 bg-emerald-600 text-white rounded text-sm"
                          >
                            {processingId === internship.id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              'Save'
                            )}
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="text-sm text-gray-700">
                          <h4 className="font-medium text-gray-900 mb-1">Description</h4>
                          <p>{internship.description}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-gray-900 text-sm mb-1">Duration</h4>
                            <p className="text-sm text-gray-700">{internship.duration}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 text-sm mb-1">Positions</h4>
                            <p className="text-sm text-gray-700">{internship.numberOfPositions}</p>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm mb-1">Work Hours</h4>
                          <div className="flex items-center text-sm text-gray-700">
                            <Clock size={14} className="mr-1 text-emerald-600" />
                            <span>{internship.workHours}</span>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm mb-1">Location</h4>
                          <div className="flex items-center text-sm text-gray-700">
                            <MapPin size={14} className="mr-1 text-emerald-600" />
                            <span>
                              {internship.locationType === 'remote' ? 'Remote' : 
                               internship.locationType === 'onsite' ? `${internship.city}, ${internship.state}` : 
                               'Hybrid'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex justify-center mt-3">
                          <button
                            onClick={() => toggleInternshipStatus(internship.id, internship.isActive)}
                            className={`px-4 py-2 rounded text-sm flex items-center ${
                              internship.isActive ? 
                                'bg-yellow-100 text-yellow-800' : 
                                'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {processingId === internship.id ? 
                              <Loader2 size={16} className="animate-spin mr-1" /> : 
                              internship.isActive ? <X size={16} className="mr-1" /> : <Check size={16} className="mr-1" />
                            }
                            {internship.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-sm sm:text-base font-medium text-gray-500 uppercase tracking-wider">
                    Internship
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-sm sm:text-base font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-sm sm:text-base font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-sm sm:text-base font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-sm sm:text-base font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInternships.map((internship) => (
                  <>
                    <tr key={internship.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          {internship.internshipImageUrl && (
                            <img 
                              src={internship.internshipImageUrl} 
                              alt={internship.internshipTitle}
                              className="w-12 h-12 rounded-md object-cover mr-3"
                            />
                          )}
                          <div>
                            <div className="text-base sm:text-lg font-medium text-gray-900">
                              {editingInternship?.id === internship.id ? (
                                <input
                                  type="text"
                                  name="internshipTitle"
                                  value={editFormData.internshipTitle || ''}
                                  onChange={handleEditChange}
                                  className="w-full p-2 border border-gray-300 rounded text-base"
                                />
                              ) : (
                                internship.internshipTitle
                              )}
                            </div>
                            <div className="text-sm text-gray-500 line-clamp-1">
                              {editingInternship?.id === internship.id ? (
                                <textarea
                                  name="description"
                                  value={editFormData.description || ''}
                                  onChange={handleEditChange}
                                  className="w-full p-2 border border-gray-300 rounded text-base"
                                  rows={2}
                                />
                              ) : (
                                internship.description
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm sm:text-base text-gray-500">
                        {editingInternship?.id === internship.id ? (
                          <select
                            name="department"
                            value={editFormData.department || ''}
                            onChange={handleEditChange}
                            className="w-full p-2 border border-gray-300 rounded text-base"
                          >
                            {departmentOptions.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        ) : (
                          internship.department
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm sm:text-base text-gray-500">
                        {formatDate(internship.startDate)} - {formatDate(internship.endDate)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs sm:text-sm leading-4 font-semibold rounded-full ${
                          internship.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {internship.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm sm:text-base font-medium">
                        {editingInternship?.id === internship.id ? (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={saveEditedInternship}
                              disabled={processingId === internship.id}
                              className="text-emerald-600 hover:text-emerald-800 flex items-center text-sm sm:text-base"
                            >
                              {processingId === internship.id ? (
                                <Loader2 size={16} className="animate-spin mr-1" />
                              ) : (
                                <Save size={16} className="mr-1" />
                              )}
                              Save
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="text-gray-600 hover:text-gray-800 flex items-center text-sm sm:text-base"
                            >
                              <ChevronLeft size={16} className="mr-1" />
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              if (expandedInternship === internship.id) {
                                setExpandedInternship(null);
                              } else {
                                setExpandedInternship(internship.id);
                              }
                            }}
                            className="text-emerald-600 hover:text-emerald-900 mr-2 text-sm sm:text-base"
                          >
                            {expandedInternship === internship.id ? 'Hide' : 'Details'}
                            {expandedInternship === internship.id ? 
                              <ChevronUp size={16} className="inline ml-1" /> : 
                              <ChevronDown size={16} className="inline ml-1" />
                            }
                          </button>
                        )}
                      </td>
                    </tr>
                    
                    {/* Expanded View */}
                    {expandedInternship === internship.id && (
                      <tr className="bg-gray-50">
                        <td colSpan={5} className="px-4 py-4">
                          {editingInternship?.id === internship.id ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              {/* Left Column */}
                              <div className="space-y-4">
                                {/* Basic Details */}
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                  <h3 className="text-lg font-medium text-gray-900 mb-3">Basic Details</h3>
                                  <div className="space-y-4">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">Eligibility Criteria</label>
                                      <input
                                        type="text"
                                        name="eligibilityCriteria"
                                        value={editFormData.eligibilityCriteria || ''}
                                        onChange={handleEditChange}
                                        className="w-full p-2 border border-gray-300 rounded text-sm"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">Number of Positions</label>
                                      <input
                                        type="text"
                                        name="numberOfPositions"
                                        value={editFormData.numberOfPositions || ''}
                                        onChange={handleEditChange}
                                        className="w-full p-2 border border-gray-300 rounded text-sm"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                                      <select
                                        name="duration"
                                        value={editFormData.duration || ''}
                                        onChange={handleEditChange}
                                        className="w-full p-2 border border-gray-300 rounded text-sm"
                                      >
                                        {durationOptions.map(option => (
                                          <option key={option} value={option}>{option}</option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>
                                </div>

                                {/* Schedule */}
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                  <h3 className="text-lg font-medium text-gray-900 mb-3">Schedule</h3>
                                  <div className="grid grid-cols-1 gap-4">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">Work Hours</label>
                                      <input
                                        type="text"
                                        name="workHours"
                                        value={editFormData.workHours || ''}
                                        onChange={handleEditChange}
                                        className="w-full p-2 border border-gray-300 rounded text-sm"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">Location Type</label>
                                      <select
                                        name="locationType"
                                        value={editFormData.locationType || 'onsite'}
                                        onChange={handleEditChange}
                                        className="w-full p-2 border border-gray-300 rounded text-sm"
                                      >
                                        {locationTypeOptions.map(option => (
                                          <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
                                        ))}
                                      </select>
                                    </div>
                                    {editFormData.locationType !== 'remote' && (
                                      <>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                          <input
                                            type="text"
                                            name="city"
                                            value={editFormData.city || ''}
                                            onChange={handleEditChange}
                                            className="w-full p-2 border border-gray-300 rounded text-sm"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                          <input
                                            type="text"
                                            name="state"
                                            value={editFormData.state || ''}
                                            onChange={handleEditChange}
                                            className="w-full p-2 border border-gray-300 rounded text-sm"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                          <input
                                            type="text"
                                            name="address"
                                            value={editFormData.address || ''}
                                            onChange={handleEditChange}
                                            className="w-full p-2 border border-gray-300 rounded text-sm"
                                          />
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Right Column */}
                              <div className="space-y-4">
                                {/* Payment Details */}
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                  <h3 className="text-lg font-medium text-gray-900 mb-3">Payment Details</h3>
                                  <div className="space-y-4">
                                    <div className="flex items-center">
                                      <input
                                        type="checkbox"
                                        id="isPaid"
                                        name="isPaid"
                                        checked={editFormData.isPaid || false}
                                        onChange={handleEditChange}
                                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                                      />
                                      <label htmlFor="isPaid" className="ml-2 block text-sm text-gray-700">
                                        Paid Internship
                                      </label>
                                    </div>
                                    {editFormData.isPaid && (
                                      <>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">Stipend Amount</label>
                                          <input
                                            type="text"
                                            name="stipendAmount"
                                            value={editFormData.stipendAmount || ''}
                                            onChange={handleEditChange}
                                            className="w-full p-2 border border-gray-300 rounded text-sm"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
                                          <select
                                            name="paymentMode"
                                            value={editFormData.paymentMode || ''}
                                            onChange={handleEditChange}
                                            className="w-full p-2 border border-gray-300 rounded text-sm"
                                          >
                                            {paymentModeOptions.map(option => (
                                              <option key={option} value={option}>{option}</option>
                                            ))}
                                          </select>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>

                                {/* Required Skills */}
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                  <h3 className="text-lg font-medium text-gray-900 mb-3">Required Skills</h3>
                                  <div className="space-y-2">
                                    {(editFormData.requiredSkills || []).map((skill, index) => (
                                      <div key={index} className="flex items-center gap-2">
                                        <input
                                          type="text"
                                          value={skill}
                                          onChange={(e) => handleArrayChange('requiredSkills', index, e.target.value)}
                                          className="flex-1 p-2 border border-gray-300 rounded text-sm"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => removeSkill(index)}
                                          className="text-red-500 hover:text-red-700"
                                        >
                                          <X size={16} />
                                        </button>
                                      </div>
                                    ))}
                                    <button
                                      type="button"
                                      onClick={addSkill}
                                      className="text-emerald-600 hover:text-emerald-800 text-sm flex items-center"
                                    >
                                      <Plus size={14} className="mr-1" />
                                      Add Skill
                                    </button>
                                  </div>
                                </div>

                                {/* Application Details */}
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                  <h3 className="text-lg font-medium text-gray-900 mb-3">Application Details</h3>
                                  <div className="space-y-4">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">Application Start Date</label>
                                      <input
                                        type="date"
                                        name="applicationStartDate"
                                        value={editFormData.applicationStartDate || ''}
                                        onChange={handleEditChange}
                                        className="w-full p-2 border border-gray-300 rounded text-sm"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">Application Deadline</label>
                                      <input
                                        type="date"
                                        name="applicationDeadline"
                                        value={editFormData.applicationDeadline || ''}
                                        onChange={handleEditChange}
                                        className="w-full p-2 border border-gray-300 rounded text-sm"
                                      />
                                    </div>
                                    <div className="flex items-center">
                                      <input
                                        type="checkbox"
                                        id="requireResume"
                                        name="requireResume"
                                        checked={editFormData.requireResume || false}
                                        onChange={handleEditChange}
                                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                                      />
                                      <label htmlFor="requireResume" className="ml-2 block text-sm text-gray-700">
                                        Require Resume
                                      </label>
                                    </div>
                                  </div>
                                </div>

                                {/* Coordinator Details */}
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                  <h3 className="text-lg font-medium text-gray-900 mb-3">Coordinator Details</h3>
                                  <div className="space-y-4">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                      <input
                                        type="text"
                                        name="coordinatorName"
                                        value={editFormData.coordinatorName || ''}
                                        onChange={handleEditChange}
                                        className="w-full p-2 border border-gray-300 rounded text-sm"
                                      />
                                    </div>
                                    <div>
                                                                       <input
                                      type="email"
                                      name="coordinatorEmail"
                                      value={editFormData.coordinatorEmail || ''}
                                      onChange={handleEditChange}
                                      className="w-full p-3 border border-gray-300 rounded text-lg"
                                    />
                                          </div>
                                          <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                            <input
                                              type="tel"
                                              name="coordinatorPhone"
                                              value={editFormData.coordinatorPhone || ''}
                                              onChange={handleEditChange}
                                              className="w-full p-2 border border-gray-300 rounded text-sm"
                                            />
                                          </div>
                                        </div>
                                      </div>
      
                                      {/* Status Management */}
                                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                                        <h3 className="text-lg font-medium text-gray-900 mb-3">Status Management</h3>
                                        <div className="flex items-center justify-between">
                                          <div>
                                            <p className="text-sm text-gray-600">Created: {formatDateTime(internship.createdAt)}</p>
                                            <p className="text-sm text-gray-600">Last Updated: {formatDateTime(internship.updatedAt)}</p>
                                          </div>
                                          <button
                                            onClick={() => toggleInternshipStatus(internship.id, internship.isActive)}
                                            disabled={processingId === internship.id}
                                            className={`px-4 py-2 rounded text-sm flex items-center ${
                                              internship.isActive ? 
                                                'bg-yellow-100 text-yellow-800' : 
                                                'bg-emerald-100 text-emerald-800'
                                            }`}
                                          >
                                            {processingId === internship.id ? 
                                              <Loader2 size={16} className="animate-spin mr-1" /> : 
                                              internship.isActive ? <X size={16} className="mr-1" /> : <Check size={16} className="mr-1" />
                                            }
                                            {internship.isActive ? 'Deactivate' : 'Activate'}
                                          </button>
                                        </div>
                                      </div>
      
                                      {/* Action Buttons */}
                                      <div className="flex justify-end gap-3 pt-4">
                                        <button
                                          onClick={saveEditedInternship}
                                          disabled={processingId === internship.id}
                                          className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:bg-emerald-300"
                                        >
                                          {processingId === internship.id ? (
                                            <Loader2 size={16} className="animate-spin mr-2" />
                                          ) : (
                                            <Save size={16} className="mr-2" />
                                          )}
                                          Save Changes
                                        </button>
                                        <button
                                          onClick={cancelEditing}
                                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                                        >
                                          <X size={16} className="mr-2" />
                                          Cancel
                                        </button>
                                        <button
                                          onClick={() => handleDeleteInternship(internship.id)}
                                          disabled={processingId === internship.id}
                                          className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:bg-red-50"
                                        >
                                          {processingId === internship.id ? (
                                            <Loader2 size={16} className="animate-spin mr-2" />
                                          ) : (
                                            <Trash2 size={16} className="mr-2" />
                                          )}
                                          Delete
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Left Column */}
                                    <div className="space-y-6">
                                      {/* Basic Details */}
                                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                                        <h3 className="text-lg font-medium text-gray-900 mb-3">Basic Details</h3>
                                        <div className="space-y-3">
                                          <div>
                                            <h4 className="text-sm font-medium text-gray-700">Eligibility Criteria</h4>
                                            <p className="text-sm text-gray-600">{internship.eligibilityCriteria}</p>
                                          </div>
                                          <div className="grid grid-cols-2 gap-4">
                                            <div>
                                              <h4 className="text-sm font-medium text-gray-700">Positions</h4>
                                              <p className="text-sm text-gray-600">{internship.numberOfPositions}</p>
                                            </div>
                                            <div>
                                              <h4 className="text-sm font-medium text-gray-700">Duration</h4>
                                              <p className="text-sm text-gray-600">{internship.duration}</p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
      
                                      {/* Schedule */}
                                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                                        <h3 className="text-lg font-medium text-gray-900 mb-3">Schedule</h3>
                                        <div className="space-y-3">
                                          <div>
                                            <h4 className="text-sm font-medium text-gray-700">Work Hours</h4>
                                            <div className="flex items-center text-sm text-gray-600">
                                              <Clock size={14} className="mr-1 text-emerald-600" />
                                              <span>{internship.workHours}</span>
                                            </div>
                                          </div>
                                          <div>
                                            <h4 className="text-sm font-medium text-gray-700">Location</h4>
                                            <div className="flex items-center text-sm text-gray-600">
                                              <MapPin size={14} className="mr-1 text-emerald-600" />
                                              <span>
                                                {internship.locationType === 'remote' ? 'Remote' : 
                                                 internship.locationType === 'onsite' ? `${internship.city}, ${internship.state}` : 
                                                 'Hybrid'}
                                                {internship.locationType !== 'remote' && internship.address && (
                                                  <span className="block mt-1">{internship.address}</span>
                                                )}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
      
                                      {/* Payment Details */}
                                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                                        <h3 className="text-lg font-medium text-gray-900 mb-3">Payment Details</h3>
                                        <div className="space-y-3">
                                          <div>
                                            <h4 className="text-sm font-medium text-gray-700">Payment Status</h4>
                                            <p className="text-sm text-gray-600">
                                              {internship.isPaid ? (
                                                <span className="flex items-center">
                                                  <DollarSign size={14} className="mr-1 text-emerald-600" />
                                                  Paid - {internship.stipendAmount} ({internship.paymentMode})
                                                </span>
                                              ) : 'Unpaid'}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
      
                                    {/* Right Column */}
                                    <div className="space-y-6">
                                      {/* Required Skills */}
                                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                                        <h3 className="text-lg font-medium text-gray-900 mb-3">Required Skills</h3>
                                        <div className="flex flex-wrap gap-2">
                                          {internship.requiredSkills.map((skill, index) => (
                                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                                              {skill}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
      
                                      {/* Application Details */}
                                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                                        <h3 className="text-lg font-medium text-gray-900 mb-3">Application Details</h3>
                                        <div className="space-y-3">
                                          <div className="grid grid-cols-2 gap-4">
                                            <div>
                                              <h4 className="text-sm font-medium text-gray-700">Start Date</h4>
                                              <p className="text-sm text-gray-600">{formatDate(internship.applicationStartDate)}</p>
                                            </div>
                                            <div>
                                              <h4 className="text-sm font-medium text-gray-700">Deadline</h4>
                                              <p className="text-sm text-gray-600">{formatDate(internship.applicationDeadline)}</p>
                                            </div>
                                          </div>
                                          <div>
                                            <h4 className="text-sm font-medium text-gray-700">Requirements</h4>
                                            <p className="text-sm text-gray-600">
                                              {internship.requireResume ? 'Resume required' : 'No resume required'}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
      
                                      {/* Coordinator Details */}
                                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                                        <h3 className="text-lg font-medium text-gray-900 mb-3">Coordinator Details</h3>
                                        <div className="space-y-3">
                                          <div>
                                            <h4 className="text-sm font-medium text-gray-700">Name</h4>
                                            <p className="text-sm text-gray-600">{internship.coordinatorName}</p>
                                          </div>
                                          <div className="grid grid-cols-2 gap-4">
                                            <div>
                                              <h4 className="text-sm font-medium text-gray-700">Email</h4>
                                              <div className="flex items-center text-sm text-gray-600">
                                                <Mail size={14} className="mr-1 text-emerald-600" />
                                                <a href={`mailto:${internship.coordinatorEmail}`} className="hover:underline">
                                                  {internship.coordinatorEmail}
                                                </a>
                                              </div>
                                            </div>
                                            <div>
                                              <h4 className="text-sm font-medium text-gray-700">Phone</h4>
                                              <div className="flex items-center text-sm text-gray-600">
                                                <Phone size={14} className="mr-1 text-emerald-600" />
                                                <a href={`tel:${internship.coordinatorPhone}`} className="hover:underline">
                                                  {internship.coordinatorPhone}
                                                </a>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
      
                                      {/* Status Management */}
                                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                                        <h3 className="text-lg font-medium text-gray-900 mb-3">Status Management</h3>
                                        <div className="flex items-center justify-between">
                                          <div>
                                            <p className="text-sm text-gray-600">Created: {formatDateTime(internship.createdAt)}</p>
                                            <p className="text-sm text-gray-600">Last Updated: {formatDateTime(internship.updatedAt)}</p>
                                          </div>
                                          <div className="flex gap-3">
                                            <button
                                              onClick={() => startEditing(internship)}
                                              className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center"
                                            >
                                              <Edit size={16} className="mr-2" />
                                              Edit
                                            </button>
                                            <button
                                              onClick={() => toggleInternshipStatus(internship.id, internship.isActive)}
                                              disabled={processingId === internship.id}
                                              className={`px-4 py-2 rounded text-sm flex items-center ${
                                                internship.isActive ? 
                                                  'bg-yellow-100 text-yellow-800' : 
                                                  'bg-emerald-100 text-emerald-800'
                                              }`}
                                            >
                                              {processingId === internship.id ? 
                                                <Loader2 size={16} className="animate-spin mr-1" /> : 
                                                internship.isActive ? <X size={16} className="mr-1" /> : <Check size={16} className="mr-1" />
                                              }
                                              {internship.isActive ? 'Deactivate' : 'Activate'}
                                            </button>
                                            <button
                                              onClick={() => handleDeleteInternship(internship.id)}
                                              disabled={processingId === internship.id}
                                              className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:bg-red-50 flex items-center"
                                            >
                                              {processingId === internship.id ? (
                                                <Loader2 size={16} className="animate-spin mr-1" />
                                              ) : (
                                                <Trash2 size={16} className="mr-1" />
                                              )}
                                              Delete
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </td>
                            </tr>
                          )}
                        </>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );
      }