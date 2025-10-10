// // 'use client';

// // import { useEffect, useState } from 'react';
// // import { useRouter } from 'next/navigation';
// // import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
// // import { Button } from '@/components/ui/button';
// // import { Input } from '@/components/ui/input';
// // import { Label } from '@/components/ui/label';
// // import { toast } from 'sonner';
// // import { Pencil, Trash, ExternalLink } from 'lucide-react';
// // import College from '@/lib/models/College'; // Make sure API routes exist

// // export default function AdminManageColleges() {
// //   const [colleges, setColleges] = useState<any[]>([]);
// //   const [loading, setLoading] = useState(true);
// //   const [searchQuery, setSearchQuery] = useState('');
// //   const router = useRouter();

// //   const fetchColleges = async () => {
// //     try {
// //       setLoading(true);
// //       const token = localStorage.getItem('token');
// //       const res = await fetch('/api/admin/colleges', {
// //         headers: { Authorization: `Bearer ${token}` },
// //       });
// //       const data = await res.json();
// //       setColleges(data.colleges || []);
// //     } catch (err) {
// //       toast.error('Failed to fetch colleges');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     fetchColleges();
// //   }, []);

// //   const handleDelete = async (collegeId: string) => {
// //     if (!confirm('Are you sure you want to delete this college?')) return;

// //     try {
// //       const token = localStorage.getItem('token');
// //       const res = await fetch(`/api/admin/colleges/${collegeId}`, {
// //         method: 'DELETE',
// //         headers: { Authorization: `Bearer ${token}` },
// //       });
// //       if (res.ok) {
// //         toast.success('College deleted successfully');
// //         setColleges(prev => prev.filter(c => c._id !== collegeId));
// //       } else {
// //         toast.error('Failed to delete college');
// //       }
// //     } catch (err) {
// //       toast.error('Error deleting college');
// //     }
// //   };

// //   const filteredColleges = colleges.filter(c =>
// //     c.name.toLowerCase().includes(searchQuery.toLowerCase())
// //   );

// //   return (
// //     <div className="container mx-auto px-4 py-8">
// //       <h1 className="text-3xl font-bold text-gray-900 mb-6">Manage Colleges</h1>

// //       {/* Search */}
// //       <div className="mb-6 flex gap-4">
// //         <div className="flex-1">
// //           <Label htmlFor="search">Search College</Label>
// //           <Input
// //             id="search"
// //             placeholder="Search by name"
// //             value={searchQuery}
// //             onChange={e => setSearchQuery(e.target.value)}
// //           />
// //         </div>
// //         <Button onClick={() => router.push('/admin/colleges/add')}>Add New College</Button>
// //       </div>

// //       {loading ? (
// //         <div className="text-center py-12">Loading colleges...</div>
// //       ) : filteredColleges.length === 0 ? (
// //         <div className="text-center py-12">No colleges found</div>
// //       ) : (
// //         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
// //           {filteredColleges.map(college => (
// //             <Card key={college._id} className="group hover:shadow-lg transition-shadow">
// //               <CardHeader>
// //                 <CardTitle className="text-lg font-semibold">{college.name}</CardTitle>
// //               </CardHeader>
// //               <CardContent className="space-y-2">
// //                 <div className="text-sm text-gray-600">
// //                   Location: {college.location || 'N/A'}
// //                 </div>
// //                 <div className="text-sm text-gray-600">
// //                   Fees: ₹{college.fees?.toLocaleString() || 'N/A'} / year
// //                 </div>
// //                 <div className="text-sm text-gray-600">
// //                   Established: {college.established || 'N/A'}
// //                 </div>
// //                 <div className="flex gap-2 mt-2">
// //                   <Button
// //                     size="sm"
// //                     variant="outline"
// //                     className="flex-1 flex items-center justify-center gap-2"
// //                     onClick={() => router.push(`/admin/colleges/edit/${college._id}`)}
// //                   >
// //                     <Pencil className="h-4 w-4" /> Edit
// //                   </Button>
// //                   <Button
// //                     size="sm"
// //                     variant="destructive"
// //                     className="flex-1 flex items-center justify-center gap-2"
// //                     onClick={() => handleDelete(college._id)}
// //                   >
// //                     <Trash className="h-4 w-4" /> Delete
// //                   </Button>
// //                   <Button
// //                     size="sm"
// //                     variant="outline"
// //                     className="flex-1 flex items-center justify-center gap-2"
// //                     onClick={() => router.push(`/college/${college._id}`)}
// //                   >
// //                     <ExternalLink className="h-4 w-4" /> View
// //                   </Button>
// //                 </div>
// //               </CardContent>
// //             </Card>
// //           ))}
// //         </div>
// //       )}
// //     </div>
// //   );
// // }
// 'use client';

// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { toast } from 'sonner';
// import { Pencil, Trash, ExternalLink, Check, X } from 'lucide-react';

// export default function AdminManageColleges() {
//   const [colleges, setColleges] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState('');
//   const router = useRouter();

//   const fetchColleges = async () => {
//     try {
//       setLoading(true);
//       const token = localStorage.getItem('token');
//       const res = await fetch('/api/admin/colleges', {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const data = await res.json();
//       setColleges(data.colleges || data || []); // fallback in case API returns array directly
//     } catch (err) {
//       toast.error('Failed to fetch colleges');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchColleges();
//   }, []);

//   const handleDelete = async (collegeId: string) => {
//     if (!confirm('Are you sure you want to delete this college?')) return;
//     try {
//       const token = localStorage.getItem('token');
//       const res = await fetch(`/api/admin/colleges/${collegeId}`, {
//         method: 'DELETE',
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (res.ok) {
//         toast.success('College deleted successfully');
//         setColleges(prev => prev.filter(c => c._id !== collegeId));
//       } else {
//         toast.error('Failed to delete college');
//       }
//     } catch (err) {
//       toast.error('Error deleting college');
//     }
//   };

//   const handleUpdate = async (collegeId: string, formData: any, onClose: () => void) => {
//     try {
//       const token = localStorage.getItem('token');
//       const res = await fetch(`/api/admin/colleges/${collegeId}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
//         body: JSON.stringify(formData),
//       });
//       if (!res.ok) throw new Error('Failed to update college');
//       const updatedCollege = await res.json();
//       setColleges(prev => prev.map(c => (c._id === collegeId ? updatedCollege : c)));
//       toast.success('College updated successfully');
//       onClose();
//     } catch (err) {
//       toast.error('Failed to update college');
//       console.error(err);
//     }
//   };

//   const filteredColleges = colleges.filter(c =>
//     c.name.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-3xl font-bold text-gray-900 mb-6">Manage Colleges</h1>

//       {/* Search */}
//       <div className="mb-6 flex gap-4">
//         <div className="flex-1">
//           <Label htmlFor="search">Search College</Label>
//           <Input
//             id="search"
//             placeholder="Search by name"
//             value={searchQuery}
//             onChange={e => setSearchQuery(e.target.value)}
//           />
//         </div>
//         <Button onClick={() => router.push('/admin/colleges/add')}>Add New College</Button>
//       </div>

//       {loading ? (
//         <div className="text-center py-12">Loading colleges...</div>
//       ) : filteredColleges.length === 0 ? (
//         <div className="text-center py-12">No colleges found</div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {filteredColleges.map(college => {
//             const [isEditing, setIsEditing] = useState(false);
//             const [formData, setFormData] = useState({
//               name: college.name,
//               location: college.location,
//               fees: college.fees,
//               description: college.description,
//               established: college.established,
//             });

//             return (
//               <Card key={college._id} className="group hover:shadow-lg transition-shadow">
//                 <CardHeader>
//                   <CardTitle>
//                     {isEditing ? (
//                       <Input
//                         value={formData.name}
//                         onChange={e => setFormData({ ...formData, name: e.target.value })}
//                       />
//                     ) : (
//                       college.name
//                     )}
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-2">
//                   {isEditing ? (
//                     <>
//                       <Input
//                         value={formData.location}
//                         onChange={e => setFormData({ ...formData, location: e.target.value })}
//                         placeholder="Location"
//                       />
//                       <Input
//                         type="number"
//                         value={formData.fees}
//                         onChange={e => setFormData({ ...formData, fees: Number(e.target.value) })}
//                         placeholder="Fees"
//                       />
//                       <Input
//                         value={formData.established}
//                         onChange={e => setFormData({ ...formData, established: e.target.value })}
//                         placeholder="Established Year"
//                       />
//                       <Input
//                         value={formData.description}
//                         onChange={e => setFormData({ ...formData, description: e.target.value })}
//                         placeholder="Description"
//                       />
//                       <div className="flex gap-2 mt-2">
//                         <Button
//                           size="sm"
//                           variant="outline"
//                           onClick={() => handleUpdate(college._id, formData, () => setIsEditing(false))}
//                         >
//                           <Check className="h-4 w-4" /> Save
//                         </Button>
//                         <Button
//                           size="sm"
//                           variant="destructive"
//                           onClick={() => setIsEditing(false)}
//                         >
//                           <X className="h-4 w-4" /> Cancel
//                         </Button>
//                       </div>
//                     </>
//                   ) : (
//                     <>
//                       <div className="text-sm text-gray-600">Location: {college.location || 'N/A'}</div>
//                       <div className="text-sm text-gray-600">Fees: ₹{college.fees?.toLocaleString() || 'N/A'} / year</div>
//                       <div className="text-sm text-gray-600">Established: {college.established || 'N/A'}</div>
//                       <div className="text-sm text-gray-600">Description: {college.description || 'N/A'}</div>
//                       <div className="flex gap-2 mt-2">
//                         <Button
//                           size="sm"
//                           variant="outline"
//                           className="flex-1 flex items-center justify-center gap-2"
//                           onClick={() => setIsEditing(true)}
//                         >
//                           <Pencil className="h-4 w-4" /> Edit
//                         </Button>
//                         <Button
//                           size="sm"
//                           variant="destructive"
//                           className="flex-1 flex items-center justify-center gap-2"
//                           onClick={() => handleDelete(college._id)}
//                         >
//                           <Trash className="h-4 w-4" /> Delete
//                         </Button>
//                         <Button
//                           size="sm"
//                           variant="outline"
//                           className="flex-1 flex items-center justify-center gap-2"
//                           onClick={() => router.push(`/college/${college._id}`)}
//                         >
//                           <ExternalLink className="h-4 w-4" /> View
//                         </Button>
//                       </div>
//                     </>
//                   )}
//                 </CardContent>
//               </Card>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Pencil, Trash, ExternalLink, Check, X } from 'lucide-react';

export default function AdminManageColleges() {
  const [colleges, setColleges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingColleges, setEditingColleges] = useState<{ [id: string]: any }>({});
  const router = useRouter();

  const fetchColleges = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/colleges', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setColleges(data.colleges || data || []);
    } catch (err) {
      toast.error('Failed to fetch colleges');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColleges();
  }, []);

  const handleDelete = async (collegeId: string) => {
    if (!confirm('Are you sure you want to delete this college?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/colleges/${collegeId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success('College deleted successfully');
        setColleges(prev => prev.filter(c => c._id !== collegeId));
      } else {
        toast.error('Failed to delete college');
      }
    } catch (err) {
      toast.error('Error deleting college');
    }
  };

  const handleUpdate = async (collegeId: string) => {
    const formData = editingColleges[collegeId];
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/colleges/${collegeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Failed to update college');
      const updatedCollege = await res.json();
      setColleges(prev => prev.map(c => (c._id === collegeId ? updatedCollege : c)));
      toast.success('College updated successfully');
      setEditingColleges(prev => ({ ...prev, [collegeId]: undefined }));
    } catch (err) {
      toast.error('Failed to update college');
      console.error(err);
    }
  };

  const filteredColleges = colleges.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
  <h1 className="text-3xl font-bold text-indigo-800 mb-6">Manage Colleges</h1>

  {/* Search */}
  <div className="mb-6 flex gap-4">
    <div className="flex-1">
      <Label htmlFor="search">Search College</Label>
      <Input
        id="search"
        placeholder="Search by name"
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
      />
    </div>
    <Button className="bg-purple-600 text-white hover:bg-purple-700" onClick={() => router.push('/admin/colleges/add')}>
      + Add New College
    </Button>
  </div>

  {loading ? (
    <div className="text-center py-12 text-purple-600 font-semibold">Loading colleges...</div>
  ) : filteredColleges.length === 0 ? (
    <div className="text-center py-12 text-red-600 font-semibold">No colleges found</div>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredColleges.map((college, idx) => {
        const isEditing = !!editingColleges[college._id];
        const formData = editingColleges[college._id] || {
          name: college.name,
          location: college.location,
          fees: college.fees,
          description: college.description,
          established: college.established,
        };

        return (
          <Card
            key={college._id}
            className={`group hover:shadow-2xl transition-shadow rounded-xl border-l-8 ${
              idx % 3 === 0
                ? 'border-indigo-500 bg-gradient-to-tr from-indigo-50 to-indigo-100'
                : idx % 3 === 1
                ? 'border-green-500 bg-gradient-to-tr from-green-50 to-green-100'
                : 'border-pink-500 bg-gradient-to-tr from-pink-50 to-pink-100'
            }`}
          >
            <CardHeader>
              <CardTitle className="text-lg font-bold text-gray-800">
                {isEditing ? (
                  <Input
                    value={formData.name}
                    onChange={e =>
                      setEditingColleges(prev => ({
                        ...prev,
                        [college._id]: { ...formData, name: e.target.value },
                      }))
                    }
                  />
                ) : (
                  college.name
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {isEditing ? (
                <>
                  <Input
                    value={formData.location}
                    onChange={e =>
                      setEditingColleges(prev => ({
                        ...prev,
                        [college._id]: { ...formData, location: e.target.value },
                      }))
                    }
                    placeholder="Location"
                  />
                  <Input
                    type="number"
                    value={formData.fees}
                    onChange={e =>
                      setEditingColleges(prev => ({
                        ...prev,
                        [college._id]: { ...formData, fees: Number(e.target.value) },
                      }))
                    }
                    placeholder="Fees"
                  />
                  <Input
                    value={formData.established}
                    onChange={e =>
                      setEditingColleges(prev => ({
                        ...prev,
                        [college._id]: { ...formData, established: e.target.value },
                      }))
                    }
                    placeholder="Established Year"
                  />
                  <Input
                    value={formData.description}
                    onChange={e =>
                      setEditingColleges(prev => ({
                        ...prev,
                        [college._id]: { ...formData, description: e.target.value },
                      }))
                    }
                    placeholder="Description"
                  />
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="outline" className="bg-green-100 text-green-700 hover:bg-green-200" onClick={() => handleUpdate(college._id)}>
                      <Check className="h-4 w-4" /> Save
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="bg-red-100 text-red-700 hover:bg-red-200"
                      onClick={() => setEditingColleges(prev => ({ ...prev, [college._id]: undefined }))}
                    >
                      <X className="h-4 w-4" /> Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-sm text-gray-600">Location: <span className="text-indigo-700 font-medium">{college.location || 'N/A'}</span></div>
                  <div className="text-sm text-gray-600">Fees: <span className="text-green-700 font-medium">₹{college.fees?.toLocaleString() || 'N/A'}</span> / year</div>
                  <div className="text-sm text-gray-600">Established: <span className="text-purple-700 font-medium">{college.established || 'N/A'}</span></div>
                  <div className="text-sm text-gray-600">Description: {college.description || 'N/A'}</div>
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 flex items-center justify-center gap-2 bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                      onClick={() => setEditingColleges(prev => ({ ...prev, [college._id]: formData }))}
                    >
                      <Pencil className="h-4 w-4" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex-1 flex items-center justify-center gap-2 bg-red-100 text-red-700 hover:bg-red-200"
                      onClick={() => handleDelete(college._id)}
                    >
                      <Trash className="h-4 w-4" /> Delete
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-100 text-blue-700 hover:bg-blue-200"
                      onClick={() => router.push(`/college/${college._id}`)}
                    >
                      <ExternalLink className="h-4 w-4" /> View
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  )}
</div>

  );
}
