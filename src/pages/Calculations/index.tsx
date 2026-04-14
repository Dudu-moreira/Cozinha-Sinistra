import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Calculator, Search, ArrowRight, Save, ChefHat, DollarSign, Package, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Calculation } from '@/types';
import { api } from '@/services/api';
import { useAuth } from '@/AuthContext';
import { DeleteConfirmDialog } from '@/components/Shared/DeleteConfirmDialog';
import { Pagination } from '@/components/Shared/Pagination';

interface CalculationsPageProps {
  calculations: Calculation[];
  refresh: () => void;
}

export const CalculationsPage = ({ calculations, refresh }: CalculationsPageProps) => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const totalPages = Math.ceil(calculations.length / itemsPerPage);
  const paginatedCalculations = calculations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const [view, setView] = useState<'list' | 'form'>('list');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [calculationToDelete, setCalculationToDelete] = useState<string | null>(null);
  
  const initialFormState = {
    title: '',
    ingredients: [
      { id: Math.random().toString(36).substr(2, 9), name: '', price: '', totalQty: '', usedQty: '' }
    ],
    additionalCosts: {
      expenses: '',
      labor: '',
      filling: ''
    },
    profitMargin: '30',
    production: {
      yield: '1',
      weight: ''
    }
  };

  const [formData, setFormData] = useState(initialFormState);

  // Real-time calculations
  const results = useMemo(() => {
    const ingredientsCost = formData.ingredients.reduce((acc, ing) => {
      const price = parseFloat(ing.price) || 0;
      const total = parseFloat(ing.totalQty) || 1;
      const used = parseFloat(ing.usedQty) || 0;
      return acc + (price / total) * used;
    }, 0);

    const additional = 
      (parseFloat(formData.additionalCosts.expenses) || 0) +
      (parseFloat(formData.additionalCosts.labor) || 0) +
      (parseFloat(formData.additionalCosts.filling) || 0);

    const subtotal = ingredientsCost + additional;
    const margin = parseFloat(formData.profitMargin) || 0;
    const totalValue = subtotal + (subtotal * margin / 100);
    
    const yieldQty = parseFloat(formData.production.yield) || 1;
    const unitCost = totalValue / yieldQty;

    return {
      ingredientsCost,
      additional,
      subtotal,
      totalValue,
      unitCost
    };
  }, [formData]);

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [
        ...formData.ingredients,
        { id: Math.random().toString(36).substr(2, 9), name: '', price: '', totalQty: '', usedQty: '' }
      ]
    });
  };

  const removeIngredient = (id: string) => {
    if (formData.ingredients.length === 1) return;
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter(ing => ing.id !== id)
    });
  };

  const updateIngredient = (id: string, field: string, value: string) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.map(ing => 
        ing.id === id ? { ...ing, [field]: value } : ing
      )
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const data = {
      ...formData,
      totalValue: results.totalValue,
      unitCost: results.unitCost,
      userId: user.id
    };

    try {
      await api.addCalculation(data);
      setView('list');
      setFormData(initialFormState);
      refresh();
    } catch (err) {
      console.error("Error saving calculation:", err);
    }
  };

  const handleDelete = async () => {
    if (!user || !calculationToDelete) return;
    try {
      await api.deleteCalculation(calculationToDelete);
      setCalculationToDelete(null);
      setIsDeleteDialogOpen(false);
      refresh();
    } catch (err) {
      console.error("Error deleting calculation:", err);
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  if (view === 'form') {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setView('list')} className="rounded-full">
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Novo Cálculo de Custo</h2>
            <p className="text-slate-500 text-sm">Preencha os dados abaixo para calcular o custo da sua produção.</p>
          </div>
        </div>

        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* 1. Título */}
              <div className="space-y-2">
                <Label>Nome do Cálculo / Receita</Label>
                <Input 
                  value={formData.title || ''} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Ex: Bolo de Brigadeiro Gourmet"
                  required
                  className="text-lg font-bold h-12"
                />
              </div>

              {/* 2. Ingredientes */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-bold flex items-center gap-2">
                    <ChefHat size={18} className="text-primary" />
                    1. Ingredientes
                  </Label>
                  <Button type="button" variant="outline" size="sm" onClick={addIngredient} className="gap-2">
                    <Plus size={14} /> Adicionar
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {formData.ingredients.map((ing) => (
                    <div key={ing.id} className="grid grid-cols-1 sm:grid-cols-12 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 relative group">
                      <div className="sm:col-span-4 space-y-1">
                        <Label className="text-[10px] uppercase text-slate-400 font-bold">Nome</Label>
                        <Input 
                          placeholder="Ingrediente" 
                          value={ing.name || ''} 
                          onChange={(e) => updateIngredient(ing.id, 'name', e.target.value)}
                          required
                        />
                      </div>
                      <div className="sm:col-span-2 space-y-1">
                        <Label className="text-[10px] uppercase text-slate-400 font-bold">Preço (R$)</Label>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="0.00" 
                          value={ing.price || ''} 
                          onChange={(e) => updateIngredient(ing.id, 'price', e.target.value)}
                          required
                        />
                      </div>
                      <div className="sm:col-span-2 space-y-1">
                        <Label className="text-[10px] uppercase text-slate-400 font-bold">Qtd Total</Label>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="1000" 
                          value={ing.totalQty || ''} 
                          onChange={(e) => updateIngredient(ing.id, 'totalQty', e.target.value)}
                          required
                        />
                      </div>
                      <div className="sm:col-span-2 space-y-1">
                        <Label className="text-[10px] uppercase text-slate-400 font-bold">Qtd Uso</Label>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="250" 
                          value={ing.usedQty || ''} 
                          onChange={(e) => updateIngredient(ing.id, 'usedQty', e.target.value)}
                          required
                        />
                      </div>
                      <div className="sm:col-span-2 space-y-1">
                        <Label className="text-[10px] uppercase text-slate-400 font-bold">Custo</Label>
                        <div className="h-10 flex items-center px-3 bg-white rounded-lg border border-slate-200 text-sm font-bold text-emerald-600">
                          {formatCurrency((parseFloat(ing.price) / (parseFloat(ing.totalQty) || 1)) * (parseFloat(ing.usedQty) || 0))}
                        </div>
                      </div>
                      {formData.ingredients.length > 1 && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-white shadow-sm border border-slate-100 text-red-500 transition-opacity"
                          onClick={() => removeIngredient(ing.id)}
                        >
                          <Trash2 size={12} />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Custos Adicionais & Produção */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label className="text-base font-bold flex items-center gap-2">
                    <DollarSign size={18} className="text-primary" />
                    2. Custos Adicionais
                  </Label>
                  <div className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="space-y-1">
                      <Label className="text-xs">Gastos Extras (Gás, Luz, etc)</Label>
                      <Input 
                        type="number" 
                        step="0.01" 
                        value={formData.additionalCosts.expenses || ''} 
                        onChange={(e) => setFormData({...formData, additionalCosts: {...formData.additionalCosts, expenses: e.target.value}})}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Mão de Obra</Label>
                      <Input 
                        type="number" 
                        step="0.01" 
                        value={formData.additionalCosts.labor || ''} 
                        onChange={(e) => setFormData({...formData, additionalCosts: {...formData.additionalCosts, labor: e.target.value}})}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Custo do Recheio</Label>
                      <Input 
                        type="number" 
                        step="0.01" 
                        value={formData.additionalCosts.filling || ''} 
                        onChange={(e) => setFormData({...formData, additionalCosts: {...formData.additionalCosts, filling: e.target.value}})}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-bold flex items-center gap-2">
                    <Package size={18} className="text-primary" />
                    3. Produção
                  </Label>
                  <div className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="space-y-1">
                      <Label className="text-xs">Rendimento (Unidades)</Label>
                      <Input 
                        type="number" 
                        value={formData.production.yield || ''} 
                        onChange={(e) => setFormData({...formData, production: {...formData.production, yield: e.target.value}})}
                        placeholder="1"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Peso por Unidade (Opcional)</Label>
                      <Input 
                        placeholder="Ex: 100g"
                        value={formData.production.weight || ''} 
                        onChange={(e) => setFormData({...formData, production: {...formData.production, weight: e.target.value}})}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Margem de Lucro (%)</Label>
                      <Input 
                        type="number" 
                        value={formData.profitMargin || ''} 
                        onChange={(e) => setFormData({...formData, profitMargin: e.target.value})}
                        placeholder="30"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Resumo */}
              <div className="p-8 bg-slate-900 rounded-2xl text-white space-y-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="text-slate-400 text-sm">Subtotal (Custo Produção)</span>
                  <span className="font-bold text-lg">{formatCurrency(results.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="text-slate-400 text-sm">Margem aplicada ({formData.profitMargin}%)</span>
                  <span className="text-emerald-400 font-bold text-lg">+{formatCurrency(results.totalValue - results.subtotal)}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                  <div className="p-5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                    <p className="text-[10px] uppercase text-slate-400 font-black mb-1 tracking-wider">Valor de Venda Total</p>
                    <p className="text-3xl font-black text-white">{formatCurrency(results.totalValue)}</p>
                  </div>
                  <div className="p-5 bg-primary/20 rounded-2xl border border-primary/30 backdrop-blur-sm">
                    <p className="text-[10px] uppercase text-primary-foreground/60 font-black mb-1 tracking-wider">Custo por Unidade</p>
                    <p className="text-3xl font-black text-primary-foreground">{formatCurrency(results.unitCost)}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => setView('list')} className="flex-1 h-12 font-bold">
                  Cancelar
                </Button>
                <Button type="submit" className="flex-[2] bg-primary hover:bg-primary/90 gap-2 h-12 text-base font-bold shadow-lg shadow-primary/20">
                  <Save size={20} />
                  Salvar Cálculo
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
        title="Excluir Cálculo"
        description="Tem certeza que deseja excluir este cálculo salvo?"
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="hidden sm:block">
          <h2 className="text-2xl font-bold text-slate-900">Calculadora de Custos</h2>
          <p className="text-slate-500">Calcule o custo exato de cada receita e defina seu lucro</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setView('form')} className="bg-primary hover:bg-primary/90 gap-2">
            <Plus size={18} />
            Novo Cálculo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <CardTitle className="text-lg">Cálculos Salvos</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-50">
              {paginatedCalculations.map((calc) => (
                <div key={calc.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                      <Calculator size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{calc.title}</h4>
                      <p className="text-xs text-slate-400">{new Date(calc.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right mr-4">
                      <p className="text-[10px] uppercase text-slate-400 font-bold">Venda Sugerida</p>
                      <p className="text-sm font-black text-emerald-600">{formatCurrency(calc.totalValue)}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-red-600 transition-opacity" onClick={() => {
                      setCalculationToDelete(calc.id);
                      setIsDeleteDialogOpen(true);
                    }}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
              {calculations.length === 0 && (
                <div className="p-12 text-center text-slate-400 italic">Nenhum cálculo salvo</div>
              )}
            </div>
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={setCurrentPage} 
            />
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-primary text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator size={20} />
              Dica Pro
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 relative z-10">
            <p className="text-sm text-primary-foreground/80 leading-relaxed">
              Lembre-se de incluir custos fixos (água, luz, gás) e sua mão de obra no cálculo final para garantir um lucro real.
            </p>
            <Button variant="secondary" className="w-full font-bold text-primary">
              Ver Guia de Precificação
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
