import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

// Types
import type {
  Permission,
  Task,
  WorkspaceSettings,
  Milestone,
  Submission,
} from '../types';

// Lib
import { getInitials, getDaysLeft, toLocalDatetimeString } from '../lib/utils';

// Layout
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';

// Feature Views
import LoginPage from '../features/auth/LoginPage';
import DashboardView from '../features/dashboard/DashboardView';
import BoardView from '../features/board/BoardView';
import TasksView from '../features/tasks/TasksView';
import CreateTaskView from '../features/tasks/CreateTaskView';
import MyTasksView from '../features/mytasks/MyTasksView';
import TeamView from '../features/team/TeamView';
import RolesView from '../features/roles/RolesView';
import ReportsView from '../features/reports/ReportsView';
import SettingsView from '../features/settings/SettingsView';
import ProfileView from '../features/profile/ProfileView';

// Modals
import TaskDetailModal from '../features/tasks/modals/TaskDetailModal';
import EditTaskModal from '../features/tasks/modals/EditTaskModal';
import AddMemberModal from '../features/team/modals/AddMemberModal';
import EditMemberModal from '../features/team/modals/EditMemberModal';
import AddRoleModal from '../features/roles/modals/AddRoleModal';
import MilestoneFormModal from '../features/tasks/modals/MilestoneFormModal';
import SubmitWorkModal from '../features/tasks/modals/SubmitWorkModal';
import ReviewSubmissionModal from '../features/tasks/modals/ReviewSubmissionModal';

// Hooks
import { useAuth } from '../hooks/useAuth';
import { useTasks } from '../hooks/useTasks';
import { useMembers } from '../hooks/useMembers';
import { useRoles } from '../hooks/useRoles';
import { useSettings } from '../hooks/useSettings';
import { useNotifications } from '../hooks/useNotifications';
import { useMilestones } from '../hooks/useMilestones';

// Toast type
interface Toast { id: number; message: string; type: 'success' | 'error'; }

