import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Edit2, BookOpen, Calculator, Search, ChevronRight, ArrowLeft, Eye, Copy, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/services/api';
import { useAuth } from '@/AuthContext';
import { DeleteConfirmDialog } from '@/components/Shared/DeleteConfirmDialog';
import { Pagination } from '@/components/Shared/Pagination';

interface RecipesPageProps {
  recipes: any[];
  refresh: () => void;
}

export const RecipesPage = ({ recipes, refresh }: RecipesPageProps) => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredRecipes = recipes.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const totalPages = Math.ceil(filteredRecipes.length / itemsPerPage);
  const paginatedRecipes = filteredRecipes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const [view, setView] = useState<'list' | 'form' | 'detail'>('list');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<string | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<any | null>(null);
  const [viewingRecipe, setViewingRecipe] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    yield: '',
    cost: '',
    ingredients: [] as any[]
  });

  useEffect(() => {
    if (editingRecipe || viewingRecipe) {
      const target = editingRecipe || viewingRecipe;
      setFormData({
        name: target.name,
        yield: target.yield.toString(),
        cost: target.cost.toString(),
        ingredients: target.ingredients || []
      });
    } else {
      setFormData({
        name: '',
        yield: '',
        cost: '',
        ingredients: []
      });
    }
  }, [editingRecipe, viewingRecipe, view]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    const data = {
      name: formData.name,
      yield: parseFloat(formData.yield),
      cost: parseFloat(formData.cost),
      ingredients: formData.ingredients,
      userId: user.id
    };

    try {
      if (editingRecipe) {
        await api.updateRecipe(editingRecipe.id, data);
      } else {
        await api.addRecipe(data);
      }
      setView('list');
      setEditingRecipe(null);
      refresh();
      alert(editingRecipe ? 'Receita atualizada!' : 'Receita cadastrada com sucesso!');
    } catch (err) {
      console.error("Error saving recipe:", err);
      alert("Erro ao salvar receita.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDuplicate = async (recipe: any) => {
    if (!user) return;
    try {
      const data = {
        name: `${recipe.name} (Cópia)`,
        yield: recipe.yield,
        cost: recipe.cost,
        ingredients: recipe.ingredients,
        userId: user.id
      };
      await api.addRecipe(data);
      refresh();
      alert('Receita duplicada com sucesso!');
    } catch (err) {
      console.error("Error duplicating recipe:", err);
      alert("Erro ao duplicar receita.");
    }
  };

  const handleDelete = async () => {
    if (!user || !recipeToDelete) return;
    try {
      await api.deleteRecipe(recipeToDelete);
      setRecipeToDelete(null);
      setIsDeleteDialogOpen(false);
      refresh();
    } catch (err) {
      console.error("Error deleting recipe:", err);
    }
  };

  if (view === 'form' || view === 'detail') {
    const isDetail = view === 'detail';
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => { setView('list'); setEditingRecipe(null); setViewingRecipe(null); }} className="rounded-full">
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {isDetail ? 'Detalhes da Receita' : (editingRecipe ? 'Editar Receita' : 'Nova Receita')}
            </h2>
            <p className="text-slate-500 text-sm">
              {isDetail ? 'Visualize as informações da receita.' : 'Preencha os detalhes da receita abaixo.'}
            </p>
          </div>
        </div>

        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
              <div className="space-y-2">
                <Label>Nome da Receita</Label>
                <Input 
                  value={formData.name || ''} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: Bolo de Cenoura com Brigadeiro"
                  required
                  disabled={isDetail}
                  className="h-12"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Rendimento (unidades/fatias)</Label>
                  <Input 
                    type="number"
                    value={formData.yield || ''} 
                    onChange={(e) => setFormData({...formData, yield: e.target.value})}
                    placeholder="12"
                    required
                    disabled={isDetail}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Custo Estimado (R$)</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={formData.cost || ''} 
                    onChange={(e) => setFormData({...formData, cost: e.target.value})}
                    placeholder="0.00"
                    required
                    disabled={isDetail}
                    className="h-12"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Ingredientes (Opcional)</Label>
                <p className="text-xs text-slate-500 mb-2">Adicione os ingredientes para cálculo automático de custo no futuro.</p>
                <div className="p-12 border-2 border-dashed border-slate-100 rounded-2xl text-center text-slate-400 text-sm">
                  Funcionalidade de Ficha Técnica em breve
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => { setView('list'); setEditingRecipe(null); setViewingRecipe(null); }} className="flex-1 h-12 font-bold">
                  {isDetail ? 'Voltar' : 'Cancelar'}
                </Button>
                {!isDetail && (
                  <Button 
                    type="submit" 
                    disabled={isSaving}
                    className="flex-[2] bg-primary hover:bg-primary/90 h-12 text-base font-bold shadow-lg shadow-primary/20"
                  >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingRecipe ? 'Salvar Alterações' : 'Criar Receita')}
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
        title="Excluir Receita"
        description="Tem certeza que deseja excluir esta receita? Esta ação não pode ser desfeita."
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="hidden sm:block">
          <h2 className="text-2xl font-bold text-slate-900">Minhas Receitas</h2>
          <p className="text-slate-500">Organize seu catálogo de produtos e fichas técnicas</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              placeholder="Buscar receita..." 
              className="pl-10 w-full sm:w-[250px]" 
              value={searchTerm || ''}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => setView('form')} className="bg-primary hover:bg-primary/90 gap-2">
            <Plus size={18} />
            Nova
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedRecipes.map((recipe) => (
          <Card key={recipe.id} className="border-none shadow-sm hover:shadow-md transition-shadow group overflow-hidden">
            <div className="h-2 bg-primary/20" />
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-slate-50 rounded-xl text-slate-400">
                  <BookOpen size={24} />
                </div>
                <div className="flex gap-1 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8" title="Visualizar" onClick={() => {
                    setViewingRecipe(recipe);
                    setView('detail');
                  }}>
                    <Eye size={14} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" title="Editar" onClick={() => {
                    setEditingRecipe(recipe);
                    setView('form');
                  }}>
                    <Edit2 size={14} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" title="Duplicar" onClick={() => handleDuplicate(recipe)}>
                    <Copy size={14} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" title="Excluir" onClick={() => {
                    setRecipeToDelete(recipe.id);
                    setIsDeleteDialogOpen(true);
                  }}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
              
              <h3 className="font-bold text-slate-900 text-lg mb-4">{recipe.name}</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Rendimento</p>
                  <p className="text-sm font-bold text-slate-700">{recipe.yield} unidades</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Custo/Un</p>
                  <p className="text-sm font-bold text-emerald-600">R$ {(recipe.cost / recipe.yield).toFixed(2)}</p>
                </div>
              </div>
              
              <Button variant="outline" className="w-full gap-2 text-xs font-bold group">
                Ver Ficha Técnica
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Button>
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
};
