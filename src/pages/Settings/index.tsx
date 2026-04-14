import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Building2, 
  Shield, 
  Save, 
  Trash2,
  Mail,
  Smartphone,
  Lock
} from 'lucide-react';
import { useAuth } from '@/AuthContext';
import { cn } from '@/lib/utils';

interface SettingsPageProps {
  userProfile: any;
  setUserProfile: (profile: any) => void;
}

export const SettingsPage = ({ userProfile, setUserProfile }: SettingsPageProps) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: userProfile?.name || user?.user_metadata?.full_name || '',
    companyName: userProfile?.companyName || '',
    email: user?.email || '',
    phone: userProfile?.phone || '',
    cnpj: userProfile?.cnpj || '',
    address: userProfile?.address || '',
    city: userProfile?.city || '',
    state: userProfile?.state || ''
  });

  const handleSave = () => {
    setUserProfile({
      ...userProfile,
      ...formData
    });
    // In a real app, this would call an API
  };

  const menuItems = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'company', label: 'Empresa', icon: Building2 },
    { id: 'security', label: 'Segurança', icon: Shield },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="hidden sm:block">
        <h2 className="text-2xl font-bold text-slate-900">Configurações</h2>
        <p className="text-slate-500">Gerencie sua conta e preferências do sistema</p>
      </div>

      <Tabs defaultValue="profile" orientation="vertical" className="flex flex-col md:flex-row gap-6">
        <TabsList className="flex md:flex-col h-auto bg-transparent p-0 gap-1 md:w-64">
          {menuItems.map((item) => (
            <TabsTrigger
              key={item.id}
              value={item.id}
              className={cn(
                "justify-start gap-3 px-4 py-3 h-auto border-none data-active:bg-white data-active:shadow-sm data-active:text-primary font-bold text-slate-500 hover:text-slate-900 transition-all",
                "group-data-vertical/tabs:w-full"
              )}
            >
              <item.icon size={18} />
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="flex-1">
          <TabsContent value="profile" className="m-0 space-y-6">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
                <CardDescription>Atualize seus dados de contato e identificação</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome Completo</Label>
                    <Input 
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Seu nome"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>E-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <Input value={formData.email} disabled className="pl-10 bg-slate-50" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <div className="relative">
                      <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <Input 
                        className="pl-10"
                        value={formData.phone} 
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                  </div>
                </div>
                <div className="pt-4 flex justify-end">
                  <Button className="bg-primary hover:bg-primary/90 gap-2" onClick={handleSave}>
                    <Save size={18} />
                    Salvar Alterações
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm border-red-100 bg-red-50/30">
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center gap-2">
                  <Trash2 size={18} />
                  Zona de Perigo
                </CardTitle>
                <CardDescription>Ações irreversíveis para sua conta</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 mb-4">
                  Ao excluir sua conta, todos os seus dados (pedidos, receitas, estoque) serão permanentemente removidos.
                </p>
                <Button variant="destructive" className="bg-red-500 hover:bg-red-600">
                  Excluir Minha Conta
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="company" className="m-0 space-y-6">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Dados da Empresa</CardTitle>
                <CardDescription>Informações da sua confeitaria para documentos e relatórios</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome da Confeitaria</Label>
                    <Input 
                      value={formData.companyName} 
                      onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                      placeholder="Ex: Doce Encanto"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CNPJ / CPF</Label>
                    <Input 
                      value={formData.cnpj} 
                      onChange={(e) => setFormData({...formData, cnpj: e.target.value})}
                      placeholder="00.000.000/0000-00"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Endereço</Label>
                  <Input 
                    value={formData.address} 
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Rua, número, bairro"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Cidade</Label>
                    <Input 
                      value={formData.city} 
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Estado</Label>
                    <Input 
                      value={formData.state} 
                      onChange={(e) => setFormData({...formData, state: e.target.value})}
                    />
                  </div>
                </div>
                <div className="pt-4 flex justify-end">
                  <Button className="bg-primary hover:bg-primary/90 gap-2" onClick={handleSave}>
                    <Save size={18} />
                    Salvar Dados
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="m-0 space-y-6">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Segurança da Conta</CardTitle>
                <CardDescription>Gerencie sua senha e autenticação</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Senha Atual</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <Input type="password" title="Senha Atual" className="pl-10" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nova Senha</Label>
                      <Input type="password" title="Nova Senha" />
                    </div>
                    <div className="space-y-2">
                      <Label>Confirmar Nova Senha</Label>
                      <Input type="password" title="Confirmar Nova Senha" />
                    </div>
                  </div>
                </div>
                <div className="pt-4 flex justify-end">
                  <Button className="bg-primary hover:bg-primary/90 gap-2">
                    <Save size={18} />
                    Atualizar Senha
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
