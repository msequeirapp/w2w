export interface Agent {
  id: string;
  name: string;
  team: string;
  daysOff: number[]; // 0 for Sunday, 1 for Monday, etc.
  notes: Record<string, string>; // Keys are dates in YYYY-MM-DD format
  availability: {
    morning: boolean;
    afternoon: boolean;
    night: boolean;
  };
}

export interface Team {
  id: string;
  name: string;
  requiredAgents: {
    // Keys are days of the week (0-6), values are required agents per shift
    [key: number]: {
      morning: number;
      afternoon: number;
      night: number;
    };
  };
}

export interface ScheduleEntry {
  agentId: string;
  agentName: string;
  team: string;
  shifts: {
    // Keys are dates in YYYY-MM-DD format
    [key: string]: {
      shift: 'morning' | 'afternoon' | 'night' | 'off';
      note?: string;
    };
  };
}

export interface AppLanguage {
  current: 'en' | 'es';
  translations: Record<string, Record<string, string>>;
}

export interface AppState {
  agents: Agent[];
  teams: Team[];
  schedule: ScheduleEntry[];
  language: AppLanguage;
}