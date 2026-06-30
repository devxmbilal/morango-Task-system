import { useState, useCallback } from 'react';
import type { MilestoneAttachment, Task } from '../types';
import { api } from '../lib/api';
import { toastSuccess, toastError } from '../lib/toast';

interface CreateTaskInput {
  title: string;
  desc: string;
  assigneeId: string;
  priority: string;
  tag: string;
  due: string;
  images: string[];
  referenceLinks?: string[];
  milestones?: Array<{
    title: string;
    description: string;
    dueDate?: string;
    links: string[];
    attachments: MilestoneAttachment[];
  }>;
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get('/tasks');
      setTasks(data || []);
    } catch (e: any) {
      console.error('Error fetching tasks:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const moveTask = async (taskId: string, status: string) => {
    const originalTasks = [...tasks];
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== taskId) return t;
        const update: Partial<Task> = { status: status as any };
        if (status === 'done') update.progress = 100;
        else if (status === 'todo') update.progress = 0;
        return { ...t, ...update };
      })
    );
    try {
      await api.put(`/tasks/${taskId}`, { status });
      fetchTasks();
      toastSuccess(`Task status changed to ${status === 'inprogress' ? 'In Progress' : status === 'todo' ? 'To Do' : 'Done'}`);
      return { ok: true };
    } catch (e: any) {
      setTasks(originalTasks);
      toastError(e.message || 'Failed to move task');
      return { ok: false };
    }
  };

  const setProgress = async (taskId: string, progress: number) => {
    try {
      await api.put(`/tasks/${taskId}`, { progress });
      fetchTasks();
      toastSuccess(`Progress updated to ${progress}%`);
      return { ok: true };
    } catch (e: any) {
      toastError(e.message || 'Failed to update progress');
      return { ok: false };
    }
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const data = await api.upload('/upload', formData);
      toastSuccess(`${file.name} uploaded successfully`);
      return data.fileUrl as string;
    } catch (e: any) {
      toastError(e.message || 'File upload failed');
      throw e;
    }
  };

  const createTask = async (taskForm: CreateTaskInput) => {
    try {
      await api.post('/tasks', taskForm);
      fetchTasks();
      toastSuccess('Task created successfully!');
      return { ok: true };
    } catch (err: any) {
      toastError(err.message || 'Failed to create task');
      return { ok: false, error: err.message || 'Failed to create task' };
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchTasks();
      toastSuccess('Task deleted successfully');
      return { ok: true };
    } catch (e: any) {
      toastError(e.message || 'Failed to delete task');
      return { ok: false };
    }
  };

  const updateTask = async (
    taskId: string,
    editTaskForm: {
      title: string;
      desc: string;
      assigneeId: string;
      priority: string;
      tag: string;
      due: string;
      referenceLinks?: string[];
    }
  ) => {
    try {
      await api.put(`/tasks/${taskId}`, editTaskForm);
      fetchTasks();
      toastSuccess('Task updated successfully');
      return { ok: true };
    } catch (e: any) {
      toastError(e.message || 'Failed to update task');
      return { ok: false, error: e.message || 'Failed to update task' };
    }
  };

  const acceptTask = async (taskId: string) => {
    try {
      await api.post(`/tasks/${taskId}/accept`);
      fetchTasks();
      toastSuccess('Task accepted — status moved to In Progress');
      return { ok: true };
    } catch (e: any) {
      toastError(e.message || 'Failed to accept task');
      return { ok: false };
    }
  };

  const postComment = async (taskId: string, text: string) => {
    try {
      await api.post(`/tasks/${taskId}/comments`, { text });
      fetchTasks();
      toastSuccess('Comment added');
      return { ok: true };
    } catch (e: any) {
      toastError(e.message || 'Failed to post comment');
      return { ok: false };
    }
  };

  return {
    tasks,
    loading,
    setTasks,
    fetchTasks,
    moveTask,
    setProgress,
    uploadFile,
    createTask,
    deleteTask,
    updateTask,
    postComment,
    acceptTask,
  };
}
