import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Edit2, Settings2, Calendar as CalendarIcon, Clock, MoreVertical, ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Task, ProductionColumn } from '@/types';
import { api } from '@/services/api';
import { useAuth } from '@/AuthContext';
import { DeleteConfirmDialog } from '@/components/Shared/DeleteConfirmDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface ProductionPageProps {
  tasks: Task[];
  columns: ProductionColumn[];
  refresh: () => void;
}

export const ProductionPage = ({ tasks, columns, refresh }: ProductionPageProps) => {
  const { user } = useAuth();
  const [view, setView] = useState<'board' | 'task-form' | 'column-form'>('board');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    status: '',
    dueDate: ''
  });

  // Column management state
  const [isColumnDeleteDialogOpen, setIsColumnDeleteDialogOpen] = useState(false);
  const [columnToDelete, setColumnToDelete] = useState<string | null>(null);
  const [editingColumn, setEditingColumn] = useState<ProductionColumn | null>(null);
  const [columnFormData, setColumnFormData] = useState({
    name: '',
    order: 0
  });
  const [columnError, setColumnError] = useState<string | null>(null);

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
  }, [editingTask, view, columns]);

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
  }, [editingColumn, view, columns.length]);

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
      setView('board');
      setEditingTask(null);
      refresh();
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

    // Check for duplicate names
    const isDuplicate = columns.some(col => 
      col.name.toLowerCase() === columnFormData.name.toLowerCase() && 
      col.id !== editingColumn?.id
    );

    if (isDuplicate) {
      setColumnError("Já existe uma coluna com este nome.");
      return;
    }

    setColumnError(null);
    try {
      if (editingColumn) {
        // If name changed, update all tasks with the old status
        if (editingColumn.name !== columnFormData.name) {
          await api.updateTasksStatus(editingColumn.name, columnFormData.name, user.id);
        }
        await api.updateProductionColumn(editingColumn.id, data);
      } else {
        await api.addProductionColumn(data);
      }
      setView('board');
      setEditingColumn(null);
      refresh();
    } catch (err) {
      console.error("Error saving column:", err);
    }
  };

  const updateTaskStatus = async (id: string, newStatus: string) => {
    if (!user) return;
    try {
      await api.updateTask(id, { status: newStatus });
      refresh();
    } catch (err) {
      console.error("Error updating task status:", err);
    }
  };

  const handleDelete = async () => {
    if (!user || !taskToDelete) return;
    try {
      await api.deleteTask(taskToDelete);
      setTaskToDelete(null);
      setIsDeleteDialogOpen(false);
      refresh();
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  const handleColumnDelete = async () => {
    if (!user || !columnToDelete) return;
    try {
      await api.deleteProductionColumn(columnToDelete);
      setColumnToDelete(null);
      setIsColumnDeleteDialogOpen(false);
      refresh();
    } catch (err) {
      console.error("Error deleting column:", err);
    }
  };

  if (view === 'task-form') {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => { setView('board'); setEditingTask(null); }} className="rounded-full">
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}</h2>
            <p className="text-slate-500 text-sm">Preencha os detalhes da tarefa abaixo.</p>
          </div>
        </div>

        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
              <div className="space-y-2">
                <Label>Título da Tarefa</Label>
                <Input 
                  value={formData.title || ''} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Ex: Preparar massa do bolo"
                  required
                  className="h-12"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Coluna</Label>
                  <Select 
                    value={formData.status || ''} 
                    onValueChange={(val) => setFormData({...formData, status: val})}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map(col => (
                        <SelectItem key={col.id} value={col.name}>{col.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Data Limite</Label>
                  <Input 
                    type="date"
                    value={formData.dueDate || ''} 
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                    required
                    className="h-12"
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => { setView('board'); setEditingTask(null); }} className="flex-1 h-12 font-bold">
                  Cancelar
                </Button>
                <Button type="submit" className="flex-[2] bg-primary hover:bg-primary/90 h-12 text-base font-bold shadow-lg shadow-primary/20">
                  {editingTask ? 'Salvar Alterações' : 'Criar Tarefa'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (view === 'column-form') {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => { setView('board'); setEditingColumn(null); }} className="rounded-full">
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Gerenciar Colunas</h2>
            <p className="text-slate-500 text-sm">Adicione ou edite as colunas da sua linha de produção.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              <form onSubmit={handleColumnSubmit} className="space-y-6">
                {columnError && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg">
                    {columnError}
                  </div>
                )}
                <div className="space-y-2">
                  <Label>{editingColumn ? 'Editar Coluna' : 'Nova Coluna'}</Label>
                  <Input 
                    placeholder="Nome da coluna" 
                    value={columnFormData.name || ''}
                    onChange={(e) => setColumnFormData({...columnFormData, name: e.target.value})}
                    className="h-12"
                    required
                  />
                </div>
                <div className="flex gap-4 pt-2">
                  <Button type="button" variant="outline" onClick={() => { setView('board'); setEditingColumn(null); }} className="flex-1 h-12 font-bold">
                    Voltar
                  </Button>
                  <Button type="submit" className="flex-[2] bg-primary hover:bg-primary/90 h-12 text-base font-bold shadow-lg shadow-primary/20">
                    {editingColumn ? 'Salvar Alterações' : 'Adicionar Coluna'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Colunas Atuais</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="space-y-3">
                {columns.map(col => (
                  <div key={col.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-700">{col.name}</span>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-primary hover:bg-white" onClick={() => {
                        setEditingColumn(col);
                      }}>
                        <Edit2 size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-10 w-10 text-red-400 hover:text-red-600 hover:bg-white" onClick={() => {
                        setColumnToDelete(col.id);
                        setIsColumnDeleteDialogOpen(true);
                      }}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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
        title="Excluir Tarefa"
        description="Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita."
      />
      <DeleteConfirmDialog 
        isOpen={isColumnDeleteDialogOpen} 
        onClose={() => setIsColumnDeleteDialogOpen(false)} 
        onConfirm={handleColumnDelete}
        title="Excluir Coluna"
        description="Tem certeza que deseja excluir esta coluna? Todas as tarefas nela continuarão existindo, mas sem uma coluna válida."
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="hidden sm:block">
          <h2 className="text-2xl font-bold text-slate-900">Linha de Produção</h2>
          <p className="text-slate-500">Gerencie o fluxo de trabalho da sua cozinha</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setView('column-form')} className="gap-2">
            <Settings2 size={18} />
            Coluna
          </Button>
          <Button onClick={() => setView('task-form')} className="bg-primary hover:bg-primary/90 gap-2">
            <Plus size={18} />
            Tarefa
          </Button>
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-6 min-h-[calc(100vh-250px)]">
        {columns.map((column) => {
          const columnTasks = tasks.filter(t => t.status === column.name);
          return (
            <div key={column.id} className="w-[300px] shrink-0 flex flex-col gap-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900">{column.name}</h3>
                  <Badge variant="secondary" className="bg-slate-100 text-slate-500">{columnTasks.length}</Badge>
                </div>
              </div>
              
              <div className="flex-1 bg-slate-50/50 rounded-xl p-3 border border-slate-100 space-y-3">
                {columnTasks.map((task) => (
                  <Card key={task.id} className="border-none shadow-sm hover:shadow-md transition-shadow group">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-sm font-bold text-slate-900 leading-tight">{task.title}</h4>
                        <DropdownMenu>
                          <DropdownMenuTrigger render={
                            <Button variant="ghost" size="icon" className="h-8 w-8 transition-opacity">
                              <MoreVertical size={14} />
                            </Button>
                          } />
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setEditingTask(task);
                              setView('task-form');
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
                      
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Clock size={12} />
                          <span className="text-[10px] font-bold">
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          {(() => {
                            const sortedCols = [...columns].sort((a, b) => a.order - b.order);
                            const currIdx = sortedCols.findIndex(c => c.name === column.name);
                            const prevCol = currIdx > 0 ? sortedCols[currIdx - 1] : null;
                            const nextCol = currIdx < sortedCols.length - 1 ? sortedCols[currIdx + 1] : null;

                            return (
                              <>
                                {prevCol && (
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6 text-slate-300 hover:text-primary"
                                    onClick={() => updateTaskStatus(task.id, prevCol.name)}
                                    title={`Mover para ${prevCol.name}`}
                                  >
                                    <ArrowLeft size={12} />
                                  </Button>
                                )}
                                {nextCol && (
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6 text-slate-300 hover:text-primary"
                                    onClick={() => updateTaskStatus(task.id, nextCol.name)}
                                    title={`Mover para ${nextCol.name}`}
                                  >
                                    <ArrowRight size={12} />
                                  </Button>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {columnTasks.length === 0 && (
                  <div className="py-8 text-center text-slate-300 text-xs italic border-2 border-dashed border-slate-100 rounded-lg">
                    Vazio
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
