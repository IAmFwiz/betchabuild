import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Send, Heart, MoreVertical } from 'lucide-react-native';

interface Prediction {
  id: string;
  title: string;
  category: string;
  image_url?: string;
  yes_price: number;
  no_price: number;
  end_date: string;
}

interface Comment {
  id: string;
  user: {
    name: string;
    avatar: string;
    verified?: boolean;
  };
  text: string;
  likes: number;
  timestamp: string;
  liked?: boolean;
}

interface CommentModalProps {
  visible: boolean;
  prediction: Prediction;
  onClose: () => void;
}

const CommentModal: React.FC<CommentModalProps> = ({ visible, prediction, onClose }) => {
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>(() => {
    // Check if this is the Rihanna card and provide tailored comments
    if (prediction.title.toLowerCase().includes('rihanna')) {
      return [
        {
          id: '1',
          user: {
            name: 'MusicLover2024',
            avatar: 'https://i.pravatar.cc/100?u=1',
            verified: false,
          },
          text: "She's been teasing new music on Instagram! The studio pics are everywhere 👀",
          likes: 24,
          timestamp: '2h',
          liked: false,
        },
        {
          id: '2',
          user: {
            name: 'RihannaNavyFan',
            avatar: 'https://i.pravatar.cc/100?u=2',
            verified: true,
          },
          text: "It's been TOO long since Anti. She's definitely dropping something this year! 🔥",
          likes: 89,
          timestamp: '4h',
          liked: true,
        },
        {
          id: '3',
          user: {
            name: 'PopCultureGuru',
            avatar: 'https://i.pravatar.cc/100?u=3',
            verified: false,
          },
          text: "Her Fenty brand is huge now, but music is her first love. I'm betting YES on this one!",
          likes: 45,
          timestamp: '6h',
          liked: false,
        },
        {
          id: '4',
          user: {
            name: 'ChartWatcher',
            avatar: 'https://i.pravatar.cc/100?u=4',
            verified: true,
          },
          text: "Industry insiders are saying she's been working with top producers lately... 👑",
          likes: 67,
          timestamp: '8h',
          liked: true,
        },
        {
          id: '5',
          user: {
            name: 'BarbadosQueen',
            avatar: 'https://i.pravatar.cc/100?u=5',
            verified: false,
          },
          text: "She literally said 'music is coming' in that recent interview. How much more confirmation do we need?",
          likes: 156,
          timestamp: '12h',
          liked: false,
        },
        {
          id: '6',
          user: {
            name: 'StreamingStats',
            avatar: 'https://i.pravatar.cc/100?u=6',
            verified: false,
          },
          text: "Her old tracks are trending again on Spotify. Perfect time for a comeback! 📈",
          likes: 32,
          timestamp: '1d',
          liked: false,
        },
        {
          id: '7',
          user: {
            name: 'MusicIndustryInside',
            avatar: 'https://i.pravatar.cc/100?u=7',
            verified: true,
          },
          text: "Record label sources confirm she's been in the studio. This is happening! 🎵",
          likes: 201,
          timestamp: '1d',
          liked: true,
        },
        {
          id: '8',
          user: {
            name: 'AntiEraFan',
            avatar: 'https://i.pravatar.cc/100?u=8',
            verified: false,
          },
          text: "She's taking her time to make it perfect. When Rihanna drops, it's always worth the wait ✨",
          likes: 78,
          timestamp: '2d',
          liked: false,
        }
      ];
    } else {
      // Generic comments for other predictions
      return [
        {
          id: '1',
          user: {
            name: 'BettingPro',
            avatar: 'https://i.pravatar.cc/100?u=10',
            verified: false,
          },
          text: "This is a tough one to call. The odds seem about right!",
          likes: 12,
          timestamp: '1h',
          liked: false,
        },
        {
          id: '2',
          user: {
            name: 'TrendWatcher',
            avatar: 'https://i.pravatar.cc/100?u=11',
            verified: true,
          },
          text: "Based on recent developments, I'm leaning towards YES on this prediction.",
          likes: 28,
          timestamp: '3h',
          liked: true,
        },
        {
          id: '3',
          user: {
            name: 'DataAnalyst',
            avatar: 'https://i.pravatar.cc/100?u=12',
            verified: false,
          },
          text: "Looking at historical patterns, this seems likely to happen.",
          likes: 15,
          timestamp: '5h',
          liked: false,
        }
      ];
    }
  });

  const handleLikeComment = (commentId: string) => {
    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? { 
            ...comment, 
            liked: !comment.liked,
            likes: comment.liked ? comment.likes - 1 : comment.likes + 1
          }
        : comment
    ));
  };

  const handleSendComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now().toString(),
        user: {
          name: 'You',
          avatar: 'https://i.pravatar.cc/100',
        },
        text: newComment.trim(),
        likes: 0,
        timestamp: 'now',
        liked: false,
      };
      setComments(prev => [comment, ...prev]);
      setNewComment('');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Comments</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Prediction Preview */}
        <View style={styles.predictionPreview}>
          <Image 
            source={{ uri: prediction.image_url }} 
            style={styles.previewImage}
          />
          <View style={styles.previewContent}>
            <Text style={styles.previewCategory}>{prediction.category.toUpperCase()}</Text>
            <Text style={styles.previewTitle} numberOfLines={2}>{prediction.title}</Text>
            <View style={styles.previewOdds}>
              <Text style={styles.oddsText}>YES {prediction.yes_price}%</Text>
              <Text style={styles.oddsSeparator}>•</Text>
              <Text style={styles.oddsText}>NO {prediction.no_price}%</Text>
            </View>
          </View>
        </View>

        {/* Comments List */}
        <ScrollView style={styles.commentsList} showsVerticalScrollIndicator={false}>
          {comments.map((comment) => (
            <View key={comment.id} style={styles.commentItem}>
              <Image source={{ uri: comment.user.avatar }} style={styles.avatar} />
              
              <View style={styles.commentContent}>
                <View style={styles.commentHeader}>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{comment.user.name}</Text>
                    {comment.user.verified && (
                      <View style={styles.verifiedBadge}>
                        <Text style={styles.verifiedText}>✓</Text>
                      </View>
                    )}
                    <Text style={styles.timestamp}>• {comment.timestamp}</Text>
                  </View>
                  <TouchableOpacity style={styles.moreButton}>
                    <MoreVertical size={16} color="#888" />
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.commentText}>{comment.text}</Text>
                
                <TouchableOpacity 
                  style={styles.likeButton}
                  onPress={() => handleLikeComment(comment.id)}
                >
                  <Heart 
                    size={16} 
                    color={comment.liked ? "#FF3B30" : "#888"}
                    fill={comment.liked ? "#FF3B30" : "transparent"}
                  />
                  <Text style={[styles.likeCount, comment.liked && styles.likedCount]}>
                    {comment.likes}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Comment Input */}
        <View style={styles.inputContainer}>
          <Image 
            source={{ uri: 'https://i.pravatar.cc/100' }} 
            style={styles.inputAvatar}
          />
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Add a comment..."
              placeholderTextColor="#888"
              value={newComment}
              onChangeText={setNewComment}
              multiline
              maxLength={280}
            />
            <TouchableOpacity 
              style={[styles.sendButton, !newComment.trim() && styles.sendButtonDisabled]}
              onPress={handleSendComment}
              disabled={!newComment.trim()}
            >
              <LinearGradient
                colors={newComment.trim() ? ['#00D4FF', '#0099CC'] : ['#444', '#444']}
                style={styles.sendGradient}
              >
                <Send size={16} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  placeholder: {
    width: 40,
  },
  predictionPreview: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'rgba(28, 28, 30, 0.5)',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(79, 195, 247, 0.1)',
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 12,
  },
  previewContent: {
    flex: 1,
  },
  previewCategory: {
    fontSize: 10,
    color: '#00D4FF',
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    lineHeight: 18,
    marginBottom: 8,
  },
  previewOdds: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  oddsText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
  oddsSeparator: {
    fontSize: 12,
    color: '#444',
    marginHorizontal: 8,
  },
  commentsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  commentItem: {
    flexDirection: 'row',
    paddingVertical: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    marginRight: 4,
  },
  verifiedBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#00D4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  verifiedText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: 'bold',
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
    marginLeft: 4,
  },
  moreButton: {
    padding: 4,
  },
  commentText: {
    fontSize: 14,
    color: '#FFF',
    lineHeight: 20,
    marginBottom: 8,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeCount: {
    fontSize: 12,
    color: '#888',
    marginLeft: 4,
    fontWeight: '500',
  },
  likedCount: {
    color: '#FF3B30',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'flex-end',
  },
  inputAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(28, 28, 30, 0.8)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(79, 195, 247, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  textInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 14,
    maxHeight: 80,
    marginRight: 8,
  },
  sendButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendGradient: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CommentModal;
