import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintAPI } from '../lib/api.js';
import { List, ArrowLeft, Search, Filter } from 'lucide-react';

const ComplaintsList = () => {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [complaintsData, categoriesData] = await Promise.all([
          complaintAPI.getAllComplaints(1000, 0),
          complaintAPI.getCategories(),
        ]);
        setComplaints(complaintsData.complaints);
        setFilteredComplaints(complaintsData.complaints);
        setCategories(['All', ...categoriesData.categories]);
      } catch (err) {
        console.error('Failed to load complaints');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = complaints;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(c => c.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.complaint.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.customer_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredComplaints(filtered);
  }, [searchTerm, selectedCategory, complaints]);

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
        <div className="text-white text-xl">Loading complaints...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <button onClick={() => navigate('/admin')} className="text-blue-400 hover:text-blue-300 flex items-center gap-2 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <List className="w-10 h-10 text-blue-400" />
            All Complaints ({filteredComplaints.length})
          </h1>
        </div>

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white font-semibold mb-2 flex items-center gap-2">
                <Search className="w-4 h-4" />
                Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by complaint or customer..."
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Complaints List */}
        <div className="space-y-4">
          {filteredComplaints.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20 text-center">
              <p className="text-gray-400">No complaints found</p>
            </div>
          ) : (
            filteredComplaints.map((complaint) => (
              <div key={complaint.id} className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20 hover:bg-white/15 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-gray-400 text-sm">ID: #{complaint.id}</span>
                    <h3 className="text-white font-semibold text-lg">{complaint.customer_id || 'Anonymous Customer'}</h3>
                    <p className="text-gray-300 text-sm mt-1">{new Date(complaint.timestamp).toLocaleString()}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: categoryColors[complaint.category] + '33', color: categoryColors[complaint.category] }}>
                      {complaint.category}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      complaint.priority === 'Critical' ? 'bg-red-500/20 text-red-400' :
                      complaint.priority === 'High' ? 'bg-orange-500/20 text-orange-400' :
                      complaint.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {complaint.priority}
                    </span>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-4 mb-4">
                  <p className="text-gray-300 text-sm">{complaint.complaint}</p>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <span className="text-green-400 font-semibold text-sm">
                      Confidence: {(complaint.confidence * 100).toFixed(0)}%
                    </span>
                    {complaint.keywords_matched && complaint.keywords_matched.length > 0 && (
                      <div className="flex gap-1">
                        {complaint.keywords_matched.slice(0, 3).map((keyword, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplaintsList;
