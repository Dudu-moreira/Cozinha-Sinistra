import React, { useState, useEffect, FormEvent } from 'react';
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
  PlayCircle, 
  Settings,
  Menu,
  X,
  Bell,
  Plus,
  LogOut,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  TrendingUp,
  AlertCircle,
  Loader2,
  Globe,
  Lock,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { MoreVertical, Edit2, Trash2, CheckCircle2, Clock } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { supabase } from './lib/supabase';
import { db as api } from './lib/db';
import { useAuth } from './AuthContext';
import { Order, Task, Ingredient, Transaction, OrderStatus, ProductionColumn, Calculation } from './types';

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
  | 'Tutoriais' 
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
  { name: 'Tutoriais', icon: PlayCircle },
  { name: 'Ajustes', icon: Settings },
];

export default function App() {
  const { user, loading, userProfile, logout } = useAuth();
  const [currentView, setCurrentView] = useState<View>('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  // Data states
  const [orders, setOrders] = useState<Order[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [productionColumns, setProductionColumns] = useState<ProductionColumn[]>([]);
  const [calculations, setCalculations] = useState<Calculation[]>([]);

  // Real-time listeners
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const [
        { data: ordersData },
        { data: tasksData },
        { data: ingredientsData },
        { data: transactionsData },
        { data: clientsData },
        { data: suppliersData },
        { data: recipesData },
        { data: columnsData },
        { data: calculationsData }
      ] = await Promise.all([
        api.getOrders(user.id),
        api.getTasks(user.id),
        api.getIngredients(user.id),
        api.getTransactions(user.id),
        api.getClients(user.id),
        api.getSuppliers(user.id),
        api.getRecipes(user.id),
        api.getProductionColumns(user.id),
        api.getCalculations(user.id)
      ]);

      if (ordersData) setOrders(ordersData as any);
      if (tasksData) setTasks(tasksData as any);
      if (ingredientsData) setIngredients(ingredientsData as any);
      if (transactionsData) setTransactions(transactionsData as any);
      if (clientsData) setClients(clientsData as any);
      if (suppliersData) setSuppliers(suppliersData as any);
      if (recipesData) setRecipes(recipesData as any);
      if (calculationsData) setCalculations(calculationsData as any);

      if (columnsData && columnsData.length > 0) {
        setProductionColumns(columnsData as any);
      } else if (columnsData && columnsData.length === 0) {
        // Create default columns
        const defaults = [
          { name: 'A fazer', order: 0, user_id: user.id },
          { name: 'Em andamento', order: 1, user_id: user.id },
          { name: 'Finalizado', order: 2, user_id: user.id }
        ];
        const { data: newCols } = await supabase.from('production_columns').insert(defaults).select();
        if (newCols) setProductionColumns(newCols as any);
      }
    };

    fetchData();

    // Set up real-time subscriptions
    const channels = [
      supabase.channel('orders').on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `user_id=eq.${user.id}` }, fetchData),
      supabase.channel('tasks').on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${user.id}` }, fetchData),
      supabase.channel('ingredients').on('postgres_changes', { event: '*', schema: 'public', table: 'ingredients', filter: `user_id=eq.${user.id}` }, fetchData),
      supabase.channel('transactions').on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${user.id}` }, fetchData),
      supabase.channel('clients').on('postgres_changes', { event: '*', schema: 'public', table: 'clients', filter: `user_id=eq.${user.id}` }, fetchData),
      supabase.channel('suppliers').on('postgres_changes', { event: '*', schema: 'public', table: 'suppliers', filter: `user_id=eq.${user.id}` }, fetchData),
      supabase.channel('recipes').on('postgres_changes', { event: '*', schema: 'public', table: 'recipes', filter: `user_id=eq.${user.id}` }, fetchData),
      supabase.channel('production_columns').on('postgres_changes', { event: '*', schema: 'public', table: 'production_columns', filter: `user_id=eq.${user.id}` }, fetchData),
      supabase.channel('calculations').on('postgres_changes', { event: '*', schema: 'public', table: 'calculations', filter: `user_id=eq.${user.id}` }, fetchData),
    ];

    channels.forEach(channel => channel.subscribe());

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [user]);

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

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F9FAFB]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  const handleLogout = () => setIsLogoutDialogOpen(true);
  const confirmLogout = () => logout();

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
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
                onClick={() => setCurrentView(item.name as View)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors group",
                  currentView === item.name 
                    ? "bg-primary/10 text-primary" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon size={20} className={cn(
                  "shrink-0",
                  currentView === item.name ? "text-primary" : "text-slate-400 group-hover:text-slate-600"
                )} />
                {isSidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
              </button>
            ))}
          </nav>
        </ScrollArea>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-red-600 transition-colors"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="text-sm font-medium">Sair</span>}
          </button>
        </div>
      </motion.aside>

      {/* Mobile Sidebar (Sheet) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
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
                        setCurrentView(item.name as View);
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
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
            <h1 className="text-lg font-semibold text-slate-900">{currentView}</h1>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            <Separator orientation="vertical" className="h-8 hidden sm:block" />
            <div className="flex items-center gap-3 pl-2">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-slate-900 leading-none">{userProfile?.name || user.user_metadata?.full_name || 'Usuário'}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs overflow-hidden">
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="Avatar" referrerPolicy="no-referrer" />
                ) : (
                  (userProfile?.name || user.user_metadata?.full_name || 'U').charAt(0)
                )}
              </div>
            </div>
          </div>
        </header>

        {/* View Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-7xl mx-auto"
            >
              {currentView === 'Dashboard' && <DashboardView orders={orders} tasks={tasks} ingredients={ingredients} setCurrentView={setCurrentView} />}
              {currentView === 'Pedidos' && <OrdersView orders={orders} />}
              {currentView === 'Produção' && <ProductionView tasks={tasks} columns={productionColumns} />}
              {currentView === 'Estoque' && <InventoryView ingredients={ingredients} />}
              {currentView === 'Finanças' && <FinancesView transactions={transactions} />}
              {currentView === 'Receitas' && <RecipesView recipes={recipes} />}
              {currentView === 'Calc.' && <CalculatorView calculations={calculations} />}
              {currentView === 'Clientes' && <ClientsView clients={clients} />}
              {currentView === 'Agenda' && <AgendaView orders={orders} />}
              {currentView === 'Tutoriais' && <TutorialsView />}
              {currentView === 'Ajustes' && <SettingsView />}
              {currentView === 'Fornec.' && <SuppliersView suppliers={suppliers} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function LoginScreen() {
  const { login, signUp, signInWithGoogle } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsProcessing(true);
    
    if (isSignUp) {
      const { success, error: signUpError } = await signUp(email, password, name);
      if (!success) {
        setError(signUpError || 'Erro ao criar conta.');
        setIsProcessing(false);
      }
    } else {
      const { success, error: loginError } = await login(email, password);
      if (!success) {
        setError(loginError || 'E-mail ou senha incorretos.');
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-primary/20">
            <ChefHat size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Cozinha Sinistra</h1>
          <p className="text-slate-500 mt-2 text-center">Gestão profissional para sua produção artesanal</p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
          <button 
            onClick={() => setIsSignUp(false)}
            className={cn(
              "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
              !isSignUp ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Entrar
          </button>
          <button 
            onClick={() => setIsSignUp(true)}
            className={cn(
              "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
              isSignUp ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Cadastrar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Nome Completo</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                placeholder="Seu nome"
                required
              />
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">E-mail</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              placeholder="seu@email.com"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Senha</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              placeholder="Sua senha"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 font-medium text-center">{error}</p>
          )}

          <Button 
            type="submit"
            disabled={isProcessing}
            className="w-full py-6 rounded-xl text-lg font-semibold bg-primary hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3"
          >
            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : (isSignUp ? 'Criar Minha Conta' : 'Entrar no Sistema')}
          </Button>
        </form>

        <div className="mt-6">
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-100"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400">Ou continuar com</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            onClick={signInWithGoogle}
            className="w-full py-6 rounded-xl border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
          >
            <Globe size={20} className="text-slate-400" />
            Google
          </Button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-4 items-center">
          <p className="text-sm text-slate-500">
            Dúvidas? <button className="text-primary font-bold hover:underline">Fale com o suporte</button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function DeleteConfirmDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Excluir Item", 
  description = "Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita." 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onConfirm: () => void, 
  title?: string, 
  description?: string 
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle size={20} />
            {title}
          </DialogTitle>
          <DialogDescription className="py-4">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button variant="ghost" onClick={onClose} className="flex-1 sm:flex-none">Cancelar</Button>
          <Button variant="destructive" onClick={() => { onConfirm(); onClose(); }} className="flex-1 sm:flex-none">Excluir</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: { 
  currentPage: number, 
  totalPages: number, 
  onPageChange: (page: number) => void 
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-slate-100 sm:px-6">
      <div className="flex justify-between flex-1 sm:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Próximo
        </Button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-700">
            Página <span className="font-bold">{currentPage}</span> de <span className="font-bold">{totalPages}</span>
          </p>
        </div>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
          >
            <ChevronsLeft size={16} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={16} />
          </Button>
          
          <div className="flex items-center px-2">
            <span className="text-sm font-medium text-slate-600">{currentPage}</span>
          </div>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight size={16} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            <ChevronsRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}

function DashboardView({ orders, tasks, ingredients, setCurrentView }: { orders: Order[], tasks: Task[], ingredients: Ingredient[], setCurrentView: (view: View) => void }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const paginatedOrders = orders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Generate real chart data from last 7 days
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const chartData = last7Days.map(date => {
    const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
    const dayOrders = orders.filter(o => {
      const orderDate = new Date(o.createdAt);
      return orderDate.getDate() === date.getDate() && 
             orderDate.getMonth() === date.getMonth() &&
             orderDate.getFullYear() === date.getFullYear();
    });
    const total = dayOrders.reduce((acc, curr) => acc + curr.value, 0);
    return { name: dayName.charAt(0).toUpperCase() + dayName.slice(1), valor: total };
  });

  const totalRevenue = orders.reduce((acc, curr) => acc + curr.value, 0);
  const activeOrders = orders.filter(o => o.status !== 'Entregue' && o.status !== 'Cancelado').length;
  
  // Estimate unique clients from orders
  const uniqueClients = new Set(orders.map(o => o.clientName)).size;

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {[
          { title: 'Faturamento Total', value: `R$ ${totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { title: 'Lucro Estimado (40%)', value: `R$ ${(totalRevenue * 0.4).toFixed(2)}`, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
          { title: 'Pedidos Ativos', value: activeOrders.toString(), icon: ShoppingBag, color: 'text-orange-600', bg: 'bg-orange-50' },
          { title: 'Total de Clientes', value: uniqueClients.toString(), icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("p-2 rounded-lg", stat.bg)}>
                  <stat.icon className={cn("w-5 h-5", stat.color)} />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Faturamento Semanal</CardTitle>
            <CardDescription>Desempenho dos últimos 7 dias baseado em pedidos</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] pl-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="valor" fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Alerts & Tasks */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="text-orange-500 w-5 h-5" />
                Alertas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {ingredients.filter(i => i.quantity <= i.minQuantity).slice(0, 2).map(ing => (
                <div key={ing.id} className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-100">
                  <Package className="text-red-600 w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-red-900">Estoque Baixo</p>
                    <p className="text-xs text-red-700">{ing.name} está com apenas {ing.quantity}{ing.unit}.</p>
                  </div>
                </div>
              ))}
              {ingredients.filter(i => i.quantity <= i.minQuantity).length === 0 && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                  <CheckCircle2 className="text-emerald-600 w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-emerald-900">Tudo em ordem</p>
                    <p className="text-xs text-emerald-700">Seu estoque está abastecido.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Produção Hoje</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.slice(0, 3).map((task) => (
                  <div key={task.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        task.status === 'Finalizado' ? "bg-emerald-500" : "bg-orange-500"
                      )} />
                      <span className="text-sm text-slate-700 font-medium">{task.title}</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                      {task.status}
                    </Badge>
                  </div>
                ))}
                {tasks.length === 0 && <p className="text-sm text-slate-400 text-center py-4">Nenhuma tarefa para hoje</p>}
              </div>
              <Button 
                variant="ghost" 
                className="w-full mt-4 text-primary text-sm font-bold"
                onClick={() => setCurrentView('Produção')}
              >
                Ver Produção Completa
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Orders */}
      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Pedidos Recentes</CardTitle>
            <CardDescription>Últimas encomendas recebidas</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => setCurrentView('Pedidos')}>Ver Todos</Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-4 font-semibold text-slate-500 text-sm">Cliente</th>
                  <th className="pb-4 font-semibold text-slate-500 text-sm">Produto</th>
                  <th className="pb-4 font-semibold text-slate-500 text-sm">Entrega</th>
                  <th className="pb-4 font-semibold text-slate-500 text-sm">Status</th>
                  <th className="pb-4 font-semibold text-slate-500 text-sm text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedOrders.map((order) => (
                  <tr key={order.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 text-sm font-medium text-slate-900">{order.clientName}</td>
                    <td className="py-4 text-sm text-slate-600">{order.product}</td>
                    <td className="py-4 text-sm text-slate-600">{new Date(order.deliveryDate).toLocaleDateString()}</td>
                    <td className="py-4">
                      <Badge className={cn(
                        "font-medium",
                        order.status === 'Pendente' && "bg-orange-100 text-orange-700 hover:bg-orange-100",
                        order.status === 'Em Produção' && "bg-blue-100 text-blue-700 hover:bg-blue-100",
                        order.status === 'Finalizado' && "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                      )}>
                        {order.status}
                      </Badge>
                    </td>
                    <td className="py-4 text-sm font-bold text-slate-900 text-right">R$ {order.value.toFixed(2)}</td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">Nenhum pedido encontrado</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage} 
          />
        </CardContent>
      </Card>
    </div>
  );
}

function OrdersView({ orders }: { orders: Order[] }) {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const paginatedOrders = orders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [formData, setFormData] = useState({
    clientName: '',
    product: '',
    deliveryDate: '',
    status: 'Pendente' as OrderStatus,
    value: ''
  });

  useEffect(() => {
    if (editingOrder) {
      setFormData({
        clientName: editingOrder.clientName,
        product: editingOrder.product,
        deliveryDate: editingOrder.deliveryDate.split('T')[0],
        status: editingOrder.status,
        value: editingOrder.value.toString()
      });
    } else {
      setFormData({
        clientName: '',
        product: '',
        deliveryDate: new Date().toISOString().split('T')[0],
        status: 'Pendente',
        value: ''
      });
    }
  }, [editingOrder, isModalOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const data = {
      clientName: formData.clientName,
      product: formData.product,
      deliveryDate: new Date(formData.deliveryDate).toISOString(),
      status: formData.status,
      value: parseFloat(formData.value) || 0,
      userId: user.id
    };

    try {
      if (editingOrder) {
        await api.updateOrder(editingOrder.id, data);
      } else {
        await api.addOrder(data);
      }
      setIsModalOpen(false);
      setEditingOrder(null);
    } catch (err) {
      console.error("Error saving order:", err);
    }
  };

  const handleDelete = async () => {
    if (!user || !orderToDelete) return;
    try {
      await api.deleteOrder(orderToDelete);
      setOrderToDelete(null);
    } catch (err) {
      console.error("Error deleting order:", err);
    }
  };

  return (
    <div className="space-y-6">
      <DeleteConfirmDialog 
        isOpen={isDeleteDialogOpen} 
        onClose={() => setIsDeleteDialogOpen(false)} 
        onConfirm={handleDelete}
        title="Excluir Pedido"
        description="Tem certeza que deseja excluir este pedido? Esta ação não pode ser desfeita."
      />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gerenciar Pedidos</h2>
          <p className="text-slate-500">Visualize e controle todas as suas encomendas</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setEditingOrder(null);
        }}>
          <DialogTrigger render={
            <Button className="bg-primary hover:bg-primary/90 gap-2">
              <Plus size={18} />
              Novo Pedido
            </Button>
          } />
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingOrder ? 'Editar Pedido' : 'Novo Pedido'}</DialogTitle>
              <DialogDescription>
                Preencha os detalhes da encomenda abaixo.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="client">Cliente</Label>
                <Input 
                  id="client" 
                  value={formData.clientName} 
                  onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                  placeholder="Nome do cliente"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product">Produto</Label>
                <Input 
                  id="product" 
                  value={formData.product} 
                  onChange={(e) => setFormData({...formData, product: e.target.value})}
                  placeholder="Ex: Bolo de Chocolate"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Data de Entrega</Label>
                  <Input 
                    id="date" 
                    type="date"
                    value={formData.deliveryDate} 
                    onChange={(e) => setFormData({...formData, deliveryDate: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value">Valor (R$)</Label>
                  <Input 
                    id="value" 
                    type="number"
                    step="0.01"
                    value={formData.value} 
                    onChange={(e) => setFormData({...formData, value: e.target.value})}
                    placeholder="0,00"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value: OrderStatus) => setFormData({...formData, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                    <SelectItem value="Em Produção">Em Produção</SelectItem>
                    <SelectItem value="Finalizado">Finalizado</SelectItem>
                    <SelectItem value="Entregue">Entregue</SelectItem>
                    <SelectItem value="Cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter className="pt-4">
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                  {editingOrder ? 'Salvar Alterações' : 'Criar Pedido'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:hidden">
        {paginatedOrders.map((order) => (
          <Card key={order.id} className="border-none shadow-sm">
            <CardContent className="p-4 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-900">{order.clientName}</h3>
                  <p className="text-sm text-slate-500">{order.product}</p>
                </div>
                <Badge className={cn(
                  order.status === 'Pendente' && "bg-orange-100 text-orange-700",
                  order.status === 'Em Produção' && "bg-blue-100 text-blue-700",
                  order.status === 'Finalizado' && "bg-emerald-100 text-emerald-700",
                  order.status === 'Entregue' && "bg-slate-100 text-slate-700",
                  order.status === 'Cancelado' && "bg-red-100 text-red-700"
                )}>{order.status}</Badge>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                <div className="text-xs text-slate-500">
                  Entrega: <span className="font-medium text-slate-700">{new Date(order.deliveryDate).toLocaleDateString()}</span>
                </div>
                <div className="font-bold text-primary">R$ {order.value.toFixed(2)}</div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => {
                  setEditingOrder(order);
                  setIsModalOpen(true);
                }}>Editar</Button>
                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => {
                  setOrderToDelete(order.id);
                  setIsDeleteDialogOpen(true);
                }}>
                  <Trash2 size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="hidden lg:block border-none shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="p-4 font-semibold text-slate-600 text-sm">ID</th>
                <th className="p-4 font-semibold text-slate-600 text-sm">Cliente</th>
                <th className="p-4 font-semibold text-slate-600 text-sm">Produto</th>
                <th className="p-4 font-semibold text-slate-600 text-sm">Entrega</th>
                <th className="p-4 font-semibold text-slate-600 text-sm">Status</th>
                <th className="p-4 font-semibold text-slate-600 text-sm">Valor</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-4 text-sm text-slate-400 font-mono">#{order.id.slice(0, 5)}</td>
                  <td className="p-4 text-sm font-medium text-slate-900">{order.clientName}</td>
                  <td className="p-4 text-sm text-slate-600">{order.product}</td>
                  <td className="p-4 text-sm text-slate-600">{new Date(order.deliveryDate).toLocaleDateString()}</td>
                  <td className="p-4">
                    <Badge variant="secondary" className={cn(
                      "font-medium",
                      order.status === 'Pendente' && "bg-orange-100 text-orange-700",
                      order.status === 'Em Produção' && "bg-blue-100 text-blue-700",
                      order.status === 'Finalizado' && "bg-emerald-100 text-emerald-700",
                      order.status === 'Entregue' && "bg-slate-100 text-slate-700",
                      order.status === 'Cancelado' && "bg-red-100 text-red-700"
                    )}>
                      {order.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-sm font-bold text-slate-900">R$ {order.value.toFixed(2)}</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" onClick={() => {
                        setEditingOrder(order);
                        setIsModalOpen(true);
                      }}>
                        <Edit2 size={16} className="text-slate-400 hover:text-primary" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => {
                        setOrderToDelete(order.id);
                        setIsDeleteDialogOpen(true);
                      }}>
                        <Trash2 size={16} className="text-slate-400 hover:text-red-600" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">Nenhum pedido cadastrado</td>
                </tr>
              )}
            </tbody>
          </table>
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage} 
          />
        </CardContent>
      </Card>
    </div>
  );
}

function ProductionView({ tasks, columns }: { tasks: Task[], columns: ProductionColumn[] }) {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    status: '',
    dueDate: ''
  });

  // Column management state
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [isColumnDeleteDialogOpen, setIsColumnDeleteDialogOpen] = useState(false);
  const [columnToDelete, setColumnToDelete] = useState<string | null>(null);
  const [editingColumn, setEditingColumn] = useState<ProductionColumn | null>(null);
  const [columnFormData, setColumnFormData] = useState({
    name: '',
    order: 0
  });

  useEffect(() => {
    if (editingTask) {
      setFormData({
        title: editingTask.title,
        status: editingTask.status,
        dueDate: editingTask.dueDate.split('T')[0]
      });
    } else {
      setFormData({
        title: '',
        status: columns[0]?.name || '',
        dueDate: new Date().toISOString().split('T')[0]
      });
    }
  }, [editingTask, isModalOpen, columns]);

  useEffect(() => {
    if (editingColumn) {
      setColumnFormData({
        name: editingColumn.name,
        order: editingColumn.order
      });
    } else {
      setColumnFormData({
        name: '',
        order: columns.length
      });
    }
  }, [editingColumn, isColumnModalOpen, columns.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const data = {
      title: formData.title,
      status: formData.status,
      dueDate: new Date(formData.dueDate).toISOString(),
      userId: user.id
    };

    try {
      if (editingTask) {
        await api.updateTask(editingTask.id, data);
      } else {
        await api.addTask(data);
      }
      setIsModalOpen(false);
      setEditingTask(null);
    } catch (err) {
      console.error("Error saving task:", err);
    }
  };

  const handleColumnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const data = {
      name: columnFormData.name,
      order: columnFormData.order,
      userId: user.id
    };

    try {
      if (editingColumn) {
        await api.updateProductionColumn(editingColumn.id, data);
      } else {
        await api.addProductionColumn(data);
      }
      setIsColumnModalOpen(false);
      setEditingColumn(null);
    } catch (err) {
      console.error("Error saving column:", err);
    }
  };

  const updateTaskStatus = async (id: string, newStatus: string) => {
    if (!user) return;
    try {
      await api.updateTask(id, { status: newStatus });
    } catch (err) {
      console.error("Error updating task status:", err);
    }
  };

  const handleDelete = async () => {
    if (!user || !taskToDelete) return;
    try {
      await api.deleteTask(taskToDelete);
      setTaskToDelete(null);
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  const handleColumnDelete = async () => {
    if (!user || !columnToDelete) return;
    try {
      await api.deleteProductionColumn(columnToDelete);
      setColumnToDelete(null);
    } catch (err) {
      console.error("Error deleting column:", err);
    }
  };

  return (
    <div className="space-y-6">
      <DeleteConfirmDialog 
        isOpen={isDeleteDialogOpen} 
        onClose={() => setIsDeleteDialogOpen(false)} 
        onConfirm={handleDelete}
        title="Excluir Tarefa"
        description="Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita."
      />
      <DeleteConfirmDialog 
        isOpen={isColumnDeleteDialogOpen} 
        onClose={() => setIsColumnDeleteDialogOpen(false)} 
        onConfirm={handleColumnDelete}
        title="Excluir Coluna"
        description="Tem certeza que deseja excluir esta coluna? As tarefas nesta coluna ficarão sem status visível."
      />
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Linha de Produção</h2>
          <p className="text-slate-500">Acompanhe o status de cada etapa da produção</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isColumnModalOpen} onOpenChange={(open) => {
            setIsColumnModalOpen(open);
            if (!open) setEditingColumn(null);
          }}>
            <DialogTrigger render={
              <Button variant="outline" className="gap-2">
                <Plus size={18} />
                Nova Coluna
              </Button>
            } />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingColumn ? 'Editar Coluna' : 'Nova Coluna'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleColumnSubmit} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nome da Coluna</Label>
                  <Input 
                    value={columnFormData.name} 
                    onChange={(e) => setColumnFormData({...columnFormData, name: e.target.value})}
                    placeholder="Ex: Embalagem"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ordem de Exibição</Label>
                  <Input 
                    type="number"
                    value={columnFormData.order} 
                    onChange={(e) => setColumnFormData({...columnFormData, order: parseInt(e.target.value) || 0})}
                    required
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90">{editingColumn ? 'Salvar' : 'Criar'}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isModalOpen} onOpenChange={(open) => {
            setIsModalOpen(open);
            if (!open) setEditingTask(null);
          }}>
            <DialogTrigger render={
              <Button className="bg-primary hover:bg-primary/90 gap-2">
                <Plus size={18} />
                Nova Tarefa
              </Button>
            } />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Título da Tarefa</Label>
                  <Input 
                    value={formData.title} 
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Ex: Assar bolos de chocolate"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data Limite</Label>
                    <Input 
                      type="date"
                      value={formData.dueDate} 
                      onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status Inicial</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(val: any) => setFormData({...formData, status: val})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {columns.map(col => (
                          <SelectItem key={col.id} value={col.name}>{col.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90">{editingTask ? 'Salvar' : 'Criar'}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
        {columns.map((column) => (
          <div key={column.id} className="min-w-[300px] w-[300px] space-y-4 shrink-0">
            <div className="flex items-center justify-between px-2 group/header">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-600 uppercase text-xs tracking-widest">{column.name}</h3>
                <div className="opacity-0 group-hover/header:opacity-100 transition-opacity flex gap-1">
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
                    setEditingColumn(column);
                    setIsColumnModalOpen(true);
                  }}>
                    <Edit2 size={12} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-600" onClick={() => {
                    setColumnToDelete(column.id);
                    setIsColumnDeleteDialogOpen(true);
                  }}>
                    <Trash2 size={12} />
                  </Button>
                </div>
              </div>
              <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                {tasks.filter(t => t.status === column.name).length}
              </span>
            </div>
            <div className="space-y-3 min-h-[200px] p-2 bg-slate-100/50 rounded-xl border border-dashed border-slate-200">
              {tasks.filter(t => t.status === column.name).map((task) => (
                <Card key={task.id} className="border-none shadow-sm hover:shadow-md transition-shadow group">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm font-medium text-slate-900">{task.title}</p>
                      <DropdownMenu>
                        <DropdownMenuTrigger render={
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical size={14} />
                          </Button>
                        } />
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setEditingTask(task);
                            setIsModalOpen(true);
                          }}>
                            <Edit2 size={14} className="mr-2" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => {
                            setTaskToDelete(task.id);
                            setIsDeleteDialogOpen(true);
                          }}>
                            <Trash2 size={14} className="mr-2" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                        <Calendar size={12} />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                      <div className="flex gap-1">
                        {columns.indexOf(column) > 0 && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 text-slate-400 hover:text-primary"
                            onClick={() => updateTaskStatus(task.id, columns[columns.indexOf(column) - 1].name)}
                          >
                            <ChevronLeft size={14} />
                          </Button>
                        )}
                        {columns.indexOf(column) < columns.length - 1 && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 text-slate-400 hover:text-primary"
                            onClick={() => updateTaskStatus(task.id, columns[columns.indexOf(column) + 1].name)}
                          >
                            <ChevronRight size={14} />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {tasks.filter(t => t.status === column.name).length === 0 && (
                <div className="h-24 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg">
                  <p className="text-xs text-slate-400">Sem tarefas</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InventoryView({ ingredients }: { ingredients: Ingredient[] }) {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(ingredients.length / itemsPerPage);
  const paginatedIngredients = ingredients.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<Ingredient | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    unit: '',
    minQuantity: ''
  });

  useEffect(() => {
    if (editingItem) {
      setFormData({
        name: editingItem.name,
        quantity: editingItem.quantity.toString(),
        unit: editingItem.unit,
        minQuantity: editingItem.minQuantity.toString()
      });
    } else {
      setFormData({
        name: '',
        quantity: '',
        unit: 'kg',
        minQuantity: ''
      });
    }
  }, [editingItem, isModalOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const data = {
      name: formData.name,
      quantity: parseFloat(formData.quantity) || 0,
      unit: formData.unit,
      minQuantity: parseFloat(formData.minQuantity) || 0,
      userId: user.id
    };

    try {
      if (editingItem) {
        await api.updateIngredient(editingItem.id, data);
      } else {
        await api.addIngredient(data);
      }
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      console.error("Error saving ingredient:", err);
    }
  };

  const handleDelete = async () => {
    if (!user || !itemToDelete) return;
    try {
      await api.deleteIngredient(itemToDelete);
      setItemToDelete(null);
    } catch (err) {
      console.error("Error deleting ingredient:", err);
    }
  };

  return (
    <div className="space-y-6">
      <DeleteConfirmDialog 
        isOpen={isDeleteDialogOpen} 
        onClose={() => setIsDeleteDialogOpen(false)} 
        onConfirm={handleDelete}
        title="Excluir Ingrediente"
        description="Tem certeza que deseja excluir este ingrediente do estoque? Esta ação não pode ser desfeita."
      />
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Estoque de Insumos</h2>
          <p className="text-slate-500">Controle a quantidade de ingredientes e materiais</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setEditingItem(null);
        }}>
          <DialogTrigger render={
            <Button className="bg-primary hover:bg-primary/90 gap-2">
              <Plus size={18} />
              Novo Item
            </Button>
          } />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Editar Item' : 'Novo Item'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome do Ingrediente</Label>
                <Input 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: Farinha de Trigo"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Quantidade Atual</Label>
                  <Input 
                    type="number"
                    step="0.001"
                    value={formData.quantity} 
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    placeholder="0.000"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unidade</Label>
                  <Select 
                    value={formData.unit} 
                    onValueChange={(val) => setFormData({...formData, unit: val})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">Quilograma (kg)</SelectItem>
                      <SelectItem value="g">Grama (g)</SelectItem>
                      <SelectItem value="L">Litro (L)</SelectItem>
                      <SelectItem value="ml">Mililitro (ml)</SelectItem>
                      <SelectItem value="unid">Unidade (unid)</SelectItem>
                      <SelectItem value="cx">Caixa (cx)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Quantidade Mínima (Alerta)</Label>
                <Input 
                  type="number"
                  step="0.001"
                  value={formData.minQuantity} 
                  onChange={(e) => setFormData({...formData, minQuantity: e.target.value})}
                  placeholder="Ex: 1.000"
                  required
                />
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90">{editingItem ? 'Salvar' : 'Criar'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="p-4 font-semibold text-slate-600 text-sm">Ingrediente</th>
                <th className="p-4 font-semibold text-slate-600 text-sm">Quantidade</th>
                <th className="p-4 font-semibold text-slate-600 text-sm">Unidade</th>
                <th className="p-4 font-semibold text-slate-600 text-sm">Status</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedIngredients.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-4 text-sm font-medium text-slate-900">{item.name}</td>
                  <td className="p-4 text-sm text-slate-600 font-mono">{item.quantity}</td>
                  <td className="p-4 text-sm text-slate-600">{item.unit}</td>
                  <td className="p-4">
                    {item.quantity <= item.minQuantity ? (
                      <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Baixo</Badge>
                    ) : (
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">OK</Badge>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" onClick={() => {
                        setEditingItem(item);
                        setIsModalOpen(true);
                      }}>
                        <Edit2 size={16} className="text-slate-400 hover:text-primary" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => {
                        setItemToDelete(item.id);
                        setIsDeleteDialogOpen(true);
                      }}>
                        <Trash2 size={16} className="text-slate-400 hover:text-red-600" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {ingredients.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">Nenhum ingrediente em estoque</td>
                </tr>
              )}
            </tbody>
          </table>
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage} 
          />
        </CardContent>
      </Card>
    </div>
  );
}

function FinancesView({ transactions }: { transactions: Transaction[] }) {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const paginatedTransactions = transactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'Entrada',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });

  const income = transactions.filter(t => t.type === 'Entrada').reduce((acc, curr) => acc + curr.amount, 0);
  const expenses = transactions.filter(t => t.type === 'Saída').reduce((acc, curr) => acc + curr.amount, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await api.addTransaction({
        description: formData.description,
        amount: parseFloat(formData.amount),
        type: formData.type,
        category: formData.category,
        date: formData.date,
        userId: user.id
      });
      setIsModalOpen(false);
      setFormData({
        description: '',
        amount: '',
        type: 'Entrada',
        category: '',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      console.error("Error saving transaction:", err);
    }
  };

  const handleDelete = async () => {
    if (!user || !transactionToDelete) return;
    try {
      await api.deleteTransaction(transactionToDelete);
      setTransactionToDelete(null);
    } catch (err) {
      console.error("Error deleting transaction:", err);
    }
  };

  return (
    <div className="space-y-6">
      <DeleteConfirmDialog 
        isOpen={isDeleteDialogOpen} 
        onClose={() => setIsDeleteDialogOpen(false)} 
        onConfirm={handleDelete}
        title="Excluir Transação"
        description="Tem certeza que deseja excluir este registro financeiro? Esta ação não pode ser desfeita."
      />
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Gestão Financeira</h2>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger render={
            <Button className="bg-primary hover:bg-primary/90 gap-2">
              <Plus size={18} />
              Nova Transação
            </Button>
          } />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Transação</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Ex: Venda Bolo de Chocolate"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valor (R$)</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={formData.amount} 
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    placeholder="0,00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(val: any) => setFormData({...formData, type: val})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Entrada">Entrada</SelectItem>
                      <SelectItem value="Saída">Saída</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Input 
                    value={formData.category} 
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    placeholder="Ex: Vendas, Insumos..."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input 
                    type="date"
                    value={formData.date} 
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90">Registrar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm bg-emerald-500 text-white">
          <CardContent className="p-6">
            <p className="text-emerald-100 text-sm font-medium">Entradas (Mês)</p>
            <h3 className="text-3xl font-bold mt-1">R$ {income.toFixed(2)}</h3>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-red-500 text-white">
          <CardContent className="p-6">
            <p className="text-red-100 text-sm font-medium">Saídas (Mês)</p>
            <h3 className="text-3xl font-bold mt-1">R$ {expenses.toFixed(2)}</h3>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-slate-900 text-white">
          <CardContent className="p-6">
            <p className="text-slate-400 text-sm font-medium">Saldo Atual</p>
            <h3 className="text-3xl font-bold mt-1">R$ {(income - expenses).toFixed(2)}</h3>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Fluxo de Caixa</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="p-4 font-semibold text-slate-600 text-sm">Data</th>
                <th className="p-4 font-semibold text-slate-600 text-sm">Descrição</th>
                <th className="p-4 font-semibold text-slate-600 text-sm">Categoria</th>
                <th className="p-4 font-semibold text-slate-600 text-sm">Valor</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedTransactions.map((t) => (
                <tr key={t.id} className="group">
                  <td className="p-4 text-sm text-slate-500">{new Date(t.date).toLocaleDateString()}</td>
                  <td className="p-4 text-sm font-medium text-slate-900">{t.description}</td>
                  <td className="p-4 text-sm text-slate-600">{t.category}</td>
                  <td className={cn(
                    "p-4 text-sm font-bold text-right",
                    t.type === 'Entrada' ? "text-emerald-600" : "text-red-600"
                  )}>
                    {t.type === 'Entrada' ? '+' : '-'} R$ {t.amount.toFixed(2)}
                  </td>
                  <td className="p-4 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600" onClick={() => {
                      setTransactionToDelete(t.id);
                      setIsDeleteDialogOpen(true);
                    }}>
                      <Trash2 size={14} />
                    </Button>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">Nenhuma transação registrada</td>
                </tr>
              )}
            </tbody>
          </table>
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage} 
          />
        </CardContent>
      </Card>
    </div>
  );
}

