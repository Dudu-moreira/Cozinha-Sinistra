import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, TrendingUp, TrendingDown, DollarSign, Calendar as CalendarIcon, Filter, Download, ArrowLeft, Eye, Copy, Loader2, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Transaction } from '@/types';
import { api } from '@/services/api';
import { useAuth } from '@/AuthContext';
import { DeleteConfirmDialog } from '@/components/Shared/DeleteConfirmDialog';
import { Pagination } from '@/components/Shared/Pagination';

interface FinancePageProps {
  transactions: Transaction[];
  refresh: () => void;
}

export const FinancePage = ({ transactions, refresh }: FinancePageProps) => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const stats = useMemo(() => {
    const income = transactions.filter(t => t.type === 'Entrada').reduce((acc, curr) => acc + curr.amount, 0);
    const expense = transactions.filter(t => t.type === 'Saída').reduce((acc, curr) => acc + curr.amount, 0);
    return { income, expense, balance: income - expense };
  }, [transactions]);

  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const paginatedTransactions = transactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const [view, setView] = useState<'list' | 'form' | 'detail'>('list');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<any | null>(null);
  const [viewingTransaction, setViewingTransaction] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'Entrada' as 'Entrada' | 'Saída',
    category: 'Vendas',
    date: new Date().toISOString().split('T')[0]
  });

  React.useEffect(() => {
    if (editingTransaction || viewingTransaction) {
      const target = editingTransaction || viewingTransaction;
      setFormData({
        description: target.description,
        amount: target.amount.toString(),
        type: target.type,
        category: target.category,
        date: new Date(target.date).toISOString().split('T')[0]
      });
    } else {
      setFormData({
        description: '',
        amount: '',
        type: 'Entrada',
        category: 'Vendas',
        date: new Date().toISOString().split('T')[0]
      });
    }
  }, [editingTransaction, viewingTransaction, view]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    const data = {
      description: formData.description,
      amount: parseFloat(formData.amount),
      type: formData.type,
      category: formData.category,
      date: new Date(formData.date).toISOString(),
      userId: user.id
    };

    try {
      if (editingTransaction) {
        await api.updateTransaction(editingTransaction.id, data);
      } else {
        await api.addTransaction(data);
      }
      setView('list');
      setEditingTransaction(null);
      setViewingTransaction(null);
      setFormData({
        description: '',
        amount: '',
        type: 'Entrada',
        category: 'Vendas',
        date: new Date().toISOString().split('T')[0]
      });
      refresh();
      alert(editingTransaction ? 'Transação atualizada!' : 'Transação registrada com sucesso!');
    } catch (err) {
      console.error("Error saving transaction:", err);
      alert("Erro ao salvar transação.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDuplicate = async (transaction: any) => {
    if (!user) return;
    try {
      const data = {
        description: `${transaction.description} (Cópia)`,
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        date: new Date().toISOString(),
        userId: user.id
      };
      await api.addTransaction(data);
      refresh();
      alert('Transação duplicada com sucesso!');
    } catch (err) {
      console.error("Error duplicating transaction:", err);
      alert("Erro ao duplicar transação.");
    }
  };

  const handleDelete = async () => {
    if (!user || !transactionToDelete) return;
    try {
      await api.deleteTransaction(transactionToDelete);
      setTransactionToDelete(null);
      setIsDeleteDialogOpen(false);
      refresh();
    } catch (err) {
      console.error("Error deleting transaction:", err);
    }
  };

  if (view === 'form' || view === 'detail') {
    const isDetail = view === 'detail';
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => { setView('list'); setEditingTransaction(null); setViewingTransaction(null); }} className="rounded-full">
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {isDetail ? 'Detalhes da Transação' : (editingTransaction ? 'Editar Transação' : 'Nova Transação')}
            </h2>
            <p className="text-slate-500 text-sm">
              {isDetail ? 'Visualize as informações da transação.' : 'Registre uma nova entrada ou saída financeira.'}
            </p>
          </div>
        </div>

        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input 
                  value={formData.description || ''} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Ex: Venda Bolo de Chocolate"
                  required
                  disabled={isDetail}
                  className="h-12"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Valor (R$)</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={formData.amount || ''} 
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    placeholder="0.00"
                    required
                    disabled={isDetail}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select 
                    value={formData.type || ''} 
                    onValueChange={(val: any) => setFormData({...formData, type: val})}
                    disabled={isDetail}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Entrada">Entrada</SelectItem>
                      <SelectItem value="Saída">Saída</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select 
                    value={formData.category || ''} 
                    onValueChange={(val) => setFormData({...formData, category: val})}
                    disabled={isDetail}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Vendas">Vendas</SelectItem>
                      <SelectItem value="Insumos">Insumos</SelectItem>
                      <SelectItem value="Equipamentos">Equipamentos</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input 
                    type="date"
                    value={formData.date || ''} 
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                    disabled={isDetail}
                    className="h-12"
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => { setView('list'); setEditingTransaction(null); setViewingTransaction(null); }} className="flex-1 h-12 font-bold">
                  {isDetail ? 'Voltar' : 'Cancelar'}
                </Button>
                {!isDetail && (
                  <Button 
                    type="submit" 
                    disabled={isSaving}
                    className="flex-[2] bg-primary hover:bg-primary/90 h-12 text-base font-bold shadow-lg shadow-primary/20"
                  >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingTransaction ? 'Salvar Alterações' : 'Lançar Transação')}
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
        title="Excluir Transação"
        description="Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-emerald-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <TrendingUp size={20} />
              </div>
              <Badge className="bg-white/20 text-white border-none">Entradas</Badge>
            </div>
            <p className="text-emerald-100 text-sm font-medium">Total Recebido</p>
            <h3 className="text-3xl font-black mt-1">R$ {stats.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm bg-red-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <TrendingDown size={20} />
              </div>
              <Badge className="bg-white/20 text-white border-none">Saídas</Badge>
            </div>
            <p className="text-red-100 text-sm font-medium">Total Gasto</p>
            <h3 className="text-3xl font-black mt-1">R$ {stats.expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-slate-900 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <DollarSign size={20} />
              </div>
              <Badge className="bg-white/20 text-white border-none">Saldo</Badge>
            </div>
            <p className="text-slate-400 text-sm font-medium">Saldo em Caixa</p>
            <h3 className="text-3xl font-black mt-1">R$ {stats.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="hidden sm:block">
          <h2 className="text-2xl font-bold text-slate-900">Fluxo de Caixa</h2>
          <p className="text-slate-500">Acompanhe suas entradas e saídas detalhadamente</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download size={18} />
            Exportar
          </Button>
          <Button onClick={() => setView('form')} className="bg-primary hover:bg-primary/90 gap-2">
            <Plus size={18} />
            Novo
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="p-4 font-bold text-slate-400 text-[10px] uppercase tracking-wider">Data</th>
                  <th className="p-4 font-bold text-slate-400 text-[10px] uppercase tracking-wider">Descrição</th>
                  <th className="p-4 font-bold text-slate-400 text-[10px] uppercase tracking-wider">Categoria</th>
                  <th className="p-4 font-bold text-slate-400 text-[10px] uppercase tracking-wider">Valor</th>
                  <th className="p-4 text-right font-bold text-slate-400 text-[10px] uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4 text-sm text-slate-500">{new Date(t.date).toLocaleDateString()}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-1.5 rounded-lg",
                          t.type === 'Entrada' ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
                        )}>
                          {t.type === 'Entrada' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        </div>
                        <span className="text-sm font-bold text-slate-900">{t.description}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-[10px] font-bold">{t.category}</Badge>
                    </td>
                    <td className={cn(
                      "p-4 text-sm font-black",
                      t.type === 'Entrada' ? "text-emerald-600" : "text-red-600"
                    )}>
                      {t.type === 'Entrada' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400" title="Visualizar" onClick={() => {
                          setViewingTransaction(t);
                          setView('detail');
                        }}>
                          <Eye size={14} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400" title="Editar" onClick={() => {
                          setEditingTransaction(t);
                          setView('form');
                        }}>
                          <Edit2 size={14} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400" title="Duplicar" onClick={() => handleDuplicate(t)}>
                          <Copy size={14} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 transition-opacity" title="Excluir" onClick={() => {
                          setTransactionToDelete(t.id);
                          setIsDeleteDialogOpen(true);
                        }}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-slate-400 italic">Nenhuma transação registrada</td>
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
};
