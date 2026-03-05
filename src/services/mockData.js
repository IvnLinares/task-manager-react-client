// ─── Demo Data for Portfolio ────────────────────────────────────────────────
// All dates are relative to the current date so the calendar always looks alive.

const today = new Date();
const rel = (days) => {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return d.toISOString();
};

export const DEMO_CATEGORIES = [
  { id: 1, name: 'Design',      color: '#a78bfa' },
  { id: 2, name: 'Engineering', color: '#60a5fa' },
  { id: 3, name: 'Marketing',   color: '#34d399' },
  { id: 4, name: 'Research',    color: '#fbbf24' },
  { id: 5, name: 'DevOps',      color: '#f87171' },
];

export const DEMO_TASKS = [
  {
    id: 1,
    title: 'Redesign onboarding flow',
    description: 'Simplify the new-user onboarding to reduce drop-off. Focus on progressive disclosure and fewer steps.',
    status: 'in_progress',
    priority: 'high',
    due_date: rel(1),
    owner_id: 1,
    categories: [DEMO_CATEGORIES[0], DEMO_CATEGORIES[2]],
    attachments: [],
  },
  {
    id: 2,
    title: 'Migrate DB to PostgreSQL',
    description: 'Replace SQLite with a managed Postgres instance. Update connection strings and run migration.',
    status: 'todo',
    priority: 'high',
    due_date: rel(3),
    owner_id: 1,
    categories: [DEMO_CATEGORIES[1], DEMO_CATEGORIES[4]],
    attachments: [],
  },
  {
    id: 3,
    title: 'Write unit tests for auth service',
    description: 'Cover login, token refresh, and register endpoints. Target ≥80% branch coverage.',
    status: 'todo',
    priority: 'medium',
    due_date: rel(5),
    owner_id: 1,
    categories: [DEMO_CATEGORIES[1]],
    attachments: [],
  },
  {
    id: 4,
    title: 'Keyword research for Q2 campaign',
    description: 'Use SEMrush to identify top-of-funnel keywords. Prepare a spreadsheet with volume and difficulty scores.',
    status: 'done',
    priority: 'medium',
    due_date: rel(-3),
    owner_id: 1,
    categories: [DEMO_CATEGORIES[2], DEMO_CATEGORIES[3]],
    attachments: [],
  },
  {
    id: 5,
    title: 'Set up CI/CD pipeline',
    description: 'Configure GitHub Actions to run tests on PRs and auto-deploy to staging on merge to main.',
    status: 'in_progress',
    priority: 'high',
    due_date: rel(2),
    owner_id: 1,
    categories: [DEMO_CATEGORIES[4]],
    attachments: [],
  },
  {
    id: 6,
    title: 'Conduct user interviews',
    description: 'Schedule 5 moderated sessions with beta users. Focus on pain points in the task creation flow.',
    status: 'todo',
    priority: 'medium',
    due_date: rel(7),
    owner_id: 1,
    categories: [DEMO_CATEGORIES[3], DEMO_CATEGORIES[0]],
    attachments: [],
  },
  {
    id: 7,
    title: 'Optimize image loading performance',
    description: 'Implement lazy loading and WebP conversion for all user-uploaded images. Target LCP < 2.5s.',
    status: 'todo',
    priority: 'low',
    due_date: rel(10),
    owner_id: 1,
    categories: [DEMO_CATEGORIES[1]],
    attachments: [],
  },
  {
    id: 8,
    title: 'Update privacy policy',
    description: 'Review and update the privacy policy to comply with the latest GDPR requirements.',
    status: 'done',
    priority: 'high',
    due_date: rel(-7),
    owner_id: 1,
    categories: [],
    attachments: [],
  },
  {
    id: 9,
    title: 'Design dark mode token system',
    description: 'Define CSS custom properties for both themes. Ensure all components have dark/light variants.',
    status: 'done',
    priority: 'medium',
    due_date: rel(-1),
    owner_id: 1,
    categories: [DEMO_CATEGORIES[0]],
    attachments: [],
  },
  {
    id: 10,
    title: 'Configure Supabase Storage buckets',
    description: 'Set up public and private buckets for file attachments. Apply RLS policies.',
    status: 'todo',
    priority: 'low',
    due_date: rel(14),
    owner_id: 1,
    categories: [DEMO_CATEGORIES[4]],
    attachments: [],
  },
  {
    id: 11,
    title: 'Draft Q2 OKRs',
    description: 'Align with leadership on key results for the quarter. Include measurable outcomes for each team.',
    status: 'todo',
    priority: 'medium',
    due_date: rel(0),
    owner_id: 1,
    categories: [],
    attachments: [],
  },
  {
    id: 12,
    title: 'Implement calendar view enhancements',
    description: 'Add keyboard navigation, loading skeletons, staggered animations, and weekend differentiation.',
    status: 'done',
    priority: 'high',
    due_date: rel(-2),
    owner_id: 1,
    categories: [DEMO_CATEGORIES[0], DEMO_CATEGORIES[1]],
    attachments: [],
  },
];

// ─── In-memory store (simulates a live database for the demo) ──────────────
let _tasks = DEMO_TASKS.map(t => ({ ...t }));
let _categories = DEMO_CATEGORIES.map(c => ({ ...c }));
let _nextTaskId = _tasks.length + 1;
let _nextCatId = _categories.length + 1;

// ─── Task service mock ──────────────────────────────────────────────────────
export const mockGetTasks = async () => [..._tasks];

export const mockGetTaskById = async (id) =>
  _tasks.find(t => t.id === id) ?? null;

export const mockCreateTask = async (data) => {
  const task = {
    id: _nextTaskId++,
    title: data.title ?? 'Untitled',
    description: data.description ?? null,
    status: data.status ?? 'todo',
    priority: data.priority ?? 'medium',
    due_date: data.due_date ?? null,
    owner_id: 1,
    categories: _categories.filter(c => (data.category_ids ?? []).includes(c.id)),
    attachments: [],
  };
  _tasks = [task, ..._tasks];
  return task;
};

export const mockUpdateTask = async (id, data) => {
  _tasks = _tasks.map(t => {
    if (t.id !== id) return t;
    return {
      ...t,
      ...data,
      categories: data.category_ids !== undefined
        ? _categories.filter(c => data.category_ids.includes(c.id))
        : t.categories,
    };
  });
  return _tasks.find(t => t.id === id);
};

export const mockDeleteTask = async (id) => {
  _tasks = _tasks.filter(t => t.id !== id);
  return { ok: true };
};

// Attachments are disabled in demo mode (no backend)
export const mockUploadAttachment = async () => {
  throw new Error('File uploads are disabled in demo mode.');
};

export const mockDeleteAttachment = async () => {
  throw new Error('File uploads are disabled in demo mode.');
};

// ─── Category service mock ──────────────────────────────────────────────────
export const mockGetCategories = async () => [..._categories];

export const mockCreateCategory = async (data) => {
  const cat = { id: _nextCatId++, name: data.name, color: data.color ?? '#a78bfa' };
  _categories = [..._categories, cat];
  return cat;
};

export const mockGetCategoryById = async (id) =>
  _categories.find(c => c.id === id) ?? null;
