import React from 'react';
import { Menu, Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface HeaderProps {
  currentView: string;
  setIsMobileMenuOpen: (open: boolean) => void;
  setIsSidebarOpen: (open: boolean) => void;
  isSidebarOpen: boolean;
  userProfile: any;
  user: any;
}

export const Header = ({ 
  currentView, 
  setIsMobileMenuOpen, 
  setIsSidebarOpen, 
  isSidebarOpen,
  userProfile,
  user
}: HeaderProps) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shrink-0 z-20">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu size={20} />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="hidden lg:flex"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu size={20} />
        </Button>
        <h1 className="text-lg font-semibold text-slate-900 hidden sm:block">{currentView}</h1>
      </div>

      <div className="flex items-center gap-2 lg:gap-4">
        <Button variant="ghost" size="icon" className="text-slate-500 relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-white" />
        </Button>
        <Separator orientation="vertical" className="h-8 hidden sm:block" />
        <div className="flex items-center gap-3 pl-2">
          <div className="hidden md:block text-right">
            <p className="text-sm font-medium text-slate-900 leading-none">{userProfile?.name || user?.user_metadata?.full_name || 'Usuário'}</p>
            <p className="text-xs text-slate-500 mt-1">{userProfile?.companyName || 'Minha Confeitaria'}</p>
          </div>
          <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 border border-slate-200">
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  );
};
