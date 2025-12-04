import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { complaintAPI } from '../lib/api.js';
import { Tag, ArrowLeft } from 'lucide-react';

const CategoryView = () => {
  const { category } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await complaintAPI.getComplaintsByCategory(decodeURIComponent(category));
        setData(result);
      } catch (err) {
        console.error('Failed to load category data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [category]);

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
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const color = categoryColors[decodeURIComponent(category)] || '#6b7280';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate('/admin')} className="text-blue-400 hover:text-blue-300 flex items-center gap-2 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Tag className="w-10 h-10" style={{ color }} />
            {decodeURIComponent(category)}
          </h1>
          <p className="text-gray-400">{data?.count || 0} complaints in this category</p>
        </div>

        <div className="space-y-4">
          {data?.complaints && data.complaints.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20 text-center">
              <p className="text-gray-400">No complaints in this category</p>
            </div>
          ) : (
            data?.complaints.map((complaint) => (
              <div key={complaint.id} className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-gray-400 text-sm">ID: #{complaint.id}</span>
                    <h3 className="text-white font-semibold">{complaint.customer_id || 'Anonymous'}</h3>
                    <p className="text-gray-400 text-sm">{new Date(complaint.timestamp).toLocaleString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    complaint.priority === 'Critical' ? 'bg-red-500/20 text-red-400' :
                    complaint.priority === 'High' ? 'bg-orange-500/20 text-orange-400' :
                    complaint.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {complaint.priority}
                  </span>
                </div>

                <div className="bg-white/5 rounded-lg p-4 mb-3">
                  <p className="text-gray-300 text-sm">{complaint.complaint}</p>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-green-400 font-semibold text-sm">
                    Confidence: {(complaint.confidence * 100).toFixed(0)}%
                  </span>
                  {complaint.keywords_matched && (
                    <div className="flex gap-1">
                      {complaint.keywords_matched.slice(0, 3).map((kw, i) => (
                        <span key={i} className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded">{kw}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryView;
