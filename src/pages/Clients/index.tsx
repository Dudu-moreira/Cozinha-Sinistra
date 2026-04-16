import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Edit2, User, Phone, Mail, Search, MapPin, ArrowLeft, Eye, Copy, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/services/api';
import { useAuth } from '@/AuthContext';
import { DeleteConfirmDialog } from '@/components/Shared/DeleteConfirmDialog';
import { Pagination } from '@/components/Shared/Pagination';

interface ClientsPageProps {
  clients: any[];
  refresh: () => void;
}

export const ClientsPage = ({ clients, refresh }: ClientsPageProps) => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const paginatedClients = filteredClients.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const [view, setView] = useState<'list' | 'form' | 'detail'>('list');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);
  const [editingClient, setEditingClient] = useState<any | null>(null);
  const [viewingClient, setViewingClient] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  React.useEffect(() => {
    if (editingClient || viewingClient) {
      const target = editingClient || viewingClient;
      setFormData({
        name: target.name,
        email: target.email || '',
        phone: target.phone || '',
        address: target.address || ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: ''
      });
    }
  }, [editingClient, viewingClient, view]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    const data = {
      ...formData,
      userId: user.id
    };

    try {
      if (editingClient) {
        await api.updateClient(editingClient.id, data);
      } else {
        await api.addClient(data);
      }
      setView('list');
      setEditingClient(null);
      refresh();
      alert(editingClient ? 'Cliente atualizado!' : 'Cliente cadastrado com sucesso!');
    } catch (err) {
      console.error("Error saving client:", err);
      alert("Erro ao salvar cliente.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDuplicate = async (client: any) => {
    if (!user) return;
    try {
      const data = {
        name: `${client.name} (Cópia)`,
        email: client.email,
        phone: client.phone,
        address: client.address,
        userId: user.id
      };
      await api.addClient(data);
      refresh();
      alert('Cliente duplicado com sucesso!');
    } catch (err) {
      console.error("Error duplicating client:", err);
      alert("Erro ao duplicar cliente.");
    }
  };

  const handleDelete = async () => {
    if (!user || !clientToDelete) return;
    try {
      await api.deleteClient(clientToDelete);
      setClientToDelete(null);
      setIsDeleteDialogOpen(false);
      refresh();
    } catch (err) {
      console.error("Error deleting client:", err);
    }
  };

  if (view === 'form' || view === 'detail') {
    const isDetail = view === 'detail';
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => { setView('list'); setEditingClient(null); setViewingClient(null); }} className="rounded-full">
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {isDetail ? 'Detalhes do Cliente' : (editingClient ? 'Editar Cliente' : 'Novo Cliente')}
            </h2>
            <p className="text-slate-500 text-sm">
              {isDetail ? 'Visualize as informações do cliente.' : 'Preencha os dados do cliente abaixo.'}
            </p>
          </div>
        </div>

        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
              <div className="space-y-2">
                <Label>Nome Completo</Label>
                <Input 
                  value={formData.name || ''} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: Maria Oliveira"
                  required
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
                    placeholder="maria@email.com"
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
                <Button type="button" variant="outline" onClick={() => { setView('list'); setEditingClient(null); setViewingClient(null); }} className="flex-1 h-12 font-bold">
                  {isDetail ? 'Voltar' : 'Cancelar'}
                </Button>
                {!isDetail && (
                  <Button 
                    type="submit" 
                    disabled={isSaving}
                    className="flex-[2] bg-primary hover:bg-primary/90 h-12 text-base font-bold shadow-lg shadow-primary/20"
                  >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingClient ? 'Salvar Alterações' : 'Criar Cliente')}
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
        title="Excluir Cliente"
        description="Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita."
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="hidden sm:block">
          <h2 className="text-2xl font-bold text-slate-900">Meus Clientes</h2>
          <p className="text-slate-500">Gerencie sua base de contatos e histórico de pedidos</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              placeholder="Buscar cliente..." 
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
        {paginatedClients.map((client) => (
          <Card key={client.id} className="border-none shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                  <User size={24} />
                </div>
                <div className="flex gap-1 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8" title="Visualizar" onClick={() => {
                    setViewingClient(client);
                    setView('detail');
                  }}>
                    <Eye size={14} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" title="Editar" onClick={() => {
                    setEditingClient(client);
                    setView('form');
                  }}>
                    <Edit2 size={14} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" title="Duplicar" onClick={() => handleDuplicate(client)}>
                    <Copy size={14} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" title="Excluir" onClick={() => {
                    setClientToDelete(client.id);
                    setIsDeleteDialogOpen(true);
                  }}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
              
              <h3 className="font-bold text-slate-900 text-lg mb-4">{client.name}</h3>
              
              <div className="space-y-3">
                {client.phone && (
                  <div className="flex items-center gap-2 text-slate-500">
                    <Phone size={14} className="shrink-0" />
                    <span className="text-xs font-medium">{client.phone}</span>
                  </div>
                )}
                {client.email && (
                  <div className="flex items-center gap-2 text-slate-500">
                    <Mail size={14} className="shrink-0" />
                    <span className="text-xs font-medium truncate">{client.email}</span>
                  </div>
                )}
                {client.address && (
                  <div className="flex items-center gap-2 text-slate-500">
                    <MapPin size={14} className="shrink-0" />
                    <span className="text-xs font-medium truncate">{client.address}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-6 pt-4 border-t border-slate-50">
                <Button variant="ghost" className="w-full text-xs font-bold text-primary hover:bg-primary/5">
                  Ver Histórico
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {clients.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
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
};
