// CommunityFeedScreen.tsx
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFonts, Jua_400Regular } from "@expo-google-fonts/jua";

// ========= 환경설정 =========
// Android 에뮬레이터에서 PC localhost 접근: 10.0.2.2
const BASE_URL = "http://10.0.2.2:8080";
const API = `${BASE_URL}/api/community`;

// 인증 붙기 전까지 임시 userId
const USER_ID = 1;

// ========= 타입 =========
type Comment = {
  id: string;
  username?: string;
  avatar?: string;
  timeAgo?: string;
  content: string;
  likes?: number;
  isLiked?: boolean;
  parentId?: string | null;
};

type PostDetail = {
  id: string;
  username?: string;
  avatar?: string;
  timeAgo?: string;
  title: string;
  // 백엔드: PostCategory = TIP | QUESTION
  category: "TIP" | "QUESTION";
  content: string;
  hasPhoto?: boolean;
  likes?: number;
  liked?: boolean;
  comments?: number; // 총 댓글 수(백엔드가 내려주면 사용)
};

export default function CommunityFeedScreen({ route, navigation }: any) {
  const [fontsLoaded] = useFonts({ Jua_400Regular });
  if (!fontsLoaded) return null;

  // ---- 라우트에서 postId 받기(필수) ----
  const postId: string = useMemo(() => String(route?.params?.postId ?? "1"), [route?.params?.postId]);

  // ---- 게시글/댓글 상태 ----
  const [post, setPost] = useState<PostDetail | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(0);

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [activeReply, setActiveReply] = useState<string | null>(null);

  // ---- UI/로딩 ----
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const [loadingPost, setLoadingPost] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPost();
    loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  // ========= API: 게시글 상세 =========
  async function loadPost() {
    try {
      setLoadingPost(true);
      const res = await fetch(`${API}/posts/${postId}?userId=${USER_ID}`);
      if (!res.ok) throw new Error(`GET /posts/${postId} 실패: ${res.status}`);
      const data = await res.json();

      const mapped: PostDetail = {
        id: String(data.id),
        title: data.title,
        content: data.content,
        category: data.category, // "TIP" | "QUESTION"
        hasPhoto: !!data.hasPhoto,
        username: data.username ?? "익명",
        avatar: data.avatar ?? "🙂",
        timeAgo: data.timeAgo ?? "",
        likes: data.likes ?? 0,
        liked: !!data.liked,
        comments: data.comments ?? undefined,
      };

      setPost(mapped);
      setLikes(mapped.likes ?? 0);
      setIsLiked(!!mapped.liked);
    } catch (e: any) {
      Alert.alert("오류", e?.message ?? "게시글을 불러오지 못했습니다.");
    } finally {
      setLoadingPost(false);
    }
  }

  // ========= API: 댓글 목록 (페이징 없음, List 반환) =========
  async function loadComments() {
    try {
      setLoadingComments(true);
      const res = await fetch(`${API}/posts/${postId}/comments`);
      if (!res.ok) throw new Error(`GET /posts/${postId}/comments 실패: ${res.status}`);
      const list = await res.json();

      const items: Comment[] = (list ?? []).map((c: any) => ({
        id: String(c.id),
        content: c.content,
        username: c.username ?? "익명",
        avatar: c.avatar ?? "🙂",
        timeAgo: c.timeAgo ?? "",
        likes: c.likes ?? 0,
        isLiked: !!c.liked,
        parentId: c.parentId ? String(c.parentId) : null,
      }));

      setComments(items);
    } catch (e: any) {
      Alert.alert("오류", e?.message ?? "댓글을 불러오지 못했습니다.");
    } finally {
      setLoadingComments(false);
    }
  }

  // ========= API: 댓글 등록(대댓글 포함) =========
  async function sendCommentBase(parentId?: string | null) {
    const text = parentId ? replyText : commentText;
    if (!text.trim()) return;

    try {
      setSubmitting(true);
      const body: any = { content: text.trim() };
      if (parentId) body.parentId = parentId;

      const res = await fetch(`${API}/posts/${postId}/comments?userId=${USER_ID}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`POST /posts/${postId}/comments 실패: ${res.status}`);
      const createdId = await res.json(); // 컨트롤러가 Long 반환

      const newComment: Comment = {
        id: String(createdId),
        content: text.trim(),
        username: "나",
        avatar: "🙂",
        timeAgo: "방금 전",
        likes: 0,
        isLiked: false,
        parentId: parentId ?? null,
      };

      // 단순히 최상단 추가(트리 렌더링이 필요하면 parentId 기준으로 들여쓰기/정렬 로직을 확장)
      setComments(prev => [newComment, ...prev]);
      if (parentId) {
        setReplyText("");
        setActiveReply(null);
      } else {
        setCommentText("");
      }

      // 총 댓글 수를 UI에 반영하고 싶다면 상세 갱신
      setPost(prev => (prev ? { ...prev, comments: (prev.comments ?? prev ? prev.comments : 0) as number + 1 } : prev));
    } catch (e: any) {
      Alert.alert("오류", e?.message ?? "댓글 등록에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  }
  const sendComment = () => sendCommentBase(null);
  const sendReply = (commentId: string) => sendCommentBase(commentId);

  // ========= API: 게시글 좋아요 =========
  async function toggleLike() {
    // 낙관적 업데이트
    setIsLiked(prev => !prev);
    setLikes(prev => prev + (isLiked ? -1 : 1));

    try {
      const res = await fetch(`${API}/posts/${postId}/like?userId=${USER_ID}`, { method: "POST" });
      if (!res.ok) throw new Error(`POST /posts/${postId}/like 실패: ${res.status}`);
    } catch (e) {
      // 실패 시 롤백
      setIsLiked(prev => !prev);
      setLikes(prev => prev + (isLiked ? 1 : -1));
    }
  }

  // ========= API: 댓글 좋아요 =========
  async function toggleCommentLike(commentId: string) {
    // 낙관적 업데이트
    setComments(prev =>
      prev.map(c =>
        c.id === commentId ? { ...c, isLiked: !c.isLiked, likes: (c.likes ?? 0) + (c.isLiked ? -1 : 1) } : c
      )
    );
    try {
      const res = await fetch(`${API}/comments/${commentId}/like?userId=${USER_ID}`, { method: "POST" });
      if (!res.ok) throw new Error(`POST /comments/${commentId}/like 실패: ${res.status}`);
    } catch (e) {
      // 롤백
      setComments(prev =>
        prev.map(c =>
          c.id === commentId ? { ...c, isLiked: !c.isLiked, likes: (c.likes ?? 0) + (c.isLiked ? -1 : 1) } : c
        )
      );
    }
  }

  // ========= API: 신고 =========
  async function reportPostHandler() {
    try {
      setShowHeaderMenu(false);
      const res = await fetch(`${API}/posts/${postId}/report?userId=${USER_ID}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "부적절한 내용" }), // 필요 시 UI로 사유 선택 구현
      });
      if (!res.ok) throw new Error(`POST /posts/${postId}/report 실패: ${res.status}`);
      Alert.alert("신고 완료", "신고가 접수되었습니다.");
    } catch (e: any) {
      Alert.alert("오류", e?.message ?? "신고 중 오류가 발생했습니다.");
    }
  }

  const toggleReply = (commentId: string) => {
    setActiveReply(activeReply === commentId ? null : commentId);
    setReplyText("");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack?.()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>게시글</Text>
        <View style={styles.headerMenuContainer}>
          <TouchableOpacity onPress={() => setShowHeaderMenu(!showHeaderMenu)}>
            <Ionicons name="ellipsis-horizontal" size={24} color="#6B7280" />
          </TouchableOpacity>
          {showHeaderMenu && (
            <View style={styles.headerDropdownMenu}>
              <TouchableOpacity style={styles.headerMenuItem} onPress={reportPostHandler}>
                <Text style={styles.headerMenuText}>신고하기</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* 게시글 내용 */}
      <View style={styles.postContainer}>
        {loadingPost && (
          <View style={{ paddingVertical: 20, alignItems: "center" }}>
            <ActivityIndicator />
          </View>
        )}

        {!!post && !loadingPost && (
          <>
            {/* 사용자 정보 */}
            <View style={styles.userInfo}>
              <Text style={styles.avatar}>{post.avatar ?? "🙂"}</Text>
              <View style={styles.userDetails}>
                <Text style={styles.username}>{post.username ?? "익명"}</Text>
                <Text style={styles.timeAgo}>{post.timeAgo ?? ""}</Text>
              </View>
            </View>

            {/* 제목 */}
            <Text style={styles.postTitle}>{post.title}</Text>

            {/* 카테고리 */}
            <View style={styles.categoryTag}>
              <Text style={styles.categoryText}>{post.category === "QUESTION" ? "질문" : "팁"}</Text>
            </View>

            {/* 본문 */}
            <Text style={styles.postContent}>{post.content}</Text>

            {/* (선택) 첨부 이미지 표시 */}
            {post.hasPhoto && (
              <View style={styles.imageContainer}>
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="image-outline" size={48} color="#9CA3AF" />
                  <Text style={styles.imageText}>첨부된 사진</Text>
                </View>
              </View>
            )}

            {/* 액션 버튼들 */}
            <View style={styles.postActions}>
              <TouchableOpacity style={styles.actionButton} onPress={toggleLike}>
                <Ionicons name={isLiked ? "heart" : "heart-outline"} size={20} color={isLiked ? "#EF4444" : "#6B7280"} />
                <Text style={[styles.actionText, isLiked && styles.likedText]}>{likes}</Text>
              </TouchableOpacity>

              <View style={styles.actionButton}>
                <Ionicons name="chatbubble-outline" size={20} color="#6B7280" />
                <Text style={styles.actionText}>{post.comments ?? comments.length}</Text>
              </View>

              <View style={styles.actionButton}>
                <Ionicons name="share-outline" size={20} color="#6B7280" />
                <Text style={styles.actionText}>공유</Text>
              </View>
            </View>
          </>
        )}
      </View>

      {/* 댓글 섹션 */}
      <View style={styles.commentsSection}>
        <Text style={styles.commentsTitle}>댓글 {post?.comments ?? comments.length}개</Text>

        {loadingComments && (
          <View style={{ paddingVertical: 12, alignItems: "center" }}>
            <ActivityIndicator />
          </View>
        )}

        {comments.map((comment) => (
          <View key={comment.id} style={styles.commentCard}>
            <View style={styles.commentHeader}>
              <View style={styles.commentUserInfo}>
                <Text style={styles.commentAvatar}>{comment.avatar ?? "🙂"}</Text>
                <View>
                  <Text style={styles.commentUsername}>{comment.username ?? "익명"}</Text>
                  <Text style={styles.commentTime}>{comment.timeAgo ?? ""}</Text>
                </View>
              </View>
            </View>

            <Text style={styles.commentContent}>{comment.content}</Text>

            <View style={styles.commentActions}>
              <TouchableOpacity style={styles.commentActionButton} onPress={() => toggleCommentLike(comment.id)}>
                <Ionicons
                  name={comment.isLiked ? "heart" : "heart-outline"}
                  size={16}
                  color={comment.isLiked ? "#EF4444" : "#6B7280"}
                />
                <Text style={[styles.commentActionText, comment.isLiked && styles.likedText]}>
                  {comment.likes ?? 0}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.commentActionButton} onPress={() => toggleReply(comment.id)}>
                <Text style={styles.replyText}>답글</Text>
              </TouchableOpacity>
            </View>

            {activeReply === comment.id && (
              <View style={styles.replyInput}>
                <View style={styles.replyInputContainer}>
                  <TouchableOpacity style={styles.replyCancel} onPress={() => setActiveReply(null)}>
                    <Text style={styles.replyCancelText}>취소</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={styles.replyInputField}
                    placeholder="답글을 입력하세요..."
                    value={replyText}
                    onChangeText={setReplyText}
                    onSubmitEditing={() => sendReply(comment.id)}
                    editable={!submitting}
                  />
                  <TouchableOpacity style={styles.replySendButton} onPress={() => sendReply(comment.id)} disabled={submitting}>
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
            editable={!submitting}
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendComment} disabled={submitting}>
            <Ionicons name="send" size={20} color="#1AA179" />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

// ========= 스타일 (원본 레이아웃 유지) =========
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  content: { paddingBottom: 100 },
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
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontFamily: "Jua_400Regular", color: "#111827" },
  postContainer: { backgroundColor: "#FFFFFF", padding: 20, marginBottom: 8 },
  userInfo: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  avatar: { fontSize: 40, marginRight: 12 },
  userDetails: { flex: 1 },
  username: { fontSize: 18, fontFamily: "Jua_400Regular", color: "#111827", marginBottom: 2 },
  timeAgo: { fontSize: 14, color: "#6B7280" },
  postTitle: { fontSize: 20, fontFamily: "Jua_400Regular", color: "#111827", marginBottom: 12, lineHeight: 28 },
  categoryTag: {
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  categoryText: { fontSize: 14, fontFamily: "Jua_400Regular", color: "#16A34A" },
  postContent: { fontSize: 16, fontFamily: "Jua_400Regular", color: "#374151", lineHeight: 24, marginBottom: 20 },
  imageContainer: { marginBottom: 20 },
  imagePlaceholder: { height: 200, backgroundColor: "#F3F4F6", borderRadius: 12, alignItems: "center", justifyContent: "center" },
  imageText: { fontSize: 14, color: "#9CA3AF", marginTop: 8, fontFamily: "Jua_400Regular" },
  postActions: { flexDirection: "row", alignItems: "center", gap: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: "#F3F4F6" },
  actionButton: { flexDirection: "row", alignItems: "center", gap: 6 },
  actionText: { fontSize: 14, color: "#6B7280", fontFamily: "Jua_400Regular" },
  likedText: { color: "#EF4444" },
  commentsSection: { backgroundColor: "#FFFFFF", padding: 20 },
  commentsTitle: { fontSize: 18, fontFamily: "Jua_400Regular", color: "#111827", marginBottom: 16 },
  commentCard: { marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  commentHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  commentUserInfo: { flexDirection: "row", alignItems: "center" },
  commentAvatar: { fontSize: 28, marginRight: 10 },
  commentUsername: { fontSize: 14, fontFamily: "Jua_400Regular", color: "#111827", marginBottom: 2 },
  commentTime: { fontSize: 12, color: "#6B7280" },
  commentContent: { fontSize: 14, fontFamily: "Jua_400Regular", color: "#374151", lineHeight: 20, marginBottom: 12 },
  commentActions: { flexDirection: "row", alignItems: "center", gap: 16 },
  commentActionButton: { flexDirection: "row", alignItems: "center", gap: 4 },
  commentActionText: { fontSize: 12, color: "#6B7280", fontFamily: "Jua_400Regular" },
  replyText: { fontSize: 12, color: "#6B7280", fontFamily: "Jua_400Regular" },
  commentInput: { backgroundColor: "#FFFFFF", padding: 20, borderTopWidth: 1, borderTopColor: "#F3F4F6" },
  inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#F9FAFB", borderRadius: 24, paddingHorizontal: 16, paddingVertical: 12 },
  sendButton: { padding: 4 },
  commentInputField: { flex: 1, fontSize: 14, color: "#374151", fontFamily: "Jua_400Regular" },
  replyInput: { marginTop: 12, paddingLeft: 38 },
  replyInputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#F3F4F6", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 },
  replyInputField: { flex: 1, fontSize: 12, color: "#374151", fontFamily: "Jua_400Regular" },
  replyCancel: { marginRight: 8 },
  replyCancelText: { fontSize: 10, color: "#6B7280", fontFamily: "Jua_400Regular" },
  replySendButton: { padding: 2 },
  headerMenuContainer: { position: "relative" },
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
  headerMenuItem: { paddingVertical: 12, paddingHorizontal: 16 },
  headerMenuText: { fontSize: 14, color: "#EF4444", fontFamily: "Jua_400Regular" },
});
