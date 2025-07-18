import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { format, addDays, startOfWeek } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Download, RefreshCw } from 'lucide-react';
import { ScheduleEntry } from '@/types';

const SchedulePage: React.FC = () => {
  const { state, generateSchedule, downloadSchedule } = useApp();
  const { t } = useLanguage();
  const [startDate, setStartDate] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 0 }));
  const [filterTeam, setFilterTeam] = useState<string>('all');

  const handleGenerateSchedule = () => {
    generateSchedule(startDate);
  };

  const handleDownloadSchedule = () => {
    downloadSchedule();
  };

  // Create array of dates for the week
  const weekDates = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));

  // Filter schedule entries by team if a filter is selected
  const filteredSchedule = state.schedule.filter(
    (entry) => filterTeam === 'all' || entry.team === filterTeam
  );

  // Get a list of all teams from the agents for filtering
  const teams = Array.from(new Set(state.agents.map((agent) => agent.team)));

  // Helper function to get shift display
  const getShiftDisplay = (entry: ScheduleEntry, date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const shiftData = entry.shifts[dateString];
    
    if (!shiftData) return null;
    
    let badgeVariant: 'default' | 'outline' | 'secondary' | 'destructive' = 'default';
    const badgeLabel = t(`agents.${shiftData.shift}`);
    
    switch (shiftData.shift) {
      case 'morning':
        badgeVariant = 'default';
        break;
      case 'afternoon':
        badgeVariant = 'secondary';
        break;
      case 'night':
        badgeVariant = 'outline';
        break;
      case 'off':
        badgeVariant = 'destructive';
        break;
    }
    
    return (
      <Badge variant={badgeVariant} className="whitespace-nowrap">
        {badgeLabel}
        {shiftData.note && <span className="ml-1">({shiftData.note})</span>}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">{t('schedule.title')}</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] flex justify-start">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(startDate, 'PPP')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date) => date && setStartDate(startOfWeek(date, { weekStartsOn: 0 }))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          
          <Button onClick={handleGenerateSchedule} variant="default">
            <RefreshCw className="mr-2 h-4 w-4" />
            {t('schedule.generate')}
          </Button>
          
          <Button onClick={handleDownloadSchedule} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            {t('schedule.download')}
          </Button>
        </div>
      </div>
      
      <div className="flex items-center mb-6">
        <Select value={filterTeam} onValueChange={setFilterTeam}>
          <SelectTrigger className="max-w-[200px]">
            <SelectValue placeholder={t('agents.team')} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">{t('app.all')}</SelectItem>
              {teams.map((team) => (
                <SelectItem key={team} value={team}>
                  {team}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {filteredSchedule.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">{t('schedule.noSchedule')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[150px]">{t('agents.name')}</TableHead>
                <TableHead>{t('agents.team')}</TableHead>
                {weekDates.map((date) => (
                  <TableHead key={date.toString()} className="text-center">
                    <div className="flex flex-col">
                      <span>{t(`days.${format(date, 'EEEE').toLowerCase()}`)}</span>
                      <span className="text-muted-foreground text-xs">{format(date, 'MM/dd')}</span>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSchedule.map((entry) => (
                <TableRow key={entry.agentId}>
                  <TableCell className="font-medium">{entry.agentName}</TableCell>
                  <TableCell>{entry.team}</TableCell>
                  {weekDates.map((date) => (
                    <TableCell key={date.toString()} className="text-center">
                      {getShiftDisplay(entry, date)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default SchedulePage;