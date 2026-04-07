import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  DollarSign, 
  ArrowUpRight, 
  X,
  CreditCard,
  Home,
  Utensils,
  Play,
  Bus,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Transaction, TransactionType, Currency, Category, Meta } from './types';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    ars: number;
    usd: number;
    ingresos: number;
    gastos: number;
    categories: Record<Category, number>;
    metas: Meta[];
  }>({
    ars: 0,
    usd: 0,
    ingresos: 0,
    gastos: 0,
    categories: {
      alquiler: 0,
      comida: 0,
      entretenimiento: 0,
      transporte: 0,
      suscripciones: 0,
      meta_contribution: 0
    },
    metas: []
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<TransactionType>('ingreso_mensual');
  const [pendingTx, setPendingTx] = useState({
    tipo: 'ingreso_mensual' as TransactionType,
    moneda: 'ars' as Currency,
    monto: '',
    categoria: 'alquiler' as Category
  });

  const fetchData = async () => {
    setLoading(true);
    const { data: transactions } = await supabase.from('transactions').select('*');
    const { data: metas } = await supabase.from('metas').select('*');

    const newState = {
      ars: 0,
      usd: 0,
      ingresos: 0,
      gastos: 0,
      categories: {
        alquiler: 0,
        comida: 0,
        entretenimiento: 0,
        transporte: 0,
        suscripciones: 0,
        meta_contribution: 0
      },
      metas: (metas || []) as Meta[]
    };

    if (transactions) {
      transactions.forEach((tx: Transaction) => {
        const monto = Number(tx.monto);
        if (tx.tipo === 'ingreso_mensual') {
          if (tx.moneda === 'ars') newState.ingresos += monto;
        } else if (tx.tipo === 'deposito_fondos') {
          newState[tx.moneda] += monto;
        } else if (tx.tipo === 'gasto') {
          newState[tx.moneda] -= monto;
          if (tx.moneda === 'ars' && tx.categoria && tx.categoria !== 'meta_contribution') {
            newState.gastos += monto;
            newState.categories[tx.categoria] += monto;
          }
        }
      });
    }
    setData(newState);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    const amount = parseFloat(pendingTx.monto);
    if (isNaN(amount) || amount <= 0) return alert("Monto inválido");

    const { error } = await supabase.from('transactions').insert([{
      tipo: pendingTx.tipo,
      moneda: pendingTx.moneda,
      monto: amount,
      categoria: pendingTx.tipo === 'gasto' ? pendingTx.categoria : null
    }]);

    if (error) alert(error.message);
    else {
      setIsModalOpen(false);
      setPendingTx({ ...pendingTx, monto: '' });
      fetchData();
    }
  };

  const openQuickAction = (type: TransactionType) => {
    setPendingTx({ ...pendingTx, tipo: type });
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-slate-100 p-6 md:p-12">
      {/* Header */}
      <header className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div className="relative">
          <div className="absolute -top-4 -left-4 w-24 h-24 bg-emerald-500/10 blur-3xl rounded-full" />
          <h1 className="text-4xl font-black tracking-tight text-white relative">
            Finanzas de <span className="text-emerald-400">Bautista</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1 uppercase tracking-widest font-medium">Panel de Gestión Privada</p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => openQuickAction('ingreso_mensual')}
          className="btn-primary flex items-center gap-2 group"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform" />
          Cargar Ingreso Mensual
        </motion.button>
      </header>

      <main className="max-w-6xl mx-auto space-y-12">
        {/* KPI Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Ingresos" 
            value={data.ingresos} 
            icon={<TrendingUp className="text-emerald-400" />} 
            color="emerald"
          />
          <StatCard 
            title="Gastos Totales" 
            value={data.gastos} 
            icon={<TrendingDown className="text-rose-400" />} 
            color="rose"
            isNegative
          />
          <StatCard 
            title="Balance Neto" 
            value={Math.max(0, data.ingresos - data.gastos)} 
            icon={<Wallet className="text-indigo-400" />} 
            color="indigo"
          />
        </section>

        {/* Currency Portfolio */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <WalletCard 
            currency="ARS" 
            symbol="ARS"
            value={data.ars} 
            color="emerald"
            onAction={() => openQuickAction('deposito_fondos')}
          />
          <WalletCard 
            currency="Dólares" 
            symbol="USD"
            value={data.usd} 
            color="amber"
            onAction={() => openQuickAction('deposito_fondos')}
          />
        </section>

        {/* Categories & Goals Placeholder */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           {/* Detailed Expenses */}
           <div className="lg:col-span-12 premium-card">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold">Desglose de Gastos (ARS)</h3>
                <Settings size={18} className="text-slate-500 cursor-pointer hover:text-white transition-colors" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                 <CategoryItem icon={<Home />} label="Alquiler" value={data.categories.alquiler} />
                 <CategoryItem icon={<Utensils />} label="Comida" value={data.categories.comida} />
                 <CategoryItem icon={<Play />} label="Ocio" value={data.categories.entretenimiento} />
                 <CategoryItem icon={<Bus />} label="Viajes" value={data.categories.transporte} />
                 <CategoryItem icon={<CreditCard />} label="Apps" value={data.categories.suscripciones} />
              </div>
           </div>
        </section>
      </main>

      {/* Modern Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">Nueva Operación</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Tipo de Movimiento</label>
                  <div className="grid grid-cols-1 gap-2">
                    <select 
                      value={pendingTx.tipo} 
                      onChange={(e) => setPendingTx({...pendingTx, tipo: e.target.value as TransactionType})}
                      className="w-full bg-slate-800 border-none rounded-xl p-3 focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="ingreso_mensual">Ingreso Mensual (KPI)</option>
                      <option value="deposito_fondos">Depósito en Fondos (Ahorro)</option>
                      <option value="gasto">Gasto / Salida</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Moneda</label>
                    <select 
                      value={pendingTx.moneda} 
                      onChange={(e) => setPendingTx({...pendingTx, moneda: e.target.value as Currency})}
                      className="w-full bg-slate-800 border-none rounded-xl p-3 focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="ars">ARS</option>
                      <option value="usd">USD</option>
                    </select>
                  </div>
                  {pendingTx.tipo === 'gasto' && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Categoría</label>
                      <select 
                        value={pendingTx.categoria} 
                        onChange={(e) => setPendingTx({...pendingTx, categoria: e.target.value as Category})}
                        className="w-full bg-slate-800 border-none rounded-xl p-3 focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="alquiler">Alquiler</option>
                        <option value="comida">Comida</option>
                        <option value="entretenimiento">Ocio</option>
                        <option value="transporte">Viajes</option>
                        <option value="suscripciones">Suscripciones</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Importe</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</div>
                    <input 
                      type="number"
                      value={pendingTx.monto}
                      onChange={(e) => setPendingTx({...pendingTx, monto: e.target.value})}
                      placeholder="0.00"
                      className="w-full bg-slate-800 border-none rounded-xl p-4 pl-8 text-2xl font-bold focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <button 
                  onClick={handleSave}
                  className="w-full py-4 bg-emerald-500 text-emerald-950 rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
                >
                  Guardar Transacción
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ title, value, icon, color, isNegative }: { 
  title: string, value: number, icon: React.ReactNode, color: string, isNegative?: boolean 
}) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="premium-card relative overflow-hidden"
    >
      <div className={cn(
        "absolute -top-12 -right-12 w-32 h-32 blur-3xl opacity-20 rounded-full",
        color === 'emerald' ? 'bg-emerald-500' : color === 'rose' ? 'bg-rose-500' : 'bg-indigo-500'
      )} />
      <div className="flex justify-between items-start mb-6">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{title}</span>
        <div className="bg-white/5 p-2 rounded-lg">{icon}</div>
      </div>
      <div className={cn(
        "text-3xl font-black tracking-tight",
        isNegative ? "text-rose-400" : "text-white"
      )}>
        {isNegative ? '-' : '+'}${value.toLocaleString('es-AR')}
      </div>
      <div className="mt-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
        Actualizado en tiempo real
      </div>
    </motion.div>
  );
}

function WalletCard({ currency, symbol, value, color, onAction }: { 
  currency: string, symbol: string, value: number, color: string, onAction: () => void 
}) {
  return (
    <div className="premium-card min-h-[280px] flex flex-col justify-between border-r-4 border-emerald-500/50">
      <div className={cn(
        "absolute -bottom-16 -right-16 w-48 h-48 blur-3xl opacity-10 rounded-full",
        color === 'emerald' ? 'bg-emerald-500' : 'bg-amber-500'
      )} />
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className={cn("w-2 h-2 rounded-full", color === 'emerald' ? 'bg-emerald-500' : 'bg-amber-500')} />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{currency}</span>
        </div>
        <div className={cn(
          "text-5xl font-black tracking-tighter",
          color === 'emerald' ? 'text-white' : 'text-amber-400'
        )}>
          {symbol} {value.toLocaleString('es-AR')}
        </div>
      </div>
      <button 
        onClick={onAction}
        className={cn(
          "w-full py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl active:scale-95",
          color === 'emerald' ? "bg-emerald-500 text-emerald-950 shadow-emerald-500/10" : "bg-amber-500 text-amber-950 shadow-amber-500/10"
        )}
      >
        Gestionar Fondos {symbol}
      </button>
    </div>
  );
}

function CategoryItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: number }) {
  return (
    <div className="space-y-2 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
      <div className="text-emerald-400 flex justify-center">{icon}</div>
      <div className="text-[10px] uppercase font-bold text-slate-500 tracking-tighter">{label}</div>
      <div className="text-sm font-black whitespace-nowrap">${value.toLocaleString('es-AR')}</div>
    </div>
  );
}
