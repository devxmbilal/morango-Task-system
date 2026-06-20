import { useState, useCallback } from 'react';
import { api } from '../lib/api';
import { toastSuccess, toastError } from '../lib/toast';

export function useMembers() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get('/members');
      setMembers(data || []);
    } catch (e: any) {
      console.error('Error fetching members:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const createMember = async (memberForm: {
    name: string;
    email: string;
    title: string;
    role: string;
    password?: string;
  }) => {
    try {
      await api.post('/members', memberForm);
      fetchMembers();
      toastSuccess('Team member added successfully!');
      return { ok: true };
    } catch (err: any) {
      toastError(err.message || 'Failed to add member');
      return { ok: false, error: err.message || 'Failed to create member' };
    }
  };

  const updateMember = async (
    memberId: string,
    editMemberForm: {
      name: string;
      email: string;
      title: string;
      roleId: string;
      isActive: boolean;
      password?: string;
    }
  ) => {
    try {
      await api.put(`/members/${memberId}`, editMemberForm);
      fetchMembers();
      toastSuccess('Team member updated successfully');
      return { ok: true };
    } catch (e: any) {
      toastError(e.message || 'Failed to update member');
      return { ok: false, error: e.message || 'Failed to update member' };
    }
  };

  const deleteMember = async (memberId: string) => {
    try {
      await api.delete(`/members/${memberId}`);
      fetchMembers();
      toastSuccess('Team member removed');
      return { ok: true };
    } catch (e: any) {
      toastError(e.message || 'Failed to delete member');
      return { ok: false };
    }
  };

  return {
    members,
    loading,
    setMembers,
    fetchMembers,
    createMember,
    updateMember,
    deleteMember,
  };
}