function RecipesView({ recipes }: { recipes: any[] }) {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(recipes.length / itemsPerPage);
  const paginatedRecipes = recipes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<string | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    yield: '',
    cost: ''
  });

  useEffect(() => {
    if (editingRecipe) {
      setFormData({
        name: editingRecipe.name || '',
        yield: editingRecipe.yield || '',
        cost: (editingRecipe.cost || 0).toString()
      });
    } else {
      setFormData({
        name: '',
        yield: '',
        cost: ''
      });
    }
  }, [editingRecipe, isModalOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const data = {
      name: formData.name,
      yield: formData.yield,
      cost: parseFloat(formData.cost) || 0,
      userId: user.id
    };

    try {
      if (editingRecipe) {
        await api.updateRecipe(editingRecipe.id, data);
      } else {
        await api.addRecipe(data);
      }
      setIsModalOpen(false);
      setEditingRecipe(null);
    } catch (err) {
      console.error("Error saving recipe:", err);
    }
  };

  const handleDelete = async () => {
    if (!user || !recipeToDelete) return;
    try {
      await api.deleteRecipe(recipeToDelete);
      setRecipeToDelete(null);
    } catch (err) {
      console.error("Error deleting recipe:", err);
    }
  };

  return (
    <div className="space-y-6">
      <DeleteConfirmDialog 
        isOpen={isDeleteDialogOpen} 
        onClose={() => setIsDeleteDialogOpen(false)} 
        onConfirm={handleDelete}
        title="Excluir Receita"
        description="Tem certeza que deseja excluir esta receita? Esta ação não pode ser desfeita."
      />
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Minhas Receitas</h2>
          <p className="text-slate-500">Cadastre e gerencie suas fichas técnicas</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setEditingRecipe(null);
        }}>
          <DialogTrigger render={
            <Button className="bg-primary hover:bg-primary/90 gap-2">
              <Plus size={18} />
              Nova Receita
            </Button>
          } />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingRecipe ? 'Editar Receita' : 'Nova Receita'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome da Receita</Label>
                <Input 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: Bolo de Chocolate Belga"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Rendimento</Label>
                  <Input 
                    value={formData.yield} 
                    onChange={(e) => setFormData({...formData, yield: e.target.value})}
                    placeholder="Ex: 2kg ou 50 unid"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Custo Estimado (R$)</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={formData.cost} 
                    onChange={(e) => setFormData({...formData, cost: e.target.value})}
                    placeholder="0,00"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90">{editingRecipe ? 'Salvar' : 'Criar'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedRecipes.map((recipe) => (
          <Card key={recipe.id} className="border-none shadow-sm hover:shadow-md transition-shadow group">
            <CardHeader className="relative">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-2 group-hover:scale-110 transition-transform">
                <ChefHat size={24} />
              </div>
              <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                  setEditingRecipe(recipe);
                  setIsModalOpen(true);
                }}>
                  <Edit2 size={14} />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => {
                  setRecipeToDelete(recipe.id);
                  setIsDeleteDialogOpen(true);
                }}>
                  <Trash2 size={14} />
                </Button>
              </div>
              <CardTitle className="text-lg">{recipe.name}</CardTitle>
              <CardDescription>{recipe.ingredients?.length || 0} ingredientes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                <div className="text-sm text-slate-500">Custo: <span className="font-bold text-slate-900">R$ {(recipe.cost || 0).toFixed(2)}</span></div>
                <div className="text-sm text-slate-500">Rende: <span className="font-bold text-slate-900">{recipe.yield}</span></div>
              </div>
              <Button variant="outline" className="w-full mt-4">Ver Detalhes</Button>
            </CardContent>
          </Card>
        ))}
        {recipes.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
            Nenhuma receita cadastrada
          </div>
        )}
      </div>
      <Pagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
        onPageChange={setCurrentPage} 
      />
    </div>
  );
}