export default function App() {
  // ─── Workspace Settings ───
  const [accentColor, setAccentColor] = useState<string>('#4f46e5'); // Temporary state for initialization fallback

  // ─── Hooks (Data Layer) ───
  const { settings, fetchSettings, saveSettings } = useSettings();
  const {
    token,
    user,
    loading: authLoading,
    loginError,
    login,
    logout,
    updateProfile,
  } = useAuth();

  const {
    tasks,
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
  } = useTasks();

  const {
    members,
    setMembers,
    fetchMembers,
    createMember,
    updateMember,
    deleteMember,
  } = useMembers();

  const {
    roles,
    setRoles,
    fetchRoles,
    createRole,
  } = useRoles();

  const {
    notifications,
    fetchNotifications,
    markNotificationsRead,
    markOneRead,
  } = useNotifications();

  const {
    milestones,
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
  } = useMilestones();

  // ─── Toast State ───
  const [toasts, setToasts] = useState<Toast[]>([]);

  // ─── Navigation ───
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // ─── Auth Form ───
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  // ─── Add Member Modal ───
  const [addingMember, setAddingMember] = useState<boolean>(false);
  const [memberForm, setMemberForm] = useState({
    name: '',
    email: '',
    title: '',
    role: 'employee',
    password: '',
  });

  // ─── Add Role Modal ───
  const [addingRole, setAddingRole] = useState<boolean>(false);
  const [roleForm, setRoleForm] = useState({
    name: '',
    color: '#7c3aed',
    perms: {
      allTasks: false,
      create: false,
      team: false,
      roles: false,
      reports: false,
      settings: false,
    } as Permission,
  });

  // ─── Create Task Form ───
  const [taskForm, setTaskForm] = useState({
    title: '',
    desc: '',
    assigneeId: 'u2',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    tag: 'Web Portal',
    due: '2026-06-30T18:00',
    images: [] as string[],
    referenceLinks: [] as string[],
    milestones: [] as Array<{
      title: string;
      description: string;
      dueDate: string;
      links: string[];
      attachments: { id: number; fileUrl: string; fileName: string }[];
    }>,
  });

  // ─── Edit Task Modal ───
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTaskForm, setEditTaskForm] = useState({
    title: '',
    desc: '',
    assigneeId: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    tag: 'Web Portal',
    due: '',
    referenceLinks: [] as string[],
    images: [] as string[],
  });

  // ─── Edit Member Modal ───
  const [editingMember, setEditingMember] = useState<any | null>(null);
  const [editMemberForm, setEditMemberForm] = useState({
    name: '',
    email: '',
    title: '',
    roleId: '',
    isActive: true,
    password: '',
  });

  // ─── UI Overlay States ───
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);

  // ─── Profile Section ───
  const [profileForm, setProfileForm] = useState({ name: '', email: '', password: '' });

  // ─── Comment Draft ───
  const [commentDraft, setCommentDraft] = useState<string>('');

  // ─── Create-Task image uploading counter ───
  const [taskFormUploading, setTaskFormUploading] = useState<number>(0);

  // ─── Milestone & Submission Modals ───
  const [milestoneFormOpen, setMilestoneFormOpen] = useState<boolean>(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [submitWorkFor, setSubmitWorkFor] = useState<{ milestone: Milestone; submission: Submission | null } | null>(null);
  const [submitTaskFor, setSubmitTaskFor] = useState<Task | null>(null);
  const [reviewingSubmission, setReviewingSubmission] = useState<{ submission: Submission; milestone: Milestone } | null>(null);

  // ─── Refs ───
  const userLoadedRef = useRef<boolean>(false);

  // ─── Effects ───
  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name || '', email: user.email || '', password: '' });
    }
  }, [user]);

  // Session expiry → auto-logout
  useEffect(() => {
    const onExpired = () => { logout(); navigate('/'); };
    window.addEventListener('auth_session_expired', onExpired);
    return () => window.removeEventListener('auth_session_expired', onExpired);
  }, [logout, navigate]);

  // Global toast listener
  useEffect(() => {
    const onToast = (e: Event) => {
      const { message, type } = (e as CustomEvent).detail;
      const id = Date.now();
      setToasts(prev => [...prev, { id, message, type }]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    };
    window.addEventListener('app_toast', onToast);
    return () => window.removeEventListener('app_toast', onToast);
  }, []);

  // Settings initial fetch
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Accent color sync
  useEffect(() => {
    if (settings?.accent) {
      setAccentColor(settings.accent);
    }
  }, [settings]);

  // Periodic notification fetch
  useEffect(() => {
    if (!token) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [token, fetchNotifications]);

  // Periodic pending-reviews fetch (admin only — server returns 403 for non-admins which we ignore)
  useEffect(() => {
    if (!token || !user?.perms?.permAllTasks) return;
    fetchPendingReviews();
    const interval = setInterval(fetchPendingReviews, 15000);
    return () => clearInterval(interval);
  }, [token, user, fetchPendingReviews]);

  // Data preloading & initial view routing on login/refresh
  useEffect(() => {
    if (user) {
      if (!userLoadedRef.current) {
        const perms = user.perms;
        const savedView = localStorage.getItem('morango_view');
        let initialView = perms?.permAllTasks ? 'dashboard' : 'mytasks';
        if (savedView) {
          if (savedView === 'dashboard' && !perms?.permAllTasks) initialView = 'mytasks';
          else if (savedView === 'tasks' && !perms?.permAllTasks) initialView = 'mytasks';
          else if (savedView === 'team' && !perms?.permTeam) initialView = perms?.permAllTasks ? 'dashboard' : 'mytasks';
          else if (savedView === 'roles' && !perms?.permRoles) initialView = perms?.permAllTasks ? 'dashboard' : 'mytasks';
          else if (savedView === 'reports' && !perms?.permReports) initialView = perms?.permAllTasks ? 'dashboard' : 'mytasks';
          else if (savedView === 'settings' && !perms?.permSettings) initialView = perms?.permAllTasks ? 'dashboard' : 'mytasks';
          else initialView = savedView;
        }
        navigate(`/${initialView}`, { replace: true });
        userLoadedRef.current = true;
      }
      fetchTasks();
      fetchMembers();
      fetchRoles();
      fetchNotifications();
    } else {
      userLoadedRef.current = false;
      setTasks([]);
      setMembers([]);
      setRoles([]);
    }
  }, [user, fetchTasks, fetchMembers, fetchRoles, fetchNotifications, setTasks, setMembers, setRoles, navigate]);

  // View state serialization
  useEffect(() => {
    const viewName = location.pathname.substring(1);
    if (token && viewName && viewName !== 'login' && viewName !== '') {
      localStorage.setItem('morango_view', viewName);
    }
  }, [location.pathname, token]);

  // Token syncing
  useEffect(() => {
    if (token) {
      localStorage.setItem('morango_token', token);
    } else {
      localStorage.removeItem('morango_token');
      localStorage.removeItem('morango_view');
    }
  }, [token]);

  // Fetch milestones when a task is selected
  useEffect(() => {
    if (selectedId) fetchMilestones(selectedId);
    else setMilestones([]);
  }, [selectedId, fetchMilestones, setMilestones]);

  // ─── Operations ───
  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await login(email, password);
  };

  const handleLogout = () => {
    logout();
  };

  const handleMarkNotificationsRead = async () => {
    await markNotificationsRead();
  };

  const handleNotificationClick = async (n: typeof notifications[number]) => {
    if (!n.read) markOneRead(n.id);
    if (!n.taskId) return;

    setSearchQuery('');
    setShowNotifications(false);

    // Make sure local task cache contains this task — non-admins only fetch
    // their own assignments, so a freshly assigned task may not be in cache yet.
    await fetchTasks();
    setSelectedId(n.taskId);
  };

  const handleMoveTask = async (taskId: string, status: string) => {
    await moveTask(taskId, status);
  };

  const handleSetProgress = async (taskId: string, progress: number) => {
    await setProgress(taskId, progress);
  };

  const handleAcceptTask = async (taskId: string) => {
    const res = await acceptTask(taskId);
    if (res.ok) fetchNotifications();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    e.target.value = ''; // allow re-selecting same file
    setTaskFormUploading(c => c + files.length);
    for (const file of files) {
      try {
        const fileUrl = await uploadFile(file);
        setTaskForm(prev => ({ ...prev, images: [...prev.images, fileUrl] }));
      } catch (err) {
        console.error('File upload failed:', err);
      } finally {
        setTaskFormUploading(c => c - 1);
      }
    }
  };

  const handleRemoveFormImage = (index: number) => {
    setTaskForm(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== index) }));
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;
    const res = await createTask(taskForm);
    if (res.ok) {
      navigate('/board');
      setTaskForm({
        title: '',
        desc: '',
        assigneeId: 'u2',
        priority: 'medium',
        tag: 'Web Portal',
        due: '2026-06-30T18:00',
        images: [],
        referenceLinks: [],
        milestones: [],
      });
    }
  };

  const handlePostComment = async () => {
    if (!commentDraft.trim() || !selectedId) return;
    const res = await postComment(selectedId, commentDraft);
    if (res.ok) {
      setCommentDraft('');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    const res = await deleteTask(taskId);
    if (res.ok) {
      if (selectedId === taskId) setSelectedId(null);
    }
  };

  const handleOpenEditTask = (task: Task) => {
    setEditingTask(task);
    setEditTaskForm({
      title: task.title,
      desc: task.desc,
      assigneeId: task.assigneeId,
      priority: task.priority,
      tag: task.tag,
      due: toLocalDatetimeString(task.due),
      referenceLinks: task.referenceLinks ? [...task.referenceLinks] : [],
      images: task.images ? [...task.images] : [],
    });
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    const res = await updateTask(editingTask.id, editTaskForm);
    if (res.ok) {
      setEditingTask(null);
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!window.confirm('Delete this team member? Their tasks will become unassigned.')) return;
    const res = await deleteMember(memberId);
    if (res.ok) {
      fetchTasks(); // update task assignees
    }
  };

  const handleOpenEditMember = (member: any) => {
    setEditingMember(member);
    setEditMemberForm({
      name: member.name,
      email: member.email,
      title: member.title,
      roleId: member.roleId || 'employee',
      isActive: member.isActive !== false,
      password: '',
    });
  };

  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    const res = await updateMember(editingMember.id, editMemberForm);
    if (res.ok) {
      setEditingMember(null);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await updateProfile(profileForm);
    if (res.ok) {
      setProfileForm(prev => ({ ...prev, password: '' }));
    }
  };

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberForm.name.trim() || !memberForm.email.trim()) return;
    const res = await createMember(memberForm);
    if (res.ok) {
      setAddingMember(false);
      setMemberForm({ name: '', email: '', title: '', role: 'employee', password: '' });
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleForm.name.trim()) return;
    const res = await createRole(roleForm);
    if (res.ok) {
      setAddingRole(false);
      setRoleForm({
        name: '',
        color: '#7c3aed',
        perms: { allTasks: false, create: false, team: false, roles: false, reports: false, settings: false },
      });
    }
  };

  const handleToggleRolePerm = (key: keyof Permission) => {
    setRoleForm(prev => ({
      ...prev,
      perms: { ...prev.perms, [key]: !prev.perms[key] },
    }));
  };

  const handleSaveSettings = async (newSettings: WorkspaceSettings) => {
    await saveSettings(newSettings);
  };

  // ─── Milestone Handlers ───
  const handleOpenAddMilestone = () => {
    setEditingMilestone(null);
    setMilestoneFormOpen(true);
  };

  const handleOpenEditMilestone = (m: Milestone) => {
    setEditingMilestone(m);
    setMilestoneFormOpen(true);
  };

  const handleSaveMilestone = async (form: { title: string; description: string; dueDate?: string }) => {
    if (!selectedId) return { ok: false };
    if (editingMilestone) {
      const res = await updateMilestone(editingMilestone.id, form);
      if (res.ok) fetchMilestones(selectedId);
      return res;
    } else {
      const res = await createMilestone(selectedId, form);
      if (res.ok) {
        fetchMilestones(selectedId);
        fetchTasks();
      }
      return res;
    }
  };

  const handleDeleteMilestone = async (m: Milestone) => {
    if (!window.confirm(`Delete milestone "${m.title}"? All its submissions will be removed.`)) return;
    const res = await deleteMilestone(m.id);
    if (res.ok && selectedId) {
      fetchMilestones(selectedId);
      fetchTasks();
    }
  };

  const handleOpenSubmitWork = (m: Milestone) =>
    setSubmitWorkFor({ milestone: m, submission: null });

  const handleOpenSubmitTask = (t: Task) => setSubmitTaskFor(t);

  const handleSubmitTaskDirect = async (data: { description: string; links: string[]; attachments: any[] }) => {
    if (!submitTaskFor) return { ok: false };
    const res = await submitTask(submitTaskFor.id, data);
    if (res.ok && selectedId) {
      fetchMilestones(selectedId);
      fetchTasks();
      fetchNotifications();
    }
    return res;
  };

  const handleOpenEditSubmission = (s: Submission, m: Milestone) =>
    setSubmitWorkFor({ milestone: m, submission: s });

  const handleSubmitWork = async (data: { description: string; links: string[]; attachments: any[] }) => {
    if (!submitWorkFor) return { ok: false };
    const res = submitWorkFor.submission
      ? await editSubmission(submitWorkFor.submission.id, data)
      : await submitWork(submitWorkFor.milestone.id, data);
    if (res.ok && selectedId) fetchMilestones(selectedId);
    return res;
  };

  const handleOpenReview = (s: Submission, m: Milestone) =>
    setReviewingSubmission({ submission: s, milestone: m });

  const handleReviewSubmission = async (action: 'approve' | 'reject', comment: string, reviewAttachments: any[]) => {
    if (!reviewingSubmission) return { ok: false };
    const res = await reviewSubmission(reviewingSubmission.submission.id, action, comment, reviewAttachments);
    if (res.ok) {
      if (selectedId) fetchMilestones(selectedId);
      fetchTasks();           // task.progress / status may have auto-updated
      fetchNotifications();
      fetchPendingReviews();  // remove from pending list
    }
    return res;
  };

  // ─── Derived Data ───
  const filteredTasks = tasks.filter(t => {
    const q = searchQuery.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q) ||
      t.desc.toLowerCase().includes(q)
    );
  });

  const getBoardColumns = () => {
    const colDefs = [
      { key: 'todo', label: 'To Do', color: '#94a3b8' },
      { key: 'inprogress', label: 'In Progress', color: '#f59e0b' },
      { key: 'done', label: 'Done', color: '#10b981' },
    ];
    return colDefs.map(col => {
      const colTasks = filteredTasks.filter(t => t.status === col.key);
      return { ...col, count: colTasks.length, tasks: colTasks, empty: colTasks.length === 0 };
    });
  };

  // Stats
  const totalTickets = tasks.length;
  const todoN = tasks.filter(t => t.status === 'todo').length;
  const progN = tasks.filter(t => t.status === 'inprogress').length;
  const doneN = tasks.filter(t => t.status === 'done').length;
  const overdueN = tasks.filter(t => getDaysLeft(t.due) < 0 && t.status !== 'done').length;
  const overdueList = tasks.filter(t => getDaysLeft(t.due) < 0 && t.status !== 'done');

  const stats = [
    { label: 'Total tickets', value: totalTickets, color: '#4f46e5', sub: `${progN} in progress`, subColor: '#8a8a94' },
    { label: 'In progress', value: progN, color: '#f59e0b', sub: `across ${new Set(tasks.filter(t => t.status === 'inprogress').map(t => t.assigneeId)).size} people`, subColor: '#8a8a94' },
    { label: 'Completed', value: doneN, color: '#10b981', sub: `${totalTickets ? Math.round((doneN / totalTickets) * 100) : 0}% done`, subColor: '#059669' },
    { label: 'Overdue', value: overdueN, color: '#ef4444', sub: overdueN ? 'needs attention' : 'all on track', subColor: overdueN ? '#dc2626' : '#059669' },
  ];

  // My Tasks
  const myTasks = tasks.filter(t => t.assigneeId === user?.id);
  const myStats = [
    { label: 'To do', value: myTasks.filter(t => t.status === 'todo').length, color: '#64748b' },
    { label: 'In progress', value: myTasks.filter(t => t.status === 'inprogress').length, color: '#d97706' },
    { label: 'Completed', value: myTasks.filter(t => t.status === 'done').length, color: '#059669' },
  ];

  // Reports
  const statusDist = [
    { label: 'To Do', count: todoN, color: '#94a3b8', pct: totalTickets ? Math.round((todoN / totalTickets) * 100) : 0 },
    { label: 'In Progress', count: progN, color: '#f59e0b', pct: totalTickets ? Math.round((progN / totalTickets) * 100) : 0 },
    { label: 'Done', count: doneN, color: '#10b981', pct: totalTickets ? Math.round((doneN / totalTickets) * 100) : 0 },
  ];

  // Team Members enriched
  const teamMembers = members.map(m => {
    const mt = tasks.filter(t => t.assigneeId === m.id);
    const done = mt.filter(t => t.status === 'done').length;
    const active = mt.filter(t => t.status === 'inprogress').length;
    const pct = mt.length ? Math.round((done / mt.length) * 100) : 0;
    const r = roles.find(rl => rl.id === (m.roleId || m.role)) || { name: 'Member', color: '#64748b' };
    return {
      id: m.id, name: m.name, initials: getInitials(m.name), color: m.color,
      title: m.title, email: m.email, total: mt.length, active, done, pct,
      roleLabel: r.name, roleColor: r.color,
      roleBg: `color-mix(in srgb, ${r.color} 13%, #fff)`,
      roleId: m.roleId || m.role, isActive: m.isActive !== false,
    };
  });

  const filteredMembers = teamMembers.filter(m => {
    const q = searchQuery.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      (m.title && m.title.toLowerCase().includes(q)) ||
      (m.roleLabel && m.roleLabel.toLowerCase().includes(q))
    );
  });

  // Sidebar nav items
  const getNavItems = () => {
    const list: any[] = [];
    const perms = user?.perms || ({} as any);
    const currentView = location.pathname.substring(1) || 'dashboard';
    const mkNav = (key: string, label: string, count?: number) => ({
      key, label, count,
      showCount: count !== undefined,
      onClick: () => { setSearchQuery(''); navigate(`/${key}`); },
      bg: currentView === key ? 'var(--side-active,#eef1ff)' : 'transparent',
      fg: currentView === key ? 'var(--accent,#4f46e5)' : 'var(--side-muted,#6b6b76)',
      dot: currentView === key ? 'var(--accent,#4f46e5)' : 'transparent',
      countBg: currentView === key ? `color-mix(in srgb, ${accentColor} 18%, #fff)` : 'rgba(127,127,140,.14)',
    });
    if (perms.permAllTasks) {
      list.push(mkNav('dashboard', 'Dashboard'));
      list.push(mkNav('tasks', 'Tasks', tasks.length));
      list.push(mkNav('board', 'Task Board'));
    } else {
      const myCount = tasks.filter(t => t.assigneeId === user?.id).length;
      list.push(mkNav('mytasks', 'My Tasks', myCount));
      list.push(mkNav('board', 'My Board'));
    }
    if (perms.permTeam) list.push(mkNav('team', 'Team'));
    if (perms.permRoles) list.push(mkNav('roles', 'Roles'));
    if (perms.permReports) list.push(mkNav('reports', 'Reports'));
    if (perms.permSettings) list.push(mkNav('settings', 'Settings'));
    list.push(mkNav('profile', 'My Profile'));
    return list;
  };

  // Theme Variables
  const darkTheme = settings?.sidebarTheme === 'dark';
  const sideVars = darkTheme
    ? { '--side-bg': '#0f1117', '--side-fg': '#e8e8ee', '--side-muted': '#9aa0ac', '--side-active': 'rgba(255,255,255,0.08)', '--side-border': '#22242c' }
    : { '--side-bg': '#ffffff', '--side-fg': '#16161a', '--side-muted': '#6b6b76', '--side-active': '#eef1ff', '--side-border': '#ececf1' };

  const selectedTask = tasks.find(t => t.id === selectedId);

  // ─── Render ───
  if (authLoading && token) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f6f7f9', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ border: '4px solid #f3f3f3', borderTop: `4px solid ${accentColor}`, borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <div style={{ fontSize: '15px', color: '#6b6b76', fontWeight: 600 }}>Loading workspace...</div>
        </div>
      </div>
    );
  }

  const currentView = location.pathname.substring(1) || 'dashboard';

  return (
    <div style={{ ...(sideVars as any), '--accent': accentColor, minHeight: '100vh', background: '#f6f7f9', fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#16161a' }}>

      {/* ── LOGIN ── */}
      {!user && (
        <Routes>
          <Route path="*" element={
            <LoginPage
              email={email} password={password} loginError={loginError}
              settings={settings} tasks={tasks} members={members}
              onEmailChange={setEmail} onPasswordChange={setPassword} onSubmit={handleLogin}
            />
          } />
        </Routes>
      )}

      {/* ── APP LAYOUT ── */}
      {user && (
        <div className="app-layout-container" style={{ height: '100vh', overflow: 'hidden', display: 'flex' }}>
          {/* Mobile overlay */}
          {isSidebarOpen && (
            <div onClick={() => setIsSidebarOpen(false)} className="sidebar-overlay"
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 90 }} />
          )}

          {/* Sidebar */}
          <Sidebar
            user={user} settings={settings} view={currentView}
            isSidebarOpen={isSidebarOpen} tasks={tasks} navItems={getNavItems()}
            onClose={() => setIsSidebarOpen(false)}
            onCreateTask={() => navigate('/create')}
            onLogout={handleLogout}
          />

          {/* Main Content */}
          <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
            <Header
              user={user} settings={settings} view={currentView}
              notifications={notifications}
              showNotifications={showNotifications} showProfileMenu={showProfileMenu}
              onToggleNotifications={() => { setShowNotifications(p => !p); setShowProfileMenu(false); }}
              onToggleProfileMenu={() => { setShowProfileMenu(p => !p); setShowNotifications(false); }}
              onMarkAllRead={handleMarkNotificationsRead}
              onNotificationClick={handleNotificationClick}
              onNavigate={v => { setSearchQuery(''); navigate(`/${v}`); setShowProfileMenu(false); }}
              onCreateTask={() => navigate('/create')}
              onLogout={() => { handleLogout(); setShowProfileMenu(false); }}
              onOpenSidebar={() => setIsSidebarOpen(true)}
            />

            <div className="workspace-content-body" style={{ flex: 1, overflowY: 'auto' }}>
              <Routes>
                <Route path="/" element={<Navigate to={user.perms?.permAllTasks ? "/dashboard" : "/mytasks"} replace />} />
                <Route path="/dashboard" element={
                  user.perms?.permAllTasks ? (
                    <DashboardView tasks={tasks} filteredTasks={filteredTasks} members={teamMembers} settings={settings} stats={stats} pendingReviews={pendingReviews} onSelectTask={setSelectedId} />
                  ) : (
                    <Navigate to="/mytasks" replace />
                  )
                } />
                <Route path="/board" element={<BoardView columns={getBoardColumns()} members={members} settings={settings} dragId={dragId} onDragStart={setDragId} onDrop={status => handleMoveTask(dragId || '', status)} onSelectTask={setSelectedId} searchQuery={searchQuery} onSearchChange={setSearchQuery} />} />
                <Route path="/tasks" element={
                  user.perms?.permAllTasks ? (
                    <TasksView filteredTasks={filteredTasks} members={members} settings={settings} searchQuery={searchQuery} onSearchChange={setSearchQuery} onSelectTask={setSelectedId} onEditTask={handleOpenEditTask} onDeleteTask={handleDeleteTask} />
                  ) : (
                    <Navigate to="/mytasks" replace />
                  )
                } />
                <Route path="/mytasks" element={<MyTasksView user={user} filteredTasks={filteredTasks} settings={settings} myStats={myStats} onSelectTask={setSelectedId} />} />
                <Route path="/team" element={
                  user.perms?.permTeam ? (
                    <TeamView user={user} filteredMembers={filteredMembers} teamMembers={teamMembers} settings={settings} searchQuery={searchQuery} onSearchChange={setSearchQuery} onAddMember={() => setAddingMember(true)} onEditMember={handleOpenEditMember} onDeleteMember={handleDeleteMember} />
                  ) : (
                    <Navigate to="/mytasks" replace />
                  )
                } />
                <Route path="/roles" element={
                  user.perms?.permRoles ? (
                    <RolesView roles={roles} user={user} accent={settings.accent} onAddRole={() => setAddingRole(true)} />
                  ) : (
                    <Navigate to="/mytasks" replace />
                  )
                } />
                <Route path="/reports" element={
                  user.perms?.permReports ? (
                    <ReportsView tasks={tasks} members={teamMembers} settings={settings} statusDist={statusDist} overdueN={overdueN} overdueList={overdueList} onSelectTask={setSelectedId} />
                  ) : (
                    <Navigate to="/mytasks" replace />
                  )
                } />
                <Route path="/create" element={
                  user.perms?.permCreate ? (
                    <CreateTaskView members={members} settings={settings} taskForm={taskForm} onFormChange={setTaskForm} onFileUpload={handleFileUpload} onRemoveImage={handleRemoveFormImage} onSubmit={handleCreateTask} onCancel={() => navigate('/board')} uploading={taskFormUploading > 0} uploadingCount={taskFormUploading} />
                  ) : (
                    <Navigate to="/mytasks" replace />
                  )
                } />
                <Route path="/settings" element={
                  user.perms?.permSettings ? (
                    <SettingsView settings={settings} onSave={handleSaveSettings} />
                  ) : (
                    <Navigate to="/mytasks" replace />
                  )
                } />
                <Route path="/profile" element={<ProfileView settings={settings} profileForm={profileForm} onFormChange={setProfileForm} onSubmit={handleUpdateProfile} />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </main>
        </div>
      )}

      {/* ── MODALS ── */}
      {selectedTask && user && (
        <TaskDetailModal
          task={selectedTask}
          members={members}
          user={user}
          settings={settings}
          commentDraft={commentDraft}
          milestones={milestones}
          onClose={() => setSelectedId(null)}
          onSetProgress={handleSetProgress}
          onCommentChange={setCommentDraft}
          onPostComment={handlePostComment}
          onAddMilestone={handleOpenAddMilestone}
          onEditMilestone={handleOpenEditMilestone}
          onDeleteMilestone={handleDeleteMilestone}
          onSubmitWork={handleOpenSubmitWork}
          onEditSubmission={handleOpenEditSubmission}
          onReviewSubmission={handleOpenReview}
          onAcceptTask={handleAcceptTask}
          onSubmitTaskDirect={handleOpenSubmitTask}
        />
      )}
      {submitTaskFor && (
        <SubmitWorkModal
          milestone={{ title: `Submit task: ${submitTaskFor.title}` }}
          settings={settings}
          onClose={() => setSubmitTaskFor(null)}
          onSubmit={handleSubmitTaskDirect}
        />
      )}
      {milestoneFormOpen && (
        <MilestoneFormModal
          existing={editingMilestone}
          settings={settings}
          onClose={() => { setMilestoneFormOpen(false); setEditingMilestone(null); }}
          onSubmit={handleSaveMilestone}
        />
      )}
      {submitWorkFor && (
        <SubmitWorkModal
          milestone={submitWorkFor.milestone}
          existing={submitWorkFor.submission}
          settings={settings}
          onClose={() => setSubmitWorkFor(null)}
          onSubmit={handleSubmitWork}
        />
      )}
      {reviewingSubmission && (
        <ReviewSubmissionModal
          submission={reviewingSubmission.submission}
          milestoneTitle={reviewingSubmission.milestone.title}
          settings={settings}
          onClose={() => setReviewingSubmission(null)}
          onReview={handleReviewSubmission}
        />
      )}
      {addingMember && <AddMemberModal roles={roles} settings={settings} memberForm={memberForm} onFormChange={setMemberForm} onSubmit={handleCreateMember} onClose={() => setAddingMember(false)} />}
      {addingRole && <AddRoleModal settings={settings} roleForm={roleForm} onFormChange={setRoleForm} onTogglePerm={handleToggleRolePerm} onSubmit={handleCreateRole} onClose={() => setAddingRole(false)} />}
      {editingTask && <EditTaskModal task={editingTask} members={members} settings={settings} editTaskForm={editTaskForm} onFormChange={setEditTaskForm} onSubmit={handleUpdateTask} onClose={() => setEditingTask(null)} />}
      {editingMember && <EditMemberModal roles={roles} settings={settings} editMemberForm={editMemberForm} onFormChange={setEditMemberForm} onSubmit={handleUpdateMember} onClose={() => setEditingMember(null)} />}

      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast-card ${toast.type}`}>
            <span className="toast-icon">
              {toast.type === 'success' ? (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM8 15L3 10L4.41 8.59L8 12.17L15.59 4.58L17 6L8 15Z" fill="#10B981" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM11 15H9V13H11V15ZM11 11H9V5H11V11Z" fill="#EF4444" />
                </svg>
              )}
            </span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
