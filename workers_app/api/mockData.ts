import type { Task, WorkerProfile } from '../types';

export const MOCK_WORKER: WorkerProfile = {
  id: 'w-001',
  name: 'Jean Baptiste Uwimana',
  phone: '+250788123456',
  department: 'Roads & Infrastructure',
};

const PLACEHOLDER_PHOTOS = [
  'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800',
  'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800',
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800',
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-001',
    issue: {
      title: 'Pothole on KN 3 Rd near Remera',
      description:
        'Large pothole causing traffic slowdown and vehicle damage. Approximately 40cm deep near the bus stop.',
      district: 'Gasabo',
      category: 'roads',
      photos: [PLACEHOLDER_PHOTOS[0]],
      latitude: -1.9536,
      longitude: 30.1045,
    },
    status: 'todo',
    due_date: '2026-07-08T17:00:00.000Z',
    admin_notes: 'Priority fix — school route. Coordinate with traffic police if lane closure needed.',
    steps: [
      { id: 's1', title: 'Inspect site and measure pothole', is_completed: false, added_by: 'admin', order: 1 },
      { id: 's2', title: 'Procure asphalt mix', is_completed: false, added_by: 'admin', order: 2 },
      { id: 's3', title: 'Fill and compact pothole', is_completed: false, added_by: 'admin', order: 3 },
      { id: 's4', title: 'Take after photo', is_completed: false, added_by: 'admin', order: 4 },
    ],
    updates: [],
    comments: [
      {
        id: 'c1',
        body: 'Assigned to you — citizen reported damage to two vehicles.',
        author: 'admin',
        type: 'comment',
        created_at: '2026-07-04T08:00:00.000Z',
      },
    ],
  },
  {
    id: 'task-002',
    issue: {
      title: 'Broken water pipe — Nyamirambo market',
      description:
        'Burst pipe flooding the street near Nyamirambo market entrance. Water wastage reported since yesterday morning.',
      district: 'Nyarugenge',
      category: 'water',
      photos: [PLACEHOLDER_PHOTOS[1]],
      latitude: -1.9787,
      longitude: 30.0394,
    },
    status: 'in_progress',
    due_date: '2026-07-06T12:00:00.000Z',
    admin_notes: 'WASAC notified. Shut-off valve is behind the blue kiosk.',
    steps: [
      { id: 's5', title: 'Locate shut-off valve', is_completed: true, completed_at: '2026-07-05T09:15:00.000Z', added_by: 'admin', order: 1 },
      { id: 's6', title: 'Replace damaged section', is_completed: false, added_by: 'admin', order: 2 },
      { id: 's7', title: 'Pressure test line', is_completed: false, added_by: 'admin', order: 3 },
    ],
    updates: [
      {
        id: 'u1',
        body: 'Arrived on site at 9:00. Shut-off valve located and water flow stopped.',
        created_at: '2026-07-05T09:30:00.000Z',
      },
    ],
    comments: [],
  },
  {
    id: 'task-003',
    issue: {
      title: 'Overflowing garbage bins — Kacyiru sector',
      description:
        'Three communal bins overflowing for 4 days. Strong odor affecting nearby shops and pedestrians.',
      district: 'Gasabo',
      category: 'sanitation',
      photos: [PLACEHOLDER_PHOTOS[2]],
      latitude: -1.9369,
      longitude: 30.0821,
    },
    status: 'blocked',
    due_date: '2026-07-07T17:00:00.000Z',
    admin_notes: 'Collection truck schedule conflict — admin coordinating with sanitation dept.',
    steps: [
      { id: 's8', title: 'Clear overflow around bins', is_completed: true, completed_at: '2026-07-04T14:00:00.000Z', added_by: 'admin', order: 1 },
      { id: 's9', title: 'Replace damaged bin lid', is_completed: false, added_by: 'admin', order: 2 },
    ],
    updates: [
      {
        id: 'u2',
        body: 'Cleared surrounding area but replacement lids not yet delivered to depot.',
        created_at: '2026-07-04T15:00:00.000Z',
      },
    ],
    comments: [
      {
        id: 'c2',
        body: 'Waiting on spare lids from warehouse — ETA tomorrow AM.',
        author: 'admin',
        type: 'comment',
        created_at: '2026-07-04T16:00:00.000Z',
      },
    ],
  },
  {
    id: 'task-004',
    issue: {
      title: 'Streetlight outage — Kimihurura',
      description: 'Four consecutive streetlights not working on KG 7 Ave. Safety concern for evening pedestrians.',
      district: 'Gasabo',
      category: 'electricity',
      photos: [PLACEHOLDER_PHOTOS[0]],
      latitude: -1.9441,
      longitude: 30.0923,
    },
    status: 'review',
    due_date: '2026-07-05T17:00:00.000Z',
    admin_notes: 'REG approved access. Ladder truck booked.',
    steps: [
      { id: 's10', title: 'Test circuit breaker', is_completed: true, completed_at: '2026-07-03T10:00:00.000Z', added_by: 'admin', order: 1 },
      { id: 's11', title: 'Replace faulty bulbs', is_completed: true, completed_at: '2026-07-03T14:00:00.000Z', added_by: 'admin', order: 2 },
      { id: 's12', title: 'Verify all four lights', is_completed: true, completed_at: '2026-07-03T15:00:00.000Z', added_by: 'worker', order: 3 },
    ],
    updates: [
      {
        id: 'u3',
        body: 'All four streetlights tested and operational. Night patrol confirmed visibility restored.',
        photo_url: PLACEHOLDER_PHOTOS[0],
        created_at: '2026-07-03T16:00:00.000Z',
      },
    ],
    comments: [],
  },
  {
    id: 'task-005',
    issue: {
      title: 'Clinic waiting area roof leak',
      description: 'Rainwater leaking through roof tiles in the local health center waiting area.',
      district: 'Kicukiro',
      category: 'health',
      photos: [PLACEHOLDER_PHOTOS[1]],
      latitude: -1.9892,
      longitude: 30.1124,
    },
    status: 'done',
    due_date: '2026-07-01T17:00:00.000Z',
    admin_notes: 'Approved and closed by admin.',
    steps: [
      { id: 's13', title: 'Patch roof section', is_completed: true, completed_at: '2026-06-30T11:00:00.000Z', added_by: 'admin', order: 1 },
      { id: 's14', title: 'Waterproof sealant applied', is_completed: true, completed_at: '2026-06-30T14:00:00.000Z', added_by: 'admin', order: 2 },
    ],
    updates: [
      {
        id: 'u4',
        body: 'Roof patched and sealant applied. No leaks observed during test watering.',
        created_at: '2026-06-30T15:00:00.000Z',
      },
    ],
    comments: [],
  },
  {
    id: 'task-006',
    issue: {
      title: 'Blocked drainage ditch — Gikondo',
      description: 'Drainage channel clogged with debris causing flooding during rain. Affects residential access road.',
      district: 'Kicukiro',
      category: 'environment',
      photos: [PLACEHOLDER_PHOTOS[2]],
      latitude: -1.9703,
      longitude: 30.0789,
    },
    status: 'todo',
    due_date: '2026-07-09T17:00:00.000Z',
    steps: [
      { id: 's15', title: 'Remove debris from channel', is_completed: false, added_by: 'admin', order: 1 },
      { id: 's16', title: 'Flush channel with water', is_completed: false, added_by: 'admin', order: 2 },
    ],
    updates: [],
    comments: [],
  },
];
