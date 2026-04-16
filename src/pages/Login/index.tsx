import React, { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { ChefHat, Loader2, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/AuthContext';

export const LoginPage = () => {
  const { login, signUp, signInWithGoogle } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsProcessing(true);
    
    if (isSignUp) {
      const { success, error: signUpError } = await signUp(email, password, name);
      if (!success) {
        setError(signUpError || 'Erro ao criar conta.');
        setIsProcessing(false);
      }
    } else {
      const { success, error: loginError } = await login(email, password);
      if (!success) {
        setError(loginError || 'E-mail ou senha incorretos.');
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-primary/20">
            <ChefHat size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Cozinha Sinistra</h1>
          <p className="text-slate-500 mt-2 text-center">Gestão profissional para sua produção artesanal</p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
          <button 
            onClick={() => setIsSignUp(false)}
            className={cn(
              "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
              !isSignUp ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Entrar
          </button>
          <button 
            onClick={() => setIsSignUp(true)}
            className={cn(
              "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
              isSignUp ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Cadastrar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Nome Completo</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                placeholder="Seu nome"
                required
              />
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">E-mail</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              placeholder="seu@email.com"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Senha</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              placeholder="Sua senha"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 font-medium text-center">{error}</p>
          )}

          <Button 
            type="submit"
            disabled={isProcessing}
            className="w-full py-6 rounded-xl text-lg font-semibold bg-primary hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3"
          >
            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : (isSignUp ? 'Criar Minha Conta' : 'Entrar no Sistema')}
          </Button>
        </form>

        <div className="mt-6">
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-100"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400">Ou continuar com</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            onClick={signInWithGoogle}
            className="w-full py-6 rounded-xl border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
          >
            <Globe size={20} className="text-slate-400" />
            Google
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
