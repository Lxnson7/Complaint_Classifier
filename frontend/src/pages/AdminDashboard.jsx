import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintAPI } from '../lib/api.js';
import { BarChart3, AlertCircle, Clock, TrendingUp, RefreshCw, Trash2 } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsData, complaintsData] = await Promise.all([
        complaintAPI.getStats(),
        complaintAPI.getAllComplaints(10, 0),
      ]);
      setStats(statsData);
      setComplaints(complaintsData.complaints);
    } catch (err) {
      setError('Failed to load data. Make sure backend is running on http://localhost:8000');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReset = async () => {
    if (window.confirm('Are you sure you want to reset all data?')) {
      try {
        await complaintAPI.resetData();
        fetchData();
      } catch (err) {
        alert('Failed to reset data');
      }
    }
  };

  const categoryColors = {
    'Payment Issue': '#f59e0b',
    'Delivery Issue': '#3b82f6',
    'Product Defect': '#ef4444',
    'Refund Request': '#10b981',
    'Account Problem': '#8b5cf6',
    'Fraud': '#dc2626',
    'General Query': '#6b7280',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6 max-w-md">
          <p className="text-red-300 text-center mb-4">{error}</p>
          <button onClick={fetchData} className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <BarChart3 className="w-10 h-10 text-blue-400" />
              Admin Dashboard
            </h1>
            <p className="text-gray-400">Complaint Management & Analytics</p>
          </div>
          <div className="flex gap-3">
            <button onClick={fetchData} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button onClick={handleReset} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Reset Data
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
            <p className="text-gray-400 text-sm mb-2">Total Complaints</p>
            <p className="text-4xl font-bold text-white">{stats?.total_complaints || 0}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
            <p className="text-gray-400 text-sm mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Avg. Confidence
            </p>
            <p className="text-4xl font-bold text-green-400">{((stats?.average_confidence || 0) * 100).toFixed(0)}%</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
            <p className="text-gray-400 text-sm mb-2">Most Common</p>
            <p className="text-xl font-bold text-white">{stats?.most_common_category || 'N/A'}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20 cursor-pointer hover:bg-white/15" onClick={() => navigate('/complaints')}>
            <p className="text-gray-400 text-sm mb-2">View All</p>
            <p className="text-xl font-bold text-blue-400">→ Complaints List</p>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20 mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Complaints by Category</h3>
          <div className="space-y-3">
            {stats && Object.entries(stats.category_breakdown || {}).map(([category, count]) => {
              const percentage = stats.category_percentages?.[category] || 0;
              const color = categoryColors[category] || '#6b7280';

              return (
                <div key={category} className="space-y-1 cursor-pointer hover:opacity-80" onClick={() => navigate(`/category/${encodeURIComponent(category)}`)}>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">{category}</span>
                    <span className="text-white font-semibold">{count} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%`, backgroundColor: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Complaints */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-white">Recent Complaints</h3>
            <button onClick={() => navigate('/complaints')} className="text-blue-400 hover:text-blue-300">
              View All →
            </button>
          </div>

          {complaints.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No complaints submitted yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-4 py-3 text-left text-gray-300 font-semibold">ID</th>
                    <th className="px-4 py-3 text-left text-gray-300 font-semibold">Customer</th>
                    <th className="px-4 py-3 text-left text-gray-300 font-semibold">Category</th>
                    <th className="px-4 py-3 text-left text-gray-300 font-semibold">Priority</th>
                    <th className="px-4 py-3 text-left text-gray-300 font-semibold">Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((complaint) => (
                    <tr key={complaint.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-white font-mono">#{complaint.id}</td>
                      <td className="px-4 py-3 text-white">{complaint.customer_id || 'Anonymous'}</td>
                      <td className="px-4 py-3">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: categoryColors[complaint.category] + '33', color: categoryColors[complaint.category] }}>
                          {complaint.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          complaint.priority === 'Critical' ? 'bg-red-500/20 text-red-400' :
                          complaint.priority === 'High' ? 'bg-orange-500/20 text-orange-400' :
                          complaint.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {complaint.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-green-400 font-semibold">{(complaint.confidence * 100).toFixed(0)}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
