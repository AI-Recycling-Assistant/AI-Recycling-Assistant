// app/community/community-main.tsx
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFonts, Jua_400Regular } from "@expo-google-fonts/jua";
import { useEffect, useMemo, useState } from "react";
import { router } from "expo-router";
import { useAuth } from "@store/auth";  // ✅ 로그인 정보 사용

// ===== 타입 =====
type CommunityPost = {
  id: string;
  authorId?: number | null;       // ✅ 글쓴이 userId
  username?: string;              // 닉네임
  avatar?: string;
  timeAgo?: string;
  title: string;
  category: "TIP" | "QUESTION";
  content: string;
  hasPhoto?: boolean;
  likes?: number;
  comments?: number;
  liked?: boolean;
  mine?: boolean;
};

type CategoryTab = "전체" | "질문" | "팁";

type SpringPage<T> = {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
};

// ===== API 기본 설정 =====
const BASE_URL =
  Platform.OS === "android" ? "http://10.0.2.2:8080" : "http://localhost:8080";
const API = `${BASE_URL}/api/community`;

// 탭 → 서버 카테고리 매핑
function mapTabToServerCategory(cat: CategoryTab): "QUESTION" | "TIP" | "" {
  if (cat === "질문") return "QUESTION";
  if (cat === "팁") return "TIP";
  return "";
}

export default function CommunityMainScreen() {
  const [fontsLoaded] = useFonts({ Jua_400Regular });
  const { userId } = useAuth();               // ✅ 현재 로그인한 유저
  const currentUserId = userId ?? null;

  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [activeCategory, setActiveCategory] = useState<CategoryTab>("전체");

  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [hasMore, setHasMore] = useState(true);

  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const serverCategory = useMemo(
    () => mapTabToServerCategory(activeCategory),
    [activeCategory]
  );

  useEffect(() => {
    loadPosts(true).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverCategory, currentUserId]);

  if (!fontsLoaded) return null;

  // ===== 목록 호출 (Spring Page) =====
  async function loadPosts(reset = false) {
    try {
      setLoading(true);
      setErrorText(null);

      const nextPage = reset ? 0 : page + 1;
      const params = new URLSearchParams();
      params.append("page", String(nextPage));
      params.append("size", String(size));
      if (serverCategory) params.append("category", serverCategory);
      if (currentUserId != null) {
        params.append("userId", String(currentUserId));  // ✅ 로그인 유저 전달
      }

      const res = await fetch(`${API}/posts?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`목록 조회 실패: ${res.status}`);
      }

      const raw = await res.json();
      const data = raw as Partial<SpringPage<any>>;
      const contentArray = Array.isArray(data.content) ? data.content : [];

      const mapped: CommunityPost[] = contentArray.map((p: any) => ({
        id: String(p.id),
        title: p.title ?? "",
        content: p.content ?? "",
        category: p.category as "TIP" | "QUESTION",
        comments: p.commentCount ?? 0,
        likes: p.likeCount ?? 0,
        liked: !!p.liked,                         // ✅ 서버에서 온 liked 사용
        username: p.writer ?? "익명",
        avatar: "🙂",
        timeAgo: p.timeAgo ?? "",
        hasPhoto: !!p.hasPhoto,
        authorId:
          typeof p.authorId === "number" ? p.authorId : null, // ✅ 글쓴이 id
        mine: !!p.mine,
      }));

      if (reset) {
        setPosts(mapped);
        setPage(data.number ?? 0);
      } else {
        setPosts((prev) => [...prev, ...mapped]);
        setPage(data.number ?? nextPage);
      }

      if (typeof data.last === "boolean") {
        setHasMore(!data.last);
      } else if (
        typeof data.totalPages === "number" &&
        typeof data.number === "number"
      ) {
        setHasMore(data.number + 1 < data.totalPages);
      } else {
        setHasMore(mapped.length === size);
      }
    } catch (e: any) {
      setErrorText(e?.message ?? "목록을 불러오는 동안 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  // ===== 좋아요 =====
  async function toggleLike(postId: string) {
    if (!currentUserId) {
      Alert.alert("안내", "로그인 후 이용해주세요.");
      return;
    }

    // 낙관적 업데이트
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              liked: !p.liked,
              likes: (p.likes ?? 0) + (p.liked ? -1 : 1),
            }
          : p
      )
    );

    try {
      const res = await fetch(
        `${API}/posts/${postId}/like?userId=${currentUserId}`,
        { method: "POST" }
      );
      if (!res.ok) {
        throw new Error(`좋아요 실패: ${res.status}`);
      }
    } catch (e) {
      // 롤백
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                liked: !p.liked,
                likes: (p.likes ?? 0) + (p.liked ? -1 : 1),
              }
            : p
        )
      );
      Alert.alert("오류", "좋아요 처리에 실패했습니다.");
    }
  }

  // ===== 게시글 삭제 (내 글일 때만) =====
  // ===== 게시글 삭제 (내 글일 때만) =====
  async function handleDelete(postId: string) {
    if (!currentUserId) {
      Alert.alert("안내", "로그인 후 이용해주세요.");
      return;
    }

    try {
      const res = await fetch(
        `${API}/posts/${postId}?userId=${currentUserId}`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        throw new Error(`삭제 실패: ${res.status}`);
      }

      // 1) 화면 목록에서 해당 게시글 제거
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      setActiveMenu(null);

      // 2) 삭제 완료 안내 + 확인 누르면 community-main으로 이동
      Alert.alert("알림", "게시글이 삭제되었습니다.", [
        {
          text: "확인",
          onPress: () => {
            router.replace("/community/community-main");
          },
        },
      ]);
    } catch (e: any) {
      Alert.alert(
        "오류",
        e?.message ?? "게시글 삭제 중 오류가 발생했습니다."
      );
    }
  }


  const toggleMenu = (postId: string) =>
    setActiveMenu(activeMenu === postId ? null : postId);

  const onChangeTab = (tab: CategoryTab) => {
    setActiveCategory(tab);
    setHasMore(true);
  };

  const goBack = () => {
    router.back();
  };

  // ✅ 현재 로그인 유저의 글인지 체크
  const isMyPost = (post: CommunityPost) =>
    currentUserId != null &&
    post.authorId != null &&
    post.authorId === currentUserId;

  return (
    <View style={styles.screen}>
      {/* 🔥 TouchableWithoutFeedback 제거하고 그냥 ScrollView만 사용 */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTouches="handled"
      >
        {/* 상단 내비 헤더 */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backButton} onPress={goBack}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>커뮤니티</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* 헤더 카드 */}
        <View style={styles.header}>
          <Text style={styles.brand}>함께하는</Text>
          <Text style={styles.title}>쓰담이들 커뮤니티</Text>
          <Text style={styles.subtitle}>
            "분리배출 경험을 나누고 소통해요"
          </Text>
        </View>

        {/* 카테고리 탭 */}
        <View style={styles.categoryTabs}>
          <TouchableOpacity
            style={[styles.tab, activeCategory === "전체" && styles.activeTab]}
            onPress={() => onChangeTab("전체")}
          >
            <Text
              style={[
                styles.tabText,
                activeCategory === "전체" && styles.activeTabText,
              ]}
            >
              전체
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeCategory === "질문" && styles.activeTab]}
            onPress={() => onChangeTab("질문")}
          >
            <Text
              style={[
                styles.tabText,
                activeCategory === "질문" && styles.activeTabText,
              ]}
            >
              질문
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeCategory === "팁" && styles.activeTab]}
            onPress={() => onChangeTab("팁")}
          >
            <Text
              style={[
                styles.tabText,
                activeCategory === "팁" && styles.activeTabText,
              ]}
            >
              팁
            </Text>
          </TouchableOpacity>
        </View>

        {/* 오류 메시지 */}
        {errorText && (
          <View style={{ paddingVertical: 8 }}>
            <Text style={{ color: "#EF4444", fontFamily: "Jua_400Regular" }}>
              {errorText}
            </Text>
          </View>
        )}

        {/* 게시글 목록 */}
        <View style={styles.postsContainer}>
          {loading && posts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator />
            </View>
          ) : posts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                아직 등록된 게시물이 없습니다
              </Text>
            </View>
          ) : (
            posts.map((post) => (
              <View key={post.id} style={styles.postCard}>
                {/* 사용자 정보 */}
                <View style={styles.postHeader}>
                  <View style={styles.userInfo}>
                    <Text style={styles.avatar}>{post.avatar ?? "🙂"}</Text>
                    <View style={styles.userDetails}>
                      <Text style={styles.username}>
                        {post.username ?? "익명"}
                      </Text>
                      <Text style={styles.timeAgo}>
                        {post.timeAgo ?? ""}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.menuContainer}>
                    <TouchableOpacity onPress={() => toggleMenu(post.id)}>
                      <Ionicons
                        name="ellipsis-horizontal"
                        size={20}
                        color="#6B7280"
                      />
                    </TouchableOpacity>
                    {activeMenu === post.id && (
                      <View style={styles.dropdownMenu}>
                        {isMyPost(post) ? (
                          // ✅ 내 글 → 게시글 삭제하기
                          <TouchableOpacity
                            style={[styles.menuItem, styles.dangerItem]}
                            onPress={() => handleDelete(post.id)}
                          >
                            <Text
                              style={[
                                styles.menuItemText,
                                styles.dangerText,
                              ]}
                            >
                              게시글 삭제하기
                            </Text>
                          </TouchableOpacity>
                        ) : (
                          // ✅ 남의 글 → 신고하기 (report 화면으로 이동)
                          <TouchableOpacity
                            style={[styles.menuItem, styles.dangerItem]}
                            onPress={() => {
                              setActiveMenu(null);
                              router.push({
                                pathname: "/community/community-report",
                                params: { postId: post.id },
                              });
                            }}
                          >
                            <Text
                              style={[
                                styles.menuItemText,
                                styles.dangerText,
                              ]}
                            >
                              신고하기
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </View>
                </View>

                {/* 제목 → 상세 페이지 이동 */}
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: "/community/community-feed",
                      params: { postId: post.id },
                    })
                  }
                >
                  <Text style={styles.postTitle}>{post.title}</Text>
                </TouchableOpacity>

                {/* 메타 (카테고리 / 사진 여부) */}
                <View style={styles.postMeta}>
                  <View
                    style={[
                      styles.categoryTag,
                      post.category === "QUESTION"
                        ? styles.categoryTagQuestion
                        : styles.categoryTagTip,
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryTagText,
                        post.category === "QUESTION"
                          ? styles.categoryTagTextQuestion
                          : styles.categoryTagTextTip,
                      ]}
                    >
                      {post.category === "QUESTION" ? "질문" : "팁"}
                    </Text>
                  </View>

                  {post.hasPhoto && (
                    <View style={styles.photoIndicator}>
                      <Ionicons
                        name="image-outline"
                        size={14}
                        color="#6B7280"
                      />
                      <Text style={styles.photoIndicatorText}>사진 첨부</Text>
                    </View>
                  )}
                </View>

                {/* 액션 */}
                <View style={styles.postActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => toggleLike(post.id)}
                  >
                    <Ionicons
                      name={post.liked ? "heart" : "heart-outline"}
                      size={20}
                      color={post.liked ? "#EF4444" : "#6B7280"}
                    />
                    <Text
                      style={[
                        styles.actionText,
                        post.liked && styles.likedText,
                      ]}
                    >
                      {post.likes ?? 0}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() =>
                      router.push({
                        pathname: "/community/community-feed",
                        params: { postId: post.id },
                      })
                    }
                  >
                    <Ionicons
                      name="chatbubble-outline"
                      size={20}
                      color="#6B7280"
                    />
                    <Text style={styles.actionText}>
                      {post.comments ?? 0}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* 더 보기 */}
        {hasMore && (
          <View style={{ alignItems: "center", paddingVertical: 16 }}>
            {loading ? (
              <ActivityIndicator />
            ) : (
              <TouchableOpacity
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  backgroundColor: "#1AA179",
                  borderRadius: 8,
                }}
                onPress={() => loadPosts(false)}
              >
                <Text
                  style={{ color: "#fff", fontFamily: "Jua_400Regular" }}
                >
                  더 보기
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {/* 플로팅 버튼 (우측 하단 고정) */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => router.push("/community/community-upload")}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

// 스타일은 그대로
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F9FAFB" },
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingVertical: 24, paddingBottom: 100 },
  // ... 나머지 스타일은 기존 그대로 ...
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    paddingVertical: 12,
    marginBottom: 8,
  },
  backButton: { padding: 4 },
  topBarTitle: {
    fontFamily: "Jua_400Regular",
    fontSize: 18,
    color: "#111827",
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
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: 8 },
  activeTab: { backgroundColor: "#1AA179" },
  tabText: { fontFamily: "Jua_400Regular", fontSize: 14, color: "#6B7280" },
  activeTabText: { color: "#FFFFFF" },
  postsContainer: { gap: 16 },
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
  userInfo: { flexDirection: "row", alignItems: "center" },
  avatar: { fontSize: 32, marginRight: 12 },
  userDetails: { flex: 1 },
  username: {
    fontFamily: "Jua_400Regular",
    fontSize: 16,
    color: "#111827",
    marginBottom: 2,
  },
  timeAgo: { fontSize: 12, color: "#6B7280" },
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
  categoryTagQuestion: { backgroundColor: "#EBF4FF" },
  categoryTagTip: { backgroundColor: "#F0FDF4" },
  categoryTagText: { fontSize: 12, fontFamily: "Jua_400Regular" },
  categoryTagTextQuestion: { color: "#3B82F6" },
  categoryTagTextTip: { color: "#16A34A" },
  photoIndicator: { flexDirection: "row", alignItems: "center", gap: 4 },
  photoIndicatorText: {
    fontSize: 12,
    color: "#6B7280",
    fontFamily: "Jua_400Regular",
  },
  postActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  actionButton: { flexDirection: "row", alignItems: "center", gap: 6 },
  actionText: {
    fontSize: 14,
    color: "#6B7280",
    fontFamily: "Jua_400Regular",
  },
  likedText: { color: "#EF4444" },
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
  menuContainer: { position: "relative" },
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
  dangerItem: { borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  dangerText: { color: "#EF4444" },
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
