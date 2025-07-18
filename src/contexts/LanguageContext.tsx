import React, { createContext, useState, useContext, ReactNode } from 'react';
import { AppLanguage } from '@/types';

// English translations
const enTranslations = {
  // Common
  'app.name': 'w2w - Work Shift Scheduler',
  'app.save': 'Save',
  'app.cancel': 'Cancel',
  'app.delete': 'Delete',
  'app.edit': 'Edit',
  'app.add': 'Add',
  'app.search': 'Search',
  'app.yes': 'Yes',
  'app.no': 'No',
  'app.confirm': 'Confirm',

  // Navigation
  'nav.agents': 'Agents',
  'nav.teams': 'Teams',
  'nav.schedule': 'Schedule',
  'nav.settings': 'Settings',

  // Agents
  'agents.title': 'Agents Management',
  'agents.add': 'Add Agent',
  'agents.name': 'Name',
  'agents.team': 'Team',
  'agents.daysOff': 'Days Off',
  'agents.availability': 'Shift Availability',
  'agents.notes': 'Notes',
  'agents.noAgents': 'No agents found',
  'agents.morning': 'Morning',
  'agents.afternoon': 'Afternoon',
  'agents.night': 'Night',
  'agents.addNote': 'Add Note',
  'agents.noteDate': 'Date',
  'agents.noteText': 'Note',

  // Teams
  'teams.title': 'Teams Management',
  'teams.add': 'Add Team',
  'teams.name': 'Team Name',
  'teams.requiredAgents': 'Required Agents per Day',
  'teams.noTeams': 'No teams found',
  'teams.day': 'Day',
  'teams.morning': 'Morning',
  'teams.afternoon': 'Afternoon',
  'teams.night': 'Night',

  // Schedule
  'schedule.title': 'Schedule',
  'schedule.generate': 'Generate Schedule',
  'schedule.download': 'Download as Excel',
  'schedule.noSchedule': 'No schedule generated yet',
  'schedule.weekStarting': 'Week starting',
  'schedule.shift': 'Shift',

  // Days
  'days.sunday': 'Sunday',
  'days.monday': 'Monday',
  'days.tuesday': 'Tuesday',
  'days.wednesday': 'Wednesday',
  'days.thursday': 'Thursday',
  'days.friday': 'Friday',
  'days.saturday': 'Saturday',

  // Settings
  'settings.title': 'Settings',
  'settings.language': 'Language',
  'settings.english': 'English',
  'settings.spanish': 'Spanish',

  // Errors
  'error.required': 'This field is required',
  'error.invalidFormat': 'Invalid format',
};

// Spanish translations
const esTranslations = {
  // Common
  'app.name': 'w2w - Programador de Turnos de Trabajo',
  'app.save': 'Guardar',
  'app.cancel': 'Cancelar',
  'app.delete': 'Eliminar',
  'app.edit': 'Editar',
  'app.add': 'Añadir',
  'app.search': 'Buscar',
  'app.yes': 'Sí',
  'app.no': 'No',
  'app.confirm': 'Confirmar',

  // Navigation
  'nav.agents': 'Agentes',
  'nav.teams': 'Equipos',
  'nav.schedule': 'Horario',
  'nav.settings': 'Configuración',

  // Agents
  'agents.title': 'Gestión de Agentes',
  'agents.add': 'Añadir Agente',
  'agents.name': 'Nombre',
  'agents.team': 'Equipo',
  'agents.daysOff': 'Días Libres',
  'agents.availability': 'Disponibilidad de Turnos',
  'agents.notes': 'Notas',
  'agents.noAgents': 'No se encontraron agentes',
  'agents.morning': 'Mañana',
  'agents.afternoon': 'Tarde',
  'agents.night': 'Noche',
  'agents.addNote': 'Añadir Nota',
  'agents.noteDate': 'Fecha',
  'agents.noteText': 'Nota',

  // Teams
  'teams.title': 'Gestión de Equipos',
  'teams.add': 'Añadir Equipo',
  'teams.name': 'Nombre del Equipo',
  'teams.requiredAgents': 'Agentes Requeridos por Día',
  'teams.noTeams': 'No se encontraron equipos',
  'teams.day': 'Día',
  'teams.morning': 'Mañana',
  'teams.afternoon': 'Tarde',
  'teams.night': 'Noche',

  // Schedule
  'schedule.title': 'Horario',
  'schedule.generate': 'Generar Horario',
  'schedule.download': 'Descargar como Excel',
  'schedule.noSchedule': 'Aún no se ha generado ningún horario',
  'schedule.weekStarting': 'Semana que comienza',
  'schedule.shift': 'Turno',

  // Days
  'days.sunday': 'Domingo',
  'days.monday': 'Lunes',
  'days.tuesday': 'Martes',
  'days.wednesday': 'Miércoles',
  'days.thursday': 'Jueves',
  'days.friday': 'Viernes',
  'days.saturday': 'Sábado',

  // Settings
  'settings.title': 'Configuración',
  'settings.language': 'Idioma',
  'settings.english': 'Inglés',
  'settings.spanish': 'Español',

  // Errors
  'error.required': 'Este campo es obligatorio',
  'error.invalidFormat': 'Formato inválido',
};

interface LanguageContextType {
  language: AppLanguage;
  setLanguage: (lang: 'en' | 'es') => void;
  t: (key: string) => string;
}

const initialLanguage: AppLanguage = {
  current: 'en',
  translations: {
    en: enTranslations,
    es: esTranslations,
  },
};

const LanguageContext = createContext<LanguageContextType>({
  language: initialLanguage,
  setLanguage: () => {},
  t: () => '',
});

export const useLanguage = () => useContext(LanguageContext);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<AppLanguage>(initialLanguage);

  const setLanguage = (lang: 'en' | 'es') => {
    setLanguageState((prevState) => ({
      ...prevState,
      current: lang,
    }));

    // Save language preference to localStorage
    localStorage.setItem('w2w-language', lang);
  };

  // Translation function
  const t = (key: string): string => {
    return language.translations[language.current][key] || key;
  };

  // Initialize language from localStorage if available
  React.useEffect(() => {
    const savedLanguage = localStorage.getItem('w2w-language') as 'en' | 'es' | null;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'es')) {
      setLanguageState((prevState) => ({
        ...prevState,
        current: savedLanguage,
      }));
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};