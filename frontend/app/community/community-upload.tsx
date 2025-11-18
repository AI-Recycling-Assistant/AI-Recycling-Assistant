// app/community/community-upload.tsx
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFonts, Jua_400Regular } from "@expo-google-fonts/jua";
import { useState } from "react";
import { router } from "expo-router";
import { useAuth } from "@store/auth"; // ✅ 로그인 정보 사용

// ===== API 기본 설정 =====
const BASE_URL =
  Platform.OS === "android" ? "http://10.0.2.2:8080" : "http://localhost:8080";
const API = `${BASE_URL}/api/community`;

type ServerCategory = "QUESTION" | "TIP";

function mapUiToServerCategory(ui: string): ServerCategory | null {
  if (ui === "질문") return "QUESTION";
  if (ui === "팁") return "TIP";
  return null;
}

export default function CommunityUploadScreen() {
  const [fontsLoaded] = useFonts({ Jua_400Regular });

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryPressed, setCategoryPressed] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hasPhoto, setHasPhoto] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdPostId, setCreatedPostId] = useState<string | null>(null);

  const categories = ["질문", "팁"];

  // ✅ 전역 auth 에서 현재 로그인 유저 정보 가져오기
  const { userId, isLoggedIn } = useAuth();

  if (!fontsLoaded) return null;

  const validate = () => {
    if (!selectedCategory) {
      Alert.alert("안내", "카테고리를 선택해주세요.");
      return false;
    }
    if (!title.trim()) {
      Alert.alert("안내", "제목을 입력해주세요.");
      return false;
    }
    if (!content.trim()) {
      Alert.alert("안내", "내용을 입력해주세요.");
      return false;
    }
    return true;
  };

  // ===== 게시글 등록 =====
  const handlePublish = async () => {
    // ✅ 로그인 여부 체크
    if (!isLoggedIn || !userId) {
      Alert.alert("로그인이 필요합니다", "게시물을 작성하려면 먼저 로그인해주세요.");
      return;
    }

    if (!validate()) return;

    const serverCategory = mapUiToServerCategory(selectedCategory);
    if (!serverCategory) {
      Alert.alert("오류", "지원하지 않는 카테고리입니다.");
      return;
    }

    try {
      setSubmitting(true);

      const body = {
        title: title.trim(),
        content: content.trim(),
        category: serverCategory,
        hasPhoto,
      };

      // ✅ 하드코딩 대신 실제 로그인한 유저의 userId 사용
      const res = await fetch(`${API}/posts?userId=${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error(`게시물 등록 실패: ${res.status}`);

      const postId = await res.json(); // Long 반환
      setCreatedPostId(String(postId));
      setShowSuccess(true);
    } catch (e: any) {
      Alert.alert("오류", e?.message ?? "게시물 등록 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <View style={styles.successContainer}>
        <Text style={styles.successMessage}>게시물 등록 완료!</Text>
        <TouchableOpacity
          style={styles.successButton}
          onPress={() => {
            if (createdPostId) {
              router.replace({
                pathname: "/community/community-feed",
                params: { postId: createdPostId },
              });
            } else {
              router.back();
            }
          }}
        >
          <Text style={styles.successButtonText}>확인하러 가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={true}
      keyboardShouldPersistTaps="handled"
    >
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          disabled={submitting}
        >
          <Ionicons name="chevron-back" size={32} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>새 글 작성</Text>
        <TouchableOpacity
          style={styles.publishButton}
          onPress={handlePublish}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator />
          ) : (
            <Text style={styles.publishButtonText}>등록</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* 메인 콘텐츠 */}
      <View style={styles.mainContent}>
        {/* 카테고리 선택 */}
        <View style={styles.categoryContainer}>
          <Text style={styles.categoryTitle}>카테고리</Text>
          <TouchableOpacity
            style={[
              styles.categorySelector,
              categoryPressed && styles.categorySelectorPressed,
            ]}
            onPressIn={() => setCategoryPressed(true)}
            onPressOut={() => setCategoryPressed(false)}
            onPress={() => setIsDropdownOpen(true)}
            disabled={submitting}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory && styles.categoryTextSelected,
              ]}
            >
              {selectedCategory || "카테고리를 선택해주세요"}
            </Text>
            <Text
              style={[
                styles.dropdownArrow,
                categoryPressed && styles.dropdownArrowPressed,
              ]}
            >
              ▼
            </Text>
          </TouchableOpacity>
        </View>

        {/* 제목 입력 */}
        <View style={styles.titleContainer}>
          <Text style={styles.titleLabel}>제목</Text>
          <TextInput
            style={styles.titleInput}
            placeholder="제목을 입력해주세요"
            placeholderTextColor="#9CA3AF"
            value={title}
            onChangeText={setTitle}
            editable={!submitting}
          />
        </View>

        {/* 내용 입력 */}
        <View style={styles.contentContainer}>
          <Text style={styles.contentLabel}>내용</Text>
          <TextInput
            style={styles.contentInput}
            placeholder="내용을 입력해주세요"
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={8}
            textAlignVertical="top"
            value={content}
            onChangeText={setContent}
            editable={!submitting}
          />
        </View>

        {/* 사진 첨부 (플래그 전송) */}
        <View style={styles.photoContainer}>
          <Text style={styles.photoLabel}>사진 첨부</Text>
          <TouchableOpacity
            style={styles.photoButton}
            onPress={() => setHasPhoto(!hasPhoto)}
            disabled={submitting}
          >
            <Ionicons name="camera-outline" size={24} color="#6B7280" />
            <Text style={styles.photoButtonText}>
              {hasPhoto ? "사진이 첨부되었습니다" : "사진 추가하기"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 하단 버튼 */}
        <View style={styles.bottomButtons}>
          <TouchableOpacity
            style={styles.backButtonBottom}
            onPress={() => router.back()}
            disabled={submitting}
          >
            <Text style={styles.backButtonText}>돌아가기</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handlePublish}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator />
            ) : (
              <Text style={styles.submitButtonText}>게시물 등록</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* 드롭다운 모달 */}
      <Modal
        visible={isDropdownOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsDropdownOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsDropdownOpen(false)}
        >
          <View style={styles.dropdownModal}>
            {categories.map((category, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dropdownItem,
                  index < categories.length - 1 && styles.dropdownItemBorder,
                ]}
                onPress={() => {
                  setSelectedCategory(category);
                  setIsDropdownOpen(false);
                }}
                disabled={submitting}
              >
                <Text style={styles.dropdownItemText}>{category}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  content: { paddingBottom: 40 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: { padding: 4 },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Jua_400Regular",
    color: "#111827",
  },
  publishButton: {
    backgroundColor: "#1AA179",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  publishButtonText: {
    fontSize: 14,
    fontFamily: "Jua_400Regular",
    color: "#FFFFFF",
  },

  mainContent: { paddingHorizontal: 20, paddingTop: 24 },
  categoryContainer: { marginBottom: 24 },
  categoryTitle: {
    fontFamily: "Jua_400Regular",
    fontSize: 16,
    color: "#111827",
    marginBottom: 8,
  },
  categorySelector: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryText: {
    fontFamily: "Jua_400Regular",
    fontSize: 14,
    color: "#9CA3AF",
  },
  categoryTextSelected: { color: "#111827" },
  dropdownArrow: { fontSize: 12, color: "#9CA3AF" },
  categorySelectorPressed: {},
  dropdownArrowPressed: { transform: [{ scale: 1.2 }], color: "#111827" },

  titleContainer: { marginBottom: 24 },
  titleLabel: {
    fontFamily: "Jua_400Regular",
    fontSize: 16,
    color: "#111827",
    marginBottom: 8,
  },
  titleInput: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    fontFamily: "Jua_400Regular",
    fontSize: 14,
    color: "#111827",
  },

  contentContainer: { marginBottom: 24 },
  contentLabel: {
    fontFamily: "Jua_400Regular",
    fontSize: 16,
    color: "#111827",
    marginBottom: 8,
  },
  contentInput: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    fontFamily: "Jua_400Regular",
    fontSize: 14,
    color: "#111827",
    minHeight: 200,
  },

  photoContainer: { marginBottom: 24 },
  photoLabel: {
    fontFamily: "Jua_400Regular",
    fontSize: 16,
    color: "#111827",
    marginBottom: 8,
  },
  photoButton: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  photoButtonText: {
    fontFamily: "Jua_400Regular",
    fontSize: 14,
    color: "#6B7280",
  },

  bottomButtons: { flexDirection: "row", gap: 12, marginTop: 32 },
  backButtonBottom: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  backButtonText: {
    fontFamily: "Jua_400Regular",
    fontSize: 16,
    color: "#6B7280",
  },
  submitButton: {
    flex: 1,
    backgroundColor: "#1AA179",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  submitButtonText: {
    fontFamily: "Jua_400Regular",
    fontSize: 16,
    color: "#FFFFFF",
  },

  successContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  successMessage: {
    fontFamily: "Jua_400Regular",
    fontSize: 24,
    color: "#111827",
    marginBottom: 40,
    textAlign: "center",
  },
  successButton: {
    backgroundColor: "#1AA179",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  successButtonText: {
    fontFamily: "Jua_400Regular",
    fontSize: 16,
    color: "#FFFFFF",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownModal: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    width: "80%",
    maxWidth: 300,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  dropdownItem: { padding: 16 },
  dropdownItemBorder: { borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  dropdownItemText: {
    fontFamily: "Jua_400Regular",
    fontSize: 16,
    color: "#111827",
    textAlign: "center",
  },
});
