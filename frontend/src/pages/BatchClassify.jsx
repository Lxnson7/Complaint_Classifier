import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintAPI } from '../lib/api.js';
import { Layers, ArrowLeft, Plus, X, Loader2 } from 'lucide-react';

const BatchClassify = () => {
  const [complaints, setComplaints] = useState([{ id: 1, text: '', customerId: '' }]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const addComplaint = () => {
    setComplaints([...complaints, { id: Date.now(), text: '', customerId: '' }]);
  };

  const removeComplaint = (id) => {
    setComplaints(complaints.filter(c => c.id !== id));
  };

  const updateComplaint = (id, field, value) => {
    setComplaints(complaints.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleSubmit = async () => {
    const validComplaints = complaints.filter(c => c.text.trim().length >= 5);
    
    if (validComplaints.length === 0) {
      alert('Please add at least one complaint with minimum 5 characters');
      return;
    }

    setLoading(true);
    try {
      const payload = validComplaints.map(c => ({
        complaint: c.text.trim(),
        customer_id: c.customerId.trim() || null,
      }));
      
      const data = await complaintAPI.classifyBatch(payload);
      setResults(data);
    } catch (err) {
      alert('Failed to classify batch');
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate('/')} className="text-blue-400 hover:text-blue-300 flex items-center gap-2 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Layers className="w-10 h-10 text-green-400" />
            Batch Classification
          </h1>
          <p className="text-gray-400">Classify multiple complaints at once</p>
        </div>

        {!results ? (
          <>
            <div className="space-y-4 mb-6">
              {complaints.map((complaint, index) => (
                <div key={complaint.id} className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-white font-semibold">Complaint #{index + 1}</h3>
                    {complaints.length > 1 && (
                      <button onClick={() => removeComplaint(complaint.id)} className="text-red-400 hover:text-red-300">
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-gray-300 text-sm mb-1">Customer ID (optional)</label>
                      <input
                        type="text"
                        value={complaint.customerId}
                        onChange={(e) => updateComplaint(complaint.id, 'customerId', e.target.value)}
                        placeholder="Customer name or ID"
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm mb-1">Complaint Text *</label>
                      <textarea
                        value={complaint.text}
                        onChange={(e) => updateComplaint(complaint.id, 'text', e.target.value)}
                        placeholder="Enter complaint text (min 5 characters)"
                        rows={3}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <button onClick={addComplaint} className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add Another
              </button>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 disabled:cursor-not-allowed text-white font-semibold rounded-lg flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Layers className="w-5 h-5" />
                    Classify All
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-2">Results</h3>
              <p className="text-gray-400">Successfully processed {results.total_processed} complaints</p>
            </div>

            <div className="space-y-4">
              {results.results.map((result, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-white font-semibold">Complaint #{index + 1}</h3>
                      <p className="text-gray-400 text-sm">ID: #{result.id}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: categoryColors[result.category] + '33', color: categoryColors[result.category] }}>
                        {result.category}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        result.priority === 'Critical' ? 'bg-red-500/20 text-red-400' :
                        result.priority === 'High' ? 'bg-orange-500/20 text-orange-400' :
                        result.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {result.priority}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-3 mb-3">
                    <p className="text-gray-300 text-sm">{result.complaint}</p>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-green-400 font-semibold text-sm">
                      Confidence: {(result.confidence * 100).toFixed(0)}%
                    </span>
                    {result.keywords_matched && result.keywords_matched.length > 0 && (
                      <div className="flex gap-1">
                        {result.keywords_matched.slice(0, 3).map((kw, i) => (
                          <span key={i} className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded">{kw}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => setResults(null)} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg">
              Classify More
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BatchClassify;

