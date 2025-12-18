import { Link } from 'react-router-dom';
import { MessageSquare, LayoutDashboard, List, Microscope, Layers } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="text-center max-w-4xl">
        <div className="mb-8">
          <MessageSquare className="w-20 h-20 mx-auto text-blue-400 mb-4" />
          <h1 className="text-5xl font-bold text-white mb-4">Complaint Hub</h1>
          <p className="text-xl text-gray-300 mb-8">ML-Powered Complaint Classification System</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link to="/complaint" className="p-6 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 hover:border-blue-400/50 transition-all hover:shadow-lg hover:shadow-blue-400/20">
            <MessageSquare className="w-10 h-10 text-blue-400 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-white mb-2">Submit Complaint</h2>
            <p className="text-gray-300 text-sm">File a new complaint</p>
          </Link>

          <Link to="/admin" className="p-6 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 hover:border-purple-400/50 transition-all hover:shadow-lg hover:shadow-purple-400/20">
            <LayoutDashboard className="w-10 h-10 text-purple-400 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-white mb-2">Dashboard</h2>
            <p className="text-gray-300 text-sm">View statistics</p>
          </Link>

          <Link to="/complaints" className="p-6 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 hover:border-green-400/50 transition-all hover:shadow-lg hover:shadow-green-400/20">
            <List className="w-10 h-10 text-green-400 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-white mb-2">All Complaints</h2>
            <p className="text-gray-300 text-sm">Browse complaints</p>
          </Link>

          <Link to="/analyze" className="p-6 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 hover:border-pink-400/50 transition-all hover:shadow-lg hover:shadow-pink-400/20">
            <Microscope className="w-10 h-10 text-pink-400 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-white mb-2">Analyze</h2>
            <p className="text-gray-300 text-sm">Debug classification</p>
          </Link>

          <Link to="/batch" className="p-6 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 hover:border-yellow-400/50 transition-all hover:shadow-lg hover:shadow-yellow-400/20">
            <Layers className="w-10 h-10 text-yellow-400 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-white mb-2">Batch Classify</h2>
            <p className="text-gray-300 text-sm">Multiple at once</p>
          </Link>
        </div>

        
      </div>
    </div>
  );
};

export default Index;
