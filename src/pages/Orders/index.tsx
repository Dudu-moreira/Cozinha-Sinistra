import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Edit2, Search, ArrowLeft, Loader2, Eye, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Order, OrderStatus } from '@/types';
import { api } from '@/services/api';
import { useAuth } from '@/AuthContext';
import { DeleteConfirmDialog } from '@/components/Shared/DeleteConfirmDialog';
import { Pagination } from '@/components/Shared/Pagination';

interface OrdersPageProps {
  orders: Order[];
  refresh: () => void;
}

export const OrdersPage = ({ orders, refresh }: OrdersPageProps) => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [view, setView] = useState<'list' | 'form' | 'detail'>('list');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    clientName: '',
    product: '',
    deliveryDate: '',
    value: '',
    status: 'Pendente' as OrderStatus
  });

  useEffect(() => {
    if (editingOrder || viewingOrder) {
      const target = editingOrder || viewingOrder;
      setFormData({
        clientName: target!.clientName,
        product: target!.product,
        deliveryDate: target!.deliveryDate.split('T')[0],
        value: target!.value.toString(),
        status: target!.status
      });
    } else {
      setFormData({
        clientName: '',
        product: '',
        deliveryDate: new Date().toISOString().split('T')[0],
        value: '',
        status: 'Pendente'
      });
    }
  }, [editingOrder, viewingOrder, view]);

  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const paginatedOrders = orders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const val = parseFloat(formData.value);
    if (isNaN(val)) {
      alert("Por favor, insira um valor válido.");
      return;
    }

    setIsSaving(true);
    const data = {
      ...formData,
      value: val,
      userId: user.id
    };

    try {
      if (editingOrder) {
        await api.updateOrder(editingOrder.id, data);
      } else {
        await api.addOrder(data);
      }
      setView('list');
      setEditingOrder(null);
      refresh();
      alert(editingOrder ? 'Pedido atualizado!' : 'Pedido criado com sucesso!');
    } catch (err) {
      console.error("Error saving order:", err);
      alert("Erro ao salvar pedido. Verifique os dados e tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !orderToDelete) return;
    try {
      await api.deleteOrder(orderToDelete);
      setOrderToDelete(null);
      setIsDeleteDialogOpen(false);
      refresh();
    } catch (err) {
      console.error("Error deleting order:", err);
    }
  };

  const handleDuplicate = async (order: Order) => {
    if (!user) return;
    try {
      const data = {
        clientName: `${order.clientName} (Cópia)`,
        product: order.product,
        deliveryDate: order.deliveryDate.split('T')[0],
        value: order.value,
        status: 'Pendente' as OrderStatus,
        userId: user.id
      };
      await api.addOrder(data);
      refresh();
      alert('Pedido duplicado com sucesso!');
    } catch (err) {
      console.error("Error duplicating order:", err);
      alert("Erro ao duplicar pedido.");
    }
  };

  if (view === 'form' || view === 'detail') {
    const isDetail = view === 'detail';
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => { setView('list'); setEditingOrder(null); setViewingOrder(null); }} className="rounded-full">
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {isDetail ? 'Detalhes do Pedido' : (editingOrder ? 'Editar Pedido' : 'Novo Pedido')}
            </h2>
            <p className="text-slate-500 text-sm">
              {isDetail ? 'Visualize as informações da encomenda.' : 'Preencha os detalhes da encomenda abaixo.'}
            </p>
          </div>
        </div>

        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
              <div className="space-y-2">
                <Label htmlFor="client">Cliente</Label>
                <Input 
                  id="client" 
                  value={formData.clientName || ''} 
                  onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                  placeholder="Nome do cliente"
                  required
                  disabled={isDetail}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product">Produto</Label>
                <Input 
                  id="product" 
                  value={formData.product || ''} 
                  onChange={(e) => setFormData({...formData, product: e.target.value})}
                  placeholder="Ex: Bolo de Chocolate"
                  required
                  disabled={isDetail}
                  className="h-12"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="date">Data de Entrega</Label>
                  <Input 
                    id="date" 
                    type="date"
                    value={formData.deliveryDate || ''} 
                    onChange={(e) => setFormData({...formData, deliveryDate: e.target.value})}
                    required
                    disabled={isDetail}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value">Valor (R$)</Label>
                  <Input 
                    id="value" 
                    type="number"
                    step="0.01"
                    value={formData.value || ''} 
                    onChange={(e) => setFormData({...formData, value: e.target.value})}
                    placeholder="0,00"
                    required
                    disabled={isDetail}
                    className="h-12"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status || ''} 
                  onValueChange={(value: OrderStatus) => setFormData({...formData, status: value})}
                  disabled={isDetail}
                >
                  <SelectTrigger className="h-12">
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
              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => { setView('list'); setEditingOrder(null); setViewingOrder(null); }} className="flex-1 h-12 font-bold">
                  {isDetail ? 'Voltar' : 'Cancelar'}
                </Button>
                {!isDetail && (
                  <Button 
                    type="submit" 
                    disabled={isSaving}
                    className="flex-[2] bg-primary hover:bg-primary/90 h-12 text-base font-bold shadow-lg shadow-primary/20"
                  >
                    {isSaving ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      editingOrder ? 'Salvar Alterações' : 'Criar Pedido'
                    )}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

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
        <div className="hidden sm:block">
          <h2 className="text-2xl font-bold text-slate-900">Gerenciar Pedidos</h2>
          <p className="text-slate-500">Visualize e controle todas as suas encomendas</p>
        </div>
        <Button onClick={() => setView('form')} className="bg-primary hover:bg-primary/90 gap-2">
          <Plus size={18} />
          Novo
        </Button>
      </div>

      {/* Mobile View */}
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
                  setViewingOrder(order);
                  setView('detail');
                }}>
                  <Eye size={16} className="mr-1" /> Visualizar
                </Button>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="text-slate-500 hover:text-primary" onClick={() => {
                    setEditingOrder(order);
                    setView('form');
                  }}>
                    <Edit2 size={16} />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-slate-500 hover:text-primary" onClick={() => handleDuplicate(order)}>
                    <Copy size={16} />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => {
                    setOrderToDelete(order.id);
                    setIsDeleteDialogOpen(true);
                  }}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {orders.length === 0 && (
          <div className="col-span-full p-8 text-center text-slate-400 bg-white rounded-xl shadow-sm">
            Nenhum pedido cadastrado
          </div>
        )}
      </div>

      {/* Desktop View */}
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
                    <div className="flex justify-end gap-1 transition-opacity">
                      <Button variant="ghost" size="icon" title="Visualizar" onClick={() => {
                        setViewingOrder(order);
                        setView('detail');
                      }}>
                        <Eye size={16} className="text-slate-400 hover:text-primary" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Editar" onClick={() => {
                        setEditingOrder(order);
                        setView('form');
                      }}>
                        <Edit2 size={16} className="text-slate-400 hover:text-primary" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Duplicar" onClick={() => handleDuplicate(order)}>
                        <Copy size={16} className="text-slate-400 hover:text-primary" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Excluir" onClick={() => {
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
};
