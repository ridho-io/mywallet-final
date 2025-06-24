// lib/database.ts
import { supabase } from "./supabase";

// --- Tipe Data ---
export type Transaction = {
  id?: string;
  user_id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  created_at?: string;
};

export type Budget = {
  id?: string;
  user_id: string;
  category: string;
  amount: number;
  month: number;
  year: number;
};

export type SavingGoal = {
  id: string;
  user_id: string;
  goal_name: string;
  target_amount: number;
  current_amount: number;
  created_at: string;
};

// --- Fungsi Transaksi ---
export const getTransactions = async (
  userId: string,
  page: number,
  pageSize: number
): Promise<Transaction[] | null> => {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (error) {
    console.error("Error fetching transactions:", error);
    return null;
  }
  return data;
};

export const updateTransaction = async (
  id: string,
  updates: Partial<Omit<Transaction, "id" | "user_id" | "created_at">>
) => {
  const { data, error } = await supabase
    .from("transactions")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating transaction:", error);
    throw new Error(error.message);
  }
  return data;
};

export const deleteTransaction = async (id: string) => {
  const { error } = await supabase.from("transactions").delete().eq("id", id);

  if (error) {
    console.error("Error deleting transaction:", error);
    throw new Error(error.message);
  }
  return true;
};

export const getTransactionsForMonth = async (
  userId: string,
  year: number,
  month: number
): Promise<Transaction[] | null> => {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 1);

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .gte("created_at", startDate.toISOString())
    .lt("created_at", endDate.toISOString());

  if (error) {
    console.error("Error fetching transactions for month:", error);
    return null;
  }
  return data;
};

export const getTransactionsForDateRange = async (
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<Transaction[] | null> => {
  // Set jam pada endDate ke akhir hari untuk memastikan semua transaksi di hari itu terambil
  endDate.setHours(23, 59, 59, 999);

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .gte("created_at", startDate.toISOString())
    .lte("created_at", endDate.toISOString());

  if (error) {
    console.error("Error fetching transactions for date range:", error);
    throw new Error(error.message);
  }
  return data;
};

// --- Fungsi Budget ---
export const getBudgetsForMonth = async (
  userId: string,
  year: number,
  month: number // month is 1-12
): Promise<Budget[] | null> => {
  const { data, error } = await supabase
    .from("budgets")
    .select("*")
    .eq("user_id", userId)
    .eq("year", year)
    .eq("month", month);

  if (error) {
    console.error("Error fetching budgets for month:", error);
    return null;
  }
  return data;
};

export const setBudget = async (budget: Omit<Budget, "id">) => {
  const { data, error } = await supabase
    .from("budgets")
    .upsert(budget, { onConflict: "user_id,category,year,month" }) // Kunci unik untuk upsert
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const deleteBudget = async (id: string) => {
  const { error } = await supabase.from("budgets").delete().eq("id", id);

  if (error) {
    console.error("Error deleting budget:", error);
    throw new Error(error.message);
  }
  return true;
};

// --- Fungsi Tabungan ---
export const getSavingGoals = async (
  userId: string
): Promise<SavingGoal[] | null> => {
  const { data, error } = await supabase
    .from("savings_goals")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching saving goals:", error);
    return null;
  }
  return data;
};

export const createSavingGoal = async (
  goal: Omit<SavingGoal, "id" | "created_at" | "current_amount">
) => {
  const { data, error } = await supabase
    .from("savings_goals")
    .insert({ ...goal, current_amount: 0 }) // Selalu mulai dari 0
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const updateSavingGoal = async (
  id: string,
  updates: { goal_name: string; target_amount: number }
) => {
  const { data, error } = await supabase
    .from("savings_goals")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const deleteSavingGoal = async (id: string) => {
  const { error } = await supabase.from("savings_goals").delete().eq("id", id);

  if (error) throw new Error(error.message);
  return true;
};

export const addContribution = async (
  goalId: string,
  userId: string,
  amount: number
) => {
  const { data, error } = await supabase.rpc("add_contribution", {
    p_goal_id: goalId,
    p_user_id: userId,
    p_amount: amount,
  });

  if (error) throw error;
  return data;
};

// --- FUNGSI BARU UNTUK FITUR KONTROL BUDGET ---

/**
 * Mengambil budget untuk kategori spesifik pada bulan dan tahun tertentu.
 * @param month - Bulan berbasis 1 (1 untuk Januari, 12 untuk Desember)
 */
export async function getBudgetForCategory(
  userId: string,
  category: string,
  year: number,
  month: number
): Promise<Budget | null> {
  const { data, error } = await supabase
    .from("budgets")
    .select("*")
    .eq("user_id", userId)
    .eq("category", category)
    .eq("year", year)
    .eq("month", month) // DB month is 1-12
    .single();

  // Kode error 'PGRST116' berarti tidak ada baris yang ditemukan, ini bukan error aplikasi.
  if (error && error.code !== "PGRST116") {
    console.error("Error fetching budget for category:", error);
    throw error;
  }
  return data;
}

/**
 * Menghitung total pengeluaran untuk kategori spesifik pada bulan dan tahun tertentu.
 * @param month - Bulan berbasis 0 (0 untuk Januari, 11 untuk Desember)
 */
export async function getSpentAmountForCategory(
  userId: string,
  category: string,
  year: number,
  month: number
): Promise<number> {
  const startDate = new Date(year, month, 1).toISOString();
  const endDate = new Date(year, month + 1, 0, 23, 59, 59).toISOString(); // Akhir hari terakhir di bulan itu

  const { data, error } = await supabase
    .from("transactions")
    .select("amount")
    .eq("user_id", userId)
    .eq("category", category)
    .eq("type", "expense")
    .gte("created_at", startDate)
    .lte("created_at", endDate);

  if (error) {
    console.error("Error fetching spent amount for category:", error);
    throw error;
  }

  // Menjumlahkan semua nominal transaksi yang cocok
  const totalSpent = data.reduce((sum, current) => sum + current.amount, 0);
  return totalSpent;
}


export const getDailySummaryForMonth = async (userId: string, year: number, month: number) => {
    const { data, error } = await supabase.rpc('get_daily_summary_for_month', {
        p_user_id: userId,
        p_year: year,
        p_month: month,
    });
    if (error) throw new Error(error.message);
    return data;
};

export const getSummaryLastNMonths = async (userId: string, months: number) => {
    const { data, error } = await supabase.rpc('get_summary_last_n_months', {
        p_user_id: userId,
        n_months: months,
    });
    if (error) throw new Error(error.message);
    return data;
};