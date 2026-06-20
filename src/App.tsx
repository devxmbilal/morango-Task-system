import React, { useState, useEffect } from 'react';

// Define TS Interfaces
interface Permission {
  allTasks: boolean;
  create: boolean;
  team: boolean;
  roles: boolean;
  reports: boolean;
  settings: boolean;
}

interface Role {
  id: string;
  name: string;
  color: string;
  system: boolean;
  memberCount?: number;
  perms: Permission;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  title: string;
  color: string;
  perms?: {
    permAllTasks: boolean;
    permCreate: boolean;
    permTeam: boolean;
    permRoles: boolean;
    permReports: boolean;
    permSettings: boolean;
  };
}

interface Comment {
  id: number;
  author: string;
  text: string;
  time: string;
}

interface Task {
  id: string;
  title: string;
  desc: string;
  assigneeId: string;
  status: 'todo' | 'inprogress' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tag: string;
  created: string;
  start: string;
  due: string;
  progress: number;
  images: string[];
  comments: Comment[];
}

interface WorkspaceSettings {
  companyName: string;
  accent: string;
  sidebarTheme: 'light' | 'dark';
  smtpHost?: string;
  smtpPort?: string;
  smtpUser?: string;
  smtpPassword?: string;
  smtpFrom?: string;
  emailEnabled?: boolean;
}

interface AppNotification {
  id: number;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const API_BASE = 'http://localhost:5000/api';

export default function App() {
  // Authentication & Layout states
  const [token, setToken] = useState<string | null>(localStorage.getItem('morango_token'));
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<WorkspaceSettings>({
    companyName: 'Morango AI',
    accent: '#4f46e5',
    sidebarTheme: 'light',
    smtpHost: '',
    smtpPort: '',
    smtpUser: '',
    smtpPassword: '',
    smtpFrom: '',
    emailEnabled: false
  });

  // Navigation and views
  const [view, setView] = useState<string>(() => localStorage.getItem('morango_view') || 'dashboard');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Form inputs
  const [email, setEmail] = useState<string>('ayesha@morango.ai');
  const [password, setPassword] = useState<string>('demo1234');
  const [commentDraft, setCommentDraft] = useState<string>('');
  
  // Data lists
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  
  // Notifications states
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);
  
  // Modal toggles & form states
  const [addingMember, setAddingMember] = useState<boolean>(false);
  const [memberForm, setMemberForm] = useState({ name: '', email: '', title: '', role: 'employee', password: '' });
  
  const [addingRole, setAddingRole] = useState<boolean>(false);
  const [roleForm, setRoleForm] = useState({
    name: '',
    color: '#7c3aed',
    perms: { allTasks: false, create: false, team: false, roles: false, reports: false, settings: false }
  });

  const [taskForm, setTaskForm] = useState({
    title: '',
    desc: '',
    assigneeId: 'u2',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    tag: 'Web Portal',
    due: '2026-06-30T18:00',
    images: [] as string[]
  });

