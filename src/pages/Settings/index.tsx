import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { User, Building2, Bell, Shield, CreditCard, Save } from 'lucide-react';
import { useAuth } from '@/AuthContext';

interface SettingsPageProps {
  userProfile: any;
  setUserProfile: (profile: any) => void;
}

export const SettingsPage = ({ userProfile, setUserProfile }: SettingsPageProps) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: userProfile?.name || user?.user_metadata?.full_name || '',
    companyName: userProfile?.companyName || '',
    email: user?.email || '',
    phone: userProfile?.phone || ''
  });

  const handleSave = () => {
    setUserProfile({
      ...userProfile,
      ...formData
    });
    // In a real app, this would call an API to save to DB
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="hidden sm:block">
        <h2 className="text-2xl font-bold text-slate-900">Configurações</h2>
        <p className="text-slate-500">Gerencie sua conta e preferências do sistema</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-1">
          <Button variant="ghost" className="w-full justify-start gap-3 bg-white shadow-sm text-primary font-bold">
            <User size={18} /> Perfil
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-slate-500">
            <Building2 size={18} /> Empresa
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-slate-500">
            <Bell size={18} /> Notificações
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-slate-500">
            <Shield size={18} /> Segurança
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-slate-500">
            <CreditCard size={18} /> Assinatura
          </Button>
        </div>

        <div className="md:col-span-3 space-y-6">
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
                    value={formData.name || ''} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>E-mail</Label>
                  <Input value={formData.email || ''} disabled className="bg-slate-50" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input 
                    value={formData.phone || ''} 
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>
              <Separator className="my-4" />
              <div className="space-y-2">
                <Label>Nome da Confeitaria</Label>
                <Input 
                  value={formData.companyName || ''} 
                  onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                />
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
              <CardTitle className="text-red-600">Zona de Perigo</CardTitle>
              <CardDescription>Ações irreversíveis para sua conta</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" className="bg-red-500 hover:bg-red-600">
                Excluir Minha Conta
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
