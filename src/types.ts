export type NavTab =
  | 'dashboard'
  | 'journey'
  | 'level'
  | 'projects'
  | 'achievements'
  | 'path'
  | 'session'
  | 'ide'
  | 'circuit'
  | 'code'
  | 'hardware'
  | 'progress'
  | 'settings'
  | 'teacher';

export type BadgeId =
  | 'first-connection'
  | 'first-upload'
  | 'first-blinking-led'
  | 'circuit-builder'
  | 'code-explorer'
  | 'led-master'
  | 'traffic-light-engineer'
  | 'sensor-explorer'
  | 'automation-engineer'
  | 'robotics-builder';

export interface BadgeDef {
  id: BadgeId;
  title: string;
  description: string;
  icon: string;
  xpBonus: number;
}

export interface CodeCheckRule {
  id: string;
  label: string;
  hint: string;
  test: (code: string) => boolean;
}

export interface GuidedStage {
  id: string;
  title: string;
  instruction: string;
  hint: string;
  codeBefore: string;
  placeholder: string;
  codeAfter: string;
  acceptedAnswers: string[];
  normalizeWhitespace?: boolean;
}

export interface SessionDef {
  id: number; // 1..30
  level: number; // 1..14
  levelTitle: string;
  title: string;
  subtitle: string;
  objective: string;
  explanation: string;
  xpReward: number;
  badgeReward?: BadgeId;
  hardwareFocused?: boolean; // First 4 sessions are pure hardware-first
  category:
    | 'hardware-connect'
    | 'hardware-upload'
    | 'code-understand'
    | 'code-modify'
    | 'circuit-guided'
    | 'code-guided'
    | 'code-independent'
    | 'multi-led'
    | 'traffic-light'
    | 'buttons'
    | 'conditionals'
    | 'sensors'
    | 'automation'
    | 'robotics';
  components?: string[];
  starterCode?: string;
  solutionCode?: string;
  hints?: string[];
  rules?: CodeCheckRule[];
  sensorType?: 'ldr' | 'moisture' | 'dht11' | 'dht11-led' | 'ultrasonic' | 'relay' | 'pump' | 'irrigation' | 'motor' | 'l298n' | 'robot-move' | 'robot-obstacle';
}

export interface HardwareDeviceInfo {
  chip: string;
  mac?: string;
  usbVendorId?: number;
  usbProductId?: number;
  portLabel: string;
  connectedAt: string;
}

export interface StudentSubmission {
  id: string;
  studentName: string;
  sessionId: number;
  sessionTitle: string;
  code: string;
  passedRules: number;
  totalRules: number;
  submittedAt: string;
}

export interface StudentProgress {
  studentName: string;
  xp: number;
  completedSessions: number[];
  completedLevels: number[];
  quizScores: Record<number, number>;
  beginnerBadges: string[];
  unlockedBadges: BadgeId[];
  hardwareConnectedOnce: boolean;
  uploadedOnce: boolean;
  savedCode: Record<number, string>;
  submissions: StudentSubmission[];
  activityLog: { time: string; message: string; xp?: number }[];
}

export type ComponentCategory =
  | 'Microcontrollers'
  | 'Breadboards'
  | 'Basic Components'
  | 'Sensors'
  | 'Output Components'
  | 'Robotics'
  | 'Connections';

export interface PinDef {
  id: string;
  label: string;
  x: number; // relative to component width
  y: number; // relative to component height
  type: 'power' | 'gnd' | 'gpio' | 'analog' | 'signal' | 'passive';
}

export interface LibraryComponentDef {
  type: string;
  name: string;
  category: ComponentCategory;
  width: number;
  height: number;
  description: string;
  color: string;
  pins: PinDef[];
}

export interface PlacedComponent {
  id: string;
  type: string;
  x: number;
  y: number;
  rotation: number; // 0, 90, 180, 270
  label?: string;
  props?: Record<string, string | number | boolean>;
}

export interface CircuitWire {
  id: string;
  fromCompId: string;
  fromPinId: string;
  toCompId: string;
  toPinId: string;
  color: string;
}

export interface CircuitDiagnostic {
  id: string;
  severity: 'ok' | 'error' | 'warning';
  title: string;
  explanation: string;
}
