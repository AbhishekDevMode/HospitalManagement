import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('analytics');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Data states
  const [analytics, setAnalytics] = useState(null);
  const [unverifiedDoctors, setUnverifiedDoctors] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {

    const storedUser = localStorage.getItem('user');
    
    if (!storedUser) {
    
      navigate('/login');
    
    } else {
    
      const u = JSON.parse(storedUser);
      if (u.role !== 'ROLE_ADMIN') {
        navigate('/dashboard');
      }
      setUser(u);
    }
  }, [navigate]);

  useEffect(() => {
    if (!user) return;
    const config = { headers: { Authorization: `Bearer ${user.accessToken}` } };

    const fetchData = async () => {
      try {
        if (activeTab === 'analytics') {
          const res = await axios.get(`${API_BASE}/api/admin/analytics`, config);
          setAnalytics(res.data);
        } else if (activeTab === 'doctors') {
          const res = await axios.get(`${API_BASE}/api/admin/doctors/unverified`, config);
          setUnverifiedDoctors(res.data);
        } else if (activeTab === 'users') {
          const res = await axios.get(`${API_BASE}/api/admin/users`, config);
          setUsers(res.data);
        } else if (activeTab === 'departments') {
          const res = await axios.get(`${API_BASE}/api/departments`, config);
          setDepartments(res.data);
        } else if (activeTab === 'billing') {
          const res = await axios.get(`${API_BASE}/api/invoices`, config);
          setInvoices(res.data);
        } else if (activeTab === 'complaints') {
          const res = await axios.get(`${API_BASE}/api/complaints`, config);
          setComplaints(res.data);
        }
      } catch (err) {
        console.error("Error fetching data", err);
      }
    };
    fetchData();
  }, [activeTab, user]);

  const verifyDoctor = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.accessToken}` } };
      await axios.put(`${API_BASE}/api/admin/doctors/${id}/verify`, {}, config);
      setUnverifiedDoctors(unverifiedDoctors.filter(d => d.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleUserStatus = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.accessToken}` } };
      await axios.put(`${API_BASE}/api/admin/users/${id}/toggle-status`, {}, config);
      setUsers(users.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'analytics':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
            {analytics ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                  <h3 className="text-slate-500 font-medium">Total Appointments</h3>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{analytics.totalAppointments}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                  <h3 className="text-slate-500 font-medium">Total Patients</h3>
                  <p className="text-3xl font-bold text-green-600 mt-2">{analytics.totalPatients}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                  <h3 className="text-slate-500 font-medium">Total Doctors</h3>
                  <p className="text-3xl font-bold text-purple-600 mt-2">{analytics.totalDoctors}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                  <h3 className="text-slate-500 font-medium">Total Revenue</h3>
                  <p className="text-3xl font-bold text-amber-600 mt-2">${analytics.totalRevenue}</p>
                </div>
              </div>
            ) : <p>Loading analytics...</p>}
          </div>
        );

      case 'doctors':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Doctor Onboarding</h2>
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Specialization</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {unverifiedDoctors.length === 0 ? (
                    <tr><td colSpan="3" className="px-6 py-4 text-center text-slate-500">No pending doctors</td></tr>
                  ) : unverifiedDoctors.map(doctor => (
                    <tr key={doctor.id}>
                      <td className="px-6 py-4">{doctor.name}</td>
                      <td className="px-6 py-4">{doctor.specialization}</td>
                      <td className="px-6 py-4">
                        <button onClick={() => verifyDoctor(doctor.id)} className="text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded">
                          Approve
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'users':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">User Management</h2>
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Username</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {users.map(u => (
                    <tr key={u.id}>
                      <td className="px-6 py-4">{u.username}</td>
                      <td className="px-6 py-4">{u.role}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${u.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {u.isActive !== false ? 'Active' : 'Blocked'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {u.role !== 'ROLE_ADMIN' && (
                          <button onClick={() => toggleUserStatus(u.id)} className={`px-3 py-1 rounded text-white ${u.isActive !== false ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                            {u.isActive !== false ? 'Block' : 'Unblock'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      
      case 'departments':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Departments</h2>
            {/* Simple display, skipping full CRUD form for brevity */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {departments.map(dept => (
                    <tr key={dept.id}>
                      <td className="px-6 py-4 font-medium">{dept.name}</td>
                      <td className="px-6 py-4 text-slate-600">{dept.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'billing':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Billing & Invoices</h2>
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {invoices.length === 0 ? (
                    <tr><td colSpan="3" className="px-6 py-4 text-center">No invoices found</td></tr>
                  ) : invoices.map(inv => (
                    <tr key={inv.id}>
                      <td className="px-6 py-4">#{inv.id}</td>
                      <td className="px-6 py-4">${inv.amount}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${inv.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'complaints':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Complaints</h2>
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden p-6">
              <p className="text-slate-500">Feature in development: View and resolve patient/doctor complaints here.</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!user) return null;

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <h2 className="font-bold text-slate-800 text-lg tracking-tight">Admin Portal</h2>
          <p className="text-sm text-slate-500 mt-1">Manage system</p>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3">
            {[
              { id: 'analytics', label: 'Analytics' },
              { id: 'doctors', label: 'Doctor Onboarding' },
              { id: 'users', label: 'User Management' },
              { id: 'departments', label: 'Departments' },
              { id: 'billing', label: 'Billing' },
              { id: 'complaints', label: 'Complaints' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto bg-slate-50 p-8">
        <div className="max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
