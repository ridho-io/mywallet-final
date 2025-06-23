// components/specific/SavingGoalCard.tsx
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import GlassContainer from '../Styled/GlassContainer';
import { SavingGoal } from '../../lib/database';

type SavingGoalCardProps = {
  goal: SavingGoal;
  onContributePress: () => void;
};

const SavingGoalCard = ({ goal, onContributePress }: SavingGoalCardProps) => {
    const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
    
    return (
        <GlassContainer style={styles.card}>
            <Text style={styles.goalName}>{goal.goal_name}</Text>
            <View style={styles.progressBarContainer}>
                <View style={[styles.progressBarFill, { width: `${Math.min(progress, 100)}%` }]}/>
            </View>
            <View style={styles.detailsContainer}>
                <Text style={styles.amountText}>
                    {new Intl.NumberFormat('id-ID').format(goal.current_amount)} / {new Intl.NumberFormat('id-ID').format(goal.target_amount)}
                </Text>
                <Pressable style={styles.contributeButton} onPress={onContributePress}>
                    <Text style={styles.contributeText}>+ Tabung</Text>
                </Pressable>
            </View>
        </GlassContainer>
    );
};

const styles = StyleSheet.create({
    card: { gap: 5, backgroundColor: 'rgba(50, 50, 50, 0.5)' },
    goalName: { color: 'white', fontSize: 20, fontWeight: 'bold' },
    progressBarContainer: {
        height: 10,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 5,
        overflow: 'hidden',
        marginVertical: 10,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#007AFF',
        borderRadius: 5,
    },
    detailsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    amountText: { color: '#AEAEB2', fontSize: 14 },
    contributeButton: { 
        backgroundColor: '#007AFF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    contributeText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
});

export default SavingGoalCard;