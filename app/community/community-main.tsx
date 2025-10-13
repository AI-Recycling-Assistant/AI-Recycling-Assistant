import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TouchableWithoutFeedback } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFonts, Jua_400Regular } from "@expo-google-fonts/jua";
import { useState } from "react";

type CommunityPost = {
  id: string;
  username: string;
  avatar: string;
  timeAgo: string;
  title: string;
  category: "tip" | "question";
  content: string;
  hasPhoto?: boolean;
  likes: number;
  comments: number;
  isLiked: boolean;
};

const SAMPLE_POSTS: CommunityPost[] = [
  {
    id: "1",
    username: "쓰담이마스터",
    avatar: "👑",
    timeAgo: "2시간 전",
    title: "플라스틱 분리배출 성공 후기!",
    category: "tip",
    content: "오늘 플라스틱 분리배출 완벽하게 했어요! 라벨도 다 떼고 깨끗하게 씻어서 버렸답니다. 처음에는 어려웠는데 이제 습관이 되었어요. 다른 분들도 함께 해요!",
    hasPhoto: true,
    likes: 24,
    comments: 8,
    isLiked: true,
  },
  {
    id: "2", 
    username: "환경지킴이",
    avatar: "🌱",
    timeAgo: "5시간 전",
    title: "종이컵 분리배출 방법 문의",
    category: "question",
    content: "종이컵도 분리배출이 되는 줄 몰랐는데 쓰담이 덕분에 알게 됐어요! 그런데 코팅된 종이컵은 어떻게 버려야 하나요? 자세한 방법을 알려주세요.",
    likes: 18,
    comments: 12,
    isLiked: false,
  },
  {
    id: "3",
    username: "재활용왕",
    avatar: "♻️",
    timeAgo: "1일 전", 
    title: "동네 재활용센터에서 칭찬받았어요!",
    category: "tip",
    content: "우리 동네 재활용센터에서 분리배출 잘한다고 칭찬받았어요! 쓰담이들 화이팅! 계속 함께 해요. 지구를 지키는 작은 실천이 모여 큰 변화를 만들어요.",
    likes: 45,
    comments: 23,
    isLiked: true,
  },
  {
    id: "4",
    username: "초보쓰담이",
    avatar: "🔰",
    timeAgo: "3시간 전",
    title: "유리병 뚜껑 분리해야 하나요?",
    category: "question",
    content: "유리병을 버릴 때 뚜껑도 함께 분리해서 버려야 하는지 궁금해요. 금속 뚜껑과 플라스틱 뚜껑이 다른가요?",
    likes: 7,
    comments: 15,
    isLiked: false,
  },
  {
    id: "5",
    username: "분리배출달인",
    avatar: "🏆",
    timeAgo: "6시간 전",
    title: "음식물 쓰레기 줄이는 꿀팁!",
    category: "tip",
    content: "음식물 쓰레기를 줄이는 간단한 방법들을 공유해요. 장보기 전 냉장고 정리, 적정량 구매, 남은 음식 활용법까지!",
    hasPhoto: true,
    likes: 32,
    comments: 19,
    isLiked: true,
  },
];