function CalculatorView({ calculations }: { calculations: Calculation[] }) {
  const { user } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [calculationToDelete, setCalculationToDelete] = useState<string | null>(null);
  const [editingCalculation, setEditingCalculation] = useState<Calculation | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [ingredients, setIngredients] = useState<any[]>([
    { id: '1', name: '', price: '', totalQty: '', usedQty: '' }
  ]);
  const [additionalCosts, setAdditionalCosts] = useState({
    expenses: '',
    labor: '',
    filling: ''
  });
  const [profitMargin, setProfitMargin] = useState('30');
  const [production, setProduction] = useState({
    yield: '1',
    weight: ''
  });

  // Pagination for the grid
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(calculations.length / itemsPerPage);
  const paginatedCalculations = calculations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    if (editingCalculation) {
      setTitle(editingCalculation.title || '');
      setIngredients(editingCalculation.ingredients || []);
      setAdditionalCosts(editingCalculation.additionalCosts || { expenses: '', labor: '', filling: '' });
      setProfitMargin(editingCalculation.profitMargin || '30');
      setProduction(editingCalculation.production || { yield: '1', weight: '' });
    } else {
      setTitle('');
      setIngredients([{ id: '1', name: '', price: '', totalQty: '', usedQty: '' }]);
      setAdditionalCosts({ expenses: '', labor: '', filling: '' });
      setProfitMargin('30');
      setProduction({ yield: '1', weight: '' });
    }
  }, [editingCalculation, isFormOpen]);

  const addIngredient = () => {
    setIngredients([...ingredients, { id: Math.random().toString(36).substr(2, 9), name: '', price: '', totalQty: '', usedQty: '' }]);
  };

  const removeIngredient = (id: string) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter(ing => ing.id !== id));
    }
  };

  const updateIngredient = (id: string, field: string, value: string) => {
    setIngredients(ingredients.map(ing => ing.id === id ? { ...ing, [field]: value } : ing));
  };

  const calculateIngredientCost = (ing: any) => {
    const price = parseFloat(ing.price) || 0;
    const totalQty = parseFloat(ing.totalQty) || 0;
    const usedQty = parseFloat(ing.usedQty) || 0;
    if (totalQty === 0) return 0;
    return (price / totalQty) * usedQty;
  };

  const ingredientsSubtotal = ingredients.reduce((acc, ing) => acc + calculateIngredientCost(ing), 0);
  const additionalTotal = (parseFloat(additionalCosts.expenses) || 0) + 
                         (parseFloat(additionalCosts.labor) || 0) + 
                         (parseFloat(additionalCosts.filling) || 0);
  
  const subtotal = ingredientsSubtotal + additionalTotal;
  const marginValue = subtotal * (parseFloat(profitMargin) / 100);
  const totalValue = subtotal + marginValue;
  
  const yieldValue = parseFloat(production.yield) || 1;
  const unitCost = totalValue / yieldValue;

  const handleSave = async () => {
    if (!user || !title) return;
    setIsSaving(true);

    const data = {
      title,
      ingredients,
      additionalCosts,
      profitMargin,
      production,
      totalValue,
      unitCost,
      userId: user.id
    };

    try {
      if (editingCalculation) {
        await api.updateCalculation(editingCalculation.id, data);
      } else {
        await api.addCalculation(data);
      }
      setIsFormOpen(false);
      setEditingCalculation(null);
    } catch (err) {
      console.error("Error saving calculation:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !calculationToDelete) return;
    try {
      await api.deleteCalculation(calculationToDelete);
      setCalculationToDelete(null);
      setIsDeleteDialogOpen(false);
    } catch (err) {
      console.error("Error deleting calculation:", err);
    }
  };

  if (isFormOpen) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => {
              setIsFormOpen(false);
              setEditingCalculation(null);
            }}>
              <ChevronLeft size={20} />
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{editingCalculation ? 'Editar Cálculo' : 'Novo Cálculo'}</h2>
              <p className="text-slate-500 text-sm">Preencha os dados para calcular o custo</p>
            </div>
          </div>
          <Button 
            className="bg-primary hover:bg-primary/90 gap-2" 
            onClick={handleSave}
            disabled={isSaving || !title}
          >
            <Calculator size={18} />
            {isSaving ? 'Salvando...' : 'Salvar Cálculo'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-sm">
              <CardContent className="p-6">
                <div className="space-y-2">
                  <Label>Título do Cálculo</Label>
                  <Input 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Coxinha de Frango"
                    className="text-lg font-bold"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Seção 1: Ingredientes */}
            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader className="border-b border-slate-50 bg-slate-50/50 py-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Package size={18} className="text-primary" />
                    Ingredientes
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={addIngredient} className="gap-1 h-8">
                    <Plus size={14} />
                    Adicionar
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/30 border-b border-slate-100">
                        <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Ingrediente</th>
                        <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider w-24">Preço (R$)</th>
                        <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider w-24">Qtd Total</th>
                        <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider w-24">Qtd Uso</th>
                        <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider w-24 text-right">Custo</th>
                        <th className="p-3 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {ingredients.map((ing) => (
                        <tr key={ing.id} className="group hover:bg-slate-50/30 transition-colors">
                          <td className="p-3">
                            <Input 
                              value={ing.name} 
                              onChange={(e) => updateIngredient(ing.id, 'name', e.target.value)}
                              placeholder="Ex: Farinha"
                              className="h-9 border-transparent bg-transparent hover:border-slate-200 focus:bg-white transition-all"
                            />
                          </td>
                          <td className="p-3">
                            <Input 
                              type="number"
                              value={ing.price} 
                              onChange={(e) => updateIngredient(ing.id, 'price', e.target.value)}
                              placeholder="0,00"
                              className="h-9 border-transparent bg-transparent hover:border-slate-200 focus:bg-white transition-all"
                            />
                          </td>
                          <td className="p-3">
                            <Input 
                              type="number"
                              value={ing.totalQty} 
                              onChange={(e) => updateIngredient(ing.id, 'totalQty', e.target.value)}
                              placeholder="1000"
                              className="h-9 border-transparent bg-transparent hover:border-slate-200 focus:bg-white transition-all"
                            />
                          </td>
                          <td className="p-3">
                            <Input 
                              type="number"
                              value={ing.usedQty} 
                              onChange={(e) => updateIngredient(ing.id, 'usedQty', e.target.value)}
                              placeholder="250"
                              className="h-9 border-transparent bg-transparent hover:border-slate-200 focus:bg-white transition-all"
                            />
                          </td>
                          <td className="p-3 text-right font-medium text-slate-700">
                            R$ {calculateIngredientCost(ing).toFixed(2)}
                          </td>
                          <td className="p-3">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeIngredient(ing.id)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Seção 2: Custos Adicionais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-none shadow-sm">
                <CardHeader className="py-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <DollarSign size={18} className="text-primary" />
                    Custos Adicionais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-500">Gastos Gerais (Energia, Gás, etc)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">R$</span>
                      <Input 
                        type="number"
                        className="pl-9"
                        value={additionalCosts.expenses}
                        onChange={(e) => setAdditionalCosts({...additionalCosts, expenses: e.target.value})}
                        placeholder="0,00"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-500">Mão de Obra</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">R$</span>
                      <Input 
                        type="number"
                        className="pl-9"
                        value={additionalCosts.labor}
                        onChange={(e) => setAdditionalCosts({...additionalCosts, labor: e.target.value})}
                        placeholder="0,00"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-500">Custo do Recheio/Extras</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">R$</span>
                      <Input 
                        type="number"
                        className="pl-9"
                        value={additionalCosts.filling}
                        onChange={(e) => setAdditionalCosts({...additionalCosts, filling: e.target.value})}
                        placeholder="0,00"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardHeader className="py-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ShoppingBag size={18} className="text-primary" />
                    Produção
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-500">Rendimento (Unidades)</Label>
                    <Input 
                      type="number"
                      value={production.yield}
                      onChange={(e) => setProduction({...production, yield: e.target.value})}
                      placeholder="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-500">Peso por Unidade (Opcional)</Label>
                    <Input 
                      type="text"
                      value={production.weight}
                      onChange={(e) => setProduction({...production, weight: e.target.value})}
                      placeholder="Ex: 100g"
                    />
                  </div>
                  <div className="pt-4 mt-4 border-t border-slate-50">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500 font-medium">Custo Unitário:</span>
                      <span className="text-xl font-bold text-primary">R$ {unitCost.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Seção 3: Resumo Financeiro */}
          <div className="space-y-6">
            <Card className="border-none shadow-sm bg-slate-900 text-white overflow-hidden sticky top-6">
              <CardHeader className="border-b border-white/10">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp size={18} className="text-primary" />
                  Resumo Financeiro
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Subtotal (Custos):</span>
                    <span className="font-medium">R$ {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Margem de Lucro (%):</span>
                      <span className="text-emerald-400 font-medium">+{marginValue.toFixed(2)}</span>
                    </div>
                    <Input 
                      type="number"
                      value={profitMargin}
                      onChange={(e) => setProfitMargin(e.target.value)}
                      className="bg-white/10 border-white/10 text-white h-8 text-right"
                    />
                  </div>
                </div>

                <Separator className="bg-white/10" />

                <div className="space-y-1">
                  <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Preço de Venda Total</span>
                  <div className="text-4xl font-black text-white">
                    R$ {totalValue.toFixed(2)}
                  </div>
                </div>

                <div className="pt-4">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-slate-400">Lucro Bruto Estimado:</div>
                      <div className="text-lg font-bold text-emerald-400">R$ {marginValue.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DeleteConfirmDialog 
        isOpen={isDeleteDialogOpen} 
        onClose={() => setIsDeleteDialogOpen(false)} 
        onConfirm={handleDelete}
        title="Excluir Cálculo"
        description="Tem certeza que deseja excluir este cálculo? Esta ação não pode ser desfeita."
      />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Meus Cálculos</h2>
          <p className="text-slate-500">Gerencie seus custos e precificações</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 gap-2" onClick={() => setIsFormOpen(true)}>
          <Plus size={18} />
          Novo Cálculo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedCalculations.map((calc) => (
          <Card key={calc.id} className="border-none shadow-sm hover:shadow-md transition-shadow group">
            <CardHeader className="relative pb-2">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-2">
                <Calculator size={20} />
              </div>
              <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                  setEditingCalculation(calc);
                  setIsFormOpen(true);
                }}>
                  <Edit2 size={14} />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => {
                  setCalculationToDelete(calc.id);
                  setIsDeleteDialogOpen(true);
                }}>
                  <Trash2 size={14} />
                </Button>
              </div>
              <CardTitle className="text-lg">{calc.title}</CardTitle>
              <CardDescription>
                {calc.updatedAt ? new Date(calc.updatedAt.toDate()).toLocaleDateString() : 'Sem data'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Preço Total</p>
                  <p className="text-lg font-bold text-slate-900">R$ {calc.totalValue.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <p className="text-[10px] text-primary uppercase font-bold">Custo Unit.</p>
                  <p className="text-lg font-bold text-primary">R$ {calc.unitCost.toFixed(2)}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full gap-2"
                onClick={() => {
                  setEditingCalculation(calc);
                  setIsFormOpen(true);
                }}
              >
                Visualizar Detalhes
              </Button>
            </CardContent>
          </Card>
        ))}
        {calculations.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
            Nenhum cálculo salvo ainda
          </div>
        )}
      </div>

      <Pagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
        onPageChange={setCurrentPage} 
      />
    </div>
  );
}

