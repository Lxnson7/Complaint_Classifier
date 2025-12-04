import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintAPI } from '../lib/api.js';
import { MessageSquare, Send, CheckCircle2, Loader2 } from 'lucide-react';

const CustomerComplaint = () => {
  const [name, setName] = useState('');
  const [complaint, setComplaint] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (name.trim().length < 2) {
      setError('Please enter your full name (at least 2 characters).');
      return;
    }

    if (complaint.trim().length < 5) {
      setError('Please describe your complaint (at least 5 characters).');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await complaintAPI.classify(complaint.trim(), name.trim());
      
      setResult({
        id: response.id,
        category: response.category,
        priority: response.priority,
        confidence: response.confidence,
        keywords: response.keywords_matched || [],
        message: response.message,
      });

      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit complaint. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewComplaint = () => {
    setName('');
    setComplaint('');
    setSubmitted(false);
    setResult(null);
    setError('');
  };

  if (submitted && result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-400" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white text-center mb-4">Complaint Submitted!</h2>
            <p className="text-gray-300 text-center mb-6">{result.message}</p>

            <div className="space-y-3 mb-6">
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-1">Reference ID</p>
                <p className="text-lg font-mono text-blue-400">#{result.id}</p>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-1">Category</p>
                <p className="text-lg font-semibold text-white">{result.category}</p>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-1">Priority</p>
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${
                    result.priority === 'Critical' ? 'bg-red-500' :
                    result.priority === 'High' ? 'bg-orange-500' :
                    result.priority === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}></span>
                  <span className="text-lg font-semibold text-white">{result.priority}</span>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-1">Confidence</p>
                <p className="text-lg font-semibold text-white">{(result.confidence * 100).toFixed(0)}%</p>
              </div>

              {result.keywords && result.keywords.length > 0 && (
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-2">Keywords Matched</p>
                  <div className="flex flex-wrap gap-2">
                    {result.keywords.map((keyword, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <button onClick={handleNewComplaint} className="w-full px-4 py-3 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg transition-colors">
                Submit Another
              </button>
              <button onClick={() => navigate('/admin')} className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
                View Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full">
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
          <div className="flex items-center gap-3 mb-8">
            <MessageSquare className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">Submit Your Complaint</h1>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white font-semibold mb-2">Your Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">Complaint Details *</label>
              <textarea
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                placeholder="Describe your complaint in detail..."
                rows={8}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors resize-none"
                required
              />
              <p className="text-sm text-gray-400 mt-2">Minimum 5 characters required</p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Complaint
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/10">
            <p className="text-gray-400 text-sm">
              <strong>Note:</strong> Your complaint will be automatically classified using ML-based AI system.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerComplaint;
