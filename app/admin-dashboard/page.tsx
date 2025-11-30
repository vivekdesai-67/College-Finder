'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Users, PlusCircle, BarChart3, Activity, UserCheck, Trash2 } from 'lucide-react';

// -------------------- TYPES --------------------
type Branch = {
  _id?: string;
  name: string;
  placementRate: number;
  avgSalary: number;
  maxSalary: number;
  cutoff: { [key: string]: number };
  admissionTrend: number;
  industryGrowth: number;
  isBooming: boolean;
};

type College = {
  _id?: string;
  name: string;
  location: string;
  type: 'Private' | 'Government' | 'Autonomous';
  established: number | '';
  fees: number | '';
  image: string;
  description: string;
  accreditation: string;
  infraRating: number | '';
  branchesOffered: Branch[];
};

type Stats = {
  newUsers: number;
  totalUsers: number;
  performance: { uptime: number; responseTime: number };
};

// -------------------- INPUT COMPONENTS --------------------
const InputField = ({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  min,
  max,
  step,
}: {
  label: string;
  value: string | number | '';
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  min?: number;
  max?: number;
  step?: string;
}) => (
  <div className="flex flex-col">
    <Label>{label}</Label>
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      type={type}
      required={required}
      min={min}
      max={max}
      step={step}
    />
  </div>
);

