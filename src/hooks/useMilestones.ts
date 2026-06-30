import { useState, useCallback } from 'react';
import type { Milestone, MilestoneAttachment, PendingReview, SubmissionAttachment } from '../types';
import { api } from '../lib/api';
import { toastSuccess, toastError } from '../lib/toast';

export function useMilestones() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchPendingReviews = useCallback(async () => {
    try {
      const data = await api.get('/submissions/pending');
      setPendingReviews(data || []);
    } catch (e) {
      // 403 for non-admin is expected — ignore silently
      setPendingReviews([]);
    }
  }, []);

  const fetchMilestones = useCallback(async (taskId: string) => {
    if (!taskId) return;
    setLoading(true);
    try {
      const data = await api.get(`/tasks/${taskId}/milestones`);
      setMilestones(data || []);
    } catch (e) {
      console.error('Error fetching milestones:', e);
      setMilestones([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createMilestone = async (
    taskId: string,
    form: { title: string; description: string; dueDate?: string; links?: string[]; attachments?: MilestoneAttachment[] }
  ) => {
    try {
      const created: Milestone = await api.post(`/tasks/${taskId}/milestones`, form);
      setMilestones(prev => [...prev, created].sort((a, b) => a.order - b.order));
      toastSuccess('Sub-task added');
      return { ok: true, milestone: created };
    } catch (e: any) {
      toastError(e.message || 'Failed to create sub-task');
      return { ok: false };
    }
  };

  const updateMilestone = async (
    id: number,
    form: { title?: string; description?: string; dueDate?: string; links?: string[]; attachments?: MilestoneAttachment[] }
  ) => {
    try {
      const updated: Milestone = await api.put(`/milestones/${id}`, form);
      setMilestones(prev => prev.map(m => (m.id === id ? updated : m)));
      toastSuccess('Sub-task updated');
      return { ok: true };
    } catch (e: any) {
      toastError(e.message || 'Failed to update sub-task');
      return { ok: false };
    }
  };

  const deleteMilestone = async (id: number) => {
    try {
      await api.delete(`/milestones/${id}`);
      setMilestones(prev => prev.filter(m => m.id !== id));
      toastSuccess('Sub-task deleted');
      return { ok: true };
    } catch (e: any) {
      toastError(e.message || 'Failed to delete sub-task');
      return { ok: false };
    }
  };

  const submitWork = async (
    milestoneId: number,
    form: { description: string; links: string[]; attachments: SubmissionAttachment[] }
  ) => {
    try {
      await api.post(`/milestones/${milestoneId}/submissions`, form);
      toastSuccess('Work submitted for review');
      return { ok: true };
    } catch (e: any) {
      toastError(e.message || 'Failed to submit work');
      return { ok: false };
    }
  };

  const submitTask = async (
    taskId: string,
    form: { description: string; links: string[]; attachments: SubmissionAttachment[] }
  ) => {
    try {
      await api.post(`/tasks/${taskId}/submit`, form);
      toastSuccess('Task submitted for review');
      return { ok: true };
    } catch (e: any) {
      toastError(e.message || 'Failed to submit task');
      return { ok: false };
    }
  };

  const editSubmission = async (
    submissionId: number,
    form: { description: string; links: string[]; attachments: SubmissionAttachment[] }
  ) => {
    try {
      await api.put(`/submissions/${submissionId}`, form);
      toastSuccess('Submission updated');
      return { ok: true };
    } catch (e: any) {
      toastError(e.message || 'Failed to update submission');
      return { ok: false };
    }
  };

  const reviewSubmission = async (
    submissionId: number,
    action: 'approve' | 'reject',
    comment: string,
    reviewAttachments: SubmissionAttachment[] = []
  ) => {
    try {
      await api.put(`/submissions/${submissionId}/review`, { action, comment, reviewAttachments });
      toastSuccess(`Submission ${action === 'approve' ? 'approved' : 'rejected'}`);
      return { ok: true };
    } catch (e: any) {
      toastError(e.message || 'Failed to review submission');
      return { ok: false };
    }
  };

  return {
    milestones,
    loading,
    setMilestones,
    fetchMilestones,
    createMilestone,
    updateMilestone,
    deleteMilestone,
    submitWork,
    submitTask,
    editSubmission,
    reviewSubmission,
    pendingReviews,
    fetchPendingReviews,
  };
}