function ClientsView({ clients }: { clients: any[] }) {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(clients.length / itemsPerPage);
  const paginatedClients = clients.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);
  const [editingClient, setEditingClient] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });

  useEffect(() => {
    if (editingClient) {
      setFormData({
        name: editingClient.name || '',
        phone: editingClient.phone || '',
        email: editingClient.email || '',
        address: editingClient.address || ''
      });
    } else {
      setFormData({
        name: '',
        phone: '',
        email: '',
        address: ''
      });
    }
  }, [editingClient, isModalOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const data = {
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      userId: user.id
    };

    try {
      if (editingClient) {
        await api.updateClient(editingClient.id, data);
      } else {
        await api.addClient(data);
      }
      setIsModalOpen(false);
      setEditingClient(null);
    } catch (err) {
      console.error("Error saving client:", err);
    }
  };

  const handleDelete = async () => {
    if (!user || !clientToDelete) return;
    try {
      await api.deleteClient(clientToDelete);
      setClientToDelete(null);
    } catch (err) {
      console.error("Error deleting client:", err);
    }
  };

  return (
    <div className="space-y-6">
      <DeleteConfirmDialog 
        isOpen={isDeleteDialogOpen} 
        onClose={() => setIsDeleteDialogOpen(false)} 
        onConfirm={handleDelete}
        title="Excluir Cliente"
        description="Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita."
      />
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Meus Clientes</h2>
          <p className="text-slate-500">Gerencie sua base de contatos e histórico</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setEditingClient(null);
        }}>
          <DialogTrigger render={
            <Button className="bg-primary hover:bg-primary/90 gap-2">
              <Plus size={18} />
              Novo Cliente
            </Button>
          } />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingClient ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome Completo</Label>
                <Input 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: Maria Silva"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input 
                    value={formData.phone} 
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div className="space-y-2">
                  <Label>E-mail</Label>
                  <Input 
                    type="email"
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="maria@email.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Endereço</Label>
                <Input 
                  value={formData.address} 
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Rua, número, bairro..."
                />
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90">{editingClient ? 'Salvar' : 'Criar'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paginatedClients.map((client) => (
          <Card key={client.id} className="border-none shadow-sm hover:shadow-md transition-shadow group">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                {client.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900">{client.name}</h3>
                <p className="text-sm text-slate-500">{client.phone || 'Sem telefone'}</p>
              </div>
              <div className="text-right flex flex-col items-end gap-1">
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                    setEditingClient(client);
                    setIsModalOpen(true);
                  }}>
                    <Edit2 size={14} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => {
                    setClientToDelete(client.id);
                    setIsDeleteDialogOpen(true);
                  }}>
                    <Trash2 size={14} />
                  </Button>
                </div>
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">{client.orders || 0} pedidos</p>
                <p className="text-sm font-bold text-primary">R$ {(client.total || 0).toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
        ))}
        {clients.length === 0 && (
          <div className="col-span-2 py-12 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
            Nenhum cliente cadastrado
          </div>
        )}
      </div>
      <Pagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
        onPageChange={setCurrentPage} 
      />
    </div>
  );
}

