const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Delete all existing data (cascade handles dependencies)
  await prisma.settings.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.attachment.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.role.deleteMany({});

  // 2. Create Roles
  const roles = [
    { id: 'admin', name: 'Admin', color: '#4f46e5', system: true, permAllTasks: true, permCreate: true, permTeam: true, permRoles: true, permReports: true, permSettings: true },
    { id: 'manager', name: 'Manager', color: '#0891b2', system: true, permAllTasks: true, permCreate: true, permTeam: false, permRoles: false, permReports: true, permSettings: false },
    { id: 'employee', name: 'Member', color: '#64748b', system: true, permAllTasks: false, permCreate: false, permTeam: false, permRoles: false, permReports: false, permSettings: false }
  ];

  for (const role of roles) {
    await prisma.role.create({ data: role });
  }
  console.log('Roles seeded.');

  // 3. Create Users
  const passwordHash = await bcrypt.hash('demo1234', 10);
  const users = [
    { id: 'u0', name: 'Zara Sheikh', roleId: 'admin', title: 'Administrator', email: 'zara@morango.ai', passwordHash, color: '#1e293b' },
    { id: 'u1', name: 'Ayesha Khan', roleId: 'manager', title: 'Project Manager', email: 'ayesha@morango.ai', passwordHash, color: '#4f46e5' },
    { id: 'u2', name: 'Bilal Ahmed', roleId: 'employee', title: 'Frontend Engineer', email: 'bilal@morango.ai', passwordHash, color: '#0891b2' },
    { id: 'u3', name: 'Sana Malik', roleId: 'employee', title: 'Backend Engineer', email: 'sana@morango.ai', passwordHash, color: '#7c3aed' },
    { id: 'u4', name: 'Usman Tariq', roleId: 'employee', title: 'QA Engineer', email: 'usman@morango.ai', passwordHash, color: '#db2777' },
    { id: 'u5', name: 'Hira Shaikh', roleId: 'employee', title: 'Product Designer', email: 'hira@morango.ai', passwordHash, color: '#d97706' },
    { id: 'u6', name: 'Faisal Raza', roleId: 'employee', title: 'DevOps Engineer', email: 'faisal@morango.ai', passwordHash, color: '#059669' }
  ];

  for (const user of users) {
    await prisma.user.create({ data: user });
  }
  console.log('Users seeded.');

  // 4. Create Settings
  await prisma.settings.create({
    data: {
      id: 1,
      companyName: 'Morango AI',
      accent: '#4f46e5',
      sidebarTheme: 'light'
    }
  });
  console.log('Settings seeded.');

  // 5. Create Tasks
  const tasks = [
    { id: 'TASK-100001', title: 'Design onboarding flow screens', description: 'Create the 4-step onboarding flow for new mobile users including welcome, permissions, profile setup and tutorial.', assigneeId: 'u5', status: 'inprogress', priority: 'high', tag: 'Mobile App', createdDate: new Date('2026-06-14'), startDate: new Date('2026-06-16'), dueDate: new Date('2026-06-22'), progress: 45 },
    { id: 'TASK-100002', title: 'Implement JWT authentication', description: 'Add access + refresh token auth with role claims and secure cookie storage.', assigneeId: 'u3', status: 'inprogress', priority: 'urgent', tag: 'Backend API', createdDate: new Date('2026-06-13'), startDate: new Date('2026-06-15'), dueDate: new Date('2026-06-20'), progress: 65 },
    { id: 'TASK-100003', title: 'Build responsive navbar component', description: 'Sticky responsive navbar with mobile drawer and active-state highlighting.', assigneeId: 'u2', status: 'todo', priority: 'medium', tag: 'Web Portal', createdDate: new Date('2026-06-17'), startDate: null, dueDate: new Date('2026-06-25'), progress: 0 },
    { id: 'TASK-100004', title: 'Write E2E test suite for checkout', description: 'Cover happy path + edge cases for the checkout funnel using Playwright.', assigneeId: 'u4', status: 'todo', priority: 'high', tag: 'QA', createdDate: new Date('2026-06-16'), startDate: null, dueDate: new Date('2026-06-28'), progress: 0 },
    { id: 'TASK-100005', title: 'Set up CI/CD pipeline', description: 'GitHub Actions pipeline with lint, test, build and staging deploy.', assigneeId: 'u6', status: 'done', priority: 'high', tag: 'DevOps', createdDate: new Date('2026-06-08'), startDate: new Date('2026-06-09'), dueDate: new Date('2026-06-15'), progress: 100 },
    { id: 'TASK-100006', title: 'Fix payment gateway timeout bug', description: 'Investigate intermittent 504s on the Stripe webhook handler under load.', assigneeId: 'u3', status: 'todo', priority: 'urgent', tag: 'Backend API', createdDate: new Date('2026-06-12'), startDate: null, dueDate: new Date('2026-06-18'), progress: 0 },
    { id: 'TASK-100007', title: 'Create dashboard analytics charts', description: 'Revenue, active users and retention charts with date-range filter.', assigneeId: 'u2', status: 'inprogress', priority: 'medium', tag: 'Web Portal', createdDate: new Date('2026-06-15'), startDate: new Date('2026-06-17'), dueDate: new Date('2026-06-30'), progress: 30 },
    { id: 'TASK-100008', title: 'Design email notification templates', description: 'Responsive HTML email templates for invites, resets and digests.', assigneeId: 'u5', status: 'done', priority: 'low', tag: 'Mobile App', createdDate: new Date('2026-06-06'), startDate: new Date('2026-06-07'), dueDate: new Date('2026-06-12'), progress: 100 },
    { id: 'TASK-100009', title: 'Optimize database queries', description: 'Add indexes and remove N+1 queries on the reports endpoints.', assigneeId: 'u6', status: 'todo', priority: 'medium', tag: 'Backend API', createdDate: new Date('2026-06-18'), startDate: null, dueDate: new Date('2026-07-02'), progress: 0 },
    { id: 'TASK-100010', title: 'User profile settings page', description: 'Editable profile with avatar upload, password change and preferences.', assigneeId: 'u2', status: 'done', priority: 'medium', tag: 'Web Portal', createdDate: new Date('2026-06-09'), startDate: new Date('2026-06-10'), dueDate: new Date('2026-06-16'), progress: 100 },
    
    // Morango AI Services Tasks
    { id: 'TASK-200001', title: 'Produce AI Films & Short-Form Videos', description: 'Produce high-impact AI Films and short-form videos to boost social engagement and visual storytelling.', assigneeId: 'u5', status: 'inprogress', priority: 'high', tag: 'AI Creative', createdDate: new Date('2026-06-20'), startDate: new Date('2026-06-22'), dueDate: new Date('2026-07-10'), progress: 45 },
    { id: 'TASK-200002', title: 'Launch Campaign Content (Digital & Social)', description: 'Design and schedule campaign content across digital and social channels using automated generative tools.', assigneeId: 'u2', status: 'todo', priority: 'medium', tag: 'AI Creative', createdDate: new Date('2026-06-21'), startDate: null, dueDate: new Date('2026-07-15'), progress: 0 },
    { id: 'TASK-200003', title: 'Set up Vertical Video & Reels Ecosystems', description: 'Establish vertical video templates, prompts, and reels ecosystems for multi-platform distribution.', assigneeId: 'u1', status: 'done', priority: 'high', tag: 'AI Creative', createdDate: new Date('2026-06-15'), startDate: new Date('2026-06-16'), dueDate: new Date('2026-06-25'), progress: 100 },
    { id: 'TASK-200004', title: 'Design AI Workflows & Automation Maps', description: 'Map out AI workflow designs to automate repetitive business processes and reduce manual overhead.', assigneeId: 'u3', status: 'inprogress', priority: 'urgent', tag: 'AI Automation', createdDate: new Date('2026-06-18'), startDate: new Date('2026-06-20'), dueDate: new Date('2026-07-05'), progress: 20 },
    { id: 'TASK-200005', title: 'Deploy Marketing & CRM Lead Automation', description: 'Set up automated campaigns, CRM leads capture, and automated follow-up sequences using Zapier/Make.', assigneeId: 'u4', status: 'todo', priority: 'high', tag: 'AI Automation', createdDate: new Date('2026-06-22'), startDate: null, dueDate: new Date('2026-07-20'), progress: 0 },
    { id: 'TASK-200006', title: 'Build Performance & Reporting Dashboards', description: 'Implement dashboards to monitor conversion funnels, automation workloads, and system health.', assigneeId: 'u6', status: 'done', priority: 'medium', tag: 'AI Automation', createdDate: new Date('2026-06-10'), startDate: new Date('2026-06-11'), dueDate: new Date('2026-06-20'), progress: 100 },
    { id: 'TASK-200007', title: 'Formulate Brand & Communication Strategy', description: 'Create strategic communication guidelines and brand messaging blueprints prior to ad budget scaling.', assigneeId: 'u0', status: 'todo', priority: 'high', tag: 'Digital Strategy', createdDate: new Date('2026-06-23'), startDate: null, dueDate: new Date('2026-07-12'), progress: 0 },
    { id: 'TASK-200008', title: 'Optimize Funnel Design (Website -> Leads -> Sales)', description: 'Refine landing page conversion funnels to ensure visitors convert to qualified leads and active sales.', assigneeId: 'u2', status: 'inprogress', priority: 'medium', tag: 'Digital Strategy', createdDate: new Date('2026-06-19'), startDate: new Date('2026-06-21'), dueDate: new Date('2026-07-08'), progress: 50 },
    { id: 'TASK-200009', title: 'Organize Corporate AI Training Workshops', description: 'Deliver custom training programs on AI tooling, Prompt Engineering, and automation options for corporate clients.', assigneeId: 'u0', status: 'done', priority: 'medium', tag: 'AI Labs', createdDate: new Date('2026-06-12'), startDate: new Date('2026-06-13'), dueDate: new Date('2026-06-18'), progress: 100 },
    { id: 'TASK-200010', title: 'Curate Custom Learning Modules for Teams', description: 'Develop bespoke education modules and video training courses on generative AI workflows.', assigneeId: 'u5', status: 'todo', priority: 'low', tag: 'AI Labs', createdDate: new Date('2026-06-24'), startDate: null, dueDate: new Date('2026-07-18'), progress: 0 },
    { id: 'TASK-200011', title: 'Plan AI Film Festival Launch & Promos', description: 'Establish timeline, rules, and promotional campaigns for the upcoming International AI Film Festival.', assigneeId: 'u1', status: 'todo', priority: 'high', tag: 'Events & Experiences', createdDate: new Date('2026-06-25'), startDate: null, dueDate: new Date('2026-07-25'), progress: 0 },
    { id: 'TASK-200012', title: 'Execute Experiential Brand Campaigns', description: 'Launch high-engagement experiential campaigns merging technology and brand culture at events.', assigneeId: 'u2', status: 'inprogress', priority: 'medium', tag: 'Events & Experiences', createdDate: new Date('2026-06-20'), startDate: new Date('2026-06-22'), dueDate: new Date('2026-07-15'), progress: 30 }
  ];

  for (const task of tasks) {
    await prisma.task.create({ data: task });
  }
  console.log('Tasks seeded.');

  // 6. Create Comments
  await prisma.comment.create({
    data: {
      taskId: 'TASK-100001',
      authorName: 'Ayesha Khan',
      text: 'Please align with the new brand colors.',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
    }
  });

  await prisma.comment.create({
    data: {
      taskId: 'TASK-100006',
      authorName: 'Usman Tariq',
      text: 'Reproduced on staging twice today.',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
    }
  });
  console.log('Comments seeded.');

  console.log('Seeding complete successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
