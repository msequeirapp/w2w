import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NotFound from './pages/NotFound';
import Layout from './components/layout/Layout';
import AgentsPage from './pages/AgentsPage';
import TeamsPage from './pages/TeamsPage';
import SchedulePage from './pages/SchedulePage';
import SettingsPage from './pages/SettingsPage';
import { LanguageProvider } from './contexts/LanguageContext';
import { AppProvider } from './contexts/AppContext';

// Setup query client for React Query
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout><AgentsPage /></Layout>} />
              <Route path="/teams" element={<Layout><TeamsPage /></Layout>} />
              <Route path="/schedule" element={<Layout><SchedulePage /></Layout>} />
              <Route path="/settings" element={<Layout><SettingsPage /></Layout>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AppProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
