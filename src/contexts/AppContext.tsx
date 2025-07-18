import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Agent, Team, ScheduleEntry, AppState } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { format, addDays, startOfWeek } from 'date-fns';
import * as XLSX from 'xlsx';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from './LanguageContext';

// Initial app state
const initialState: AppState = {
  agents: [],
  teams: [],
  schedule: [],
  language: {
    current: 'en',
    translations: {
      en: {},
      es: {},
    }
  }
};

// Create context type
interface AppContextType {
  state: AppState;
  addAgent: (agent: Omit<Agent, 'id'>) => void;
  updateAgent: (agent: Agent) => void;
  deleteAgent: (agentId: string) => void;
  addTeam: (team: Omit<Team, 'id'>) => void;
  updateTeam: (team: Team) => void;
  deleteTeam: (teamId: string) => void;
  generateSchedule: (startDate: Date) => void;
  downloadSchedule: () => void;
  addAgentNote: (agentId: string, date: string, note: string) => void;
  removeAgentNote: (agentId: string, date: string) => void;
}

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Custom hook to use the app context
export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Provider component
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    // Load from localStorage on initial load
    const savedState = localStorage.getItem('w2w-state');
    if (savedState) {
      try {
        return JSON.parse(savedState);
      } catch (e) {
        console.error('Failed to parse saved state:', e);
        return initialState;
      }
    }
    return initialState;
  });
  
  const { toast } = useToast();
  const { t } = useLanguage();

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('w2w-state', JSON.stringify(state));
  }, [state]);

  // Add a new agent
  const addAgent = (agent: Omit<Agent, 'id'>) => {
    const newAgent: Agent = {
      ...agent,
      id: uuidv4()
    };
    setState((prevState) => ({
      ...prevState,
      agents: [...prevState.agents, newAgent]
    }));
    
    toast({
      title: t('agents.add'),
      description: `${agent.name} ${t('agents.add').toLowerCase()}`,
    });
  };

  // Update an existing agent
  const updateAgent = (agent: Agent) => {
    setState((prevState) => ({
      ...prevState,
      agents: prevState.agents.map((a) => (a.id === agent.id ? agent : a))
    }));
    
    toast({
      title: t('app.edit'),
      description: `${agent.name} ${t('app.edit').toLowerCase()}`,
    });
  };

  // Delete an agent
  const deleteAgent = (agentId: string) => {
    setState((prevState) => ({
      ...prevState,
      agents: prevState.agents.filter((agent) => agent.id !== agentId)
    }));
    
    toast({
      title: t('app.delete'),
      description: t('agents.name') + " " + t('app.delete').toLowerCase(),
    });
  };

  // Add a new team
  const addTeam = (team: Omit<Team, 'id'>) => {
    const newTeam: Team = {
      ...team,
      id: uuidv4()
    };
    setState((prevState) => ({
      ...prevState,
      teams: [...prevState.teams, newTeam]
    }));
    
    toast({
      title: t('teams.add'),
      description: `${team.name} ${t('teams.add').toLowerCase()}`,
    });
  };

  // Update an existing team
  const updateTeam = (team: Team) => {
    setState((prevState) => ({
      ...prevState,
      teams: prevState.teams.map((t) => (t.id === team.id ? team : t))
    }));
    
    toast({
      title: t('app.edit'),
      description: `${team.name} ${t('app.edit').toLowerCase()}`,
    });
  };

  // Delete a team
  const deleteTeam = (teamId: string) => {
    setState((prevState) => ({
      ...prevState,
      teams: prevState.teams.filter((team) => team.id !== teamId)
    }));
    
    toast({
      title: t('app.delete'),
      description: t('teams.name') + " " + t('app.delete').toLowerCase(),
    });
  };

  // Add a note to an agent for a specific date
  const addAgentNote = (agentId: string, date: string, note: string) => {
    setState((prevState) => ({
      ...prevState,
      agents: prevState.agents.map((agent) => {
        if (agent.id === agentId) {
          return {
            ...agent,
            notes: {
              ...agent.notes,
              [date]: note
            }
          };
        }
        return agent;
      })
    }));
    
    toast({
      title: t('agents.addNote'),
      description: `${t('agents.noteDate')}: ${date}`,
    });
  };

  // Remove a note from an agent for a specific date
  const removeAgentNote = (agentId: string, date: string) => {
    setState((prevState) => ({
      ...prevState,
      agents: prevState.agents.map((agent) => {
        if (agent.id === agentId) {
          const { [date]: _, ...restNotes } = agent.notes;
          return {
            ...agent,
            notes: restNotes
          };
        }
        return agent;
      })
    }));
  };

  // Generate schedule based on agent availability and team requirements
  const generateSchedule = (startDate: Date) => {
    const { agents, teams } = state;
    
    if (agents.length === 0 || teams.length === 0) {
      toast({
        title: t('schedule.generate'),
        description: t('error.required'),
        variant: "destructive",
      });
      return;
    }
    
    const weekStart = startOfWeek(startDate, { weekStartsOn: 0 });
    const schedule: ScheduleEntry[] = [];
    
    // Create schedule entries for each agent
    agents.forEach((agent) => {
      const entry: ScheduleEntry = {
        agentId: agent.id,
        agentName: agent.name,
        team: agent.team,
        shifts: {}
      };
      
      // Initialize each day of the week
      for (let i = 0; i < 7; i++) {
        const currentDate = format(addDays(weekStart, i), 'yyyy-MM-dd');
        
        // Check if the agent has a note for this day
        if (agent.notes[currentDate]) {
          entry.shifts[currentDate] = {
            shift: 'off',
            note: agent.notes[currentDate]
          };
          continue;
        }
        
        // Check if it's a day off
        if (agent.daysOff.includes(i)) {
          entry.shifts[currentDate] = {
            shift: 'off'
          };
          continue;
        }
        
        // Assign shift based on availability
        // This is a simplified algorithm - in real life, it would be more complex
        // considering team requirements and optimal distribution
        if (agent.availability.morning) {
          entry.shifts[currentDate] = { shift: 'morning' };
        } else if (agent.availability.afternoon) {
          entry.shifts[currentDate] = { shift: 'afternoon' };
        } else if (agent.availability.night) {
          entry.shifts[currentDate] = { shift: 'night' };
        } else {
          entry.shifts[currentDate] = { shift: 'off' };
        }
      }
      
      schedule.push(entry);
    });
    
    // Update the state with the new schedule
    setState((prevState) => ({
      ...prevState,
      schedule
    }));
    
    toast({
      title: t('schedule.generate'),
      description: t('schedule.weekStarting') + " " + format(weekStart, 'yyyy-MM-dd'),
    });
  };

  // Download the schedule as an Excel file
  const downloadSchedule = () => {
    if (state.schedule.length === 0) {
      toast({
        title: t('schedule.download'),
        description: t('schedule.noSchedule'),
        variant: "destructive",
      });
      return;
    }
    
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    
    // Format data for Excel
    const data: (string | number)[][] = [];
    
    // Add header row with days of the week
    const headerRow: string[] = [t('agents.name'), t('agents.team')];
    
    const firstEntry = state.schedule[0];
    const dates = Object.keys(firstEntry.shifts).sort();
    
    // Add formatted dates to header
    dates.forEach((date) => {
      headerRow.push(date);
    });
    
    data.push(headerRow);
    
    // Add data for each agent
    state.schedule.forEach((entry) => {
      const row: (string | number)[] = [entry.agentName, entry.team];
      
      dates.forEach((date) => {
        const shiftData = entry.shifts[date];
        let cellValue = '';
        
        if (shiftData) {
          cellValue = t(`agents.${shiftData.shift}`);
          if (shiftData.note) {
            cellValue += ` (${shiftData.note})`;
          }
        }
        
        row.push(cellValue);
      });
      
      data.push(row);
    });
    
    // Create worksheet and add to workbook
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Schedule');
    
    // Generate Excel file and trigger download
    XLSX.writeFile(wb, `w2w_schedule_${dates[0]}.xlsx`);
    
    toast({
      title: t('schedule.download'),
      description: `w2w_schedule_${dates[0]}.xlsx`,
    });
  };

  return (
    <AppContext.Provider
      value={{
        state,
        addAgent,
        updateAgent,
        deleteAgent,
        addTeam,
        updateTeam,
        deleteTeam,
        generateSchedule,
        downloadSchedule,
        addAgentNote,
        removeAgentNote
      }}
    >
      {children}
    </AppContext.Provider>
  );
};