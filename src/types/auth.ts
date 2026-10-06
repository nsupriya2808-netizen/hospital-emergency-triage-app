export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: 'Attending Physician' | 'Triage Nurse' | 'Department Chief' | 'Emergency Clerk';
  avatarInitials: string;
  department: string;
  loginTime: number;
}

export const PRESET_ACCOUNTS: Array<{
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserSession['role'];
  avatarInitials: string;
  department: string;
  description: string;
}> = [
  {
    id: 'usr-1',
    name: 'Dr. Sarah Lin, MD',
    email: 'sarah.lin@hospital.org',
    password: 'password123',
    role: 'Attending Physician',
    avatarInitials: 'SL',
    department: 'Trauma & Resuscitation Bay',
    description: 'High-urgency admissions & critical resuscitation lead',
  },
  {
    id: 'usr-2',
    name: 'Nurse James Thorne, RN',
    email: 'james.thorne@hospital.org',
    password: 'password123',
    role: 'Triage Nurse',
    avatarInitials: 'JT',
    department: 'Emergency Intake & Triage',
    description: 'Vital sign assessment & severity scoring specialist',
  },
  {
    id: 'usr-3',
    name: 'Dr. Marcus Vance, MD',
    email: 'marcus.vance@hospital.org',
    password: 'password123',
    role: 'Department Chief',
    avatarInitials: 'MV',
    department: 'Cardiology ER & Administration',
    description: 'Triage workflow oversight & algorithmic benchmarking',
  },
  {
    id: 'usr-4',
    name: 'Elena Rostova',
    email: 'elena.rostova@hospital.org',
    password: 'password123',
    role: 'Emergency Clerk',
    avatarInitials: 'ER',
    department: 'Patient Registry Desk',
    description: 'Patient admissions & AVL registry management',
  },
];
