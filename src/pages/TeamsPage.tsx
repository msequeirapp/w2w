import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Team } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash, Edit } from 'lucide-react';

const TeamsPage: React.FC = () => {
  const { state, addTeam, updateTeam, deleteTeam } = useApp();
  const { t } = useLanguage();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const initialRequiredAgents = {
    0: { morning: 0, afternoon: 0, night: 0 }, // Sunday
    1: { morning: 0, afternoon: 0, night: 0 }, // Monday
    2: { morning: 0, afternoon: 0, night: 0 }, // Tuesday
    3: { morning: 0, afternoon: 0, night: 0 }, // Wednesday
    4: { morning: 0, afternoon: 0, night: 0 }, // Thursday
    5: { morning: 0, afternoon: 0, night: 0 }, // Friday
    6: { morning: 0, afternoon: 0, night: 0 }, // Saturday
  };

  const [formData, setFormData] = useState<Omit<Team, 'id'>>({
    name: '',
    requiredAgents: initialRequiredAgents,
  });

  // Reset form data when the add dialog closes
  useEffect(() => {
    if (!isAddDialogOpen && !isEditDialogOpen) {
      setFormData({
        name: '',
        requiredAgents: initialRequiredAgents,
      });
    }
  }, [isAddDialogOpen, isEditDialogOpen]);

  // Set form data when editing a team
  useEffect(() => {
    if (selectedTeam) {
      setFormData({
        name: selectedTeam.name,
        requiredAgents: { ...selectedTeam.requiredAgents },
      });
    }
  }, [selectedTeam]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRequiredAgentsChange = (
    day: number,
    shift: 'morning' | 'afternoon' | 'night',
    value: string
  ) => {
    const numValue = parseInt(value) || 0;
    setFormData((prev) => ({
      ...prev,
      requiredAgents: {
        ...prev.requiredAgents,
        [day]: {
          ...prev.requiredAgents[day],
          [shift]: numValue,
        },
      },
    }));
  };

  const handleAddTeam = () => {
    addTeam(formData);
    setIsAddDialogOpen(false);
  };

  const handleUpdateTeam = () => {
    if (selectedTeam) {
      updateTeam({ ...formData, id: selectedTeam.id });
      setIsEditDialogOpen(false);
    }
  };

  const handleDeleteTeam = (id: string) => {
    if (window.confirm(t('app.confirm'))) {
      deleteTeam(id);
    }
  };

  // Filter teams based on search term
  const filteredTeams = state.teams.filter((team) =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h1 className="text-3xl font-bold tracking-tight">{t('teams.title')}</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t('teams.add')}
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

      {filteredTeams.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">{t('teams.noTeams')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredTeams.map((team) => (
            <Card key={team.id}>
              <CardHeader>
                <CardTitle>{team.name}</CardTitle>
                <CardDescription>{t('teams.requiredAgents')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('teams.day')}</TableHead>
                      <TableHead className="text-center">{t('teams.morning')}</TableHead>
                      <TableHead className="text-center">{t('teams.afternoon')}</TableHead>
                      <TableHead className="text-center">{t('teams.night')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {weekdays.map((day) => (
                      <TableRow key={day.value}>
                        <TableCell className="font-medium">{t(day.label)}</TableCell>
                        <TableCell className="text-center">
                          {team.requiredAgents[day.value]?.morning || 0}
                        </TableCell>
                        <TableCell className="text-center">
                          {team.requiredAgents[day.value]?.afternoon || 0}
                        </TableCell>
                        <TableCell className="text-center">
                          {team.requiredAgents[day.value]?.night || 0}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedTeam(team);
                    setIsEditDialogOpen(true);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  {t('app.edit')}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteTeam(team.id)}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  {t('app.delete')}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Add Team Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t('teams.add')}</DialogTitle>
            <DialogDescription>
              {t('teams.add')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                {t('teams.name')}
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid gap-4 pt-4">
              <h3 className="text-sm font-medium">{t('teams.requiredAgents')}</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('teams.day')}</TableHead>
                    <TableHead>{t('teams.morning')}</TableHead>
                    <TableHead>{t('teams.afternoon')}</TableHead>
                    <TableHead>{t('teams.night')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {weekdays.map((day) => (
                    <TableRow key={day.value}>
                      <TableCell className="font-medium">{t(day.label)}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          value={formData.requiredAgents[day.value]?.morning || 0}
                          onChange={(e) => handleRequiredAgentsChange(day.value, 'morning', e.target.value)}
                          className="w-16 h-8"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          value={formData.requiredAgents[day.value]?.afternoon || 0}
                          onChange={(e) => handleRequiredAgentsChange(day.value, 'afternoon', e.target.value)}
                          className="w-16 h-8"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          value={formData.requiredAgents[day.value]?.night || 0}
                          onChange={(e) => handleRequiredAgentsChange(day.value, 'night', e.target.value)}
                          className="w-16 h-8"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              {t('app.cancel')}
            </Button>
            <Button type="submit" onClick={handleAddTeam} disabled={!formData.name}>
              {t('app.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Team Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t('app.edit')} {selectedTeam?.name}</DialogTitle>
            <DialogDescription>
              {t('app.edit')} {t('teams.name').toLowerCase()}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                {t('teams.name')}
              </Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid gap-4 pt-4">
              <h3 className="text-sm font-medium">{t('teams.requiredAgents')}</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('teams.day')}</TableHead>
                    <TableHead>{t('teams.morning')}</TableHead>
                    <TableHead>{t('teams.afternoon')}</TableHead>
                    <TableHead>{t('teams.night')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {weekdays.map((day) => (
                    <TableRow key={day.value}>
                      <TableCell className="font-medium">{t(day.label)}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          value={formData.requiredAgents[day.value]?.morning || 0}
                          onChange={(e) => handleRequiredAgentsChange(day.value, 'morning', e.target.value)}
                          className="w-16 h-8"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          value={formData.requiredAgents[day.value]?.afternoon || 0}
                          onChange={(e) => handleRequiredAgentsChange(day.value, 'afternoon', e.target.value)}
                          className="w-16 h-8"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          value={formData.requiredAgents[day.value]?.night || 0}
                          onChange={(e) => handleRequiredAgentsChange(day.value, 'night', e.target.value)}
                          className="w-16 h-8"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {t('app.cancel')}
            </Button>
            <Button type="submit" onClick={handleUpdateTeam} disabled={!formData.name}>
              {t('app.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamsPage;