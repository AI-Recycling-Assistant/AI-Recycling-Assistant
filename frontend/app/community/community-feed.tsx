import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFonts, Jua_400Regular } from "@expo-google-fonts/jua";
import { useState } from "react";

type Comment = {
  id: string;
  username: string;
  avatar: string;
  timeAgo: string;
  content: string;
  likes: number;
  isLiked: boolean;
};

const SAMPLE_COMMENTS: Comment[] = [
  {
    id: "1",
    username: "환경지킴이",
    avatar: "🌱",
    timeAgo: "1시간 전",
    content: "정말 유용한 정보네요! 저도 라벨 떼는 게 어려웠는데 따뜻한 물에 담가두면 쉽게 떨어지더라고요.",
    likes: 8,
    isLiked: true,
  },
  {
    id: "2",
    username: "재활용왕",
    avatar: "♻️",
    timeAgo: "2시간 전",
    content: "쓰담이 덕분에 분리배출 실력이 늘고 있어요! 감사합니다 👍",
    likes: 5,
    isLiked: false,
  },
];

export default function CommunityFeedScreen() {
  const [fontsLoaded] = useFonts({ Jua_400Regular });
  const [isLiked, setIsLiked] = useState(true);
  const [likes, setLikes] = useState(24);
  const [comments, setComments] = useState(SAMPLE_COMMENTS);
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [activeReply, setActiveReply] = useState<string | null>(null);

  if (!fontsLoaded) return null;

  const toggleLike = () => {
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
  };

  const toggleCommentLike = (commentId: string) => {
    setComments(comments.map(comment => 
      comment.id === commentId 
        ? { ...comment, isLiked: !comment.isLiked, likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1 }
        : comment
    ));
  };

  const reportPost = () => {
    alert('신고가 접수되었습니다.');
    setShowHeaderMenu(false);
  };

  const sendComment = () => {
    if (commentText.trim()) {
      alert('댓글이 등록되었습니다: ' + commentText);
      setCommentText("");
    }
  };

  const toggleReply = (commentId: string) => {
    setActiveReply(activeReply === commentId ? null : commentId);
    setReplyText("");
  };

  const sendReply = (commentId: string) => {
    if (replyText.trim()) {
      alert('답글이 등록되었습니다: ' + replyText);
      setReplyText("");
      setActiveReply(null);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>게시글</Text>
        <View style={styles.headerMenuContainer}>
          <TouchableOpacity onPress={() => setShowHeaderMenu(!showHeaderMenu)}>
            <Ionicons name="ellipsis-horizontal" size={24} color="#6B7280" />
          </TouchableOpacity>
          {showHeaderMenu && (
            <View style={styles.headerDropdownMenu}>
              <TouchableOpacity style={styles.headerMenuItem} onPress={reportPost}>
                <Text style={styles.headerMenuText}>신고하기</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* 게시글 내용 */}
      <View style={styles.postContainer}>
        {/* 사용자 정보 */}
        <View style={styles.userInfo}>
          <Text style={styles.avatar}>👑</Text>
          <View style={styles.userDetails}>
            <Text style={styles.username}>쓰담이마스터</Text>
            <Text style={styles.timeAgo}>2시간 전</Text>
          </View>
        </View>

        {/* 제목 */}
        <Text style={styles.postTitle}>플라스틱 분리배출 성공 후기!</Text>

        {/* 카테고리 */}
        <View style={styles.categoryTag}>
          <Text style={styles.categoryText}>팁</Text>
        </View>

        {/* 본문 */}
        <Text style={styles.postContent}>
          오늘 플라스틱 분리배출 완벽하게 했어요! 라벨도 다 떼고 깨끗하게 씻어서 버렸답니다. 
          처음에는 어려웠는데 이제 습관이 되었어요. 다른 분들도 함께 해요!
          
          특히 페트병 라벨 떼는 팁을 공유하자면:
          1. 따뜻한 물에 5분 정도 담가두기
          2. 모서리부터 천천히 떼어내기
          3. 끈적한 부분은 식용유로 닦아내기
          
          이렇게 하면 깨끗하게 분리배출할 수 있어요! 🌍♻️
        </Text>

        {/* 첨부 이미지 */}
        <View style={styles.imageContainer}>
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={48} color="#9CA3AF" />
            <Text style={styles.imageText}>첨부된 사진</Text>
          </View>
        </View>

        {/* 액션 버튼들 */}
        <View style={styles.postActions}>
          <TouchableOpacity style={styles.actionButton} onPress={toggleLike}>
            <Ionicons 
              name={isLiked ? "heart" : "heart-outline"} 
              size={20} 
              color={isLiked ? "#EF4444" : "#6B7280"} 
            />
            <Text style={[styles.actionText, isLiked && styles.likedText]}>
              {likes}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={20} color="#6B7280" />
            <Text style={styles.actionText}>{comments.length}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-outline" size={20} color="#6B7280" />
            <Text style={styles.actionText}>공유</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 댓글 섹션 */}
      <View style={styles.commentsSection}>
        <Text style={styles.commentsTitle}>댓글 {comments.length}개</Text>
        
        {comments.map((comment) => (
          <View key={comment.id} style={styles.commentCard}>
            <View style={styles.commentHeader}>
              <View style={styles.commentUserInfo}>
                <Text style={styles.commentAvatar}>{comment.avatar}</Text>
                <View>
                  <Text style={styles.commentUsername}>{comment.username}</Text>
                  <Text style={styles.commentTime}>{comment.timeAgo}</Text>
                </View>
              </View>
            </View>
            
            <Text style={styles.commentContent}>{comment.content}</Text>
            
            <View style={styles.commentActions}>
              <TouchableOpacity 
                style={styles.commentActionButton}
                onPress={() => toggleCommentLike(comment.id)}
              >
                <Ionicons 
                  name={comment.isLiked ? "heart" : "heart-outline"} 
                  size={16} 
                  color={comment.isLiked ? "#EF4444" : "#6B7280"} 
                />
                <Text style={[styles.commentActionText, comment.isLiked && styles.likedText]}>
                  {comment.likes}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.commentActionButton}
                onPress={() => toggleReply(comment.id)}
              >
                <Text style={styles.replyText}>답글</Text>
              </TouchableOpacity>
            </View>
            
            {activeReply === comment.id && (
              <View style={styles.replyInput}>
                <View style={styles.replyInputContainer}>
                  <TouchableOpacity 
                    style={styles.replyCancel}
                    onPress={() => setActiveReply(null)}
                  >
                    <Text style={styles.replyCancelText}>취소</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={styles.replyInputField}
                    placeholder="답글을 입력하세요..."
                    value={replyText}
                    onChangeText={setReplyText}
                    onSubmitEditing={() => sendReply(comment.id)}
                  />
                  <TouchableOpacity 
                    style={styles.replySendButton}
                    onPress={() => sendReply(comment.id)}
                  >
                    <Ionicons name="send" size={16} color="#1AA179" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* 댓글 입력 */}
      <View style={styles.commentInput}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.commentInputField}
            placeholder="댓글을 입력하세요..."
            value={commentText}
            onChangeText={setCommentText}
            onSubmitEditing={sendComment}
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendComment}>
            <Ionicons name="send" size={20} color="#1AA179" />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Jua_400Regular",
    color: "#111827",
  },
  postContainer: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    fontSize: 40,
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: 18,
    fontFamily: "Jua_400Regular",
    color: "#111827",
    marginBottom: 2,
  },
  timeAgo: {
    fontSize: 14,
    color: "#6B7280",
  },
  postTitle: {
    fontSize: 20,
    fontFamily: "Jua_400Regular",
    color: "#111827",
    marginBottom: 12,
    lineHeight: 28,
  },
  categoryTag: {
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  categoryText: {
    fontSize: 14,
    fontFamily: "Jua_400Regular",
    color: "#16A34A",
  },
  postContent: {
    fontSize: 16,
    fontFamily: "Jua_400Regular",
    color: "#374151",
    lineHeight: 24,
    marginBottom: 20,
  },
  imageContainer: {
    marginBottom: 20,
  },
  imagePlaceholder: {
    height: 200,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  imageText: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 8,
    fontFamily: "Jua_400Regular",
  },
  postActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    color: "#6B7280",
    fontFamily: "Jua_400Regular",
  },
  likedText: {
    color: "#EF4444",
  },
  commentsSection: {
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  commentsTitle: {
    fontSize: 18,
    fontFamily: "Jua_400Regular",
    color: "#111827",
    marginBottom: 16,
  },
  commentCard: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  commentUserInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  commentAvatar: {
    fontSize: 28,
    marginRight: 10,
  },
  commentUsername: {
    fontSize: 14,
    fontFamily: "Jua_400Regular",
    color: "#111827",
    marginBottom: 2,
  },
  commentTime: {
    fontSize: 12,
    color: "#6B7280",
  },
  commentContent: {
    fontSize: 14,
    fontFamily: "Jua_400Regular",
    color: "#374151",
    lineHeight: 20,
    marginBottom: 12,
  },
  commentActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  commentActionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  commentActionText: {
    fontSize: 12,
    color: "#6B7280",
    fontFamily: "Jua_400Regular",
  },
  replyText: {
    fontSize: 12,
    color: "#6B7280",
    fontFamily: "Jua_400Regular",
  },
  commentInput: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputPlaceholder: {
    flex: 1,
    fontSize: 14,
    color: "#9CA3AF",
    fontFamily: "Jua_400Regular",
  },
  sendButton: {
    padding: 4,
  },
  commentInputField: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
    fontFamily: "Jua_400Regular",
  },
  replyInput: {
    marginTop: 12,
    paddingLeft: 38,
  },
  replyInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  replyInputField: {
    flex: 1,
    fontSize: 12,
    color: "#374151",
    fontFamily: "Jua_400Regular",
  },
  replyCancel: {
    marginRight: 8,
  },
  replyCancelText: {
    fontSize: 10,
    color: "#6B7280",
    fontFamily: "Jua_400Regular",
  },
  replySendButton: {
    padding: 2,
  },
  headerMenuContainer: {
    position: "relative",
  },
  headerDropdownMenu: {
    position: "absolute",
    top: "100%",
    right: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 8,
    minWidth: 120,
    zIndex: 1000,
  },
  headerMenuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  headerMenuText: {
    fontSize: 14,
    color: "#EF4444",
    fontFamily: "Jua_400Regular",
  },
});