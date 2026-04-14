import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  ChefHat, 
  ShoppingBag, 
  DollarSign, 
  Package, 
  BookOpen, 
  Calculator, 
  Users, 
  Truck, 
  Settings,
  Loader2,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './AuthContext';
import { useAppData } from '@/hooks/useAppData';

// Layout Components
import { Sidebar } from '@/components/Layout/Sidebar';
import { Header } from '@/components/Layout/Header';

// Shared Components
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// Pages
import { DashboardPage } from '@/pages/Dashboard';
import { AgendaPage } from '@/pages/Agenda';
import { ProductionPage } from '@/pages/Production';
import { OrdersPage } from '@/pages/Orders';
import { FinancePage } from '@/pages/Finance';
import { InventoryPage } from '@/pages/Inventory';
import { RecipesPage } from '@/pages/Recipes';
import { CalculationsPage } from '@/pages/Calculations';
import { ClientsPage } from '@/pages/Clients';
import { SuppliersPage } from '@/pages/Suppliers';
import { SettingsPage } from '@/pages/Settings';
import { LoginPage } from '@/pages/Login';

type View = 
  | 'Dashboard' 
  | 'Agenda' 
  | 'Produção' 
  | 'Pedidos' 
  | 'Finanças' 
  | 'Estoque' 
  | 'Receitas' 
  | 'Calc.' 
  | 'Clientes' 
  | 'Fornec.' 
  | 'Ajustes';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard },
  { name: 'Agenda', icon: Calendar },
  { name: 'Produção', icon: ChefHat },
  { name: 'Pedidos', icon: ShoppingBag },
  { name: 'Finanças', icon: DollarSign },
  { name: 'Estoque', icon: Package },
  { name: 'Receitas', icon: BookOpen },
  { name: 'Calc.', icon: Calculator },
  { name: 'Clientes', icon: Users },
  { name: 'Fornec.', icon: Truck },
  { name: 'Ajustes', icon: Settings },
];

export default function App() {
  const { user, loading: authLoading, userProfile, setUserProfile, logout } = useAuth();
  const { 
    orders, tasks, ingredients, transactions, clients, suppliers, 
    recipes, productionColumns, calculations, loading: dataLoading,
    refresh 
  } = useAppData(user?.id);

  const [currentView, setCurrentView] = useState<View>('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F9FAFB]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const handleLogout = () => setIsLogoutDialogOpen(true);
  const confirmLogout = () => logout();

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      <Sidebar 
        isSidebarOpen={isSidebarOpen}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        currentView={currentView}
        setCurrentView={(view) => setCurrentView(view as View)}
        handleLogout={handleLogout}
        menuItems={menuItems}
      />

      <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <LogOut size={20} />
              Confirmar Saída
            </DialogTitle>
            <DialogDescription className="py-4">
              Tem certeza que deseja sair da sua conta? Você precisará fazer login novamente para acessar seus dados.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setIsLogoutDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmLogout}>
              Sair da Conta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header 
          currentView={currentView}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          isSidebarOpen={isSidebarOpen}
          userProfile={userProfile}
          user={user}
        />

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {dataLoading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="max-w-7xl mx-auto"
              >
                {currentView === 'Dashboard' && (
                  <DashboardPage 
                    orders={orders} 
                    tasks={tasks} 
                    ingredients={ingredients} 
                    transactions={transactions} 
                  />
                )}
                {currentView === 'Agenda' && <AgendaPage orders={orders} />}
                {currentView === 'Produção' && <ProductionPage tasks={tasks} columns={productionColumns} refresh={refresh} />}
                {currentView === 'Pedidos' && <OrdersPage orders={orders} refresh={refresh} />}
                {currentView === 'Finanças' && <FinancePage transactions={transactions} refresh={refresh} />}
                {currentView === 'Estoque' && <InventoryPage ingredients={ingredients} refresh={refresh} />}
                {currentView === 'Receitas' && <RecipesPage recipes={recipes} refresh={refresh} />}
                {currentView === 'Calc.' && <CalculationsPage calculations={calculations} refresh={refresh} />}
                {currentView === 'Clientes' && <ClientsPage clients={clients} refresh={refresh} />}
                {currentView === 'Fornec.' && <SuppliersPage suppliers={suppliers} refresh={refresh} />}
                {currentView === 'Ajustes' && <SettingsPage userProfile={userProfile} setUserProfile={setUserProfile} />}
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>
    </div>
  );
}