  // Editing states
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTaskForm, setEditTaskForm] = useState({
    title: '',
    desc: '',
    assigneeId: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    tag: 'Web Portal',
    due: ''
  });

  const [editingMember, setEditingMember] = useState<any | null>(null);
  const [editMemberForm, setEditMemberForm] = useState({
    name: '',
    email: '',
    title: '',
    roleId: '',
    isActive: true,
    password: ''
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [profileForm, setProfileForm] = useState({ name: '', email: '', password: '' });
  const [profileMessage, setProfileMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        password: ''
      });
      setProfileMessage(null);
    }
  }, [user]);

  // Poll notifications
  useEffect(() => {
    if (!token) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [token]);

  // 1. Initial configuration fetch
  useEffect(() => {
    fetchSettings();
  }, []);

  // 2. Fetch authenticated profile & lists when token is set
  useEffect(() => {
    if (token) {
      localStorage.setItem('morango_token', token);
      fetchProfile();
    } else {
      localStorage.removeItem('morango_token');
      localStorage.removeItem('morango_view');
      setUser(null);
      setTasks([]);
      setMembers([]);
      setRoles([]);
    }
  }, [token]);

  // Persist active view on changes
  useEffect(() => {
    if (token && view) {
      localStorage.setItem('morango_view', view);
    }
  }, [view, token]);

  // Fetch functions
  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_BASE}/settings`);
      const data = await res.json();
      if (res.ok) setSettings(data);
    } catch (e) {
      console.error('Error fetching settings:', e);
    }
  };

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        const perms = data.perms || {};
        
        // Restore active view from localStorage if valid
        const savedView = localStorage.getItem('morango_view');
        let initialView = perms.permAllTasks ? 'dashboard' : 'mytasks';
        if (savedView) {
          if (savedView === 'dashboard' && !perms.permAllTasks) {
            initialView = 'mytasks';
          } else if (savedView === 'tasks' && !perms.permAllTasks) {
            initialView = 'mytasks';
          } else if (savedView === 'team' && !perms.permTeam) {
            initialView = perms.permAllTasks ? 'dashboard' : 'mytasks';
          } else if (savedView === 'roles' && !perms.permRoles) {
            initialView = perms.permAllTasks ? 'dashboard' : 'mytasks';
          } else if (savedView === 'reports' && !perms.permReports) {
            initialView = perms.permAllTasks ? 'dashboard' : 'mytasks';
          } else if (savedView === 'settings' && !perms.permSettings) {
            initialView = perms.permAllTasks ? 'dashboard' : 'mytasks';
          } else {
            initialView = savedView;
          }
        }
        setView(initialView);

        // Fetch private tables
        fetchTasks();
        fetchMembers();
        fetchRoles();
        fetchNotifications();
      } else {
        setToken(null);
      }
    } catch (e) {
      console.error('Error fetching profile:', e);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setNotifications(data);
    } catch (e) {
      console.error('Error fetching notifications:', e);
    }
  };

  const handleMarkNotificationsRead = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/notifications/read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchNotifications();
      }
    } catch (e) {
      console.error('Error marking notifications as read:', e);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setTasks(data);
    } catch (e) {
      console.error('Error fetching tasks:', e);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await fetch(`${API_BASE}/members`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setMembers(data);
    } catch (e) {
      console.error('Error fetching members:', e);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await fetch(`${API_BASE}/roles`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setRoles(data);
    } catch (e) {
      console.error('Error fetching roles:', e);
    }
  };

  // Auth Operations
  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoginError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
      } else {
        setLoginError(data.error || 'Authentication failed');
      }
    } catch (err) {
      setLoginError('Failed to connect to the server');
    }
  };

  const handleLogout = () => {
    setToken(null);
  };

  // Task Operations
  const handleMoveTask = async (taskId: string, status: string) => {
    const originalTasks = [...tasks];
    
    // Optimistic UI Update
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const update: Partial<Task> = { status: status as any };
        if (status === 'done') update.progress = 100;
        else if (status === 'todo') update.progress = 0;
        return { ...t, ...update };
      }
      return t;
    }));

    try {
      const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (!res.ok) {
        setTasks(originalTasks);
      } else {
        fetchTasks();
      }
    } catch (e) {
      setTasks(originalTasks);
    }
  };

  const handleSetProgress = async (taskId: string, progress: number) => {
    try {
      const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ progress })
      });
      if (res.ok) {
        fetchTasks();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const res = await fetch(`${API_BASE}/upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
        const data = await res.json();
        if (res.ok) {
          setTaskForm(prev => ({
            ...prev,
            images: [...prev.images, data.fileUrl]
          }));
        }
      } catch (err) {
        console.error('File upload failed:', err);
      }
    }
  };

  const handleRemoveFormImage = (index: number) => {
    setTaskForm(prev => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== index)
    }));
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(taskForm)
      });
      if (res.ok) {
        fetchTasks();
        setView('board');
        setTaskForm({
          title: '',
          desc: '',
          assigneeId: 'u2',
          priority: 'medium',
          tag: 'Web Portal',
          due: '2026-06-30T18:00',
          images: []
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostComment = async () => {
    if (!commentDraft.trim() || !selectedId) return;

    try {
      const res = await fetch(`${API_BASE}/tasks/${selectedId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: commentDraft })
      });
      if (res.ok) {
        setCommentDraft('');
        fetchTasks();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchTasks();
        if (selectedId === taskId) setSelectedId(null);
      }
    } catch (e) {
      console.error(e);
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
      due: toLocalDatetimeString(task.due)
    });
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    try {
      const res = await fetch(`${API_BASE}/tasks/${editingTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editTaskForm)
      });
      if (res.ok) {
        setEditingTask(null);
        fetchTasks();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Team Member Operations
  const handleDeleteMember = async (memberId: string) => {
    if (!window.confirm('Are you sure you want to delete this team member? All their assigned tasks will become unassigned.')) return;
    try {
      const res = await fetch(`${API_BASE}/members/${memberId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchMembers();
        fetchTasks();
      }
    } catch (e) {
      console.error(e);
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
      password: ''
    });
  };

  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    try {
      const res = await fetch(`${API_BASE}/members/${editingMember.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editMemberForm)
      });
      if (res.ok) {
        setEditingMember(null);
        fetchMembers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage(null);
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileForm)
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        setProfileForm(prev => ({ ...prev, password: '' }));
        setProfileMessage({ text: 'Profile updated successfully!', type: 'success' });
      } else {
        setProfileMessage({ text: data.error || 'Failed to update profile', type: 'error' });
      }
    } catch (err) {
      setProfileMessage({ text: 'Failed to connect to the server', type: 'error' });
    }
  };

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberForm.name.trim() || !memberForm.email.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(memberForm)
      });
      if (res.ok) {
        fetchMembers();
        setAddingMember(false);
        setMemberForm({ name: '', email: '', title: '', role: 'employee', password: '' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Custom Roles Operations
  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleForm.name.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/roles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(roleForm)
      });
      if (res.ok) {
        fetchRoles();
        setAddingRole(false);
        setRoleForm({
          name: '',
          color: '#7c3aed',
          perms: { allTasks: false, create: false, team: false, roles: false, reports: false, settings: false }
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleRolePerm = (key: keyof Permission) => {
    setRoleForm(prev => ({
      ...prev,
      perms: {
        ...prev.perms,
        [key]: !prev.perms[key]
      }
    }));
  };

  // Settings Operations
  const handleSaveSettings = async (field: string, val: string | boolean) => {
    const updated = { ...settings, [field]: val };
    setSettings(updated);

    try {
      await fetch(`${API_BASE}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ [field]: val })
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Helper calculation functions
  const getInitials = (name: string) => {
    return (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  };

  const getUserById = (id: string) => {
    return members.find(m => m.id === id);
  };

  const formatDate = (iso: string) => {
    if (!iso) return '—';
    const hasTime = iso.includes('T');
    const d = hasTime ? new Date(iso) : new Date(iso + 'T00:00:00');
    if (isNaN(d.getTime())) return '—';
    if (hasTime) {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + 
             d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const toLocalDatetimeString = (iso: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const getDaysLeft = (iso: string) => {
    if (!iso) return 0;
    const d = new Date(iso);
    const t = new Date('2026-06-19T00:00:00'); // Consistent baseline
    return Math.round((d.getTime() - t.getTime()) / 86400000);
  };

  const getPriorityMeta = (p: string) => {
    const meta: Record<string, { label: string, color: string, bg: string }> = {
      low: { label: 'Low', color: '#64748b', bg: '#f1f5f9' },
      medium: { label: 'Medium', color: '#0891b2', bg: '#ecfeff' },
      high: { label: 'High', color: '#d97706', bg: '#fffbeb' },
      urgent: { label: 'Urgent', color: '#dc2626', bg: '#fef2f2' }
    };
    return meta[p] || { label: p, color: '#64748b', bg: '#f1f5f9' };
  };

  const getStatusMeta = (s: string) => {
    const meta: Record<string, { label: string, color: string }> = {
      todo: { label: 'To Do', color: '#94a3b8' },
      inprogress: { label: 'In Progress', color: '#f59e0b' },
      done: { label: 'Done', color: '#10b981' }
    };
    return meta[s] || { label: s, color: '#94a3b8' };
  };

  // Rendering Helpers
  const getNavItems = () => {
    const list = [];
    const perms = user?.perms || ({} as any);

    const mkNav = (key: string, label: string, count?: number) => ({
      key,
      label,
      count,
      showCount: count !== undefined,
      onClick: () => {
        setSearchQuery('');
        setView(key);
      },
      bg: view === key ? 'var(--side-active,#eef1ff)' : 'transparent',
      fg: view === key ? 'var(--accent,#4f46e5)' : 'var(--side-muted,#6b6b76)',
      dot: view === key ? 'var(--accent,#4f46e5)' : 'transparent',
      countBg: view === key ? `color-mix(in srgb, ${settings.accent} 18%, #fff)` : 'rgba(127,127,140,.14)'
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

  // Search filtering
  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Board columns data
  const getBoardColumns = () => {
    const colDefs = [
      { key: 'todo', label: 'To Do', color: '#94a3b8' },
      { key: 'inprogress', label: 'In Progress', color: '#f59e0b' },
      { key: 'done', label: 'Done', color: '#10b981' }
    ];

    return colDefs.map(col => {
      const colTasks = filteredTasks.filter(t => t.status === col.key);
      return {
        ...col,
        count: colTasks.length,
        tasks: colTasks,
        empty: colTasks.length === 0
      };
    });
  };

  // Dashboard Stats Calculations
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
    { label: 'Overdue', value: overdueN, color: '#ef4444', sub: overdueN ? 'needs attention' : 'all on track', subColor: overdueN ? '#dc2626' : '#059669' }
  ];

  // My Tasks list and stats
  const myTasks = tasks.filter(t => t.assigneeId === user?.id);
  const myDone = myTasks.filter(t => t.status === 'done').length;
  const myProg = myTasks.filter(t => t.status === 'inprogress').length;
  const myTodo = myTasks.filter(t => t.status === 'todo').length;

  const myStats = [
    { label: 'To do', value: myTodo, color: '#64748b' },
    { label: 'In progress', value: myProg, color: '#d97706' },
    { label: 'Completed', value: myDone, color: '#059669' }
  ];

  // Reports details
  const statusDist = [
    { label: 'To Do', count: todoN, color: '#94a3b8', pct: totalTickets ? Math.round((todoN / totalTickets) * 100) : 0 },
    { label: 'In Progress', count: progN, color: '#f59e0b', pct: totalTickets ? Math.round((progN / totalTickets) * 100) : 0 },
    { label: 'Done', count: doneN, color: '#10b981', pct: totalTickets ? Math.round((doneN / totalTickets) * 100) : 0 }
  ];

  // Team Workload variables
  const teamMembers = members.map(m => {
    const mt = tasks.filter(t => t.assigneeId === m.id);
    const done = mt.filter(t => t.status === 'done').length;
    const active = mt.filter(t => t.status === 'inprogress').length;
    const pct = mt.length ? Math.round((done / mt.length) * 100) : 0;
    const r = roles.find(rl => rl.id === (m.roleId || m.role)) || { name: 'Member', color: '#64748b' };
    return {
      id: m.id,
      name: m.name,
      initials: getInitials(m.name),
      color: m.color,
      title: m.title,
      email: m.email,
      total: mt.length,
      active,
      done,
      pct,
      roleLabel: r.name,
      roleColor: r.color,
      roleBg: `color-mix(in srgb, ${r.color} 13%, #fff)`,
      roleId: m.roleId || m.role,
      isActive: m.isActive !== false
    };
  });

  const filteredMembers = teamMembers.filter(m => {
    const query = searchQuery.toLowerCase();
    return m.name.toLowerCase().includes(query) ||
           m.email.toLowerCase().includes(query) ||
           (m.title && m.title.toLowerCase().includes(query)) ||
           (m.roleLabel && m.roleLabel.toLowerCase().includes(query));
  });

  // Task Details Modal variables
  const selectedTask = tasks.find(t => t.id === selectedId);
  const assigneeUser = selectedTask ? getUserById(selectedTask.assigneeId) : null;
  const taskPriorityMeta = selectedTask ? getPriorityMeta(selectedTask.priority) : null;
  const detail = selectedTask ? {
    ...selectedTask,
    statusLabel: getStatusMeta(selectedTask.status).label,
    statusColor: getStatusMeta(selectedTask.status).color
  } : null;
  
  const timelineData = selectedTask ? [
    { label: 'Created', date: formatDate(selectedTask.created), dot: '#4f46e5', ring: '#dfdcff', fg: '#16161a' },
    { label: selectedTask.start ? 'Assigned' : 'Unassigned', date: selectedTask.start ? formatDate(selectedTask.start) : 'pending', dot: selectedTask.start ? '#f59e0b' : '#d4d4dd', ring: selectedTask.start ? '#fdebc8' : '#eee', fg: selectedTask.start ? '#16161a' : '#9a9aa4' },
    { label: selectedTask.status === 'done' ? 'Completed' : 'Due', date: formatDate(selectedTask.due), dot: selectedTask.status === 'done' ? '#10b981' : '#dc2626', ring: selectedTask.status === 'done' ? '#c8f0d8' : '#fdd', fg: '#16161a' }
  ] : [];

  // Theme Variables
  const darkTheme = settings.sidebarTheme === 'dark';
  const sideVars = darkTheme
    ? { '--side-bg': '#0f1117', '--side-fg': '#e8e8ee', '--side-muted': '#9aa0ac', '--side-active': 'rgba(255,255,255,0.08)', '--side-border': '#22242c' }
    : { '--side-bg': '#ffffff', '--side-fg': '#16161a', '--side-muted': '#6b6b76', '--side-active': '#eef1ff', '--side-border': '#ececf1' };

  if (loading && token) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f6f7f9', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ border: '4px solid #f3f3f3', borderTop: `4px solid ${settings.accent}`, borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <div style={{ fontSize: '15px', color: '#6b6b76', fontWeight: 600 }}>Loading workspace...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...sideVars as any, '--accent': settings.accent, minHeight: '100vh', background: '#f6f7f9', fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#16161a' }}>
      
      {/* ============ LOGIN VIEW ============ */}
      {!user && (
        <div style={{ minHeight: '100vh', display: 'flex' }}>
          <div style={{ flex: 1.05, background: `linear-gradient(150deg, ${settings.accent}, color-mix(in srgb, ${settings.accent} 70%, #000))`, color: '#fff', padding: '56px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', width: '420px', height: '420px', borderRadius: '50%', border: '1px solid rgba(255,255,255,.16)', top: '-120px', right: '-120px' }}></div>
            <div style={{ position: 'absolute', width: '280px', height: '280px', borderRadius: '50%', border: '1px solid rgba(255,255,255,.12)', bottom: '-80px', left: '-60px' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '11px', fontWeight: 800, fontSize: '19px', position: 'relative' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '9px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: settings.accent, fontSize: '16px' }}>◆</div>
              {settings.companyName}
            </div>
            <div style={{ position: 'relative' }}>
              <div style={{ fontSize: '40px', fontWeight: 800, lineHeight: 1.08, maxWidth: '440px', letterSpacing: '-0.02em' }}>Assign work. Track tickets. Ship faster.</div>
              <div style={{ marginTop: '18px', fontSize: '15px', opacity: 0.82, maxWidth: '400px', lineHeight: 1.6 }}>Role-based ticketing for your software house — backlog to done, with deadlines, attachments and live progress.</div>
              <div style={{ marginTop: '30px', display: 'flex', gap: '26px' }}>
                <div><div style={{ fontSize: '24px', fontWeight: 800 }}>{tasks.filter(t => t.status !== 'done').length}</div><div style={{ fontSize: '12px', opacity: 0.75 }}>Active tickets</div></div>
                <div><div style={{ fontSize: '24px', fontWeight: 800 }}>{members.length}</div><div style={{ fontSize: '12px', opacity: 0.75 }}>Team members</div></div>
                <div><div style={{ fontSize: '24px', fontWeight: 800 }}>3</div><div style={{ fontSize: '12px', opacity: 0.75 }}>Projects</div></div>
              </div>
            </div>
            <div style={{ fontSize: '12px', opacity: 0.7, position: 'relative' }}>© 2026 {settings.companyName} · Internal Tools</div>
          </div>

          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f6f7f9', padding: '40px' }}>
            <div style={{ width: '100%', maxWidth: '372px' }}>
              <div style={{ fontSize: '25px', fontWeight: 800, letterSpacing: '-0.02em' }}>Sign in</div>
              <div style={{ color: '#6b6b76', fontSize: '14px', marginTop: '6px' }}>Welcome back. Continue to your workspace.</div>
              
              {loginError && (
                <div style={{ marginTop: '16px', padding: '10px 12px', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '10px', color: '#dc2626', fontSize: '13px', fontWeight: 600 }}>{loginError}</div>
              )}

              <form onSubmit={handleLogin} style={{ marginTop: '20px' }}>
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#44444e' }}>Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', marginTop: '7px', padding: '11px 13px', border: '1px solid #e1e1e8', borderRadius: '10px', fontSize: '14px', background: '#fff' }} required />
                </div>
                <div style={{ marginTop: '16px' }}>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#44444e' }}>Password</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', marginTop: '7px', padding: '11px 13px', border: '1px solid #e1e1e8', borderRadius: '10px', fontSize: '14px', background: '#fff' }} required />
                </div>
                <button type="submit" style={{ width: '100%', marginTop: '22px', padding: '12px', border: 'none', borderRadius: '10px', background: settings.accent, color: '#fff', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>Sign in</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ============ APPLICATION VIEW ============ */}
      {user && (
        <div style={{ minHeight: '100vh', display: 'flex' }}>
          
          {/* Sidebar */}
          <aside style={{ width: '250px', flex: 'none', background: 'var(--side-bg,#fff)', borderRight: '1px solid var(--side-border,#ececf1)', display: 'flex', flexDirection: 'column', padding: '20px 14px', position: 'sticky', top: 0, height: '100vh' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 800, fontSize: '17px', color: 'var(--side-fg,#16161a)', padding: '4px 8px 18px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: settings.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '14px' }}>◆</div>
              {settings.companyName}
            </div>
            
            <nav style={{ display: 'flex', flexDirection: 'column' }}>
              {getNavItems().map(nav => (
                <button key={nav.key} onClick={nav.onClick} style={{ display: 'flex', alignItems: 'center', gap: '11px', width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer', fontSize: '13.5px', fontWeight: 600, padding: '10px 12px', borderRadius: '9px', marginBottom: '2px', background: nav.bg, color: nav.fg }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '2px', background: nav.dot }}></span>
                  {nav.label}
                  {nav.showCount && (
                    <span style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: 700, background: nav.countBg, color: nav.fg, padding: '1px 7px', borderRadius: '20px' }}>{nav.count}</span>
                  )}
                </button>
              ))}
            </nav>

            {user.perms?.permCreate && (
              <button onClick={() => setView('create')} style={{ marginTop: '14px', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', gap: '7px', width: '100%', padding: '10px', border: 'none', borderRadius: '9px', background: settings.accent, color: '#fff', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>+ New Task</button>
            )}

            <div style={{ marginTop: 'auto', borderTop: '1px solid var(--side-border,#ececf1)', paddingTop: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: user.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px', flex: 'none' }}>{getInitials(user.name)}</div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--side-fg,#16161a)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
                <div style={{ fontSize: '11.5px', color: 'var(--side-muted,#8a8a94)' }}>{user.title}</div>
              </div>
              <button onClick={handleLogout} title="Log out" style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--side-muted,#8a8a94)', fontSize: '16px', padding: '4px' }}>⏻</button>
            </div>
          </aside>

          {/* Main Workspace */}
          <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <header style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 32px', borderBottom: '1px solid #ececf1', background: '#fff', position: 'sticky', top: 0, zIndex: 5 }}>
              <div>
                <div style={{ fontSize: '19px', fontWeight: 800, letterSpacing: '-0.01em' }}>{view === 'create' ? 'Create Task' : view.charAt(0).toUpperCase() + view.slice(1)}</div>
                <div style={{ fontSize: '12.5px', color: '#8a8a94' }}>Manage workspace operations and data.</div>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>

                {/* Bell Icon Notification Indicator */}
                <div style={{ position: 'relative' }}>
                  <button onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }} style={{ position: 'relative', width: '38px', height: '38px', borderRadius: '10px', border: '1px solid #eaeaef', background: '#fff', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6b6b76' }} className="btn-hover">
                    🔔
                    {notifications.filter(n => !n.read).length > 0 && (
                      <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '18px', height: '18px', borderRadius: '50%', background: '#ef4444', color: '#fff', fontSize: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {notifications.filter(n => !n.read).length}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div style={{ position: 'absolute', top: '46px', right: 0, width: '320px', background: '#fff', border: '1px solid #eaeaef', borderRadius: '14px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)', zIndex: 10, padding: '14px 16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f2f2f5', paddingBottom: '10px', marginBottom: '10px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 800 }}>Notifications</span>
                        {notifications.filter(n => !n.read).length > 0 && (
                          <button onClick={handleMarkNotificationsRead} style={{ border: 'none', background: 'transparent', color: settings.accent, fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>Mark all read</button>
                        )}
                      </div>
                      <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {notifications.length === 0 ? (
                          <div style={{ fontSize: '12px', color: '#8a8a94', textAlign: 'center', padding: '16px 0' }}>No notifications yet</div>
                        ) : (
                          notifications.map(n => (
                            <div key={n.id} style={{ padding: '8px 10px', borderRadius: '8px', background: n.read ? '#fff' : 'rgba(79, 70, 229, 0.05)', border: '1px solid #f1f1f5', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <div style={{ fontSize: '12px', fontWeight: 700, color: n.read ? '#16161a' : '#4f46e5' }}>{n.title}</div>
                              <div style={{ fontSize: '11.5px', color: '#4b5563', lineHeight: 1.3 }}>{n.message}</div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Button with Dropdown */}
                <div style={{ position: 'relative' }}>
                  <button onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }} style={{ width: '38px', height: '38px', borderRadius: '10px', border: '1px solid #eaeaef', background: user.color || '#4f46e5', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13.5px', cursor: 'pointer' }} title="My Profile" className="btn-hover">
                    {getInitials(user.name)}
                  </button>

                  {showProfileMenu && (
                    <div style={{ position: 'absolute', top: '46px', right: 0, width: '220px', background: '#fff', border: '1px solid #eaeaef', borderRadius: '14px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)', zIndex: 10, padding: '8px', animation: 'tf-pop 0.15s ease' }}>
                      <div style={{ padding: '8px 12px', borderBottom: '1px solid #f2f2f5', marginBottom: '6px' }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#16161a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
                        <div style={{ fontSize: '11px', color: '#8a8a94' }}>{user.title}</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <button onClick={() => { setSearchQuery(''); setView('profile'); setShowProfileMenu(false); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', textAlign: 'left', border: 'none', background: 'none', padding: '8px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#4b5563', cursor: 'pointer' }} className="btn-hover-item">
                          👤 My Profile
                        </button>
                        {user.perms?.permSettings && (
                          <button onClick={() => { setSearchQuery(''); setView('settings'); setShowProfileMenu(false); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', textAlign: 'left', border: 'none', background: 'none', padding: '8px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#4b5563', cursor: 'pointer' }} className="btn-hover-item">
                            ⚙️ Settings
                          </button>
                        )}
                        <hr style={{ border: 'none', borderTop: '1px solid #f2f2f5', margin: '4px 0' }} />
                        <button onClick={() => { handleLogout(); setShowProfileMenu(false); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', textAlign: 'left', border: 'none', background: 'none', padding: '8px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#ef4444', cursor: 'pointer' }} className="btn-hover-item">
                          🚪 Log Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {user.perms?.permCreate && (
                  <button onClick={() => setView('create')} style={{ padding: '9px 15px', border: 'none', borderRadius: '9px', background: settings.accent, color: '#fff', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>+ New Task</button>
                )}
              </div>
            </header>

            <div style={{ padding: '26px 32px', flex: 1 }}>

              {/* 1. DASHBOARD VIEW */}
              {view === 'dashboard' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                    {stats.map(st => (
                      <div key={st.label} style={{ background: '#fff', border: '1px solid #ececf1', borderRadius: '14px', padding: '18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ fontSize: '12.5px', color: '#8a8a94', fontWeight: 600 }}>{st.label}</div>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: st.color }}></div>
                        </div>
                        <div style={{ fontSize: '30px', fontWeight: 800, marginTop: '10px', letterSpacing: '-0.02em' }}>{st.value}</div>
                        <div style={{ fontSize: '12px', color: st.subColor, marginTop: '4px', fontWeight: 600 }}>{st.sub}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '18px', marginTop: '18px' }}>
                    <div style={{ background: '#fff', border: '1px solid #ececf1', borderRadius: '14px', padding: '20px' }}>
                      <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px' }}>Recent tickets</div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {filteredTasks.slice(0, 6).map(item => {
                          const assignee = getUserById(item.assigneeId);
                          const sm = getStatusMeta(item.status);
                          const dl = getDaysLeft(item.due);
                          return (
                            <div key={item.id} onClick={() => setSelectedId(item.id)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 8px', borderRadius: '9px', cursor: 'pointer' }} className="btn-hover">
                              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '11.5px', color: '#9a9aa4', width: '72px', flex: 'none' }}>{item.id}</span>
                              <span style={{ flex: 1, minWidth: 0, fontSize: '13.5px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</span>
                              <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: assignee?.color || '#94a3b8', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '10.5px', flex: 'none' }}>{getInitials(assignee?.name || '?')}</div>
                              <span style={{ fontSize: '11px', fontWeight: 700, color: sm.color, background: `color-mix(in srgb, ${sm.color} 12%, #fff)`, padding: '3px 9px', borderRadius: '20px', flex: 'none', width: '90px', textAlign: 'center' }}>{sm.label}</span>
                              <span style={{ fontSize: '12px', color: item.status === 'done' ? '#059669' : (dl < 0 ? '#dc2626' : '#8a8a94'), width: '74px', textAlign: 'right', flex: 'none', fontWeight: 600 }}>
                                {item.status === 'done' ? 'Done' : (dl < 0 ? `${-dl}d overdue` : (dl === 0 ? 'Due today' : `${dl}d left`))}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div style={{ background: '#fff', border: '1px solid #ececf1', borderRadius: '14px', padding: '20px' }}>
                      <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>Team workload</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {members.map(m => (
                          <div key={m.id}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '6px' }}>
                              <div style={{ width: '24px', height: '24px', borderRadius: '7px', background: m.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '10px' }}>{m.initials}</div>
                              <span style={{ fontSize: '12.5px', fontWeight: 600, flex: 1 }}>{m.name}</span>
                              <span style={{ fontSize: '11.5px', color: '#9a9aa4', fontWeight: 600 }}>{m.active} active</span>
                            </div>
                            <div style={{ height: '7px', background: '#eef0f3', borderRadius: '6px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${Math.min(100, m.active * 34)}%`, background: settings.accent, borderRadius: '6px' }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* 2. BOARD VIEW */}
              {view === 'board' && (
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  {getBoardColumns().map(col => (
                    <div key={col.key} onDragOver={e => e.preventDefault()} onDrop={() => handleMoveTask(dragId || '', col.key)} style={{ flex: 1, minWidth: 0, background: '#eef0f3', borderRadius: '14px', padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 6px 12px' }}>
                        <span style={{ width: '9px', height: '9px', borderRadius: '3px', background: col.color }}></span>
                        <span style={{ fontSize: '13.5px', fontWeight: 700 }}>{col.label}</span>
                        <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#8a8a94', background: '#fff', padding: '1px 8px', borderRadius: '20px' }}>{col.count}</span>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {col.tasks.map(item => {
                          const assignee = getUserById(item.assigneeId);
                          const pri = getPriorityMeta(item.priority);
                          const dl = getDaysLeft(item.due);
                          return (
                            <div key={item.id} draggable onDragStart={() => setDragId(item.id)} onClick={() => setSelectedId(item.id)} style={{ background: '#fff', border: '1px solid #ececf1', borderRadius: '12px', padding: '13px', marginBottom: '10px', cursor: 'pointer', boxShadow: '0 1px 2px rgba(16,16,26,.05)' }} className="card-hover">
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '9px' }}>
                                <span style={{ fontSize: '10.5px', fontWeight: 600, color: '#7a7a86', background: '#f1f1f5', padding: '2px 8px', borderRadius: '6px' }}>{item.tag}</span>
                                <span style={{ fontSize: '10.5px', fontWeight: 700, color: pri.color, background: pri.bg, padding: '2px 8px', borderRadius: '6px', marginLeft: 'auto' }}>{pri.label}</span>
                              </div>
                              <div style={{ fontSize: '13.5px', fontWeight: 600, lineHeight: 1.35, marginBottom: '11px' }}>{item.title}</div>
                              {item.images.length > 0 && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#8a8a94', marginBottom: '10px' }}>
                                  <span style={{ width: '13px', height: '13px', border: '1.4px solid #b8b8c0', borderRadius: '3px', display: 'inline-block' }}></span>
                                  {item.images.length} attachment(s)
                                </div>
                              )}
                              <div style={{ height: '6px', background: '#eef0f3', borderRadius: '6px', overflow: 'hidden', marginBottom: '11px' }}>
                                <div style={{ height: '100%', width: `${item.progress}%`, background: settings.accent, borderRadius: '6px' }}></div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '24px', height: '24px', borderRadius: '7px', background: assignee?.color || '#94a3b8', color: '#fff', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '10px' }}>{getInitials(assignee?.name || '?')}</div>
                                <span style={{ fontSize: '11.5px', color: '#8a8a94', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{assignee?.name || 'Unassigned'}</span>
                                <span style={{ fontSize: '11px', fontWeight: 700, color: item.status === 'done' ? '#059669' : (dl < 0 ? '#dc2626' : '#8a8a94') }}>
                                  {item.status === 'done' ? 'Done' : (dl < 0 ? `${-dl}d overdue` : (dl === 0 ? 'Today' : `${dl}d left`))}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                        {col.empty && (
                          <div style={{ textAlign: 'center', padding: '18px 8px', color: '#a8a8b0', fontSize: '12px', border: '1.5px dashed #d8d8e0', borderRadius: '11px' }}>Drop tickets here</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 2.5 TASKS LIST VIEW */}
              {view === 'tasks' && (
                <div style={{ background: '#fff', border: '1px solid #ececf1', borderRadius: '14px', padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', gap: '16px' }}>
                    <div style={{ fontSize: '15px', fontWeight: 700 }}>All Workspace Tasks ({filteredTasks.length})</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f3f3f6', border: '1px solid #eaeaef', borderRadius: '10px', padding: '8px 12px', width: '260px', color: '#9a9aa4', fontSize: '13px' }}>
                      <span style={{ fontSize: '13px' }}>⌕</span>
                      <input type="text" placeholder="Search tasks..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ border: 'none', background: 'transparent', width: '100%', fontSize: '13px', outline: 'none', color: '#16161a' }} />
                    </div>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #eef0f3', color: '#8a8a94', fontWeight: 700 }}>
                          <th style={{ padding: '12px 8px' }}>ID</th>
                          <th style={{ padding: '12px 8px' }}>Title</th>
                          <th style={{ padding: '12px 8px' }}>Project</th>
                          <th style={{ padding: '12px 8px' }}>Priority</th>
                          <th style={{ padding: '12px 8px' }}>Status</th>
                          <th style={{ padding: '12px 8px' }}>Progress</th>
                          <th style={{ padding: '12px 8px' }}>Assignee</th>
                          <th style={{ padding: '12px 8px' }}>Due Date</th>
                          <th style={{ padding: '12px 8px', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTasks.length === 0 ? (
                          <tr>
                            <td colSpan={9} style={{ padding: '24px', textAlign: 'center', color: '#8a8a94' }}>No tasks found matching your search.</td>
                          </tr>
                        ) : (
                          filteredTasks.map(item => {
                            const assignee = getUserById(item.assigneeId);
                            const sm = getStatusMeta(item.status);
                            const pri = getPriorityMeta(item.priority);
                            const dl = getDaysLeft(item.due);
                            return (
                              <tr key={item.id} style={{ borderBottom: '1px solid #eef0f3' }}>
                                <td style={{ padding: '14px 8px', fontFamily: "'IBM Plex Mono', monospace", fontSize: '12px', color: '#9a9aa4' }}>{item.id}</td>
                                <td onClick={() => setSelectedId(item.id)} style={{ padding: '14px 8px', fontWeight: 600, cursor: 'pointer', color: settings.accent }}>
                                  <span style={{ textDecoration: 'underline' }}>{item.title}</span>
                                </td>
                                <td style={{ padding: '14px 8px' }}><span style={{ fontSize: '11px', fontWeight: 600, color: '#7a7a86', background: '#f1f1f5', padding: '2px 8px', borderRadius: '6px' }}>{item.tag}</span></td>
                                <td style={{ padding: '14px 8px' }}><span style={{ fontSize: '11px', fontWeight: 700, color: pri.color, background: pri.bg, padding: '2px 8px', borderRadius: '6px' }}>{pri.label}</span></td>
                                <td style={{ padding: '14px 8px' }}><span style={{ fontSize: '11px', fontWeight: 700, color: sm.color, background: `color-mix(in srgb, ${sm.color} 12%, #fff)`, padding: '3px 9px', borderRadius: '20px' }}>{sm.label}</span></td>
                                <td style={{ padding: '14px 8px', width: '120px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ flex: 1, height: '6px', background: '#eef0f3', borderRadius: '6px', overflow: 'hidden' }}>
                                      <div style={{ height: '100%', width: `${item.progress}%`, background: settings.accent, borderRadius: '6px' }}></div>
                                    </div>
                                    <span style={{ fontSize: '11.5px', color: '#8a8a94', fontWeight: 600 }}>{item.progress}%</span>
                                  </div>
                                </td>
                                <td style={{ padding: '14px 8px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '24px', height: '24px', borderRadius: '7px', background: assignee?.color || '#94a3b8', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '10px' }}>{getInitials(assignee?.name || '?')}</div>
                                    <span>{assignee?.name || 'Unassigned'}</span>
                                  </div>
                                </td>
                                <td style={{ padding: '14px 8px', fontWeight: 600, color: item.status === 'done' ? '#059669' : (dl < 0 ? '#dc2626' : '#8a8a94') }}>
                                  {formatDate(item.due)}
                                </td>
                                <td style={{ padding: '14px 8px', textAlign: 'right' }}>
                                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                    <button onClick={() => handleOpenEditTask(item)} style={{ padding: '4px 8px', border: '1px solid #e1e1e8', borderRadius: '6px', background: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer', color: '#44444e' }}>Edit</button>
                                    <button onClick={() => handleDeleteTask(item.id)} style={{ padding: '4px 8px', border: '1px solid #fee2e2', borderRadius: '6px', background: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer', color: '#dc2626' }}>Delete</button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 3. MY TASKS VIEW */}
              {view === 'mytasks' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
                    {myStats.map(st => (
                      <div key={st.label} style={{ background: '#fff', border: '1px solid #ececf1', borderRadius: '14px', padding: '18px' }}>
                        <div style={{ fontSize: '12.5px', color: '#8a8a94', fontWeight: 600 }}>{st.label}</div>
                        <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '8px', color: st.color }}>{st.value}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ background: '#fff', border: '1px solid #ececf1', borderRadius: '14px', padding: '8px' }}>
                    {filteredTasks.filter(t => t.assigneeId === user?.id).map(item => {
                      const sm = getStatusMeta(item.status);
                      const pri = getPriorityMeta(item.priority);
                      const dl = getDaysLeft(item.due);
                      return (
                        <div key={item.id} onClick={() => setSelectedId(item.id)} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', borderBottom: '1px solid #f2f2f5', cursor: 'pointer' }} className="btn-hover">
                          <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: sm.color, flex: 'none' }}></span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px', color: '#a0a0aa' }}>{item.id}</span>
                              <span style={{ fontSize: '10px', fontWeight: 600, color: '#7a7a86', background: '#f1f1f5', padding: '1px 7px', borderRadius: '5px' }}>{item.tag}</span>
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: 600, marginTop: '3px' }}>{item.title}</div>
                          </div>
                          <span style={{ fontSize: '10.5px', fontWeight: 700, color: pri.color, background: pri.bg, padding: '3px 9px', borderRadius: '6px' }}>{pri.label}</span>
                          <div style={{ width: '130px' }}>
                            <div style={{ height: '6px', background: '#eef0f3', borderRadius: '6px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${item.progress}%`, background: settings.accent }}></div>
                            </div>
                          </div>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: item.status === 'done' ? '#059669' : (dl < 0 ? '#dc2626' : '#8a8a94'), width: '84px', textAlign: 'right' }}>
                            {item.status === 'done' ? 'Done' : (dl < 0 ? `${-dl}d overdue` : (dl === 0 ? 'Today' : `${dl}d left`))}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* 4. TEAM WORKLOAD VIEW */}
              {view === 'team' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid #eaeaef', borderRadius: '10px', padding: '8px 12px', width: '260px', color: '#9a9aa4', fontSize: '13px' }}>
                        <span style={{ fontSize: '13px' }}>⌕</span>
                        <input type="text" placeholder="Search members..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ border: 'none', background: 'transparent', width: '100%', fontSize: '13px', outline: 'none', color: '#16161a' }} />
                      </div>
                      <span style={{ fontSize: '13.5px', color: '#8a8a94', fontWeight: 600 }}>
                        {searchQuery ? `${filteredMembers.length} of ${teamMembers.length} members` : `${teamMembers.length} members`}
                      </span>
                    </div>
                    {user.perms?.permTeam && (
                      <button onClick={() => setAddingMember(true)} style={{ padding: '9px 16px', border: 'none', borderRadius: '9px', background: settings.accent, color: '#fff', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>+ Add member</button>
                    )}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    {filteredMembers.length === 0 ? (
                      <div style={{ gridColumn: 'span 3', background: '#fff', border: '1px solid #ececf1', borderRadius: '14px', padding: '48px', textAlign: 'center', color: '#8a8a94', fontWeight: 600 }}>
                        No members found matching your search.
                      </div>
                    ) : (
                      filteredMembers.map(m => (
                        <div key={m.id} style={{ background: '#fff', border: '1px solid #ececf1', borderRadius: '14px', padding: '20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '46px', height: '46px', borderRadius: '13px', background: m.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '16px', flex: 'none' }}>{m.initials}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '15px', fontWeight: 700 }}>{m.name}</span>
                                <span style={{ fontSize: '10px', fontWeight: 700, color: m.roleColor, background: m.roleBg, padding: '2px 7px', borderRadius: '5px' }}>{m.roleLabel}</span>
                                <span style={{ fontSize: '10px', fontWeight: 700, color: m.isActive ? '#059669' : '#dc2626', background: m.isActive ? '#e6f4ea' : '#fce8e6', padding: '2px 7px', borderRadius: '5px' }}>{m.isActive ? 'Active' : 'Inactive'}</span>
                              </div>
                              <div style={{ fontSize: '12px', color: '#8a8a94' }}>{m.title}</div>
                            </div>
                          </div>
                          <div style={{ fontSize: '12px', color: '#9a9aa4', marginTop: '12px' }}>{m.email}</div>
                          <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                            <div style={{ flex: 1, background: '#f7f7fa', borderRadius: '9px', padding: '10px', textAlign: 'center' }}><div style={{ fontSize: '18px', fontWeight: 800 }}>{m.total}</div><div style={{ fontSize: '10.5px', color: '#8a8a94', fontWeight: 600 }}>Total</div></div>
                            <div style={{ flex: 1, background: '#f7f7fa', borderRadius: '9px', padding: '10px', textAlign: 'center' }}><div style={{ fontSize: '18px', fontWeight: 800, color: '#d97706' }}>{m.active}</div><div style={{ fontSize: '10.5px', color: '#8a8a94', fontWeight: 600 }}>Active</div></div>
                            <div style={{ flex: 1, background: '#f7f7fa', borderRadius: '9px', padding: '10px', textAlign: 'center' }}><div style={{ fontSize: '18px', fontWeight: 800, color: '#059669' }}>{m.done}</div><div style={{ fontSize: '10.5px', color: '#8a8a94', fontWeight: 600 }}>Done</div></div>
                          </div>
                          <div style={{ marginTop: '14px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#8a8a94', marginBottom: '5px' }}><span>Completion</span><span style={{ fontWeight: 700, color: '#16161a' }}>{m.pct}%</span></div>
                            <div style={{ height: '7px', background: '#eef0f3', borderRadius: '6px', overflow: 'hidden' }}><div style={{ height: '100%', width: `${m.pct}%`, background: settings.accent }}></div></div>
                          </div>
                          {user.perms?.permTeam && (
                            <div style={{ display: 'flex', gap: '8px', marginTop: '16px', borderTop: '1px solid #ececf1', paddingTop: '14px', justifyContent: 'flex-end' }}>
                              <button onClick={() => handleOpenEditMember(m)} style={{ padding: '6px 12px', border: '1px solid #e1e1e8', borderRadius: '6px', background: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer', color: '#44444e' }}>Edit</button>
                              <button onClick={() => handleDeleteMember(m.id)} style={{ padding: '6px 12px', border: '1px solid #fee2e2', borderRadius: '6px', background: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer', color: '#dc2626' }}>Delete</button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}

              {/* 5. ROLES VIEW */}
              {view === 'roles' && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '18px' }}>
                    <div style={{ fontSize: '13.5px', color: '#8a8a94', fontWeight: 600 }}>{roles.length} Roles available</div>
                    {user.perms?.permRoles && (
                      <button onClick={() => setAddingRole(true)} style={{ marginLeft: 'auto', padding: '9px 16px', border: 'none', borderRadius: '9px', background: settings.accent, color: '#fff', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>+ Add role</button>
                    )}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    {roles.map(r => (
                      <div key={r.id} style={{ background: '#fff', border: '1px solid #ececf1', borderRadius: '14px', padding: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                          <span style={{ width: '12px', height: '12px', borderRadius: '4px', background: r.color }}></span>
                          <span style={{ fontSize: '16px', fontWeight: 700 }}>{r.name}</span>
                          {r.system && (
                            <span style={{ fontSize: '10px', color: '#8a8a94', background: '#f1f1f5', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>SYSTEM</span>
                          )}
                          <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#8a8a94' }}>{r.memberCount} user(s)</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid #ececf1', paddingTop: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}><span>View all tasks</span><span style={{ color: r.perms.allTasks ? r.color : '#cbd5e1', fontWeight: 'bold' }}>{r.perms.allTasks ? 'Yes' : 'No'}</span></div>
                          <div style={{ display: 'flex', justifySelf: 'space-between', justifyContent: 'space-between', fontSize: '13px' }}><span>Create tasks</span><span style={{ color: r.perms.create ? r.color : '#cbd5e1', fontWeight: 'bold' }}>{r.perms.create ? 'Yes' : 'No'}</span></div>
                          <div style={{ display: 'flex', justifySelf: 'space-between', justifyContent: 'space-between', fontSize: '13px' }}><span>Manage team</span><span style={{ color: r.perms.team ? r.color : '#cbd5e1', fontWeight: 'bold' }}>{r.perms.team ? 'Yes' : 'No'}</span></div>
                          <div style={{ display: 'flex', justifySelf: 'space-between', justifyContent: 'space-between', fontSize: '13px' }}><span>Manage roles</span><span style={{ color: r.perms.roles ? r.color : '#cbd5e1', fontWeight: 'bold' }}>{r.perms.roles ? 'Yes' : 'No'}</span></div>
                          <div style={{ display: 'flex', justifySelf: 'space-between', justifyContent: 'space-between', fontSize: '13px' }}><span>View reports</span><span style={{ color: r.perms.reports ? r.color : '#cbd5e1', fontWeight: 'bold' }}>{r.perms.reports ? 'Yes' : 'No'}</span></div>
                          <div style={{ display: 'flex', justifySelf: 'space-between', justifyContent: 'space-between', fontSize: '13px' }}><span>Manage settings</span><span style={{ color: r.perms.settings ? r.color : '#cbd5e1', fontWeight: 'bold' }}>{r.perms.settings ? 'Yes' : 'No'}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* 6. REPORTS VIEW */}
              {view === 'reports' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
                    <div style={{ background: '#fff', border: '1px solid #ececf1', borderRadius: '14px', padding: '22px' }}>
                      <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '18px' }}>Status distribution</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                        {statusDist.map(d => (
                          <div key={d.label}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '7px' }}><span style={{ fontWeight: 600 }}>{d.label}</span><span style={{ fontWeight: 700, color: '#8a8a94' }}>{d.count} · {d.pct}%</span></div>
                            <div style={{ height: '11px', background: '#eef0f3', borderRadius: '7px', overflow: 'hidden' }}><div style={{ height: '100%', width: `${d.pct}%`, background: d.color, borderRadius: '7px' }}></div></div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ background: '#fff', border: '1px solid #ececf1', borderRadius: '14px', padding: '22px' }}>
                      <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '18px' }}>Completion by member</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {members.map(m => (
                          <div key={m.id}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '6px' }}>
                              <div style={{ width: '22px', height: '22px', borderRadius: '7px', background: m.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '9.5px' }}>{m.initials}</div>
                              <span style={{ fontSize: '12.5px', fontWeight: 600, flex: 1 }}>{m.name}</span>
                              <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#16161a' }}>{m.pct}%</span>
                            </div>
                            <div style={{ height: '7px', background: '#eef0f3', borderRadius: '6px', overflow: 'hidden' }}><div style={{ height: '100%', width: `${m.pct}%`, background: settings.accent }}></div></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={{ background: '#fff', border: '1px solid #ececf1', borderRadius: '14px', padding: '22px', marginTop: '18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}><div style={{ fontSize: '15px', fontWeight: 700 }}>Overdue &amp; at-risk</div><span style={{ fontSize: '11px', fontWeight: 700, color: '#dc2626', background: '#fef2f2', padding: '2px 9px', borderRadius: '20px' }}>{overdueN}</span></div>
                    {overdueN > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {overdueList.map(item => {
                          const assignee = getUserById(item.assigneeId);
                          const dl = getDaysLeft(item.due);
                          return (
                            <div key={item.id} onClick={() => setSelectedId(item.id)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 8px', borderRadius: '9px', cursor: 'pointer' }} className="btn-hover">
                              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px', color: '#a0a0aa', width: '72px' }}>{item.id}</span>
                              <span style={{ flex: 1, fontSize: '13.5px', fontWeight: 600 }}>{item.title}</span>
                              <div style={{ width: '24px', height: '24px', borderRadius: '7px', background: assignee?.color || '#94a3b8', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '10px' }}>{getInitials(assignee?.name || '?')}</div>
                              <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#dc2626', width: '90px', textAlign: 'right' }}>{-dl}d overdue</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div style={{ color: '#8a8a94', fontSize: '13px', padding: '6px' }}>Nothing overdue. Great work 🎉</div>
                    )}
                  </div>
                </>
              )}

              {/* 7. CREATE TASK VIEW */}
              {view === 'create' && (
                <div style={{ maxWidth: '780px' }}>
                  <form onSubmit={handleCreateTask} style={{ background: '#fff', border: '1px solid #ececf1', borderRadius: '16px', padding: '28px' }}>
                    <div style={{ fontSize: '17px', fontWeight: 800, marginBottom: '4px' }}>Create a new ticket</div>
                    <div style={{ fontSize: '13px', color: '#8a8a94', marginBottom: '22px' }}>Assign it to a team member with a deadline and attachments.</div>
                    
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e' }}>Title</label>
                      <input value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} placeholder="e.g. Build responsive navbar" style={{ width: '100%', marginTop: '7px', padding: '11px 13px', border: '1px solid #e1e1e8', borderRadius: '10px', fontSize: '14px' }} required />
                    </div>
                    
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e' }}>Description</label>
                      <textarea value={taskForm.desc} onChange={e => setTaskForm({ ...taskForm, desc: e.target.value })} placeholder="Describe the task, acceptance criteria..." style={{ width: '100%', marginTop: '7px', padding: '11px 13px', border: '1px solid #e1e1e8', borderRadius: '10px', fontSize: '14px', minHeight: '96px', resize: 'vertical' }}></textarea>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                      <div>
                        <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e' }}>Assign to</label>
                        <select value={taskForm.assigneeId} onChange={e => setTaskForm({ ...taskForm, assigneeId: e.target.value })} style={{ width: '100%', marginTop: '7px', padding: '11px 13px', border: '1px solid #e1e1e8', borderRadius: '10px', fontSize: '14px', background: '#fff' }}>
                          {members.map(o => (
                            <option key={o.id} value={o.id}>{o.name} · {o.title}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e' }}>Priority</label>
                        <select value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value as any })} style={{ width: '100%', marginTop: '7px', padding: '11px 13px', border: '1px solid #e1e1e8', borderRadius: '10px', fontSize: '14px', background: '#fff' }}>
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' }}>
                      <div>
                        <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e' }}>Project</label>
                        <select value={taskForm.tag} onChange={e => setTaskForm({ ...taskForm, tag: e.target.value })} style={{ width: '100%', marginTop: '7px', padding: '11px 13px', border: '1px solid #e1e1e8', borderRadius: '10px', fontSize: '14px', background: '#fff' }}>
                          <option value="Web Portal">Web Portal</option>
                          <option value="Mobile App">Mobile App</option>
                          <option value="Backend API">Backend API</option>
                          <option value="DevOps">DevOps</option>
                          <option value="QA">QA</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e' }}>Deadline</label>
                        <input type="datetime-local" value={taskForm.due} onChange={e => setTaskForm({ ...taskForm, due: e.target.value })} style={{ width: '100%', marginTop: '7px', padding: '10px 13px', border: '1px solid #e1e1e8', borderRadius: '10px', fontSize: '14px', background: '#fff' }} required />
                      </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e' }}>Attachments</label>
                      <label style={{ marginTop: '7px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', border: '1.5px dashed #d4d4dd', borderRadius: '12px', padding: '24px', cursor: 'pointer', background: '#fafafc' }} className="btn-hover">
                        <span style={{ fontSize: '20px', color: '#8a8a94' }}>☁</span>
                        <span style={{ fontSize: '13px', fontWeight: 700 }}>Click to upload file</span>
                        <span style={{ fontSize: '11.5px', color: '#a0a0aa' }}>Images, documents up to 10MB</span>
                        <input type="file" multiple onChange={handleFileUpload} style={{ display: 'none' }} />
                      </label>
                      
                      {taskForm.images.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '12px' }}>
                          {taskForm.images.map((src, i) => (
                            <div key={i} style={{ position: 'relative', width: '84px', height: '84px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e6e6ec' }}>
                              <img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                              <button type="button" onClick={() => handleRemoveFormImage(i)} style={{ position: 'absolute', top: '4px', right: '4px', width: '20px', height: '20px', borderRadius: '6px', border: 'none', background: 'rgba(0,0,0,.6)', color: '#fff', cursor: 'pointer', fontSize: '12px' }}>×</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid #f2f2f5', paddingTop: '20px' }}>
                      <button type="button" onClick={() => setView('board')} style={{ padding: '11px 20px', border: '1px solid #e1e1e8', borderRadius: '10px', background: '#fff', fontWeight: 700, fontSize: '13.5px', cursor: 'pointer' }}>Cancel</button>
                      <button type="submit" style={{ padding: '11px 24px', border: 'none', borderRadius: '10px', background: settings.accent, color: '#fff', fontWeight: 700, fontSize: '13.5px', cursor: 'pointer' }}>Create ticket</button>
                    </div>
                  </form>
                </div>
              )}

              {/* 8. SETTINGS VIEW */}
              {view === 'settings' && (
                <div style={{ maxWidth: '640px' }}>
                  <div style={{ background: '#fff', border: '1px solid #ececf1', borderRadius: '16px', padding: '28px' }}>
                    <div style={{ fontSize: '16px', fontWeight: 800, marginBottom: '22px' }}>Workspace customization</div>
                    
                    <div style={{ marginBottom: '22px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 700, color: '#44444e' }}>Company name</label>
                      <input value={settings.companyName} onChange={e => handleSaveSettings('companyName', e.target.value)} style={{ width: '100%', marginTop: '7px', padding: '11px 13px', border: '1px solid #e1e1e8', borderRadius: '10px', fontSize: '14px' }} />
                    </div>

                    <div style={{ marginBottom: '22px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 700, color: '#44444e' }}>Accent color</label>
                      <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                        {['#4f46e5', '#2563eb', '#0d9488', '#7c3aed', '#db2777'].map(c => (
                          <button key={c} onClick={() => handleSaveSettings('accent', c)} style={{ width: '32px', height: '32px', borderRadius: '8px', background: c, cursor: 'pointer', border: `3px solid ${settings.accent === c ? '#16161a' : 'transparent'}` }}></button>
                        ))}
                      </div>
                       <div style={{ marginBottom: '22px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 700, color: '#44444e' }}>Sidebar theme</label>
                      <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                        <button onClick={() => handleSaveSettings('sidebarTheme', 'light')} style={{ padding: '11px 22px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', border: `1px solid ${settings.sidebarTheme === 'light' ? settings.accent : '#e1e1e8'}`, background: settings.sidebarTheme === 'light' ? `color-mix(in srgb, ${settings.accent} 8%, #fff)` : '#fff', color: settings.sidebarTheme === 'light' ? settings.accent : '#6b6b76' }}>Light</button>
                        <button onClick={() => handleSaveSettings('sidebarTheme', 'dark')} style={{ padding: '11px 22px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', border: `1px solid ${settings.sidebarTheme === 'dark' ? settings.accent : '#e1e1e8'}`, background: settings.sidebarTheme === 'dark' ? `color-mix(in srgb, ${settings.accent} 8%, #fff)` : '#fff', color: settings.sidebarTheme === 'dark' ? settings.accent : '#6b6b76' }}>Dark</button>
                      </div>
                    </div>

                    <div style={{ marginTop: '28px', borderTop: '1px solid #ececf1', paddingTop: '22px' }}>
                      <div style={{ fontSize: '15px', fontWeight: 800, marginBottom: '18px' }}>Email Setup (SMTP)</div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        <input type="checkbox" id="emailEnabled" checked={!!settings.emailEnabled} onChange={e => handleSaveSettings('emailEnabled', e.target.checked)} style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: settings.accent }} />
                        <label htmlFor="emailEnabled" style={{ fontSize: '13px', fontWeight: 700, color: '#44444e', cursor: 'pointer' }}>Enable Email Notifications</label>
                      </div>

                      {settings.emailEnabled && (
                        <>
                          <div style={{ marginBottom: '18px' }}>
                            <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#6b6b76' }}>SMTP Host</label>
                            <input value={settings.smtpHost || ''} onChange={e => handleSaveSettings('smtpHost', e.target.value)} placeholder="e.g. smtp.gmail.com" style={{ width: '100%', marginTop: '6px', padding: '10px 12px', border: '1px solid #e1e1e8', borderRadius: '10px', fontSize: '13.5px' }} />
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
                            <div>
                              <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#6b6b76' }}>SMTP Port</label>
                              <input value={settings.smtpPort || ''} onChange={e => handleSaveSettings('smtpPort', e.target.value)} placeholder="e.g. 587" style={{ width: '100%', marginTop: '6px', padding: '10px 12px', border: '1px solid #e1e1e8', borderRadius: '10px', fontSize: '13.5px' }} />
                            </div>
                            <div>
                              <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#6b6b76' }}>Sender Email (From)</label>
                              <input value={settings.smtpFrom || ''} onChange={e => handleSaveSettings('smtpFrom', e.target.value)} placeholder="e.g. noreply@morango.ai" style={{ width: '100%', marginTop: '6px', padding: '10px 12px', border: '1px solid #e1e1e8', borderRadius: '10px', fontSize: '13.5px' }} />
                            </div>
                          </div>

                          <div style={{ marginBottom: '18px' }}>
                            <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#6b6b76' }}>SMTP User (Username)</label>
                            <input value={settings.smtpUser || ''} onChange={e => handleSaveSettings('smtpUser', e.target.value)} placeholder="e.g. user@gmail.com" style={{ width: '100%', marginTop: '6px', padding: '10px 12px', border: '1px solid #e1e1e8', borderRadius: '10px', fontSize: '13.5px' }} />
                          </div>

                          <div style={{ marginBottom: '8px' }}>
                            <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#6b6b76' }}>SMTP Password</label>
                            <input type="password" value={settings.smtpPassword || ''} onChange={e => handleSaveSettings('smtpPassword', e.target.value)} placeholder="••••••••" style={{ width: '100%', marginTop: '6px', padding: '10px 12px', border: '1px solid #e1e1e8', borderRadius: '10px', fontSize: '13.5px' }} />
                          </div>
                        </>
                      )}
                    </div>                   </div>
                  </div>
                </div>
              )}

              {/* PROFILE VIEW */}
              {view === 'profile' && (
                <div style={{ maxWidth: '640px' }}>
                  <form onSubmit={handleUpdateProfile} style={{ background: '#fff', border: '1px solid #ececf1', borderRadius: '16px', padding: '28px' }}>
                    <div style={{ fontSize: '17px', fontWeight: 800, marginBottom: '4px' }}>My Profile Settings</div>
                    <div style={{ fontSize: '13px', color: '#8a8a94', marginBottom: '22px' }}>Update your personal workspace settings and credentials.</div>

                    {profileMessage && (
                      <div style={{ marginBottom: '16px', padding: '10px 12px', background: profileMessage.type === 'success' ? '#e6f4ea' : '#fef2f2', border: `1px solid ${profileMessage.type === 'success' ? '#34a853' : '#fee2e2'}`, borderRadius: '10px', color: profileMessage.type === 'success' ? '#137333' : '#dc2626', fontSize: '13.5px', fontWeight: 600 }}>
                        {profileMessage.text}
                      </div>
                    )}

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e' }}>Full Name</label>
                      <input value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} style={{ width: '100%', marginTop: '7px', padding: '11px 13px', border: '1px solid #e1e1e8', borderRadius: '10px', fontSize: '14px' }} required />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e' }}>Email Address</label>
                      <input type="email" value={profileForm.email} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} style={{ width: '100%', marginTop: '7px', padding: '11px 13px', border: '1px solid #e1e1e8', borderRadius: '10px', fontSize: '14px' }} required />
                    </div>

                    <div style={{ marginBottom: '22px' }}>
                      <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e' }}>New Password (leave empty to keep current)</label>
                      <input type="password" value={profileForm.password} onChange={e => setProfileForm({ ...profileForm, password: e.target.value })} placeholder="••••••••" style={{ width: '100%', marginTop: '7px', padding: '11px 13px', border: '1px solid #e1e1e8', borderRadius: '10px', fontSize: '14px' }} />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid #f2f2f5', paddingTop: '20px' }}>
                      <button type="submit" style={{ padding: '11px 24px', border: 'none', borderRadius: '10px', background: settings.accent, color: '#fff', fontWeight: 700, fontSize: '13.5px', cursor: 'pointer' }}>Save Profile</button>
                    </div>
                  </form>
                </div>
              )}

            </div>
          </main>
        </div>
      )}

      {/* ============ TICKET DETAIL MODAL ============ */}
      {selectedTask && detail && (
        <div onClick={() => setSelectedId(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(16,16,26,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px', zIndex: 50, animation: 'tf-overlay .15s ease' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '820px', maxHeight: '88vh', overflowY: 'auto', background: '#fff', borderRadius: '18px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', animation: 'tf-pop .2s ease' }}>
            <header style={{ padding: '22px 26px', borderBottom: '1px solid #f0f0f3', display: 'flex', alignItems: 'center', gap: '12px', position: 'sticky', top: 0, background: '#fff', zIndex: 10, borderRadius: '18px 18px 0 0' }}>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '12px', color: '#9a9aa4', fontWeight: 600 }}>{detail.id}</span>
              <span style={{ fontSize: '10.5px', fontWeight: 600, color: '#7a7a86', background: '#f1f1f5', padding: '3px 9px', borderRadius: '6px' }}>{detail.tag}</span>
              <span style={{ fontSize: '10.5px', fontWeight: 700, color: taskPriorityMeta?.color, background: taskPriorityMeta?.bg, padding: '3px 9px', borderRadius: '6px' }}>{taskPriorityMeta?.label}</span>
              <button onClick={() => setSelectedId(null)} style={{ marginLeft: 'auto', width: '30px', height: '30px', borderRadius: '8px', border: 'none', background: '#f3f3f6', cursor: 'pointer', fontSize: '16px', color: '#6b6b76', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 0 }}>
              <div style={{ padding: '24px 26px', borderRight: '1px solid #f0f0f3' }}>
                <div style={{ fontSize: '20px', fontWeight: 800, lineHeight: 1.25, letterSpacing: '-0.01em', marginBottom: '18px' }}>{detail.title}</div>
                
                <div style={{ display: 'flex', gap: '8px', marginBottom: '22px' }}>
                  <button onClick={() => handleMoveTask(selectedTask.id, 'todo')} style={{ flex: 1, padding: '9px', borderRadius: '9px', cursor: 'pointer', fontWeight: 700, fontSize: '12px', border: `1px solid ${selectedTask.status === 'todo' ? '#64748b' : '#e1e1e8'}`, background: selectedTask.status === 'todo' ? '#64748b' : '#fff', color: selectedTask.status === 'todo' ? '#fff' : '#6b6b76' }}>To Do</button>
                  <button onClick={() => handleMoveTask(selectedTask.id, 'inprogress')} style={{ flex: 1, padding: '9px', borderRadius: '9px', cursor: 'pointer', fontWeight: 700, fontSize: '12px', border: `1px solid ${selectedTask.status === 'inprogress' ? '#f59e0b' : '#e1e1e8'}`, background: selectedTask.status === 'inprogress' ? '#f59e0b' : '#fff', color: selectedTask.status === 'inprogress' ? '#fff' : '#6b6b76' }}>In Progress</button>
                  <button onClick={() => handleMoveTask(selectedTask.id, 'done')} style={{ flex: 1, padding: '9px', borderRadius: '9px', cursor: 'pointer', fontWeight: 700, fontSize: '12px', border: `1px solid ${selectedTask.status === 'done' ? '#10b981' : '#e1e1e8'}`, background: selectedTask.status === 'done' ? '#10b981' : '#fff', color: selectedTask.status === 'done' ? '#fff' : '#6b6b76' }}>Done</button>
                </div>

                <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e', marginBottom: '7px' }}>Description</div>
                <div style={{ fontSize: '13.5px', color: '#55555e', lineHeight: 1.65, marginBottom: '22px', whiteSpace: 'pre-wrap' }}>{detail.desc}</div>

                <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e', marginBottom: '10px' }}>Progress — {selectedTask.progress}%</div>
                <input type="range" min="0" max="100" step="5" value={selectedTask.progress} onChange={e => handleSetProgress(selectedTask.id, parseInt(e.target.value, 10))} style={{ width: '100%', cursor: 'pointer', accentColor: settings.accent, marginBottom: '22px' }} />

                {detail.images.length > 0 && (
                  <>
                    <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e', marginBottom: '10px' }}>Attachments</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '22px' }}>
                      {detail.images.map((src, i) => (
                        <a key={i} href={src} target="_blank" rel="noopener noreferrer" style={{ display: 'block', width: '104px', height: '104px', borderRadius: '11px', overflow: 'hidden', border: '1px solid #e6e6ec' }}>
                          <img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </a>
                      ))}
                    </div>
                  </>
                )}

                <div style={{ borderTop: '1px solid #f2f2f5', paddingTop: '22px' }}>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e', marginBottom: '12px' }}>Comments ({detail.comments.length})</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                    {detail.comments.map(c => (
                      <div key={c.id} style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#94a3b8', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '10.5px', flex: 'none', marginTop: '2px' }}>{getInitials(c.author)}</div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                            <span style={{ fontSize: '12.5px', fontWeight: 700 }}>{c.author}</span>
                            <span style={{ fontSize: '11px', color: '#a0a0aa' }}>{c.time}</span>
                          </div>
                          <div style={{ fontSize: '13px', color: '#55555e', lineHeight: 1.45 }}>{c.text}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '9px', marginTop: '4px' }}>
                    <input value={commentDraft} onChange={e => setCommentDraft(e.target.value)} placeholder="Add a comment…" style={{ flex: 1, padding: '9px 12px', border: '1px solid #e1e1e8', borderRadius: '9px', fontSize: '13px', outline: 'none' }} />
                    <button onClick={handlePostComment} style={{ padding: '9px 15px', border: 'none', borderRadius: '9px', background: settings.accent, color: '#fff', fontWeight: 700, fontSize: '12.5px', cursor: 'pointer' }}>Post</button>
                  </div>
                </div>
              </div>

              <div style={{ padding: '24px 24px', background: '#fbfbfc', borderRadius: '0 0 18px 0', display: 'flex', flexDirection: 'column', gap: '22px' }}>
                <div>
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#8a8a94', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: '8px' }}>Assignee</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: assigneeUser?.color || '#94a3b8', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>{getInitials(assigneeUser?.name || '?')}</div>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 700 }}>{assigneeUser?.name || 'Unassigned'}</div>
                      <div style={{ fontSize: '11.5px', color: '#8a8a94' }}>{assigneeUser?.title || ''}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#8a8a94', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: '12px' }}>Timeline</div>
                  <div style={{ position: 'relative', paddingLeft: '6px' }}>
                    {timelineData.map((tl, i) => (
                      <div key={i} style={{ display: 'flex', gap: '12px', paddingBottom: '16px', position: 'relative' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: tl.dot, border: `2px solid ${tl.ring}`, flex: 'none', zIndex: 1 }}></div>
                          {i < timelineData.length - 1 && (
                            <div style={{ width: '2px', flex: 1, background: '#e6e6ec', minHeight: '16px' }}></div>
                          )}
                        </div>
                        <div style={{ marginTop: '-2px' }}>
                          <div style={{ fontSize: '12.5px', fontWeight: 700, color: tl.fg }}>{tl.label}</div>
                          <div style={{ fontSize: '11.5px', color: '#9a9aa4' }}>{tl.date}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                  <div style={{ flex: 1, background: '#fff', border: '1px solid #ececf1', borderRadius: '10px', padding: '11px', textAlign: 'center' }}>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: selectedTask.status === 'done' ? '#059669' : (getDaysLeft(selectedTask.due) < 0 ? '#dc2626' : '#8a8a94') }}>
                      {selectedTask.status === 'done' ? 'Done' : (getDaysLeft(selectedTask.due) < 0 ? `${-getDaysLeft(selectedTask.due)}d overdue` : (getDaysLeft(selectedTask.due) === 0 ? 'Today' : `${getDaysLeft(selectedTask.due)}d left`))}
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#9a9aa4', fontWeight: 600 }}>Deadline</div>
                  </div>
                  <div style={{ flex: 1, background: '#fff', border: '1px solid #ececf1', borderRadius: '10px', padding: '11px', textAlign: 'center' }}>
                    <div style={{ fontSize: '16px', fontWeight: 800 }}>{selectedTask.progress}%</div>
                    <div style={{ fontSize: '10.5px', color: '#9a9aa4', fontWeight: 600 }}>Complete</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ ADD MEMBER MODAL ============ */}
      {addingMember && (
        <div onClick={() => setAddingMember(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(16,16,26,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px', zIndex: 60, animation: 'tf-overlay .15s ease' }}>
          <form onSubmit={handleCreateMember} onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '460px', background: '#fff', borderRadius: '18px', padding: '26px', animation: 'tf-pop .2s ease' }}>
            <div style={{ fontSize: '18px', fontWeight: 800 }}>Add team member</div>
            <div style={{ fontSize: '13px', color: '#8a8a94', marginTop: '4px', marginBottom: '20px' }}>Create a new account and add them to the workspace.</div>
            
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e' }}>Full name</label>
              <input value={memberForm.name} onChange={e => setMemberForm({ ...memberForm, name: e.target.value })} placeholder="e.g. Ali Hassan" style={{ width: '100%', marginTop: '7px', padding: '11px 13px', border: '1px solid #e1e1e8', borderRadius: '10px', fontSize: '14px' }} required />
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e' }}>Email</label>
              <input type="email" value={memberForm.email} onChange={e => setMemberForm({ ...memberForm, email: e.target.value })} placeholder="ali@morango.ai" style={{ width: '100%', marginTop: '7px', padding: '11px 13px', border: '1px solid #e1e1e8', borderRadius: '10px', fontSize: '14px' }} required />
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e' }}>Password</label>
              <input type="password" value={memberForm.password} onChange={e => setMemberForm({ ...memberForm, password: e.target.value })} placeholder="••••••••" style={{ width: '100%', marginTop: '7px', padding: '11px 13px', border: '1px solid #e1e1e8', borderRadius: '10px', fontSize: '14px' }} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '22px' }}>
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e' }}>Job title</label>
                <input value={memberForm.title} onChange={e => setMemberForm({ ...memberForm, title: e.target.value })} placeholder="Frontend Engineer" style={{ width: '100%', marginTop: '7px', padding: '11px 13px', border: '1px solid #e1e1e8', borderRadius: '10px', fontSize: '14px' }} />
              </div>
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e' }}>Role</label>
                <select value={memberForm.role} onChange={e => setMemberForm({ ...memberForm, role: e.target.value })} style={{ width: '100%', marginTop: '7px', padding: '11px 13px', border: '1px solid #e1e1e8', borderRadius: '10px', fontSize: '14px', background: '#fff' }}>
                  {roles.map(o => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setAddingMember(false)} style={{ padding: '11px 18px', border: '1px solid #e1e1e8', borderRadius: '10px', background: '#fff', fontWeight: 700, fontSize: '13.5px', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ padding: '11px 22px', border: 'none', borderRadius: '10px', background: settings.accent, color: '#fff', fontWeight: 700, fontSize: '13.5px', cursor: 'pointer' }}>Add member</button>
            </div>
          </form>
        </div>
      )}

      {/* ============ ADD ROLE MODAL ============ */}
      {addingRole && (
        <div onClick={() => setAddingRole(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(16,16,26,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px', zIndex: 60, animation: 'tf-overlay .15s ease' }}>
          <form onSubmit={handleCreateRole} onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '480px', maxHeight: '88vh', overflowY: 'auto', background: '#fff', borderRadius: '18px', padding: '26px', animation: 'tf-pop .2s ease' }}>
            <div style={{ fontSize: '18px', fontWeight: 800 }}>Create role</div>
            <div style={{ fontSize: '13px', color: '#8a8a94', marginTop: '4px', marginBottom: '20px' }}>Pick what this role is allowed to do.</div>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e' }}>Role name</label>
              <input value={roleForm.name} onChange={e => setRoleForm({ ...roleForm, name: e.target.value })} placeholder="e.g. Team Lead" style={{ width: '100%', marginTop: '7px', padding: '11px 13px', border: '1px solid #e1e1e8', borderRadius: '10px', fontSize: '14px' }} required />
            </div>

            <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e', marginTop: '16px', marginBottom: '9px' }}>Color</div>
            <div style={{ display: 'flex', gap: '9px', marginBottom: '16px' }}>
              {['#7c3aed', '#0891b2', '#db2777', '#d97706', '#059669', '#2563eb'].map(c => (
                <button type="button" key={c} onClick={() => setRoleForm({ ...roleForm, color: c })} style={{ width: '30px', height: '30px', borderRadius: '8px', background: c, cursor: 'pointer', border: `3px solid ${roleForm.color === c ? '#16161a' : 'transparent'}` }}></button>
              ))}
            </div>

            <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e', marginTop: '18px', marginBottom: '10px' }}>Permissions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(Object.keys(roleForm.perms) as Array<keyof Permission>).map(key => {
                const on = roleForm.perms[key];
                const labels: Record<string, string> = { allTasks: 'View all tasks', create: 'Create & assign tasks', team: 'Manage team', roles: 'Manage roles', reports: 'View reports', settings: 'Manage settings' };
                return (
                  <button type="button" key={key} onClick={() => handleToggleRolePerm(key)} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, border: `1px solid ${on ? settings.accent : '#e1e1e8'}`, background: on ? `color-mix(in srgb, ${settings.accent} 8%, #fff)` : '#fff', color: on ? '#16161a' : '#6b6b76' }}>
                    <span style={{ width: '17px', height: '17px', borderRadius: '5px', border: `1.5px solid ${on ? settings.accent : '#cfcfd8'}`, background: on ? settings.accent : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#fff', flex: 'none' }}>
                      {on ? '✓' : ''}
                    </span>
                    {labels[key]}
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '22px' }}>
              <button type="button" onClick={() => setAddingRole(false)} style={{ padding: '11px 18px', border: '1px solid #e1e1e8', borderRadius: '10px', background: '#fff', fontWeight: 700, fontSize: '13.5px', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ padding: '11px 22px', border: 'none', borderRadius: '10px', background: settings.accent, color: '#fff', fontWeight: 700, fontSize: '13.5px', cursor: 'pointer' }}>Create role</button>
            </div>
          </form>
        </div>
      )}

      {/* ============ EDIT TASK MODAL ============ */}
      {editingTask && (
        <div onClick={() => setEditingTask(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(16,16,26,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px', zIndex: 60, animation: 'tf-overlay .15s ease' }}>
          <form onSubmit={handleUpdateTask} onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '580px', background: '#fff', borderRadius: '18px', padding: '26px', animation: 'tf-pop .2s ease' }}>
            <div style={{ fontSize: '18px', fontWeight: 800 }}>Edit Task</div>
            <div style={{ fontSize: '13px', color: '#8a8a94', marginTop: '4px', marginBottom: '20px' }}>Modify the task details below.</div>
            
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e' }}>Title</label>
              <input value={editTaskForm.title} onChange={e => setEditTaskForm({ ...editTaskForm, title: e.target.value })} style={{ width: '100%', marginTop: '7px', padding: '11px 13px', border: '1px solid #e1e1e8', borderRadius: '10px', fontSize: '14px' }} required />
            </div>
            
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e' }}>Description</label>
              <textarea value={editTaskForm.desc} onChange={e => setEditTaskForm({ ...editTaskForm, desc: e.target.value })} style={{ width: '100%', marginTop: '7px', padding: '11px 13px', border: '1px solid #e1e1e8', borderRadius: '10px', fontSize: '14px', minHeight: '96px', resize: 'vertical' }}></textarea>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e' }}>Assign to</label>
                <select value={editTaskForm.assigneeId} onChange={e => setEditTaskForm({ ...editTaskForm, assigneeId: e.target.value })} style={{ width: '100%', marginTop: '7px', padding: '11px 13px', border: '1px solid #e1e1e8', borderRadius: '10px', fontSize: '14px', background: '#fff' }}>
                  <option value="">Unassigned</option>
                  {members.map(o => (
                    <option key={o.id} value={o.id}>{o.name} · {o.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e' }}>Priority</label>
                <select value={editTaskForm.priority} onChange={e => setEditTaskForm({ ...editTaskForm, priority: e.target.value as any })} style={{ width: '100%', marginTop: '7px', padding: '11px 13px', border: '1px solid #e1e1e8', borderRadius: '10px', fontSize: '14px', background: '#fff' }}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '22px' }}>
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e' }}>Project</label>
                <select value={editTaskForm.tag} onChange={e => setEditTaskForm({ ...editTaskForm, tag: e.target.value })} style={{ width: '100%', marginTop: '7px', padding: '11px 13px', border: '1px solid #e1e1e8', borderRadius: '10px', fontSize: '14px', background: '#fff' }}>
                  <option value="Web Portal">Web Portal</option>
                  <option value="Mobile App">Mobile App</option>
                  <option value="Backend API">Backend API</option>
                  <option value="DevOps">DevOps</option>
                  <option value="QA">QA</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e' }}>Deadline</label>
                <input type="datetime-local" value={editTaskForm.due} onChange={e => setEditTaskForm({ ...editTaskForm, due: e.target.value })} style={{ width: '100%', marginTop: '7px', padding: '10px 13px', border: '1px solid #e1e1e8', borderRadius: '10px', fontSize: '14px', background: '#fff' }} required />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setEditingTask(null)} style={{ padding: '11px 18px', border: '1px solid #e1e1e8', borderRadius: '10px', background: '#fff', fontWeight: 700, fontSize: '13.5px', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ padding: '11px 22px', border: 'none', borderRadius: '10px', background: settings.accent, color: '#fff', fontWeight: 700, fontSize: '13.5px', cursor: 'pointer' }}>Save Changes</button>
            </div>
          </form>
        </div>
      )}

      {/* ============ EDIT MEMBER MODAL ============ */}
      {editingMember && (
        <div onClick={() => setEditingMember(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(16,16,26,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px', zIndex: 60, animation: 'tf-overlay .15s ease' }}>
          <form onSubmit={handleUpdateMember} onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '460px', background: '#fff', borderRadius: '18px', padding: '26px', animation: 'tf-pop .2s ease' }}>
            <div style={{ fontSize: '18px', fontWeight: 800 }}>Edit team member</div>
            <div style={{ fontSize: '13px', color: '#8a8a94', marginTop: '4px', marginBottom: '20px' }}>Update profile, role, and system status.</div>
            
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e' }}>Full name</label>
              <input value={editMemberForm.name} onChange={e => setEditMemberForm({ ...editMemberForm, name: e.target.value })} style={{ width: '100%', marginTop: '7px', padding: '11px 13px', border: '1px solid #e1e1e8', borderRadius: '10px', fontSize: '14px' }} required />
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e' }}>Email</label>
              <input type="email" value={editMemberForm.email} onChange={e => setEditMemberForm({ ...editMemberForm, email: e.target.value })} style={{ width: '100%', marginTop: '7px', padding: '11px 13px', border: '1px solid #e1e1e8', borderRadius: '10px', fontSize: '14px' }} required />
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e' }}>New Password (leave empty to keep current)</label>
              <input type="password" value={editMemberForm.password} onChange={e => setEditMemberForm({ ...editMemberForm, password: e.target.value })} placeholder="••••••••" style={{ width: '100%', marginTop: '7px', padding: '11px 13px', border: '1px solid #e1e1e8', borderRadius: '10px', fontSize: '14px' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '22px' }}>
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e' }}>Job title</label>
                <input value={editMemberForm.title} onChange={e => setEditMemberForm({ ...editMemberForm, title: e.target.value })} style={{ width: '100%', marginTop: '7px', padding: '11px 13px', border: '1px solid #e1e1e8', borderRadius: '10px', fontSize: '14px' }} />
              </div>
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e' }}>Role</label>
                <select value={editMemberForm.roleId} onChange={e => setEditMemberForm({ ...editMemberForm, roleId: e.target.value })} style={{ width: '100%', marginTop: '7px', padding: '11px 13px', border: '1px solid #e1e1e8', borderRadius: '10px', fontSize: '14px', background: '#fff' }}>
                  {roles.map(o => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <input type="checkbox" id="isActive" checked={editMemberForm.isActive} onChange={e => setEditMemberForm({ ...editMemberForm, isActive: e.target.checked })} style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: settings.accent }} />
              <label htmlFor="isActive" style={{ fontSize: '13px', fontWeight: 700, color: '#44444e', cursor: 'pointer' }}>Active Member (uncheck to deactivate)</label>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setEditingMember(null)} style={{ padding: '11px 18px', border: '1px solid #e1e1e8', borderRadius: '10px', background: '#fff', fontWeight: 700, fontSize: '13.5px', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ padding: '11px 22px', border: 'none', borderRadius: '10px', background: settings.accent, color: '#fff', fontWeight: 700, fontSize: '13.5px', cursor: 'pointer' }}>Save Changes</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
