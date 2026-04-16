import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Edit2, Truck, Phone, Mail, Search, MapPin, ArrowLeft, Eye, Copy, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/services/api';
import { useAuth } from '@/AuthContext';
import { DeleteConfirmDialog } from '@/components/Shared/DeleteConfirmDialog';
import { Pagination } from '@/components/Shared/Pagination';

interface SuppliersPageProps {
  suppliers: any[];
  refresh: () => void;
}

export const SuppliersPage = ({ suppliers, refresh }: SuppliersPageProps) => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);
  const paginatedSuppliers = filteredSuppliers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const [view, setView] = useState<'list' | 'form' | 'detail'>('list');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<string | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<any | null>(null);
  const [viewingSupplier, setViewingSupplier] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    phone: '',
    email: '',
    address: ''
  });

  React.useEffect(() => {
    if (editingSupplier || viewingSupplier) {
      const target = editingSupplier || viewingSupplier;
      setFormData({
        name: target.name,
        category: target.category || '',
        phone: target.phone || '',
        email: target.email || '',
        address: target.address || ''
      });
    } else {
      setFormData({
        name: '',
        category: '',
        phone: '',
        email: '',
        address: ''
      });
    }
  }, [editingSupplier, viewingSupplier, view]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    const data = {
      ...formData,
      userId: user.id
    };

    try {
      if (editingSupplier) {
        await api.updateSupplier(editingSupplier.id, data);
      } else {
        await api.addSupplier(data);
      }
      setView('list');
      setEditingSupplier(null);
      refresh();
      alert(editingSupplier ? 'Fornecedor atualizado!' : 'Fornecedor cadastrado com sucesso!');
    } catch (err) {
      console.error("Error saving supplier:", err);
      alert("Erro ao salvar fornecedor.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDuplicate = async (supplier: any) => {
    if (!user) return;
    try {
      const data = {
        name: `${supplier.name} (Cópia)`,
        category: supplier.category,
        phone: supplier.phone,
        email: supplier.email,
        address: supplier.address,
        userId: user.id
      };
      await api.addSupplier(data);
      refresh();
      alert('Fornecedor duplicado com sucesso!');
    } catch (err) {
      console.error("Error duplicating supplier:", err);
      alert("Erro ao duplicar fornecedor.");
    }
  };

  const handleDelete = async () => {
    if (!user || !supplierToDelete) return;
    try {
      await api.deleteSupplier(supplierToDelete);
      setSupplierToDelete(null);
      setIsDeleteDialogOpen(false);
      refresh();
    } catch (err) {
      console.error("Error deleting supplier:", err);
    }
  };

  if (view === 'form' || view === 'detail') {
    const isDetail = view === 'detail';
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => { setView('list'); setEditingSupplier(null); setViewingSupplier(null); }} className="rounded-full">
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {isDetail ? 'Detalhes do Fornecedor' : (editingSupplier ? 'Editar Fornecedor' : 'Novo Fornecedor')}
            </h2>
            <p className="text-slate-500 text-sm">
              {isDetail ? 'Visualize as informações do fornecedor.' : 'Preencha os dados do fornecedor abaixo.'}
            </p>
          </div>
        </div>

        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
              <div className="space-y-2">
                <Label>Nome da Empresa/Fornecedor</Label>
                <Input 
                  value={formData.name || ''} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: Atacadão das Embalagens"
                  required
                  disabled={isDetail}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Input 
                  value={formData.category || ''} 
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  placeholder="Ex: Laticínios, Embalagens, Frutas..."
                  disabled={isDetail}
                  className="h-12"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>E-mail</Label>
                  <Input 
                    type="email"
                    value={formData.email || ''} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="contato@fornecedor.com"
                    disabled={isDetail}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input 
                    value={formData.phone || ''} 
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="(00) 00000-0000"
                    disabled={isDetail}
                    className="h-12"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Endereço</Label>
                <Input 
                  value={formData.address || ''} 
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Rua, Número, Bairro, Cidade"
                  disabled={isDetail}
                  className="h-12"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => { setView('list'); setEditingSupplier(null); setViewingSupplier(null); }} className="flex-1 h-12 font-bold">
                  {isDetail ? 'Voltar' : 'Cancelar'}
                </Button>
                {!isDetail && (
                  <Button 
                    type="submit" 
                    disabled={isSaving}
                    className="flex-[2] bg-primary hover:bg-primary/90 h-12 text-base font-bold shadow-lg shadow-primary/20"
                  >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingSupplier ? 'Salvar Alterações' : 'Criar Fornecedor')}
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
        title="Excluir Fornecedor"
        description="Tem certeza que deseja excluir este fornecedor? Esta ação não pode ser desfeita."
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="hidden sm:block">
          <h2 className="text-2xl font-bold text-slate-900">Meus Fornecedores</h2>
          <p className="text-slate-500">Gerencie seus parceiros e fontes de suprimentos</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              placeholder="Buscar fornecedor..." 
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

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {paginatedSuppliers.map((supplier) => (
          <Card key={supplier.id} className="border-none shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                  <Truck size={24} />
                </div>
                <div className="flex gap-1 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8" title="Visualizar" onClick={() => {
                    setViewingSupplier(supplier);
                    setView('detail');
                  }}>
                    <Eye size={14} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" title="Editar" onClick={() => {
                    setEditingSupplier(supplier);
                    setView('form');
                  }}>
                    <Edit2 size={14} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" title="Duplicar" onClick={() => handleDuplicate(supplier)}>
                    <Copy size={14} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" title="Excluir" onClick={() => {
                    setSupplierToDelete(supplier.id);
                    setIsDeleteDialogOpen(true);
                  }}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
              
              <h3 className="font-bold text-slate-900 text-lg mb-1">{supplier.name}</h3>
              {supplier.category && (
                <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-[10px] font-bold mb-4">{supplier.category}</Badge>
              )}
              
              <div className="space-y-3 mt-4">
                {supplier.phone && (
                  <div className="flex items-center gap-2 text-slate-500">
                    <Phone size={14} className="shrink-0" />
                    <span className="text-xs font-medium">{supplier.phone}</span>
                  </div>
                )}
                {supplier.email && (
                  <div className="flex items-center gap-2 text-slate-500">
                    <Mail size={14} className="shrink-0" />
                    <span className="text-xs font-medium truncate">{supplier.email}</span>
                  </div>
                )}
                {supplier.address && (
                  <div className="flex items-center gap-2 text-slate-500">
                    <MapPin size={14} className="shrink-0" />
                    <span className="text-xs font-medium truncate">{supplier.address}</span>
                  </div>
                )}
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
};