function AgendaView({ orders }: { orders: Order[] }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Agenda de Entregas</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Mês</Button>
          <Button variant="outline" size="sm">Semana</Button>
          <Button variant="outline" size="sm" className="bg-primary text-white border-primary">Dia</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-3 border-none shadow-sm p-6">
          <div className="grid grid-cols-7 gap-px bg-slate-100 border border-slate-100 rounded-xl overflow-hidden">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
              <div key={day} className="bg-slate-50 p-2 text-center text-xs font-bold text-slate-500 uppercase">{day}</div>
            ))}
            {Array.from({ length: 31 }).map((_, i) => {
              const dayOrders = orders.filter(o => new Date(o.deliveryDate).getDate() === i + 1);
              return (
                <div key={i} className="bg-white min-h-[100px] p-2 hover:bg-slate-50 transition-colors cursor-pointer">
                  <span className="text-sm font-medium text-slate-400">{i + 1}</span>
                  {dayOrders.map(order => (
                    <div key={order.id} className="mt-1 p-1 bg-orange-100 text-orange-700 text-[10px] font-bold rounded border border-orange-200 truncate">
                      {order.product}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </Card>

        <div className="space-y-4">
          <h3 className="font-bold text-slate-900">Próximas Entregas</h3>
          {orders.slice(0, 5).map((order, i) => (
            <div key={i} className="flex gap-4 items-start">
              <div className="text-sm font-bold text-slate-400 w-12 pt-1">
                {new Date(order.deliveryDate).getHours()}:00
              </div>
              <div className="flex-1 p-3 bg-white rounded-xl shadow-sm border-l-4 border-primary">
                <p className="text-sm font-bold text-slate-900">{order.product}</p>
                <p className="text-xs text-slate-500">{order.clientName}</p>
              </div>
            </div>
          ))}
          {orders.length === 0 && <p className="text-sm text-slate-400 text-center py-4">Nenhuma entrega agendada</p>}
        </div>
      </div>
    </div>
  );
}

function TutorialsView() {
  const tutorials: any[] = [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Tutoriais e Dicas</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tutorials.map((video, i) => (
          <Card key={i} className="border-none shadow-sm overflow-hidden group cursor-pointer">
            <div className="aspect-video bg-slate-200 relative flex items-center justify-center">
              <PlayCircle className="text-white w-12 h-12 opacity-80 group-hover:scale-110 transition-transform" />
              <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
                {video.duration}
              </span>
            </div>
            <CardContent className="p-4">
              <Badge variant="secondary" className="mb-2 text-[10px] uppercase tracking-wider">{video.category}</Badge>
              <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors">{video.title}</h3>
            </CardContent>
          </Card>
        ))}
        {tutorials.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-xl border-2 border-dashed border-slate-100">
            <PlayCircle className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500">Nenhum tutorial disponível no momento.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SettingsView() {
  const { user, userProfile } = useAuth();
  const [formData, setFormData] = useState({
    companyName: '',
    phone: '',
    address: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        companyName: userProfile.companyName || '',
        phone: userProfile.phone || '',
        address: userProfile.address || ''
      });
    }
  }, [userProfile]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await supabase.from('profiles').update({
        company_name: formData.companyName,
        phone: formData.phone,
        address: formData.address
      }).eq('id', user.id);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving settings:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Configurações</h2>
        <p className="text-slate-500 text-sm">Gerencie sua conta e preferências do sistema</p>
      </div>

      {showSuccess && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-medium flex items-center gap-2 border border-emerald-100"
        >
          <CheckCircle2 size={18} />
          Configurações salvas com sucesso!
        </motion.div>
      )}

      <Tabs defaultValue="perfil" className="space-y-6">
        <TabsList className="bg-slate-100/50 p-1 gap-1">
          <TabsTrigger value="perfil" className="gap-2 px-4">
            <User size={16} />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="conta" className="gap-2 px-4">
            <Lock size={16} />
            Conta
          </TabsTrigger>
          <TabsTrigger value="linguagem" className="gap-2 px-4">
            <Globe size={16} />
            Linguagem
          </TabsTrigger>
        </TabsList>

        <TabsContent value="perfil">
          <Card className="border-none shadow-sm">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
                <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                  <ChefHat size={40} />
                </div>
                <div>
                  <Button size="sm">Alterar Foto</Button>
                  <p className="text-xs text-slate-500 mt-2">JPG ou PNG. Máximo 2MB.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome da Empresa</Label>
                    <Input 
                      value={formData.companyName} 
                      onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                      placeholder="Ex: Cozinha Sinistra"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone Comercial</Label>
                    <Input 
                      value={formData.phone} 
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Endereço de Produção</Label>
                  <Input 
                    value={formData.address} 
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Rua das Flores, 123..."
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                <Button variant="ghost">Cancelar</Button>
                <Button 
                  className="bg-primary hover:bg-primary/90" 
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conta">
          <Card className="border-none shadow-sm">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>E-mail da Conta</Label>
                  <Input value={user?.email || ''} disabled className="bg-slate-50" />
                  <p className="text-xs text-slate-500">O e-mail não pode ser alterado diretamente.</p>
                </div>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900">Segurança</h3>
                  <Button variant="outline">Alterar Senha</Button>
                </div>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-red-600">Zona de Perigo</h3>
                  <p className="text-xs text-slate-500">Ao excluir sua conta, todos os seus dados serão removidos permanentemente.</p>
                  <Button variant="destructive">Excluir Minha Conta</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="linguagem">
          <Card className="border-none shadow-sm">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Idioma do Sistema</Label>
                  <Select defaultValue="pt-BR">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                      <SelectItem value="en">English (US)</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Fuso Horário</Label>
                  <Select defaultValue="America/Sao_Paulo">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Sao_Paulo">Brasília (GMT-3)</SelectItem>
                      <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SuppliersView({ suppliers }: { suppliers: any[] }) {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const totalPages = Math.ceil(suppliers.length / itemsPerPage);
  const paginatedSuppliers = suppliers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<string | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    phone: '',
    email: ''
  });

  useEffect(() => {
    if (editingSupplier) {
      setFormData({
        name: editingSupplier.name || '',
        category: editingSupplier.category || '',
        phone: editingSupplier.phone || '',
        email: editingSupplier.email || ''
      });
    } else {
      setFormData({
        name: '',
        category: '',
        phone: '',
        email: ''
      });
    }
  }, [editingSupplier, isModalOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const data = {
      name: formData.name,
      category: formData.category,
      phone: formData.phone,
      email: formData.email,
      userId: user.id
    };

    try {
      if (editingSupplier) {
        await api.updateSupplier(editingSupplier.id, data);
      } else {
        await api.addSupplier(data);
      }
      setIsModalOpen(false);
      setEditingSupplier(null);
    } catch (err) {
      console.error("Error saving supplier:", err);
    }
  };

  const handleDelete = async () => {
    if (!user || !supplierToDelete) return;
    try {
      await api.deleteSupplier(supplierToDelete);
      setSupplierToDelete(null);
    } catch (err) {
      console.error("Error deleting supplier:", err);
    }
  };

  return (
    <div className="space-y-6">
      <DeleteConfirmDialog 
        isOpen={isDeleteDialogOpen} 
        onClose={() => setIsDeleteDialogOpen(false)} 
        onConfirm={handleDelete}
        title="Excluir Fornecedor"
        description="Tem certeza que deseja excluir este fornecedor? Esta ação não pode ser desfeita."
      />
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Fornecedores</h2>
          <p className="text-slate-500">Gerencie seus parceiros e contatos de suprimentos</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setEditingSupplier(null);
        }}>
          <DialogTrigger render={
            <Button className="bg-primary hover:bg-primary/90 gap-2">
              <Plus size={18} />
              Novo Fornecedor
            </Button>
          } />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingSupplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome do Fornecedor</Label>
                <Input 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: Distribuidora Doce"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(val) => setFormData({...formData, category: val})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ingredientes">Ingredientes</SelectItem>
                    <SelectItem value="Embalagens">Embalagens</SelectItem>
                    <SelectItem value="Frutas Frescas">Frutas Frescas</SelectItem>
                    <SelectItem value="Laticínios">Laticínios</SelectItem>
                    <SelectItem value="Outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input 
                    value={formData.phone} 
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="(11) 4444-4444"
                  />
                </div>
                <div className="space-y-2">
                  <Label>E-mail</Label>
                  <Input 
                    type="email"
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="contato@fornecedor.com"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90">{editingSupplier ? 'Salvar' : 'Criar'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedSuppliers.map((supplier) => (
          <Card key={supplier.id} className="border-none shadow-sm hover:shadow-md transition-shadow group">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                    <Truck size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{supplier.name}</h3>
                    <p className="text-xs text-slate-500">{supplier.category}</p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                    setEditingSupplier(supplier);
                    setIsModalOpen(true);
                  }}>
                    <Edit2 size={14} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => {
                    setSupplierToDelete(supplier.id);
                    setIsDeleteDialogOpen(true);
                  }}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                <span className="text-sm text-slate-600">{supplier.phone || 'Sem telefone'}</span>
                <Button variant="ghost" size="sm" className="text-primary font-bold hover:bg-primary/5">Contato</Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {suppliers.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
            Nenhum fornecedor cadastrado
          </div>
        )}
      </div>
      <Pagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
        onPageChange={setCurrentPage} 
      />
    </div>
  );
}
