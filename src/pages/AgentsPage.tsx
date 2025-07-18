import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Agent } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon, Plus, Trash, Edit, X } from 'lucide-react';

const AgentsPage: React.FC = () => {
  const { state, addAgent, updateAgent, deleteAgent, addAgentNote, removeAgentNote } = useApp();
  const { t } = useLanguage();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [formData, setFormData] = useState<Omit<Agent, 'id'>>({
    name: '',
    team: '',
    daysOff: [],
    notes: {},
    availability: {
      morning: true,
      afternoon: true,
      night: true,
    },
  });
  const [noteDate, setNoteDate] = useState<Date | undefined>(new Date());
  const [noteText, setNoteText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Reset form data when the add dialog closes
  useEffect(() => {
    if (!isAddDialogOpen && !isEditDialogOpen) {
      setFormData({
        name: '',
        team: '',
        daysOff: [],
        notes: {},
        availability: {
          morning: true,
          afternoon: true,
          night: true,
        },
      });
    }
  }, [isAddDialogOpen, isEditDialogOpen]);

  // Set form data when editing an agent
  useEffect(() => {
    if (selectedAgent) {
      setFormData({
        name: selectedAgent.name,
        team: selectedAgent.team,
        daysOff: [...selectedAgent.daysOff],
        notes: { ...selectedAgent.notes },
        availability: { ...selectedAgent.availability },
      });
    }
  }, [selectedAgent]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTeamChange = (value: string) => {
    setFormData((prev) => ({ ...prev, team: value }));
  };

  const handleDayOffToggle = (day: number) => {
    setFormData((prev) => {
      const daysOff = prev.daysOff.includes(day)
        ? prev.daysOff.filter((d) => d !== day)
        : [...prev.daysOff, day];
      return { ...prev, daysOff };
    });
  };

  const handleAvailabilityToggle = (shift: 'morning' | 'afternoon' | 'night') => {
    setFormData((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        [shift]: !prev.availability[shift],
      },
    }));
  };

  const handleAddAgent = () => {
    addAgent(formData);
    setIsAddDialogOpen(false);
  };

  const handleUpdateAgent = () => {
    if (selectedAgent) {
      updateAgent({ ...formData, id: selectedAgent.id });
      setIsEditDialogOpen(false);
    }
  };

  const handleDeleteAgent = (id: string) => {
    if (window.confirm(t('app.confirm'))) {
      deleteAgent(id);
    }
  };

  const handleAddNote = () => {
    if (selectedAgent && noteDate && noteText) {
      const formattedDate = format(noteDate, 'yyyy-MM-dd');
      addAgentNote(selectedAgent.id, formattedDate, noteText);
      setIsNoteDialogOpen(false);
      setNoteText('');
    }
  };

  const handleRemoveNote = (date: string) => {
    if (selectedAgent) {
      removeAgentNote(selectedAgent.id, date);
    }
  };

  // Filter agents based on search term
  const filteredAgents = state.agents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.team.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const weekdays = [
    { value: 0, label: 'days.sunday' },
    { value: 1, label: 'days.monday' },
    { value: 2, label: 'days.tuesday' },
    { value: 3, label: 'days.wednesday' },
    { value: 4, label: 'days.thursday' },
    { value: 5, label: 'days.friday' },
    { value: 6, label: 'days.saturday' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{t('agents.title')}</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t('agents.add')}
        </Button>
      </div>
      
      <div className="flex items-center mb-6">
        <Input
          placeholder={t('app.search')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {filteredAgents.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">{t('agents.noAgents')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAgents.map((agent) => (
            <Card key={agent.id}>
              <CardHeader>
                <CardTitle>{agent.name}</CardTitle>
                <CardDescription>{t('agents.team')}: {agent.team}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">{t('agents.daysOff')}:</h3>
                    <div className="flex flex-wrap gap-2">
                      {agent.daysOff.map((day) => (
                        <span key={day} className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-md">
                          {t(weekdays.find((d) => d.value === day)?.label || '')}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">{t('agents.availability')}:</h3>
                    <div className="flex flex-wrap gap-2">
                      {agent.availability.morning && (
                        <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 text-xs px-2 py-1 rounded-md">
                          {t('agents.morning')}
                        </span>
                      )}
                      {agent.availability.afternoon && (
                        <span className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300 text-xs px-2 py-1 rounded-md">
                          {t('agents.afternoon')}
                        </span>
                      )}
                      {agent.availability.night && (
                        <span className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300 text-xs px-2 py-1 rounded-md">
                          {t('agents.night')}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium">{t('agents.notes')}:</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedAgent(agent);
                          setIsNoteDialogOpen(true);
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {Object.keys(agent.notes).length > 0 ? (
                      <div className="space-y-2">
                        {Object.entries(agent.notes).map(([date, note]) => (
                          <div key={date} className="flex items-center justify-between bg-muted p-2 rounded-md">
                            <div>
                              <div className="text-xs font-medium">{date}</div>
                              <div className="text-sm">{note}</div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveNote(date)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">{t('agents.noAgents')}</p>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedAgent(agent);
                    setIsEditDialogOpen(true);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  {t('app.edit')}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteAgent(agent.id)}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  {t('app.delete')}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Add Agent Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('agents.add')}</DialogTitle>
            <DialogDescription>
              {t('agents.add')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                {t('agents.name')}
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="team" className="text-right">
                {t('agents.team')}
              </Label>
              <Select
                value={formData.team}
                onValueChange={handleTeamChange}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={t('agents.team')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {state.teams.map((team) => (
                      <SelectItem key={team.id} value={team.name}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">
                {t('agents.daysOff')}
              </Label>
              <div className="col-span-3 space-y-2">
                {weekdays.map((day) => (
                  <div key={day.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`day-${day.value}`}
                      checked={formData.daysOff.includes(day.value)}
                      onCheckedChange={() => handleDayOffToggle(day.value)}
                    />
                    <Label htmlFor={`day-${day.value}`}>{t(day.label)}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">
                {t('agents.availability')}
              </Label>
              <div className="col-span-3 space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="morning"
                    checked={formData.availability.morning}
                    onCheckedChange={() => handleAvailabilityToggle('morning')}
                  />
                  <Label htmlFor="morning">{t('agents.morning')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="afternoon"
                    checked={formData.availability.afternoon}
                    onCheckedChange={() => handleAvailabilityToggle('afternoon')}
                  />
                  <Label htmlFor="afternoon">{t('agents.afternoon')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="night"
                    checked={formData.availability.night}
                    onCheckedChange={() => handleAvailabilityToggle('night')}
                  />
                  <Label htmlFor="night">{t('agents.night')}</Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              {t('app.cancel')}
            </Button>
            <Button type="submit" onClick={handleAddAgent} disabled={!formData.name || !formData.team}>
              {t('app.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Agent Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('app.edit')} {selectedAgent?.name}</DialogTitle>
            <DialogDescription>
              {t('app.edit')} {t('agents.name').toLowerCase()}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                {t('agents.name')}
              </Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-team" className="text-right">
                {t('agents.team')}
              </Label>
              <Select
                value={formData.team}
                onValueChange={handleTeamChange}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={t('agents.team')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {state.teams.map((team) => (
                      <SelectItem key={team.id} value={team.name}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">
                {t('agents.daysOff')}
              </Label>
              <div className="col-span-3 space-y-2">
                {weekdays.map((day) => (
                  <div key={day.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-day-${day.value}`}
                      checked={formData.daysOff.includes(day.value)}
                      onCheckedChange={() => handleDayOffToggle(day.value)}
                    />
                    <Label htmlFor={`edit-day-${day.value}`}>{t(day.label)}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">
                {t('agents.availability')}
              </Label>
              <div className="col-span-3 space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-morning"
                    checked={formData.availability.morning}
                    onCheckedChange={() => handleAvailabilityToggle('morning')}
                  />
                  <Label htmlFor="edit-morning">{t('agents.morning')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-afternoon"
                    checked={formData.availability.afternoon}
                    onCheckedChange={() => handleAvailabilityToggle('afternoon')}
                  />
                  <Label htmlFor="edit-afternoon">{t('agents.afternoon')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-night"
                    checked={formData.availability.night}
                    onCheckedChange={() => handleAvailabilityToggle('night')}
                  />
                  <Label htmlFor="edit-night">{t('agents.night')}</Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {t('app.cancel')}
            </Button>
            <Button type="submit" onClick={handleUpdateAgent} disabled={!formData.name || !formData.team}>
              {t('app.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('agents.addNote')} - {selectedAgent?.name}</DialogTitle>
            <DialogDescription>
              {t('agents.addNote')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="note-date" className="text-right">
                {t('agents.noteDate')}
              </Label>
              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {noteDate ? format(noteDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={noteDate}
                      onSelect={setNoteDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="note-text" className="text-right">
                {t('agents.noteText')}
              </Label>
              <Input
                id="note-text"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNoteDialogOpen(false)}>
              {t('app.cancel')}
            </Button>
            <Button type="submit" onClick={handleAddNote} disabled={!noteDate || !noteText}>
              {t('app.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgentsPage;