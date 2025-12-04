import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { classifyComplaint } from '../lib/complaintClassifier.js';

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useComplaintStore = create(
  persist(
    (set, get) => ({
      complaints: [],

      addComplaint: (customerName, complaintText) => {
        const classification = classifyComplaint(complaintText);

        const newComplaint = {
          id: generateId(),
          customerName,
          complaint: complaintText,
          category: classification.category,
          priority: classification.priority,
          status: 'Pending',
          confidence: classification.confidence,
          keywordsMatched: classification.keywordsMatched,
          timestamp: new Date(),
        };

        set((state) => ({
          complaints: [newComplaint, ...state.complaints],
        }));

        return newComplaint;
      },

      updateComplaintStatus: (id, status) => {
        set((state) => ({
          complaints: state.complaints.map((c) =>
            c.id === id ? { ...c, status } : c
          ),
        }));
      },

      getStats: () => {
        const complaints = get().complaints;
        const categories = ['Payment Issue', 'Delivery Issue', 'Product Defect', 'Refund Request', 'Account Problem', 'Fraud', 'General Query'];
        const statuses = ['Pending', 'In Progress', 'Resolved', 'Closed'];
        const priorities = ['Low', 'Medium', 'High', 'Critical'];

        const categoryBreakdown = categories.reduce((acc, cat) => {
          acc[cat] = complaints.filter((c) => c.category === cat).length;
          return acc;
        }, {});

        const total = complaints.length;

        const categoryPercentages = categories.reduce((acc, cat) => {
          acc[cat] = total > 0 ? (categoryBreakdown[cat] / total) * 100 : 0;
          return acc;
        }, {});

        const statusBreakdown = statuses.reduce((acc, status) => {
          acc[status] = complaints.filter((c) => c.status === status).length;
          return acc;
        }, {});

        const priorityBreakdown = priorities.reduce((acc, priority) => {
          acc[priority] = complaints.filter((c) => c.priority === priority).length;
          return acc;
        }, {});

        const mostCommonCategory = categories.reduce((max, cat) =>
          categoryBreakdown[cat] > (categoryBreakdown[max] || 0) ? cat : max, categories[0]
        );

        const avgConfidence = total > 0 ? complaints.reduce((sum, c) => sum + c.confidence, 0) / total : 0;

        return {
          totalComplaints: total,
          categoryBreakdown,
          categoryPercentages,
          mostCommonCategory: total > 0 ? mostCommonCategory : null,
          averageConfidence: avgConfidence,
          statusBreakdown,
          priorityBreakdown,
        };
      },
    }),
    {
      name: 'complaint-storage',
    }
  )
);
