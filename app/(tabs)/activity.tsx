import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity,
  StatusBar 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, MessageCircle, TrendingUp, TrendingDown, Clock, CheckCircle } from 'lucide-react-native';

interface ActivityItem {
  id: string;
  type: 'bet' | 'like' | 'comment' | 'win' | 'loss';
  title: string;
  description: string;
  amount?: number;
  position?: 'yes' | 'no';
  timestamp: string;
  image: string;
  category: string;
  status?: 'pending' | 'won' | 'lost';
}

const ActivityScreen: React.FC = () => {
  const activityData: ActivityItem[] = [
    {
      id: '1',
      type: 'bet',
      title: 'Will Rihanna release new music in 2025?',
      description: 'Bet $100 on YES',
      amount: 100,
      position: 'yes',
      timestamp: '2 hours ago',
      image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80',
      category: 'Music',
      status: 'pending'
    },
    {
      id: '2',
      type: 'like',
      title: 'Will Taylor Swift announce a new album before February?',
      description: 'Liked this prediction',
      timestamp: '4 hours ago',
      image: 'https://images.unsplash.com/photo-1624091225789-30d6a58bfeef?w=400&q=80',
      category: 'Entertainment'
    },
    {
      id: '3',
      type: 'win',
      title: 'Will Drake drop a surprise album this year?',
      description: 'Won $85 betting YES',
      amount: 85,
      position: 'yes',
      timestamp: '1 day ago',
      image: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400&q=80',
      category: 'Music',
      status: 'won'
    },
    {
      id: '4',
      type: 'bet',
      title: 'Will GTA 6 be delayed past 2025?',
      description: 'Bet $50 on NO',
      amount: 50,
      position: 'no',
      timestamp: '1 day ago',
      image: 'https://images.unsplash.com/photo-1618193006865-38d47c7f8f07?w=400&q=80',
      category: 'Gaming',
      status: 'pending'
    },
    {
      id: '5',
      type: 'comment',
      title: 'Will Bad Bunny headline Coachella 2025?',
      description: 'Commented: "This is definitely happening! 🔥"',
      timestamp: '2 days ago',
      image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&q=80',
      category: 'Music'
    },
    {
      id: '6',
      type: 'bet',
      title: 'Will Beyoncé go on world tour in 2025?',
      description: 'Bet $200 on YES',
      amount: 200,
      position: 'yes',
      timestamp: '3 days ago',
      image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&q=80',
      category: 'Music',
      status: 'pending'
    },
    {
      id: '7',
      type: 'loss',
      title: 'Will Marvel announce a new Avengers movie this year?',
      description: 'Lost $75 betting YES',
      amount: 75,
      position: 'yes',
      timestamp: '4 days ago',
      image: 'https://images.unsplash.com/photo-1635863138275-d9b33299680b?w=400&q=80',
      category: 'Movies',
      status: 'lost'
    },
    {
      id: '8',
      type: 'like',
      title: 'Will Oppenheimer win Best Picture at the Oscars?',
      description: 'Liked this prediction',
      timestamp: '5 days ago',
      image: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=400&q=80',
      category: 'Movies'
    },
    {
      id: '9',
      type: 'bet',
      title: 'Will Travis Kelce and Taylor Swift get engaged?',
      description: 'Bet $150 on NO',
      amount: 150,
      position: 'no',
      timestamp: '1 week ago',
      image: 'https://images.unsplash.com/photo-1529636798458-92182e662485?w=400&q=80',
      category: 'Celebrity',
      status: 'pending'
    },
    {
      id: '10',
      type: 'win',
      title: 'Will The Weeknd win a Grammy this year?',
      description: 'Won $120 betting YES',
      amount: 120,
      position: 'yes',
      timestamp: '1 week ago',
      image: 'https://images.unsplash.com/photo-1598387846419-a2c870ad3ecd?w=400&q=80',
      category: 'Music',
      status: 'won'
    }
  ];

  const getActivityIcon = (type: string, status?: string) => {
    switch (type) {
      case 'bet':
        if (status === 'pending') return <Clock size={16} color="#00D4FF" />;
        return <TrendingUp size={16} color="#00D4FF" />;
      case 'like':
        return <Heart size={16} color="#FF3B30" fill="#FF3B30" />;
      case 'comment':
        return <MessageCircle size={16} color="#00D4FF" />;
      case 'win':
        return <CheckCircle size={16} color="#34C759" />;
      case 'loss':
        return <TrendingDown size={16} color="#FF3B30" />;
      default:
        return <Clock size={16} color="#888" />;
    }
  };

  const getActivityColor = (type: string, status?: string) => {
    switch (type) {
      case 'win':
        return '#34C759';
      case 'loss':
        return '#FF3B30';
      case 'like':
        return '#FF3B30';
      case 'comment':
        return '#00D4FF';
      case 'bet':
        return status === 'pending' ? '#00D4FF' : '#888';
      default:
        return '#888';
    }
  };

  const getPositionColor = (position?: string) => {
    return position === 'yes' ? '#34C759' : '#FF3B30';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Activity</Text>
        <Text style={styles.subtitle}>Your betting history & interactions</Text>
      </View>

      {/* Activity Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <LinearGradient
            colors={['#34C759', '#30B350']}
            style={styles.statGradient}
          >
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Wins</Text>
          </LinearGradient>
        </View>
        
        <View style={styles.statCard}>
          <LinearGradient
            colors={['#FF3B30', '#E63329']}
            style={styles.statGradient}
          >
            <Text style={styles.statNumber}>1</Text>
            <Text style={styles.statLabel}>Losses</Text>
          </LinearGradient>
        </View>
        
        <View style={styles.statCard}>
          <LinearGradient
            colors={['#00D4FF', '#0099CC']}
            style={styles.statGradient}
          >
            <Text style={styles.statNumber}>6</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </LinearGradient>
        </View>
      </View>

      {/* Activity List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {activityData.map((item) => (
          <TouchableOpacity key={item.id} style={styles.activityItem}>
            {/* Image */}
            <View style={styles.imageContainer}>
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={[styles.iconBadge, { backgroundColor: getActivityColor(item.type, item.status) }]}>
                {getActivityIcon(item.type, item.status)}
              </View>
            </View>

            {/* Content */}
            <View style={styles.itemContent}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={styles.timestamp}>{item.timestamp}</Text>
              </View>
              
              <View style={styles.itemDetails}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{item.category}</Text>
                </View>
                
                {item.amount && (
                  <View style={[styles.amountContainer, { backgroundColor: getPositionColor(item.position) }]}>
                    <Text style={styles.amountText}>
                      {item.type === 'win' ? '+' : item.type === 'loss' ? '-' : ''}${item.amount}
                    </Text>
                    {item.position && (
                      <Text style={styles.positionText}>{item.position.toUpperCase()}</Text>
                    )}
                  </View>
                )}
              </View>
              
              <Text style={styles.description} numberOfLines={2}>
                {item.description}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
        
        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statGradient: {
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  activityItem: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(28, 28, 30, 0.5)',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(79, 195, 247, 0.1)',
  },
  imageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  iconBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    flex: 1,
    marginRight: 8,
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  categoryBadge: {
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.2)',
  },
  categoryText: {
    fontSize: 10,
    color: '#00D4FF',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  amountText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '700',
  },
  positionText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#CCC',
    fontWeight: '400',
    lineHeight: 18,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default ActivityScreen;
