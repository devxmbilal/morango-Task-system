import { useState, useCallback } from 'react';
import type { Role, Permission } from '../types';
import { api } from '../lib/api';
import { toastSuccess, toastError } from '../lib/toast';

export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get('/roles');
      setRoles(data || []);
    } catch (e: any) {
      console.error('Error fetching roles:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const createRole = async (roleForm: {
    name: string;
    color: string;
    perms: Permission;
  }) => {
    try {
      await api.post('/roles', roleForm);
      fetchRoles();
      toastSuccess(`Role "${roleForm.name}" created successfully!`);
      return { ok: true };
    } catch (err: any) {
      toastError(err.message || 'Failed to create role');
      return { ok: false, error: err.message || 'Failed to create role' };
    }
  };

  return {
    roles,
    loading,
    setRoles,
    fetchRoles,
    createRole,
  };
}
