// app/(tabs)/reports.tsx
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { MotiView } from "moti";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { getTransactionsForMonth, Transaction } from "../../lib/database";
import { LinearGradient } from "expo-linear-gradient";

// --- Tipe Data untuk Laporan ---
type Period = "monthly" | "quarterly" | "semi-annually";

type MonthlySummary = {
  month: string;
  year: number;
  income: number;
  expense: number;
};

type CategorySpending = {
  category: string;
  amount: number;
  color: string;
  percentage: number;
};

type ReportData = {
  trend: MonthlySummary[];
  categoryBreakdown: CategorySpending[];
  totalIncome: number;
  totalExpense: number;
};

// --- Komponen Grafik & Visualisasi ---

const FinancialSummaryCard = ({
  income,
  expense,
}: {
  income: number;
  expense: number;
}) => {
  const net = income - expense;
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);

  return (
    <View style={styles.summaryCardContainer}>
      <View style={styles.summaryItem}>
        <View style={styles.summaryIcon(Colors.light.success)}>
          <Ionicons name="arrow-down" size={20} color="white" />
        </View>
        <View>
          <Text style={styles.summaryLabel}>Income</Text>
          <Text style={styles.summaryValue}>{formatCurrency(income)}</Text>
        </View>
      </View>
      <View style={styles.summaryItem}>
        <View style={styles.summaryIcon(Colors.light.danger)}>
          <Ionicons name="arrow-up" size={20} color="white" />
        </View>
        <View>
          <Text style={styles.summaryLabel}>Expense</Text>
          <Text style={styles.summaryValue}>{formatCurrency(expense)}</Text>
        </View>
      </View>
      <View style={styles.summaryItem}>
        <View style={styles.summaryIcon(Colors.light.tint)}>
          <Ionicons name="wallet" size={20} color="white" />
        </View>
        <View>
          <Text style={styles.summaryLabel}>Net Savings</Text>
          <Text
            style={[
              styles.summaryValue,
              { color: net >= 0 ? Colors.light.success : Colors.light.danger },
            ]}
          >
            {formatCurrency(net)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const ExpenseTrendChart = ({ data }: { data: MonthlySummary[] }) => {
    const maxValue = useMemo(() => Math.max(...data.map(d => d.expense), 1), [data]);
  
    if (data.length <= 1) {
      return (
        <View style={styles.chartPlaceholder}>
          <Ionicons name="analytics-outline" size={50} color={Colors.light.icon} />
          <Text style={styles.placeholderText}>Not enough data for a trend.</Text>
        </View>
      );
    }
  
    return (
      <View style={styles.barChartContainer}>
        {data.map((item, index) => {
          const height = (item.expense / maxValue) * 100;
          return (
            <View key={index} style={styles.barChartColumn}>
              <View style={styles.barChartBarWrapper}>
                <MotiView
                  from={{ height: "0%" }}
                  animate={{ height: `${height}%` }}
                  transition={{ type: "timing", duration: 500, delay: index * 100 }}
                  style={styles.barChartBar}
                />
              </View>
              <Text style={styles.barChartLabel}>{item.month.slice(0, 3)}</Text>
            </View>
          );
        })}
      </View>
    );
};

const SpendingDonutChart = ({ data }: { data: CategorySpending[] }) => {
    if (data.length === 0) {
      return (
        <View style={styles.chartPlaceholder}>
          <Ionicons name="pie-chart-outline" size={50} color={Colors.light.icon} />
          <Text style={styles.placeholderText}>No expense data for this period.</Text>
        </View>
      );
    }
  
    return (
      <View style={styles.donutChartContainer}>
        <View style={styles.donutPlaceholder}>
          <Ionicons name="pie-chart" size={80} color={Colors.light.tint} />
        </View>
        <View style={styles.legendContainer}>
          {data.slice(0, 5).map((item) => (
            <View key={item.category} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: item.color }]} />
              <Text style={styles.legendText} numberOfLines={1}>{item.category}</Text>
              <Text style={styles.legendPercentage}>{item.percentage.toFixed(1)}%</Text>
            </View>
          ))}
        </View>
      </View>
    );
};
  

// --- Halaman Utama Laporan ---

