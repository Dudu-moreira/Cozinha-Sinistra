import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Calendar } from 'lucide-react';
import { Order } from '@/types';

interface AgendaProps {
  orders: Order[];
}

export const AgendaPage = ({ orders }: AgendaProps) => {
  const [viewType, setViewType] = useState<'dia' | 'semana' | 'mes'>('mes');
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const monthName = today.toLocaleDateString('pt-BR', { month: 'long' });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-900 hidden sm:block">Agenda de Entregas</h2>
        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
          <div className="text-sm font-bold text-primary capitalize sm:hidden">
            {viewType === 'dia' ? 'Hoje' : viewType === 'semana' ? 'Esta Semana' : monthName}
          </div>
          <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setViewType('mes')}
              className={cn(
                "h-8 px-3 text-xs font-bold transition-all",
                viewType === 'mes' ? "bg-white shadow-sm text-primary" : "text-slate-500"
              )}
            >
              Mês
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setViewType('semana')}
              className={cn(
                "h-8 px-3 text-xs font-bold transition-all",
                viewType === 'semana' ? "bg-white shadow-sm text-primary" : "text-slate-500"
              )}
            >
              Semana
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setViewType('dia')}
              className={cn(
                "h-8 px-3 text-xs font-bold transition-all",
                viewType === 'dia' ? "bg-white shadow-sm text-primary" : "text-slate-500"
              )}
            >
              Dia
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-3 border-none shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {viewType === 'mes' && (
              <div className="flex flex-col">
                <div className="grid grid-cols-7 border-b border-slate-100">
                  {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
                    <div key={`${day}-${i}`} className="py-3 text-center text-[10px] font-black text-slate-400 uppercase">{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-px bg-slate-100">
                  {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`empty-${i}`} className="bg-slate-50/50 min-h-[80px] sm:min-h-[120px]" />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const dayNumber = i + 1;
                    const isToday = dayNumber === today.getDate() && currentMonth === today.getMonth();
                    const dayOrders = orders.filter(o => {
                      const d = new Date(o.deliveryDate);
                      return d.getDate() === dayNumber && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
                    });
                    
                    return (
                      <div key={i} className={cn(
                        "bg-white min-h-[80px] sm:min-h-[120px] p-1 sm:p-2 hover:bg-slate-50 transition-colors cursor-pointer relative group",
                        isToday && "bg-orange-50/30"
                      )}>
                        <span className={cn(
                          "text-xs font-bold",
                          isToday ? "text-primary" : "text-slate-400"
                        )}>{dayNumber}</span>
                        <div className="mt-1 space-y-0.5">
                          {dayOrders.slice(0, 3).map(order => (
                            <div key={order.id} className="p-0.5 sm:p-1 bg-orange-100 text-orange-700 text-[8px] sm:text-[9px] font-bold rounded border border-orange-200 truncate">
                              {order.product}
                            </div>
                          ))}
                          {dayOrders.length > 3 && (
                            <div className="text-[7px] text-slate-400 font-bold pl-1">+{dayOrders.length - 3} mais</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {viewType === 'semana' && (
              <div className="divide-y divide-slate-100">
                {Array.from({ length: 7 }).map((_, i) => {
                  const date = new Date();
                  date.setDate(today.getDate() - today.getDay() + i);
                  const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth();
                  const dayOrders = orders.filter(o => {
                    const d = new Date(o.deliveryDate);
                    return d.getDate() === date.getDate() && d.getMonth() === date.getMonth();
                  });
                  
                  return (
                    <div key={i} className={cn(
                      "flex gap-4 p-4 hover:bg-slate-50 transition-colors",
                      isToday && "bg-orange-50/20"
                    )}>
                      <div className="flex flex-col items-center w-12 shrink-0">
                        <span className="text-[10px] uppercase text-slate-400 font-black">
                          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][i]}
                        </span>
                        <span className={cn(
                          "text-xl font-black",
                          isToday ? "text-primary" : "text-slate-900"
                        )}>{date.getDate()}</span>
                      </div>
                      <div className="flex-1 space-y-2">
                        {dayOrders.map(order => (
                          <div key={order.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                            <div>
                              <p className="text-sm font-bold text-slate-900">{order.product}</p>
                              <p className="text-xs text-slate-500">{order.clientName} • {new Date(order.deliveryDate).getHours()}:00</p>
                            </div>
                            <Badge variant="outline" className="text-[10px] h-5">{order.status}</Badge>
                          </div>
                        ))}
                        {dayOrders.length === 0 && (
                          <p className="text-xs text-slate-300 italic pt-2">Nenhuma entrega</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {viewType === 'dia' && (
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-black text-slate-900 text-lg">Programação de Hoje</h3>
                    <p className="text-xs text-slate-500">{today.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  {Array.from({ length: 15 }).map((_, i) => {
                    const hour = i + 7; // 7:00 to 21:00
                    const hourOrders = orders.filter(o => {
                      const d = new Date(o.deliveryDate);
                      return d.getDate() === today.getDate() && 
                             d.getMonth() === today.getMonth() && 
                             d.getHours() === hour;
                    });
                    
                    return (
                      <div key={hour} className="flex gap-4 group">
                        <div className="w-10 text-[10px] font-black text-slate-300 pt-4 text-right">{hour}:00</div>
                        <div className={cn(
                          "flex-1 min-h-[60px] py-2 border-l-2 transition-colors",
                          hourOrders.length > 0 ? "border-primary" : "border-slate-100"
                        )}>
                          <div className="pl-4 space-y-2">
                            {hourOrders.map(order => (
                              <div key={order.id} className="p-3 bg-orange-50 border border-orange-100 rounded-xl flex items-center justify-between shadow-sm">
                                <div>
                                  <p className="text-sm font-bold text-slate-900">{order.product}</p>
                                  <p className="text-xs text-slate-500">{order.clientName}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                  <Badge className="text-[9px] h-4 bg-primary">{order.status}</Badge>
                                  <span className="text-[10px] font-bold text-primary">R$ {order.value.toFixed(2)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">Próximas</h3>
            <Badge variant="secondary" className="text-[10px]">{orders.filter(o => new Date(o.deliveryDate) >= today).length}</Badge>
          </div>
          <div className="space-y-3">
            {orders
              .filter(o => new Date(o.deliveryDate) >= today)
              .sort((a, b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime())
              .slice(0, 5)
              .map((order, i) => (
                <div key={i} className="flex gap-3 items-start group cursor-pointer">
                  <div className="flex flex-col items-center w-10 shrink-0 pt-1">
                    <span className="text-[10px] font-black text-slate-400">{new Date(order.deliveryDate).getHours()}:00</span>
                    <div className="w-px h-8 bg-slate-100 mt-2 group-last:hidden" />
                  </div>
                  <div className="flex-1 p-3 bg-white rounded-xl shadow-sm border border-slate-100 hover:border-primary/30 transition-colors">
                    <p className="text-xs font-black text-slate-900 truncate">{order.product}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-[10px] text-slate-500">{order.clientName}</p>
                      <span className="text-[10px] font-bold text-primary">{new Date(order.deliveryDate).getDate()}/{new Date(order.deliveryDate).getMonth() + 1}</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
          {orders.length === 0 && (
            <div className="py-8 text-center bg-white rounded-xl border border-dashed border-slate-200">
              <Calendar className="w-8 h-8 text-slate-200 mx-auto mb-2" />
              <p className="text-[10px] text-slate-400 font-bold">Sem entregas</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