const SelectField = ({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) => (
  <div className="flex flex-col">
    <Label>{label}</Label>
    <select
      className="border rounded px-2 py-1"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

// -------------------- MAIN COMPONENT --------------------
export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [colleges, setColleges] = useState<College[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [newCollege, setNewCollege] = useState<College>({
    name: '',
    location: '',
    type: 'Private',
    established: '',
    fees: '',
    image: '',
    description: '',
    accreditation: '',
    infraRating: '',
    branchesOffered: [],
  });
  const [stats, setStats] = useState<Stats>({
    newUsers: 0,
    totalUsers: 0,
    performance: { uptime: 99, responseTime: 200 },
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // -------------------- BRANCH FUNCTIONS --------------------
  const CATEGORIES = [
    '1G', '1K', '1R', '2AG', '2AK', '2AR', '2BG', '2BK', '2BR',
    '3AG', '3AK', '3AR', '3BG', '3BK', '3BR', 'GM', 'GMK', 'GMP',
    'GMR', 'NRI', 'OPN', 'OTH', 'SCG', 'SCK', 'SCR', 'STG', 'STK', 'STR',
  ];

  const addBranch = () => {
    const defaultCutoff: { [key: string]: number } = {};
    CATEGORIES.forEach(cat => defaultCutoff[cat] = 0);
    
    setNewCollege({
      ...newCollege,
      branchesOffered: [
        ...(newCollege.branchesOffered || []),
        {
          name: '',
          placementRate: 0,
          avgSalary: 0,
          maxSalary: 0,
          cutoff: defaultCutoff,
          admissionTrend: 0,
          industryGrowth: 0,
          isBooming: false,
        },
      ],
    });
  };

  const updateBranch = (idx: number, field: keyof Branch, value: any) => {
    const branches = [...newCollege.branchesOffered];
    (branches[idx] as any)[field] = value;
    setNewCollege({ ...newCollege, branchesOffered: branches });
  };

  const updateBranchCutoff = (idx: number, field: string, value: number) => {
    const branches = [...newCollege.branchesOffered];
    branches[idx].cutoff[field] = value;
    setNewCollege({ ...newCollege, branchesOffered: branches });
  };

  const removeBranch = (idx: number) => {
    const branches = newCollege.branchesOffered.filter((_, i) => i !== idx);
    setNewCollege({ ...newCollege, branchesOffered: branches });
  };

  // -------------------- USE EFFECT --------------------
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const userObj = JSON.parse(userData);
    if (userObj.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    setUser(userObj);
    fetchStats();
    fetchColleges();
    fetchStudents();
  }, []);

  // -------------------- API CALLS --------------------
  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      setStats(data);
    } catch {
      toast.error('Failed to fetch stats');
    }
  };

  const fetchColleges = async () => {
    try {
      const res = await fetch('/api/admin/colleges');
      const data = await res.json();
      // setColleges(data);
      setColleges(data.colleges || []);
    } catch {
      toast.error('Failed to fetch colleges');
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/admin/student');
      const data = await res.json();
      setStudents(data);
    } catch {
      toast.error('Failed to fetch students');
    }
  };

  // -------------------- ACTIONS --------------------
  const handleAddCollege = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollege.name || !newCollege.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const res = await fetch('/api/colleges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCollege),
      });

      if (!res.ok) throw new Error('Failed to add college');

      const savedCollege = await res.json();
      setColleges([...colleges, savedCollege]);

      setNewCollege({
        name: '',
        location: '',
        type: 'Private',
        established: '',
        fees: '',
        image: '',
        description: '',
        accreditation: '',
        infraRating: '',
        branchesOffered: [],
      });

      toast.success('College added successfully!');
    } catch {
      toast.error('Failed to add college');
    }
  };

  const handleMarkComplete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/students/${id}`, { method: 'PATCH' });
      if (!res.ok) throw new Error('Failed to update student');
      const updatedStudent = await res.json();
      setStudents(students.map(s => (s._id === id ? updatedStudent : s)));
      toast.success('Student profile marked complete');
    } catch {
      toast.error('Failed to update student');
    }
  };

  const handleDeleteStudent = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/students/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete student');
      setStudents(students.filter(s => s._id !== id));
      toast.success('Student deleted');
    } catch {
      toast.error('Failed to delete student');
    }
  };

  // -------------------- PIE DATA --------------------
  const pieData = [
    { name: 'New Users', value: stats.newUsers },
    { name: 'Existing Users', value: stats.totalUsers - stats.newUsers },
  ];

  // -------------------- RETURN JSX --------------------
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Welcome, <span className="text-blue-600">{user?.username}</span> (Admin)
        </h1>
        <p className="text-gray-600">Manage colleges, users, and website performance.</p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          {
            icon: <Users className="h-5 w-5 text-blue-600" />,
            title: "Total Users",
            value: stats.totalUsers,
            subtitle: "Active users on platform",
            gradient: "from-blue-100 to-blue-200",
          },
          {
            icon: <Activity className="h-5 w-5 text-green-600" />,
            title: "New Users",
            value: stats.newUsers,
            subtitle: "Joined this month",
            gradient: "from-green-100 to-green-200",
          },
          {
            icon: <BarChart3 className="h-5 w-5 text-orange-600" />,
            title: "Website Performance",
            value: `Uptime: ${stats.performance.uptime}% | Response: ${stats.performance.responseTime}ms`,
            gradient: "from-orange-100 to-orange-200",
          },
        ].map((stat, idx) => (
          <Card key={idx} className={`p-4 shadow-lg rounded-xl bg-gradient-to-r ${stat.gradient} hover:shadow-2xl transition`}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-800">
                {stat.icon} <span>{stat.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl md:text-3xl font-bold">{stat.value}</p>
              {stat.subtitle && <p className="text-sm text-gray-700">{stat.subtitle}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pie Chart */}
      <Card className="mb-8 shadow-lg rounded-xl hover:shadow-2xl transition">
        <CardHeader>
          <CardTitle className="text-indigo-800 font-bold">User Distribution</CardTitle>
          <CardDescription className="text-gray-600">Breakdown of new vs existing users</CardDescription>
        </CardHeader>
        <CardContent className="h-72 flex justify-center items-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={40}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [`${value}`, name]}
                contentStyle={{ backgroundColor: '#f3f4f6', borderRadius: '8px', border: 'none' }}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>


      {/* Add College Form */}
      <Card className="mb-8 shadow-lg rounded-xl hover:shadow-2xl transition">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-purple-600">
            <PlusCircle className="h-5 w-5" />
            <span>Add New College</span>
          </CardTitle>
          <CardDescription>Fill details to add a new college</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddCollege} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* College Fields */}
              <InputField label="College Name" value={newCollege.name} onChange={(v) => setNewCollege({ ...newCollege, name: v })} required />
              <InputField label="Location" value={newCollege.location} onChange={(v) => setNewCollege({ ...newCollege, location: v })} required />
              <SelectField label="Type" value={newCollege.type} options={['Private', 'Government', 'Autonomous']} onChange={(v) => setNewCollege({ ...newCollege, type: v as College['type'] })} />
              <InputField label="Established Year" type="number" value={newCollege.established} onChange={(v) => setNewCollege({ ...newCollege, established: v === '' ? '' : Number(v) })} />
              <InputField label="Fees" type="number" value={newCollege.fees} onChange={(v) => setNewCollege({ ...newCollege, fees: v === '' ? '' : Number(v) })} />
              <InputField label="Infrastructure Rating" type="number" min={1} max={5} value={newCollege.infraRating} onChange={(v) => setNewCollege({ ...newCollege, infraRating: v === '' ? '' : Number(v) })} />
              <InputField label="Accreditation" value={newCollege.accreditation} onChange={(v) => setNewCollege({ ...newCollege, accreditation: v })} />
              <InputField label="Image URL" value={newCollege.image} onChange={(v) => setNewCollege({ ...newCollege, image: v })} />
              <InputField label="Description" value={newCollege.description} onChange={(v) => setNewCollege({ ...newCollege, description: v })} />
            </div>

            {/* Branches Section */}
            <div className="space-y-2">
              <p className="font-semibold text-gray-700">Branches Offered</p>
              <div className="space-y-4 max-h-96 overflow-y-auto border rounded p-2">
                {newCollege.branchesOffered?.map((branch, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-3 border-b pb-2 hover:bg-gray-50 rounded transition">
                    <div className="col-span-full">
                      <InputField label="Branch Name" value={branch.name} onChange={(v) => updateBranch(idx, 'name', v)} />
                    </div>
                    <InputField label="Placement Rate (%)" type="number" value={branch.placementRate} onChange={(v) => updateBranch(idx, 'placementRate', Number(v))} />
                    <InputField label="Avg Salary (₹)" type="number" value={branch.avgSalary} onChange={(v) => updateBranch(idx, 'avgSalary', Number(v))} />
                    <InputField label="Max Salary (₹)" type="number" value={branch.maxSalary} onChange={(v) => updateBranch(idx, 'maxSalary', Number(v))} />
                    <InputField label="Admission Trend" type="number" step="0.01" value={branch.admissionTrend} onChange={(v) => updateBranch(idx, 'admissionTrend', Number(v))} />
                    <InputField label="Industry Growth" type="number" step="0.01" value={branch.industryGrowth} onChange={(v) => updateBranch(idx, 'industryGrowth', Number(v))} />
                    <div className="flex items-center space-x-2">
                      <Label>Is Booming?</Label>
                      <input type="checkbox" checked={branch.isBooming} onChange={(e) => updateBranch(idx, 'isBooming', e.target.checked)} />
                    </div>
                    
                    {/* All Category Cutoffs */}
                    <div className="col-span-full border-t pt-3 mt-2">
                      <p className="font-semibold text-sm mb-2">Cutoff Ranks by Category</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                        {CATEGORIES.map(cat => (
                          <InputField 
                            key={cat}
                            label={`${cat}`} 
                            type="number" 
                            value={branch.cutoff[cat] || 0} 
                            onChange={(v) => updateBranchCutoff(idx, cat, Number(v))} 
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div className="col-span-full">
                      <Button type="button" variant="destructive" className="w-full" onClick={() => removeBranch(idx)}>Remove Branch</Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button type="button" onClick={addBranch}>+ Add Branch</Button>
            </div>

            <Button type="submit" className="w-full mt-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600">
              Add College
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Students Management */}
      <Card className="shadow-lg rounded-xl hover:shadow-2xl transition">
        <CardHeader>
          <CardTitle className="text-indigo-700">Students Management</CardTitle>
          <CardDescription className="text-indigo-500">Manage registered students</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {students.map((s, idx) => (
              <li
                key={s._id}
                className={`flex justify-between items-center border-l-4 border-purple-300 pl-4 py-2 rounded-lg transition hover:bg-gradient-to-r ${idx % 2 === 0 ? 'from-purple-50 via-pink-50 to-yellow-50' : 'from-green-50 via-blue-50 to-indigo-50'
                  }`}
              >
                <div>
                  <p className="font-semibold text-purple-700">{s.username} <span className="text-gray-500">({s.email})</span></p>
                  <p className="text-sm">
                    <span className="text-blue-600 font-medium">Rank:</span> {s.rank || 'N/A'} |
                    <span className="text-green-600 font-medium ml-2">Category:</span> {s.category}
                  </p>
                </div>
                <div className="flex space-x-2">
                  {s.profileComplete ? (
                    <Badge className="bg-green-100 text-green-700">Complete</Badge>
                  ) : (
                    <Button size="sm" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200" onClick={() => handleMarkComplete(s._id)}>
                      <UserCheck className="h-4 w-4 mr-1" /> Mark Complete
                    </Button>
                  )}
                  <Button size="sm" variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-200" onClick={() => handleDeleteStudent(s._id)}>
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>


      {/* Colleges List */}
      <Card className="mb-8 shadow-2xl rounded-xl hover:shadow-3xl transition">
        <CardHeader>
          <CardTitle className="text-purple-700">Colleges List</CardTitle>
          <CardDescription className="text-purple-500">Currently added colleges</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {colleges.map((college) => (
            <Card
              key={college._id}
              className="shadow-md rounded-xl hover:shadow-xl transition transform hover:-translate-y-1 bg-gradient-to-r from-indigo-50 via-pink-50 to-yellow-50"
            >
              <CardHeader>
                <CardTitle className="text-xl text-indigo-700">{college.name}</CardTitle>
                <CardDescription className="text-indigo-500">{college.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-6">
                  {/* College Image */}
                  <img
                    src={college.image}
                    alt={college.name}
                    className="w-full md:w-1/3 h-48 object-cover rounded-lg border-2 border-indigo-200"
                  />

                  {/* College Details */}
                  <div className="flex-1 space-y-2">
                    <p><span className="font-semibold text-purple-600">Location:</span> {college.location}</p>
                    <p><span className="font-semibold text-purple-600">Type:</span> {college.type}</p>
                    <p><span className="font-semibold text-purple-600">Established:</span> {college.established}</p>
                    <p><span className="font-semibold text-purple-600">Fees:</span> ₹{college.fees.toLocaleString()}</p>
                    <p><span className="font-semibold text-purple-600">Accreditation:</span> {college.accreditation}</p>
                    <p><span className="font-semibold text-purple-600">Infra Rating:</span> {college.infraRating}/5</p>

                    {/* Branches */}
                    <div className="mt-2">
                      <p className="font-semibold text-indigo-700 mb-1">Branches Offered:</p>
                      <ul className="ml-4 space-y-2">
                        {college.branchesOffered.map((branch) => (
                          <li
                            key={branch._id}
                            className="border-l-4 border-purple-300 pl-2 pb-1 hover:bg-purple-50 rounded transition"
                          >
                            <p className="font-medium text-pink-600">{branch.name}</p>
                            <p className="text-sm text-green-700">
                              Placement Rate: <span className="font-semibold">{(branch.placementRate * 100).toFixed(1)}%</span> |
                              Avg Salary: <span className="font-semibold text-blue-600">₹{branch.avgSalary.toLocaleString()}</span> |
                              Max Salary: <span className="font-semibold text-blue-800">₹{branch.maxSalary.toLocaleString()}</span>
                            </p>
                            <div className="text-sm mt-1">
                              <p className="font-semibold text-gray-700 mb-1">Cutoff Ranks:</p>
                              <div className="flex flex-wrap gap-1">
                                {Object.entries(branch.cutoff).map(([cat, rank]) => (
                                  <span key={cat} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">
                                    {cat}: {rank}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-purple-700">
                              Admission Trend: {(branch.admissionTrend * 100).toFixed(1)}% |
                              Industry Growth: {(branch.industryGrowth * 100).toFixed(1)}% |
                              {branch.isBooming && <span className="text-orange-500 font-bold">Booming 🚀</span>}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>



    </div>

  );
}

