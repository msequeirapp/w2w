import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

export function Navbar() {
  const { t, language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language.current === 'en' ? 'es' : 'en');
  };

  const navItems = [
    { href: "/", label: "nav.agents" },
    { href: "/teams", label: "nav.teams" },
    { href: "/schedule", label: "nav.schedule" },
    { href: "/settings", label: "nav.settings" },
  ];

  return (
    <header className="border-b bg-background sticky top-0 z-10">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 md:gap-4">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="grid gap-4 py-4">
                <h2 className="text-lg font-bold">{t('app.name')}</h2>
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="flex items-center text-lg font-semibold px-4 py-2 hover:bg-accent rounded-md"
                    onClick={() => setOpen(false)}
                  >
                    {t(item.label)}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>

          <Link to="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">w2w</span>
          </Link>

          <nav className="hidden md:flex gap-6 ml-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                {t(item.label)}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleLanguage}
            className="text-sm font-medium"
          >
            {language.current === 'en' ? 'ES' : 'EN'}
          </Button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;