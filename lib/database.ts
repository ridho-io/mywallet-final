// lib/database.ts

import { supabase } from './supabase';

// 1. Definisikan tipe untuk data transaksi
export type Transaction = {
  id?: string; // id tidak wajib saat membuat transaksi baru
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description?: string; // description tidak wajib
  created_at?: string;
  user_id: string;
};

// 2. Fungsi untuk mengambil semua transaksi pengguna yang sedang login
export const getTransactions = async (userId: string, page: number, pageSize: number = 20) => {
    const from = page * pageSize;
    const to = from + pageSize - 1;
  
    const { data, error } = await supabase
      .from('transactions')
      .select('*', { count: 'exact' }) // 'count: exact' untuk mendapatkan total data
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(from, to); // Terapkan paginasi di sini
  
    if (error) {
      console.error('Error fetching transactions:', error);
      throw new Error(error.message);
    }
  
    return data;
  };

// 3. Fungsi untuk menambahkan transaksi baru
export const addTransaction = async (transaction: Omit<Transaction, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('transactions')
    .insert([transaction])
    .select() // .select() akan mengembalikan data yang baru saja dibuat
    .single(); // karena kita hanya insert satu, kita gunakan single

  if (error) {
    console.error('Error adding transaction:', error);
    throw new Error(error.message);
  }

  return data;
};

export const getTransactionsForMonth = async (userId: string, year: number, month: number) => {
    // 'month' di JavaScript dimulai dari 0 (Januari), tapi di database biasa dimulai dari 1.
    // Kita asumsikan 'month' yang diterima di sini adalah 0-11.
    const startDate = new Date(year, month, 1).toISOString();
    const endDate = new Date(year, month + 1, 1).toISOString();
  
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate) // gte = greater than or equal to (mulai dari tanggal 1)
      .lt('created_at', endDate);   // lt = less than (sebelum tanggal 1 bulan berikutnya)
  
    if (error) {
      console.error('Error fetching monthly transactions:', error);
      throw new Error(error.message);
    }
  
    return data;
  };

  export type Budget = {
    id?: string;
    user_id: string;
    category: string;
    amount: number;
    month: number; // 1-12
    year: number;
  };
  
  // Fungsi untuk mengambil semua budget pada bulan dan tahun tertentu
  export const getBudgetsForMonth = async (userId: string, year: number, month: number) => {
    // 'month' di JS adalah 0-11, kita simpan di DB sebagai 1-12
    const dbMonth = month + 1;
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .eq('year', year)
      .eq('month', dbMonth);
  
    if (error) throw new Error(error.message);
    return data;
  };
  
  // Fungsi untuk menetapkan atau memperbarui budget (Upsert)
  export const setBudget = async (budget: Omit<Budget, 'id'>) => {
    const { data, error } = await supabase
      .from('budgets')
      .upsert(budget, { onConflict: 'user_id,category,year,month' }) // Kunci unik untuk upsert
      .select()
      .single();
  
    if (error) throw new Error(error.message);
    return data;
  };

// saving goals
export type SavingGoal = {
    id: string;
    user_id: string;
    goal_name: string;
    target_amount: number;
    current_amount: number;
    created_at: string;
  };
  
  // Fungsi untuk mengambil semua saving goals
  export const getSavingGoals = async (userId: string) => {
    const { data, error } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
  
    if (error) throw new Error(error.message);
    return data;
  };
  
  // Fungsi untuk membuat saving goal baru
  export const createSavingGoal = async (goal: Omit<SavingGoal, 'id' | 'created_at' | 'current_amount'>) => {
    const { data, error } = await supabase
      .from('savings_goals')
      .insert({ ...goal, current_amount: 0 }) // Selalu mulai dari 0
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    return data;
  };
  
  // Fungsi untuk memanggil RPC add_contribution
  export const addContribution = async (goalId: string, userId: string, amount: number) => {
      const { error } = await supabase.rpc('add_contribution', {
          p_goal_id: goalId,
          p_user_id: userId,
          p_amount: amount
      });
      if (error) throw new Error(error.message);
      return true;
  };