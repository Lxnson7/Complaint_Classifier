import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index.jsx';
import CustomerComplaint from './pages/CustomerComplaint.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import ComplaintsList from './pages/ComplaintsList.jsx';
import CategoryView from './pages/CategoryView.jsx';
import AnalyzeComplaint from './pages/AnalyzeComplaint.jsx';
import BatchClassify from './pages/BatchClassify.jsx';


const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/complaint" element={<CustomerComplaint />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/complaints" element={<ComplaintsList />} />
      <Route path="/category/:category" element={<CategoryView />} />
      <Route path="/analyze" element={<AnalyzeComplaint />} />
      <Route path="/batch" element={<BatchClassify />} />
      
    </Routes>
  </BrowserRouter>
);

export default App;
