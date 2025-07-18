import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Globe } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();

  const handleLanguageChange = (value: string) => {
    setLanguage(value as 'en' | 'es');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">{t('settings.title')}</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {t('settings.language')}
          </CardTitle>
          <CardDescription>
            {t('settings.language')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={language.current}
            onValueChange={handleLanguageChange}
            className="space-y-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="en" id="en" />
              <Label htmlFor="en">{t('settings.english')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="es" id="es" />
              <Label htmlFor="es">{t('settings.spanish')}</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;