export default function CommunityMainScreen() {
  const [fontsLoaded] = useFonts({ Jua_400Regular });
  const [posts, setPosts] = useState(SAMPLE_POSTS);
  const [activeCategory, setActiveCategory] = useState<'전체' | '질문' | '팁'>('전체');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  if (!fontsLoaded) return null;

  const filteredPosts = activeCategory === '전체' 
    ? posts 
    : posts.filter(post => 
        activeCategory === '질문' ? post.category === 'question' : post.category === 'tip'
      );

  const toggleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const toggleMenu = (postId: string) => {
    setActiveMenu(activeMenu === postId ? null : postId);
  };

  const reportPost = () => {
    alert('신고가 접수되었습니다.');
    setActiveMenu(null);
  };

  const hidePost = (postId: string) => {
    setPosts(posts.filter(post => post.id !== postId));
    setActiveMenu(null);
  };

  return (
    <TouchableWithoutFeedback onPress={() => setActiveMenu(null)}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.brand}>함께하는</Text>
        <Text style={styles.title}>쓰담이들 커뮤니티</Text>
        <Text style={styles.subtitle}>"분리배출 경험을 나누고 소통해요"</Text>
      </View>

      {/* 카테고리 탭 */}
      <View style={styles.categoryTabs}>
        <TouchableOpacity 
          style={[styles.tab, activeCategory === '전체' && styles.activeTab]}
          onPress={() => setActiveCategory('전체')}
        >
          <Text style={[styles.tabText, activeCategory === '전체' && styles.activeTabText]}>전체</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeCategory === '질문' && styles.activeTab]}
          onPress={() => setActiveCategory('질문')}
        >
          <Text style={[styles.tabText, activeCategory === '질문' && styles.activeTabText]}>질문</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeCategory === '팁' && styles.activeTab]}
          onPress={() => setActiveCategory('팁')}
        >
          <Text style={[styles.tabText, activeCategory === '팁' && styles.activeTabText]}>팁</Text>
        </TouchableOpacity>
      </View>

      {/* 게시글 목록 */}
      <View style={styles.postsContainer}>
        {filteredPosts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>아직 등록된 게시물이 없습니다</Text>
          </View>
        ) : (
          filteredPosts.map((post) => (
          <View key={post.id} style={styles.postCard}>
            {/* 사용자 정보 */}
            <View style={styles.postHeader}>
              <View style={styles.userInfo}>
                <Text style={styles.avatar}>{post.avatar}</Text>
                <View style={styles.userDetails}>
                  <Text style={styles.username}>{post.username}</Text>
                  <Text style={styles.timeAgo}>{post.timeAgo}</Text>
                </View>
              </View>
              <View style={styles.menuContainer}>
                <TouchableOpacity onPress={() => toggleMenu(post.id)}>
                  <Ionicons name="ellipsis-horizontal" size={20} color="#6B7280" />
                </TouchableOpacity>
                {activeMenu === post.id && (
                  <View style={styles.dropdownMenu}>
                    <TouchableOpacity style={[styles.menuItem, styles.dangerItem]} onPress={reportPost}>
                      <Text style={[styles.menuItemText, styles.dangerText]}>신고하기</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem} onPress={() => hidePost(post.id)}>
                      <Text style={styles.menuItemText}>게시글 숨기기</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>

            {/* 게시글 제목 */}
            <Text style={styles.postTitle}>{post.title}</Text>
            
            {/* 메타 정보 */}
            <View style={styles.postMeta}>
              <View style={[
                styles.categoryTag,
                post.category === "question" ? styles.categoryTagQuestion : styles.categoryTagTip
              ]}>
                <Text style={[
                  styles.categoryTagText,
                  post.category === "question" ? styles.categoryTagTextQuestion : styles.categoryTagTextTip
                ]}>
                  {post.category === "question" ? "질문" : "팁"}
                </Text>
              </View>
              
              {post.hasPhoto && (
                <View style={styles.photoIndicator}>
                  <Ionicons name="image-outline" size={14} color="#6B7280" />
                  <Text style={styles.photoIndicatorText}>사진 첨부</Text>
                </View>
              )}
            </View>

            {/* 게시글 내용 */}
            <Text style={styles.postContent} numberOfLines={2}>{post.content}</Text>

            {/* 액션 버튼들 */}
            <View style={styles.postActions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => toggleLike(post.id)}
              >
                <Ionicons 
                  name={post.isLiked ? "heart" : "heart-outline"} 
                  size={20} 
                  color={post.isLiked ? "#EF4444" : "#6B7280"} 
                />
                <Text style={[styles.actionText, post.isLiked && styles.likedText]}>
                  {post.likes}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="chatbubble-outline" size={20} color="#6B7280" />
                <Text style={styles.actionText}>{post.comments}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="share-outline" size={20} color="#6B7280" />
                <Text style={styles.actionText}>공유</Text>
              </TouchableOpacity>
            </View>
          </View>
          ))
        )}
      </View>

      {/* 플로팅 액션 버튼 */}
      <TouchableOpacity style={styles.floatingButton}>
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingBottom: 100,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  brand: {
    fontFamily: "Jua_400Regular",
    fontSize: 18,
    color: "#0F172A",
    letterSpacing: 0.3,
  },
  title: {
    fontFamily: "Jua_400Regular",
    fontSize: 28,
    color: "#1AA179",
    letterSpacing: 0.2,
    marginTop: 4,
  },
  subtitle: {
    fontFamily: "Jua_400Regular",
    fontSize: 14,
    color: "#6B7280",
    marginTop: 6,
  },

  categoryTabs: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#1AA179",
  },
  tabText: {
    fontFamily: "Jua_400Regular",
    fontSize: 14,
    color: "#6B7280",
  },
  activeTabText: {
    color: "#FFFFFF",
  },
  postsContainer: {
    gap: 16,
  },
  postCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    fontSize: 32,
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontFamily: "Jua_400Regular",
    fontSize: 16,
    color: "#111827",
    marginBottom: 2,
  },
  timeAgo: {
    fontSize: 12,
    color: "#6B7280",
  },
  postTitle: {
    fontFamily: "Jua_400Regular",
    fontSize: 16,
    color: "#111827",
    fontWeight: "600",
    marginBottom: 8,
    lineHeight: 20,
  },
  postMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  categoryTag: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryTagQuestion: {
    backgroundColor: "#EBF4FF",
  },
  categoryTagTip: {
    backgroundColor: "#F0FDF4",
  },
  categoryTagText: {
    fontSize: 12,
    fontFamily: "Jua_400Regular",
  },
  categoryTagTextQuestion: {
    color: "#3B82F6",
  },
  categoryTagTextTip: {
    color: "#16A34A",
  },
  photoIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  photoIndicatorText: {
    fontSize: 12,
    color: "#6B7280",
    fontFamily: "Jua_400Regular",
  },
  postContent: {
    fontFamily: "Jua_400Regular",
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 16,
  },

  postActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    paddingTop: 12,
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
  floatingButton: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#1AA179",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 8,
  },
  menuContainer: {
    position: "relative",
  },
  dropdownMenu: {
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
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  menuItemText: {
    fontSize: 14,
    color: "#374151",
    fontFamily: "Jua_400Regular",
  },
  dangerItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  dangerText: {
    color: "#EF4444",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#9CA3AF",
    fontFamily: "Jua_400Regular",
  },
});