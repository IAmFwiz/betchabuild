// app/(tabs)/profile.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Trophy, TrendingUp, DollarSign, Target, LogOut, Settings } from 'lucide-react-native';
import supabaseService from '../../services/supabaseService';

interface Stats {
  totalBets: number;
  winRate: number;
  totalProfit: number;
  currentStreak: number;
  balance: number;
}

interface BetItem {
  id: string;
  question: string;
  side: 'yes' | 'no';
  amount: number;
  status: 'pending' | 'won' | 'lost';
  date: string;
  payout?: number;
}

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<Stats>({
    totalBets: 47,
    winRate: 68,
    totalProfit: 2340,
    currentStreak: 5,
    balance: 3340,
  });
  const [betHistory, setBetHistory] = useState<BetItem[]>([
    {
      id: '1',
      question: 'Will the Lakers make the playoffs?',
      side: 'yes',
      amount: 50,
      status: 'won',
      date: '2024-08-14',
      payout: 95,
    },
    {
      id: '2',
      question: 'Will inflation drop below 3%?',
      side: 'no',
      amount: 100,
      status: 'won',
      date: '2024-08-13',
      payout: 180,
    },
    {
      id: '3',
      question: 'Will Apple stock hit $250?',
      side: 'yes',
      amount: 75,
      status: 'pending',
      date: '2024-08-12',
    },
  ]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const currentUser = await supabaseService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      // Load real user stats and history
      const profile = await supabaseService.getUserProfile(currentUser.id);
      if (profile) {
        setStats({
          totalBets: profile.total_bets,
          winRate: profile.total_bets > 0 
            ? Math.round((profile.total_wins / profile.total_bets) * 100) 
            : 0,
          totalProfit: profile.balance - 1000, // Initial balance was 1000
          currentStreak: profile.win_streak,
          balance: profile.balance,
        });
      }
      
      const history = await supabaseService.getBetHistory(currentUser.id);
      if (history.length > 0) {
        setBetHistory(history.map(bet => ({
          id: bet.id,
          question: bet.market_question,
          side: bet.side,
          amount: bet.amount,
          status: bet.status,
          date: new Date(bet.created_at).toLocaleDateString(),
          payout: bet.payout,
        })));
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  };

  const handleSignOut = async () => {
    await supabaseService.signOut();
    router.replace('/auth');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'won': return '#34C759';
      case 'lost': return '#FF3B30';
      case 'pending': return '#FF9500';
      default: return '#8E8E93';
    }
  };

  const getSideColor = (side: string) => {
    return side === 'yes' ? '#34C759' : '#FF3B30';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00D4FF" />
        }>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={['#00D4FF', '#0099CC']}
                style={styles.avatarGradient}>
                <Text style={styles.avatarText}>
                  {user?.email?.[0]?.toUpperCase() || 'B'}
                </Text>
              </LinearGradient>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.email || 'Guest User'}</Text>
              <Text style={styles.memberSince}>Member since Aug 2024</Text>
            </View>
          </View>
          
          <TouchableOpacity onPress={() => router.push('/settings')}>
            <Settings size={24} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <LinearGradient
          colors={['#1C1C1E', '#2C2C2E']}
          style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <Text style={styles.balanceAmount}>${stats.balance.toLocaleString()}</Text>
          <View style={styles.profitContainer}>
            <TrendingUp size={16} color="#34C759" />
            <Text style={styles.profitText}>
              ${stats.totalProfit > 0 ? '+' : ''}{stats.totalProfit.toLocaleString()} all time
            </Text>
          </View>
        </LinearGradient>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(255, 149, 0, 0.2)' }]}>
              <Target size={20} color="#FF9500" />
            </View>
            <Text style={styles.statValue}>{stats.totalBets}</Text>
            <Text style={styles.statLabel}>Total Bets</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(52, 199, 89, 0.2)' }]}>
              <Trophy size={20} color="#34C759" />
            </View>
            <Text style={styles.statValue}>{stats.winRate}%</Text>
            <Text style={styles.statLabel}>Win Rate</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(255, 59, 48, 0.2)' }]}>
              <TrendingUp size={20} color="#FF3B30" />
            </View>
            <Text style={styles.statValue}>{stats.currentStreak}</Text>
            <Text style={styles.statLabel}>Current Streak</Text>
          </View>
        </View>

        {/* Recent Bets */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Bets</Text>
          
          {betHistory.map((bet) => (
            <View key={bet.id} style={styles.betCard}>
              <View style={styles.betHeader}>
                <View style={[styles.sideBadge, { backgroundColor: getSideColor(bet.side) }]}>
                  <Text style={styles.sideText}>{bet.side.toUpperCase()}</Text>
                </View>
                <Text style={[styles.betStatus, { color: getStatusColor(bet.status) }]}>
                  {bet.status.toUpperCase()}
                </Text>
              </View>
              
              <Text style={styles.betQuestion}>{bet.question}</Text>
              
              <View style={styles.betFooter}>
                <Text style={styles.betAmount}>Bet: ${bet.amount}</Text>
                {bet.payout && (
                  <Text style={styles.betPayout}>
                    {bet.status === 'won' ? 'Won: $' : 'Lost: $'}
                    {bet.payout}
                  </Text>
                )}
                <Text style={styles.betDate}>{bet.date}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <LogOut size={20} color="#FF3B30" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatarGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  userInfo: {
    justifyContent: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  memberSince: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  balanceCard: {
    margin: 20,
    padding: 20,
    borderRadius: 20,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '600',
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFF',
    marginVertical: 8,
  },
  profitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profitText: {
    color: '#34C759',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '600',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 16,
  },
  betCard: {
    backgroundColor: '#1C1C1E',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  betHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sideBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sideText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  betStatus: {
    fontSize: 11,
    fontWeight: '700',
  },
  betQuestion: {
    fontSize: 14,
    color: '#FFF',
    marginBottom: 12,
    lineHeight: 20,
  },
  betFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  betAmount: {
    fontSize: 12,
    color: '#8E8E93',
  },
  betPayout: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '600',
  },
  betDate: {
    fontSize: 12,
    color: '#666',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    padding: 16,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderRadius: 12,
  },
  signOutText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomSpacer: {
    height: 20,
  },
});
