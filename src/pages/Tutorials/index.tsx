import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlayCircle, BookOpen, Star, Clock, ChevronRight } from 'lucide-react';

export const TutorialsPage = () => {
  const tutorials = [
    {
      title: 'Primeiros Passos',
      description: 'Aprenda a configurar sua cozinha e cadastrar seus primeiros pedidos.',
      duration: '5 min',
      category: 'Iniciante',
      icon: PlayCircle,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      title: 'Gestão de Estoque',
      description: 'Como controlar seus insumos e configurar alertas de estoque baixo.',
      duration: '8 min',
      category: 'Intermediário',
      icon: BookOpen,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      title: 'Fichas Técnicas',
      description: 'Domine o cálculo de custos e precificação das suas receitas.',
      duration: '12 min',
      category: 'Avançado',
      icon: Star,
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="hidden sm:block text-center space-y-2">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Central de Aprendizado</h2>
        <p className="text-slate-500 max-w-2xl mx-auto">Domine todas as ferramentas da Cozinha Sinistra e leve sua confeitaria para o próximo nível.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tutorials.map((tutorial, i) => (
          <Card key={i} className="border-none shadow-sm hover:shadow-md transition-all group cursor-pointer overflow-hidden">
            <div className={cn("h-32 flex items-center justify-center", tutorial.bg)}>
              <tutorial.icon size={48} className={tutorial.color} />
            </div>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{tutorial.category}</span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                  <Clock size={10} />
                  {tutorial.duration}
                </div>
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2 group-hover:text-primary transition-colors">{tutorial.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-6">{tutorial.description}</p>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto font-bold text-primary group-hover:translate-x-1 transition-transform">
                Começar Agora <ChevronRight size={16} />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-sm bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <CardContent className="p-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left space-y-4">
            <h3 className="text-2xl font-black">Precisa de ajuda personalizada?</h3>
            <p className="text-slate-400 max-w-md">Nossa equipe de suporte está pronta para te ajudar a configurar seu negócio.</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <Button className="bg-primary hover:bg-primary/90 font-bold">Falar com Suporte</Button>
              <Button variant="ghost" className="text-white hover:bg-white/10 font-bold">Ver Documentação</Button>
            </div>
          </div>
          <div className="w-32 h-32 bg-white/10 rounded-2xl rotate-12 flex items-center justify-center border border-white/20">
            <PlayCircle size={64} className="text-primary" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper for cn which was missing in imports
const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');
