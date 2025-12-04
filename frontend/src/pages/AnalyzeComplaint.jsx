import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintAPI } from '../lib/api.js';
import { Microscope, ArrowLeft, Loader2 } from 'lucide-react';

const AnalyzeComplaint = () => {
  const [complaint, setComplaint] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAnalyze = async () => {
    if (!complaint.trim()) return;
    
    setLoading(true);
    try {
      const data = await complaintAPI.analyzeComplaint(complaint.trim());
      setResult(data);
    } catch (err) {
      alert('Failed to analyze complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate('/')} className="text-blue-400 hover:text-blue-300 flex items-center gap-2 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Microscope className="w-10 h-10 text-purple-400" />
            Analyze Complaint
          </h1>
          <p className="text-gray-400">See detailed classification scores for all categories</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20 mb-6">
          <label className="block text-white font-semibold mb-2">Enter Complaint Text</label>
          <textarea
            value={complaint}
            onChange={(e) => setComplaint(e.target.value)}
            placeholder="Type your complaint here..."
            rows={6}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none resize-none"
          />
          <button
            onClick={handleAnalyze}
            disabled={loading || !complaint.trim()}
            className="mt-4 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 disabled:cursor-not-allowed text-white font-semibold rounded-lg flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Microscope className="w-5 h-5" />
                Analyze
              </>
            )}
          </button>
        </div>

        {result && (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4">Prediction Result</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Predicted Category</p>
                  <p className="text-white font-semibold text-lg">{result.predicted_category}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Confidence</p>
                  <p className="text-green-400 font-semibold text-lg">{(result.confidence * 100).toFixed(1)}%</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Priority</p>
                  <p className="text-white font-semibold text-lg">{result.priority}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Keywords Found</p>
                  <p className="text-white font-semibold text-lg">{result.keywords?.length || 0}</p>
                </div>
              </div>

              {result.keywords && result.keywords.length > 0 && (
                <div className="mt-4">
                  <p className="text-gray-400 text-sm mb-2">Matched Keywords:</p>
                  <div className="flex flex-wrap gap-2">
                    {result.keywords.map((kw, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-500/20 text-blue-300 text-sm rounded">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4">All Category Scores</h3>
              <div className="space-y-3">
                {Object.entries(result.all_category_scores || {})
                  .sort(([, a], [, b]) => b - a)
                  .map(([category, score]) => (
                    <div key={category}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300">{category}</span>
                        <span className="text-white font-semibold">{(score * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                          style={{ width: `${score * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyzeComplaint;
