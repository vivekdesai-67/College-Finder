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
  cutoff: { general: number; obc: number; sc: number; st: number };
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
}: {
  label: string;
  value: string | number | '';
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  min?: number;
  max?: number;
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
  const addBranch = () => {
    setNewCollege({
      ...newCollege,
      branchesOffered: [
        ...(newCollege.branchesOffered || []),
        {
          name: '',
          placementRate: 0,
          avgSalary: 0,
          maxSalary: 0,
          cutoff: { general: 0, obc: 0, sc: 0, st: 0 },
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

  const updateBranchCutoff = (idx: number, field: keyof Branch['cutoff'], value: number) => {
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
    <div className="container mx-auto px-4 py-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome, {user?.username} (Admin)
        </h1>
        <p className="text-gray-600">Manage colleges, users, and website performance.</p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span>Total Users</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalUsers}</p>
            <p className="text-sm text-gray-600">Active users on platform</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-green-600" />
              <span>New Users</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.newUsers}</p>
            <p className="text-sm text-gray-600">Joined this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-orange-600" />
              <span>Website Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">Uptime: {stats.performance.uptime}%</p>
            <p className="text-lg">Response: {stats.performance.responseTime}ms</p>
          </CardContent>
        </Card>
      </div>

      {/* Pie Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>User Distribution</CardTitle>
          <CardDescription>Breakdown of new vs existing users</CardDescription>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={100} label>
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Add College */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PlusCircle className="h-5 w-5 text-purple-600" />
            <span>Add New College</span>
          </CardTitle>
          <CardDescription>Fill details to add a new college</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddCollege} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputField
                label="College Name"
                value={newCollege.name}
                onChange={(v) => setNewCollege({ ...newCollege, name: v })}
                required
              />
              <InputField
                label="Location"
                value={newCollege.location}
                onChange={(v) => setNewCollege({ ...newCollege, location: v })}
                required
              />
              <SelectField
                label="Type"
                value={newCollege.type}
                options={['Private', 'Government', 'Autonomous']}
                onChange={(v) => setNewCollege({ ...newCollege, type: v as College['type'] })}
              />
              <InputField
                label="Established Year"
                type="number"
                value={newCollege.established}
                onChange={(v) =>
                  setNewCollege({ ...newCollege, established: v === '' ? '' : Number(v) })
                }
              />
              <InputField
                label="Fees"
                type="number"
                value={newCollege.fees}
                onChange={(v) =>
                  setNewCollege({ ...newCollege, fees: v === '' ? '' : Number(v) })
                }
              />
              <InputField
                label="Infrastructure Rating"
                type="number"
                min={1}
                max={5}
                value={newCollege.infraRating}
                onChange={(v) =>
                  setNewCollege({ ...newCollege, infraRating: v === '' ? '' : Number(v) })
                }
              />
              <InputField
                label="Accreditation"
                value={newCollege.accreditation}
                onChange={(v) => setNewCollege({ ...newCollege, accreditation: v })}
              />
              <InputField
                label="Image URL"
                value={newCollege.image}
                onChange={(v) => setNewCollege({ ...newCollege, image: v })}
              />
              <InputField
                label="Description"
                value={newCollege.description}
                onChange={(v) => setNewCollege({ ...newCollege, description: v })}
              />
            </div>

            {/* Branches Section */}
            <div className="space-y-2">
              <p className="font-semibold">Branches Offered</p>
              <div className="space-y-4 max-h-96 overflow-y-auto border rounded p-2">
                {newCollege.branchesOffered?.map((branch, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-3 border-b pb-2">
                    <InputField
                      label="Name"
                      value={branch.name}
                      onChange={(v) => updateBranch(idx, 'name', v)}
                    />
                    <InputField
                      label="Placement Rate"
                      type="number"
                      value={branch.placementRate}
                      onChange={(v) => updateBranch(idx, 'placementRate', Number(v))}
                    />
                    <InputField
                      label="Avg Salary"
                      type="number"
                      value={branch.avgSalary}
                      onChange={(v) => updateBranch(idx, 'avgSalary', Number(v))}
                    />
                    <InputField
                      label="Max Salary"
                      type="number"
                      value={branch.maxSalary}
                      onChange={(v) => updateBranch(idx, 'maxSalary', Number(v))}
                    />
                    <InputField
                      label="Cutoff Gen"
                      type="number"
                      value={branch.cutoff.general}
                      onChange={(v) => updateBranchCutoff(idx, 'general', Number(v))}
                    />
                    <InputField
                      label="Cutoff OBC"
                      type="number"
                      value={branch.cutoff.obc}
                      onChange={(v) => updateBranchCutoff(idx, 'obc', Number(v))}
                    />
                    <InputField
                      label="Cutoff SC"
                      type="number"
                      value={branch.cutoff.sc}
                      onChange={(v) => updateBranchCutoff(idx, 'sc', Number(v))}
                    />
                    <InputField
                      label="Cutoff ST"
                      type="number"
                      value={branch.cutoff.st}
                      onChange={(v) => updateBranchCutoff(idx, 'st', Number(v))}
                    />
                    <InputField
                      label="Admission Trend"
                      type="number"
                      value={branch.admissionTrend}
                      onChange={(v) => updateBranch(idx, 'admissionTrend', Number(v))}
                    />
                    <InputField
                      label="Industry Growth"
                      type="number"
                      value={branch.industryGrowth}
                      onChange={(v) => updateBranch(idx, 'industryGrowth', Number(v))}
                    />
                    <div className="flex items-center space-x-2">
                      <Label>Is Booming?</Label>
                      <input
                        type="checkbox"
                        checked={branch.isBooming}
                        onChange={(e) => updateBranch(idx, 'isBooming', e.target.checked)}
                      />
                    </div>
                    <Button type="button" variant="destructive" onClick={() => removeBranch(idx)}>
                      Remove Branch
                    </Button>
                  </div>
                ))}
              </div>
              <Button type="button" onClick={addBranch}>
                + Add Branch
              </Button>
            </div>

            <Button type="submit" className="w-full mt-4">
              Add College
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Colleges List & Students Management */}
      {/* ... same JSX as your original code for displaying colleges & students ... */}
      {/* List Colleges */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Colleges List</CardTitle>
                    <CardDescription>Currently added colleges</CardDescription>
                </CardHeader>
                <CardContent>
                    {/* <ul className="space-y-2">
                        {colleges.map((c) => (
                            <li key={c._id} className="flex justify-between items-center border-b pb-2">
                                <span>{c.name} - <span className="text-gray-500">{c.location}</span></span>
                                <Badge variant="secondary">Active</Badge>
                            </li>
                        ))}
                    </ul> */}
                    {colleges.map((college) => (
                        <Card key={college._id} className="mb-8">
                            <CardHeader>
                                <CardTitle>{college.name}</CardTitle>
                                <CardDescription>{college.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col md:flex-row gap-6">
                                    {/* College Image */}
                                    <img
                                        src={college.image}
                                        alt={college.name}
                                        className="w-full md:w-1/3 h-48 object-cover rounded"
                                    />

                                    {/* College Details */}
                                    <div className="flex-1 space-y-2">
                                        <p><span className="font-semibold">Location:</span> {college.location}</p>
                                        <p><span className="font-semibold">Type:</span> {college.type}</p>
                                        <p><span className="font-semibold">Established:</span> {college.established}</p>
                                        <p><span className="font-semibold">Fees:</span> ₹{college.fees.toLocaleString()}</p>
                                        <p><span className="font-semibold">Accreditation:</span> {college.accreditation}</p>
                                        <p><span className="font-semibold">Infrastructure Rating:</span> {college.infraRating}/5</p>

                                        {/* Branches */}
                                        <div>
                                            <p className="font-semibold">Branches Offered:</p>
                                            <ul className="ml-4 space-y-1">
                                                {college.branchesOffered.map((branch) => (
                                                    <li key={branch._id} className="border-b pb-1">
                                                        <p className="font-medium">{branch.name}</p>
                                                        <p className="text-sm text-gray-600">
                                                            Placement Rate: {branch.placementRate * 100}% | Avg Salary: ₹{branch.avgSalary.toLocaleString()} | Max Salary: ₹{branch.maxSalary.toLocaleString()}
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            Cutoff: Gen {branch.cutoff.general}, OBC {branch.cutoff.obc}, SC {branch.cutoff.sc}, ST {branch.cutoff.st}
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            Admission Trend: {(branch.admissionTrend * 100).toFixed(1)}% | Industry Growth: {(branch.industryGrowth * 100).toFixed(1)}% | {branch.isBooming ? 'Booming 🚀' : ''}
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

            {/* Students Management */}
            <Card>
                <CardHeader>
                    <CardTitle>Students Management</CardTitle>
                    <CardDescription>Manage registered students</CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-3">
                        {students.map((s) => (
                            <li key={s._id} className="flex justify-between items-center border-b pb-2">
                                <div>
                                    <p className="font-semibold">{s.username} ({s.email})</p>
                                    <p className="text-sm text-gray-500">
                                        Rank: {s.rank || 'N/A'} | Category: {s.category}
                                    </p>
                                </div>
                                <div className="flex space-x-2">
                                    {s.profileComplete ? (
                                        <Badge className="bg-green-100 text-green-700">Complete</Badge>
                                    ) : (
                                        <Button size="sm" onClick={() => handleMarkComplete(s._id)}>
                                            <UserCheck className="h-4 w-4 mr-1" /> Mark Complete
                                        </Button>
                                    )}
                                    <Button size="sm" variant="destructive" onClick={() => handleDeleteStudent(s._id)}>
                                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
    </div>
  );
}

 