// components/specific/BudgetCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

type BudgetCardProps = {
  category: string;
  budgetAmount: number;
  spentAmount: number;
};

const BudgetCard = ({ category, budgetAmount, spentAmount }: BudgetCardProps) => {
  const progress = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0;
  const remaining = budgetAmount - spentAmount;

  const getProgressColor = () => {
    if (progress > 90) return Colors.light.danger;
    if (progress > 70) return '#F5A623'; // Orange
    return Colors.light.success;
  };

  return (
    <View style={styles.budgetCard}>
      <Text style={styles.budgetCategory}>{category}</Text>
      <View style={styles.amountContainer}>
        <Text style={styles.spentAmount}>
          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(spentAmount)}
        </Text>
        <Text style={styles.budgetAmount}>
          / {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(budgetAmount)}
        </Text>
      </View>
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${Math.min(progress, 100)}%`, backgroundColor: getProgressColor() }]} />
      </View>
      <Text style={styles.remainingText}>
        Sisa: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(remaining)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  budgetCard: {
    backgroundColor: Colors.light.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  budgetCategory: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.black,
    textTransform: "capitalize"
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4
  },
  spentAmount: {
    fontSize: 16,
    color: Colors.light.icon,
    fontWeight: '600'
  },
  budgetAmount: {
    fontSize: 14,
    color: Colors.light.icon
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: Colors.light.gray,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 5,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4
  },
  remainingText: {
    fontSize: 12,
    color: Colors.light.icon,
    fontStyle: 'italic',
    textAlign: 'right'
  }
});

export default BudgetCard;