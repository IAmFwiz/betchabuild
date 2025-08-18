// components/CommentModal.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { X, Send, Heart, MessageCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { tokens } from '../theme/tokens';

interface Comment {
  id: string;
  user: string;
  avatar: string;
  text: string;
  likes: number;
  replies: number;
  timestamp: string;
  isLiked: boolean;
}

interface CommentModalProps {
  visible: boolean;
  prediction: {
    id: string;
    title: string;
    category: string;
  };
  onClose: () => void;
}

const CommentModal: React.FC<CommentModalProps> = ({ visible, prediction, onClose }) => {
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      user: 'AlexTrader',
      avatar: 'https://i.pravatar.cc/100?img=1',
      text: 'This is definitely happening! The indicators are all pointing up 📈',
      likes: 24,
      replies: 3,
      timestamp: '2h ago',
      isLiked: false,
    },
    {
      id: '2',
      user: 'CryptoQueen',
      avatar: 'https://i.pravatar.cc/100?img=2',
      text: 'I disagree. The market conditions aren\'t favorable right now.',
      likes: 18,
      replies: 5,
      timestamp: '3h ago',
      isLiked: true,
    },
    {
      id: '3',
      user: 'MarketWatch',
      avatar: 'https://i.pravatar.cc/100?img=3',
      text: 'Interesting perspective! I\'m betting YES on this one 🚀',
      likes: 42,
      replies: 8,
      timestamp: '5h ago',
      isLiked: false,
    },
    {
      id: '4',
      user: 'DataDriven',
      avatar: 'https://i.pravatar.cc/100?img=4',
      text: 'Historical data suggests a 73% probability of this outcome.',
      likes: 56,
      replies: 12,
      timestamp: '8h ago',
      isLiked: false,
    },
  ]);

  const handleSendComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now().toString(),
        user: 'You',
        avatar: 'https://i.pravatar.cc/100?img=99',
        text: newComment,
        likes: 0,
        replies: 0,
        timestamp: 'Just now',
        isLiked: false,
      };
      setComments([comment, ...comments]);
      setNewComment('');
    }
  };

  const toggleLike = (commentId: string) => {
    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          isLiked: !comment.isLiked,
          likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
        };
      }
      return comment;
    }));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <BlurView intensity={20} style={styles.container}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>Comments</Text>
              <View style={styles.commentCount}>
                <Text style={styles.commentCountText}>{comments.length}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Prediction Context */}
          <View style={styles.predictionContext}>
            <LinearGradient
              colors={['#00D4FF', '#0099CC']}
              style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{prediction.category}</Text>
            </LinearGradient>
            <Text style={styles.predictionTitle} numberOfLines={2}>
              {prediction.title}
            </Text>
          </View>

          {/* Comments List */}
          <ScrollView style={styles.commentsList} showsVerticalScrollIndicator={false}>
            {comments.map((comment) => (
              <View key={comment.id} style={styles.commentItem}>
                <Image source={{ uri: comment.avatar }} style={styles.avatar} />
                <View style={styles.commentContent}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.username}>{comment.user}</Text>
                    <Text style={styles.timestamp}>{comment.timestamp}</Text>
                  </View>
                  <Text style={styles.commentText}>{comment.text}</Text>
                  <View style={styles.commentActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => toggleLike(comment.id)}>
                      <Heart
                        size={16}
                        color={comment.isLiked ? '#FF3B30' : '#8E8E93'}
                        fill={comment.isLiked ? '#FF3B30' : 'transparent'}
                      />
                      <Text style={[
                        styles.actionText,
                        comment.isLiked && styles.likedText
                      ]}>
                        {comment.likes}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                      <MessageCircle size={16} color="#8E8E93" />
                      <Text style={styles.actionText}>{comment.replies}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Input Area */}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={100}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Add a comment..."
                placeholderTextColor="#8E8E93"
                value={newComment}
                onChangeText={setNewComment}
                multiline
                maxLength={280}
              />
              <TouchableOpacity
                style={[styles.sendButton, !newComment.trim() && styles.sendButtonDisabled]}
                onPress={handleSendComment}
                disabled={!newComment.trim()}>
                <LinearGradient
                  colors={newComment.trim() ? ['#00D4FF', '#0099CC'] : ['#3A3A3C', '#3A3A3C']}
                  style={styles.sendButtonGradient}>
                  <Send size={20} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '85%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  commentCount: {
    backgroundColor: '#00D4FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  commentCountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  predictionContext: {
    padding: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  predictionTitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 22,
  },
  commentsList: {
    flex: 1,
    padding: 20,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  timestamp: {
    fontSize: 12,
    color: '#8E8E93',
  },
  commentText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: 'row',
    gap: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '600',
  },
  likedText: {
    color: '#FF3B30',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'flex-end',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 14,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CommentModal;
