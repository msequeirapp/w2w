import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
      <h1 className="text-7xl font-bold mb-4">404</h1>
      <h2 className="text-2xl font-medium mb-6">Page not found</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        The page you are looking for does not exist or has been moved.
      </p>
      <Button asChild>
        <Link to="/">Go back home</Link>
      </Button>
    </div>
  );
};

export default NotFound;