import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Edit2, Package, AlertTriangle, Search, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Ingredient } from '@/types';
import { api } from '@/services/api';
import { useAuth } from '@/AuthContext';
import { DeleteConfirmDialog } from '@/components/Shared/DeleteConfirmDialog';
import { Pagination } from '@/components/Shared/Pagination';

interface InventoryPageProps {
  ingredients: Ingredient[];
  refresh: () => void;
}

export const InventoryPage = ({ ingredients, refresh }: InventoryPageProps) => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredIngredients = ingredients.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const totalPages = Math.ceil(filteredIngredients.length / itemsPerPage);
  const paginatedIngredients = filteredIngredients.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const [view, setView] = useState<'list' | 'form'>('list');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [ingredientToDelete, setIngredientToDelete] = useState<string | null>(null);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    unit: 'kg',
    minQuantity: ''
  });

  React.useEffect(() => {
    if (editingIngredient) {
      setFormData({
        name: editingIngredient.name,
        quantity: editingIngredient.quantity.toString(),
        unit: editingIngredient.unit,
        minQuantity: editingIngredient.minQuantity.toString()
      });
    } else {
      setFormData({
        name: '',
        quantity: '',
        unit: 'kg',
        minQuantity: ''
      });
    }
  }, [editingIngredient, view]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const data = {
      name: formData.name,
      quantity: parseFloat(formData.quantity),
      unit: formData.unit,
      minQuantity: parseFloat(formData.minQuantity),
      userId: user.id
    };

    try {
      if (editingIngredient) {
        await api.updateIngredient(editingIngredient.id, data);
      } else {
        await api.addIngredient(data);
      }
      setView('list');
      setEditingIngredient(null);
      refresh();
    } catch (err) {
      console.error("Error saving ingredient:", err);
    }
  };

  const handleDelete = async () => {
    if (!user || !ingredientToDelete) return;
    try {
      await api.deleteIngredient(ingredientToDelete);
      setIngredientToDelete(null);
      setIsDeleteDialogOpen(false);
      refresh();
    } catch (err) {
      console.error("Error deleting ingredient:", err);
    }
  };

  if (view === 'form') {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => { setView('list'); setEditingIngredient(null); }} className="rounded-full">
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{editingIngredient ? 'Editar Insumo' : 'Novo Insumo'}</h2>
            <p className="text-slate-500 text-sm">Preencha os dados do insumo abaixo.</p>
          </div>
        </div>

        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
              <div className="space-y-2">
                <Label>Nome do Insumo</Label>
                <Input 
                  value={formData.name || ''} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: Farinha de Trigo"
                  required
                  className="h-12"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Quantidade Atual</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={formData.quantity || ''} 
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    placeholder="0.00"
                    required
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unidade</Label>
                  <Input 
                    value={formData.unit || ''} 
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    placeholder="kg, un, ml..."
                    required
                    className="h-12"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Estoque Mínimo (Alerta)</Label>
                <Input 
                  type="number"
                  step="0.01"
                  value={formData.minQuantity || ''} 
                  onChange={(e) => setFormData({...formData, minQuantity: e.target.value})}
                  placeholder="0.00"
                  required
                  className="h-12"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => { setView('list'); setEditingIngredient(null); }} className="flex-1 h-12 font-bold">
                  Cancelar
                </Button>
                <Button type="submit" className="flex-[2] bg-primary hover:bg-primary/90 h-12 text-base font-bold shadow-lg shadow-primary/20">
                  {editingIngredient ? 'Salvar Alterações' : 'Criar Insumo'}
                </Button>
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
        title="Excluir Insumo"
        description="Tem certeza que deseja excluir este insumo? Esta ação não pode ser desfeita."
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="hidden sm:block">
          <h2 className="text-2xl font-bold text-slate-900">Estoque de Insumos</h2>
          <p className="text-slate-500">Controle seus materiais e evite desperdícios</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              placeholder="Buscar insumo..." 
              className="pl-10 w-full sm:w-[250px]" 
              value={searchTerm || ''}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => setView('form')} className="bg-primary hover:bg-primary/90 gap-2">
            <Plus size={18} />
            Novo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {paginatedIngredients.map((ing) => {
          const isLow = ing.quantity <= ing.minQuantity;
          return (
            <Card key={ing.id} className={cn(
              "border-none shadow-sm group relative overflow-hidden",
              isLow && "ring-1 ring-red-100"
            )}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <div className={cn(
                    "p-2 rounded-lg",
                    isLow ? "bg-red-50 text-red-600" : "bg-slate-50 text-slate-500"
                  )}>
                    <Package size={20} />
                  </div>
                  <div className="flex gap-1 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                      setEditingIngredient(ing);
                      setView('form');
                    }}>
                      <Edit2 size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => {
                      setIngredientToDelete(ing.id);
                      setIsDeleteDialogOpen(true);
                    }}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
                
                <h3 className="font-bold text-slate-900 mb-1">{ing.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className={cn(
                    "text-2xl font-black",
                    isLow ? "text-red-600" : "text-slate-900"
                  )}>{ing.quantity}</span>
                  <span className="text-xs font-bold text-slate-400 uppercase">{ing.unit}</span>
                </div>
                
                {isLow && (
                  <div className="mt-3 flex items-center gap-1.5 text-red-600">
                    <AlertTriangle size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Estoque Crítico</span>
                  </div>
                )}
                
                <div className="mt-4 pt-3 border-t border-slate-50 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Mínimo: {ing.minQuantity}{ing.unit}</span>
                  <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full",
                        isLow ? "bg-red-500" : "bg-emerald-500"
                      )} 
                      style={{ width: `${Math.min((ing.quantity / ing.minQuantity) * 50, 100)}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {ingredients.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
            Nenhum insumo cadastrado
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
};
