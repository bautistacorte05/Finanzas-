import React, { useState } from 'react';
import { supabase } from './lib/supabase';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, UserPlus } from 'lucide-react';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) alert(error.message);
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) alert(error.message);
      else alert('¡Registro exitoso! Por favor inicia sesión ahora.');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md relative">
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-emerald-500/20 blur-[50px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-indigo-500/20 blur-[50px] rounded-full pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black tracking-tight text-white mb-2">
              Finanzas de <span className="text-emerald-400">Bautista</span>
            </h1>
            <p className="text-slate-400 text-sm font-medium">
              {isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">Email</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"><Mail size={18} /></div>
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="tucorreo@ejemplo.com"
                    className="w-full bg-slate-800 border-none rounded-xl p-4 pl-12 text-slate-100 placeholder:text-slate-600 focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">Contraseña</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"><Lock size={18} /></div>
                  <input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-slate-800 border-none rounded-xl p-4 pl-12 text-slate-100 placeholder:text-slate-600 focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 bg-emerald-500 text-emerald-950 rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-emerald-900/30 border-t-emerald-900 rounded-full"
                />
              ) : isLogin ? (
                <><LogIn size={18} /> Iniciar Sesión</>
              ) : (
                <><UserPlus size={18} /> Registrarse</>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs font-bold text-slate-400 hover:text-white transition-colors"
            >
              {isLogin ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