export default function ReportsScreen() {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("monthly");
  const [reportData, setReportData] = useState<ReportData | null>(null);

  const PALETTE = ["#4A90E2", "#50E3C2", "#F5A623", "#BD10E0", "#7ED321", "#9013FE", "#F8E71C"];

  const loadReportData = useCallback(async () => {
    if (!session?.user) return;
    setLoading(true);

    try {
        const now = new Date();
        const numMonths = period === 'monthly' ? 1 : period === 'quarterly' ? 3 : 6;
        
        const trendData: MonthlySummary[] = [];
        let allTransactions: Transaction[] = [];

        for (let i = numMonths - 1; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const year = date.getFullYear();
            const month = date.getMonth();
            
            const transactions = await getTransactionsForMonth(session.user.id, year, month);
            if(transactions) {
                allTransactions = [...allTransactions, ...transactions];
                trendData.push({
                    month: date.toLocaleString("id-ID", { month: "long" }),
                    year: year,
                    income: transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
                    expense: transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
                });
            }
        }

        const totalIncome = allTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const totalExpense = allTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

        const categoryMap: { [key: string]: number } = {};
        allTransactions.filter(t => t.type === 'expense').forEach(tx => {
            categoryMap[tx.category] = (categoryMap[tx.category] || 0) + tx.amount;
        });

        const categoryBreakdown: CategorySpending[] = Object.entries(categoryMap)
            .map(([category, amount], index) => ({
              category,
              amount,
              color: PALETTE[index % PALETTE.length],
              percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
            }))
            .sort((a, b) => b.amount - a.amount);

        setReportData({
            trend: trendData,
            categoryBreakdown,
            totalIncome,
            totalExpense,
        });

    } catch (error: any) {
        Alert.alert("Error", `Failed to load report data: ${error.message}`);
    } finally {
        setLoading(false);
    }
  }, [session, period]);

  useFocusEffect(
    useCallback(() => {
      loadReportData();
    }, [loadReportData])
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
          <Text style={styles.placeholderText}>Generating reports...</Text>
        </View>
      );
    }
    if (!reportData) {
        return <View style={styles.center}><Text style={styles.placeholderText}>No data available.</Text></View>
    }

    return (
      <>
        <FinancialSummaryCard income={reportData.totalIncome} expense={reportData.totalExpense} />
        
        {period !== 'monthly' && (
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Expense Trend</Text>
                <ExpenseTrendChart data={reportData.trend} />
            </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Spending by Category</Text>
          <SpendingDonutChart data={reportData.categoryBreakdown} />
        </View>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <LinearGradient colors={['#4A90E2', '#0ABAB5']} style={StyleSheet.absoluteFill} />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Financial Reports</Text>
          <View style={styles.periodSelector}>
            {(["monthly", "quarterly", "semi-annually"] as Period[]).map((p) => (
              <Pressable
                key={p}
                style={[styles.periodButton, period === p && styles.periodButtonActive]}
                onPress={() => setPeriod(p)}
              >
                <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
                  {p === 'monthly' ? '1M' : p === 'quarterly' ? '3M' : '6M'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

// Styles
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#0ABAB5" },
    container: { padding: 20, paddingBottom: 100 },
    header: {
      marginTop: 40,
      marginBottom: 20,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: "bold",
      color: Colors.light.text,
    },
    periodSelector: {
      flexDirection: 'row',
      backgroundColor: Colors.light.background,
      borderRadius: 10,
      marginTop: 15,
      borderWidth: 1,
      borderColor: '#E0E0E0'
    },
    periodButton: {
      flex: 1,
      paddingVertical: 10,
      alignItems: 'center',
    },
    periodButtonActive: {
      backgroundColor: Colors.light.tint,
      borderRadius: 9,
    },
    periodText: {
      fontSize: 14,
      fontWeight: '600',
      color: Colors.light.icon,
    },
    periodTextActive: {
      color: 'white',
    },
    card: {
      backgroundColor: Colors.light.background,
      borderRadius: 20,
      padding: 20,
      marginBottom: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 3,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: Colors.light.black,
      marginBottom: 20,
    },
    center: {
      marginTop: 50,
      justifyContent: "center",
      alignItems: "center",
      gap: 15,
    },
    placeholderText: {
      color: Colors.light.icon,
      fontSize: 16,
      textAlign: "center",
    },
    chartPlaceholder: {
        height: 180,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    // Financial Summary
    summaryCardContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: Colors.light.background,
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    summaryItem: {
        alignItems: 'center',
        gap: 8,
    },
    summaryIcon: (color: string) => ({
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: color,
        justifyContent: 'center',
        alignItems: 'center',
    }),
    summaryLabel: {
        fontSize: 14,
        color: Colors.light.icon,
        textAlign: "center"
    },
    summaryValue: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.light.icon,
        textAlign: "center"
    },
    // Bar Chart
    barChartContainer: {
      height: 160,
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'flex-end',
    },
    barChartColumn: {
      flex: 1,
      alignItems: 'center',
      gap: 8,
    },
    barChartBarWrapper: {
      flex: 1,
      width: 30,
      backgroundColor: `${Colors.light.secondary}30`,
      borderRadius: 8,
      justifyContent: 'flex-end',
      overflow: 'hidden'
    },
    barChartBar: {
      width: '100%',
      backgroundColor: Colors.light.secondary,
    },
    barChartLabel: {
      fontSize: 12,
      color: Colors.light.icon,
      fontWeight: '500'
    },
    // Donut Chart
    donutChartContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      minHeight: 150,
    },
    donutPlaceholder: {
      width: 140,
      height: 140,
      borderRadius: 70,
      backgroundColor: `${Colors.light.tint}10`,
      justifyContent: 'center',
      alignItems: 'center'
    },
    legendContainer: {
      flex: 1,
      marginLeft: 20,
      gap: 12
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    legendColor: {
      width: 14,
      height: 14,
      borderRadius: 7,
    },
    legendText: {
      flex: 1,
      fontSize: 14,
      color: Colors.light.black,
    },
    legendPercentage: {
      fontSize: 14,
      fontWeight: '600',
      color: Colors.light.black,
    },
});