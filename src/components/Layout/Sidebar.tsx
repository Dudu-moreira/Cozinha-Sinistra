import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChefHat, LogOut, X, LayoutDashboard, Calendar, ShoppingBag, DollarSign, Package, BookOpen, Calculator, Users, Truck, PlayCircle, Settings } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isSidebarOpen: boolean;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  currentView: string;
  setCurrentView: (view: any) => void;
  handleLogout: () => void;
  menuItems: any[];
}

export const Sidebar = ({ 
  isSidebarOpen, 
  isMobileMenuOpen, 
  setIsMobileMenuOpen, 
  currentView, 
  setCurrentView, 
  handleLogout,
  menuItems 
}: SidebarProps) => {
  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 240 : 80 }}
        className="hidden lg:flex flex-col bg-white border-r border-slate-200 z-30"
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shrink-0">
            <ChefHat size={20} />
          </div>
          {isSidebarOpen && (
            <span className="font-bold text-lg tracking-tight text-slate-900 whitespace-nowrap">
              Cozinha Sinistra
            </span>
          )}
        </div>

        <ScrollArea className="flex-1 px-3">
          <nav className="space-y-1 py-4">
            {menuItems.map((item) => (
              <button
                key={item.name}
                onClick={() => setCurrentView(item.name)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-3 rounded-md transition-all duration-200 group",
                  currentView === item.name 
                    ? "bg-primary text-white shadow-md shadow-primary/20" 
                    : "text-slate-500 hover:bg-slate-50"
                )}
              >
                <item.icon size={20} className={cn(
                  "shrink-0",
                  currentView === item.name ? "text-white" : "group-hover:text-primary transition-colors"
                )} />
                {isSidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
              </button>
            ))}
          </nav>
        </ScrollArea>

        <div className="p-4 border-t">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors group"
          >
            <LogOut size={20} className="shrink-0 group-hover:text-red-600 transition-colors" />
            {isSidebarOpen && <span className="text-sm font-medium">Sair</span>}
          </button>
        </div>
      </motion.aside>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-white z-50 lg:hidden flex flex-col shadow-2xl h-full"
            >
              <div className="p-6 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
                    <ChefHat size={20} />
                  </div>
                  <span className="font-bold text-lg tracking-tight">Cozinha Sinistra</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                  <X size={20} />
                </Button>
              </div>
              <ScrollArea className="flex-1 px-3 min-h-0">
                <nav className="space-y-1 py-4">
                  {menuItems.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => {
                        setCurrentView(item.name);
                        setIsMobileMenuOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-3 rounded-md transition-colors",
                        currentView === item.name 
                          ? "bg-primary/10 text-primary" 
                          : "text-slate-500 hover:bg-slate-50"
                      )}
                    >
                      <item.icon size={20} />
                      <span className="text-base font-medium">{item.name}</span>
                    </button>
                  ))}
                </nav>
              </ScrollArea>
              <div className="p-4 border-t shrink-0">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-3 text-slate-500"
                >
                  <LogOut size={20} />
                  <span className="text-base font-medium">Sair</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
