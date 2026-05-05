export type TransactionType = 'ingreso_mensual' | 'deposito_fondos' | 'retiro_fondos' | 'gasto';
export type Currency = 'ars' | 'usd';
export type Category = 'alquiler' | 'comida' | 'claude_code' | 'crunchyroll' | 'tuenti' | 'apple' | 'futbol' | 'transporte' | 'psicologa' | 'fernando' | 'rock_and_roll' | 'meta_contribution';

export interface Transaction {
  id: string;
  created_at: string;
  tipo: TransactionType;
  moneda: Currency;
  monto: number;
  categoria: Category | null;
}

export interface Meta {
  id: string;
  created_at: string;
  title: string;
  current_val: number;
  total_val: number;
}
