import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, ShoppingBag, DollarSign, Package, 
  TrendingUp, TrendingDown, AlertCircle, CheckCircle2, 
  ArrowRight, Loader2
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, LineChart, Line 
} from 'recharts';
import { Order, Task, Ingredient, Transaction } from '@/types';

interface DashboardProps {
  orders: Order[];
  tasks: Task[];
  ingredients: Ingredient[];
  transactions: Transaction[];
}

export const DashboardPage = ({ orders, tasks, ingredients, transactions }: DashboardProps) => {
  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'Pendente').length;
    const monthlyRevenue = orders
      .filter(o => new Date(o.deliveryDate).getMonth() === new Date().getMonth())
      .reduce((acc, curr) => acc + curr.value, 0);
    const lowStock = ingredients.filter(i => i.quantity <= i.minQuantity).length;

    return [
      { 
        title: 'Pedidos Totais', 
        value: totalOrders, 
        icon: ShoppingBag, 
        color: 'text-blue-600', 
        bg: 'bg-blue-50',
        trend: '+12%',
        trendUp: true
      },
      { 
        title: 'Faturamento Mês', 
        value: `R$ ${monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 
        icon: DollarSign, 
        color: 'text-emerald-600', 
        bg: 'bg-emerald-50',
        trend: '+8%',
        trendUp: true
      },
      { 
        title: 'Pedidos Pendentes', 
        value: pendingOrders, 
        icon: LayoutDashboard, 
        color: 'text-orange-600', 
        bg: 'bg-orange-50',
        trend: '-2',
        trendUp: false
      },
      { 
        title: 'Estoque Baixo', 
        value: lowStock, 
        icon: Package, 
        color: 'text-red-600', 
        bg: 'bg-red-50',
        trend: 'Alerta',
        trendUp: false
      },
    ];
  }, [orders, ingredients]);

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        name: d.toLocaleDateString('pt-BR', { weekday: 'short' }),
        date: d.toISOString().split('T')[0],
        valor: 0
      };
    });

    orders.forEach(order => {
      const orderDate = new Date(order.deliveryDate).toISOString().split('T')[0];
      const day = last7Days.find(d => d.date === orderDate);
      if (day) day.valor += order.value;
    });

    return last7Days;
  }, [orders]);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("p-2 rounded-lg", stat.bg)}>
                  <stat.icon className={cn("w-5 h-5", stat.color)} />
                </div>
                <Badge variant="secondary" className={cn(
                  "text-[10px] font-bold",
                  stat.trendUp ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50"
                )}>
                  {stat.trend}
                </Badge>
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
          <CardHeader className="hidden sm:block">
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
            <CardHeader className="pb-2 hidden sm:block">
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
            <CardHeader className="pb-2 hidden sm:block">
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
              <Button variant="ghost" className="w-full mt-4 text-primary font-bold text-xs group">
                Ver Todas <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
