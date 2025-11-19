// CommunityReportScreen.tsx
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
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useFonts, Jua_400Regular } from "@expo-google-fonts/jua";
import { useState } from "react";
import { useAuth } from "@store/auth"; // ✅ 로그인 정보 사용

// ===== API 기본 설정 =====
// Android 에뮬레이터: 10.0.2.2, 웹/ios: localhost
const BASE_URL =
  Platform.OS === "android" ? "http://10.0.2.2:8080" : "http://localhost:8080";
const API = `${BASE_URL}/api/community`;

export default function CommunityReportScreen() {
  const [fontsLoaded] = useFonts({ Jua_400Regular });
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  // ✅ 전역 auth 에서 현재 로그인 유저 정보 가져오기
  const { userId, isLoggedIn } = useAuth();

  // 필수 파라미터: 신고 대상 게시글 ID
  const postId: string | undefined = route?.params?.postId
    ? String(route.params.postId)
    : undefined;

  const [feedback, setFeedback] = useState("");
  const [reasonPressed, setReasonPressed] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const reasons = ["스팸/광고", "욕설/비방", "음란물", "개인정보 노출", "기타"];

  if (!fontsLoaded) return null;

  const validate = () => {
    if (!postId) {
      Alert.alert("오류", "신고 대상 게시글 정보가 없습니다.");
      return false;
    }
    if (!selectedReason) {
      Alert.alert("안내", "신고 사유를 선택해주세요.");
      return false;
    }
    if (!feedback.trim()) {
      Alert.alert("안내", "상세 내용을 입력해주세요.");
      return false;
    }
    return true;
  };

  // ==== 신고 전송: POST /api/community/posts/{postId}/report?userId= ====
  const handleSubmit = async () => {
    // ✅ 로그인 체크
    if (!isLoggedIn || !userId) {
      Alert.alert("로그인이 필요합니다", "신고 기능을 사용하려면 먼저 로그인해주세요.");
      return;
    }

    if (!validate()) return;

    try {
      setSubmitting(true);

      const body = {
        reason: selectedReason,
        // PostReportRequest 필드 이름에 맞게 detail 사용
        detail: feedback.trim(),
      };

      const res = await fetch(
        `${API}/posts/${postId}/report?userId=${userId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      if (!res.ok) throw new Error(`신고 요청 실패: ${res.status}`);
      setIsSubmitted(true);
    } catch (e: any) {
      Alert.alert("오류", e?.message ?? "신고 처리 중 문제가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <Ionicons
            name="checkmark-circle"
            size={48}
            color="#1AA179"
            style={{ marginBottom: 12 }}
          />
          <Text style={styles.successMessage}>
            신고가 접수되었습니다.{"\n"}
            검토 후 조치하겠습니다.
          </Text>
          <TouchableOpacity
            style={styles.returnButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.returnButtonText}>
              이전 화면으로 돌아가기
            </Text>
          </TouchableOpacity>
        </View>
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
      {/* 상단 바(뒤로가기) */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ padding: 4 }}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>신고</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* 메인 콘텐츠 */}
      <View style={styles.mainContent}>
        {/* 제목 */}
        <Text style={styles.title}>게시글 신고하기</Text>
        <Text style={styles.subtitle}>부적절한 게시글을 신고해주세요</Text>

        {/* 사유 선택 */}
        <View style={styles.reasonContainer}>
          <Text style={styles.reasonTitle}>신고 사유</Text>
          <TouchableOpacity
            style={[
              styles.reasonSelector,
              reasonPressed && styles.reasonSelectorPressed,
            ]}
            onPressIn={() => setReasonPressed(true)}
            onPressOut={() => setReasonPressed(false)}
            onPress={() => setIsDropdownOpen(true)}
            disabled={submitting}
          >
            <Text
              style={[
                styles.reasonText,
                selectedReason && styles.reasonTextSelected,
              ]}
            >
              {selectedReason || "신고 사유를 선택해주세요"}
            </Text>
            <Text
              style={[
                styles.dropdownArrow,
                reasonPressed && styles.dropdownArrowPressed,
              ]}
            >
              ▼
            </Text>
          </TouchableOpacity>
        </View>

        {/* 상세 내용 입력 */}
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackTitle}>상세 내용</Text>
          <TextInput
            style={styles.feedbackInput}
            placeholder="신고 사유에 대한 구체적인 내용을 입력해주세요"
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            value={feedback}
            onChangeText={setFeedback}
            editable={!submitting}
          />
        </View>

        {/* 버튼들 */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            disabled={submitting}
          >
            <Text style={styles.backButtonText}>돌아가기</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.submitButton,
              selectedReason && feedback.trim()
                ? styles.submitButtonActive
                : undefined,
            ]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator />
            ) : (
              <Text
                style={[
                  styles.submitButtonText,
                  selectedReason && feedback.trim()
                    ? styles.submitButtonTextActive
                    : undefined,
                ]}
              >
                신고하기
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* 안내 텍스트 */}
        <Text style={styles.infoText}>
          허위 신고 시 서비스 이용에 제한이 있을 수 있습니다.{"\n"}
          신중하게 신고해주세요.
        </Text>
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
            {reasons.map((reason, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dropdownItem,
                  index < reasons.length - 1 && styles.dropdownItemBorder,
                ]}
                onPress={() => {
                  setSelectedReason(reason);
                  setIsDropdownOpen(false);
                }}
                disabled={submitting}
              >
                <Text style={styles.dropdownItemText}>{reason}</Text>
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
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    marginBottom: 8,
  },
  topBarTitle: {
    fontFamily: "Jua_400Regular",
    fontSize: 18,
    color: "#111827",
  },

  mainContent: { alignItems: "center" },
  title: {
    fontFamily: "Jua_400Regular",
    fontSize: 24,
    color: "#111827",
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: "Jua_400Regular",
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 24,
    textAlign: "center",
  },

  reasonContainer: { width: "100%", marginBottom: 20 },
  reasonTitle: {
    fontFamily: "Jua_400Regular",
    fontSize: 18,
    color: "#111827",
    marginBottom: 12,
  },
  reasonSelector: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reasonText: {
    fontFamily: "Jua_400Regular",
    fontSize: 14,
    color: "#9CA3AF",
  },
  reasonTextSelected: { color: "#111827" },
  dropdownArrow: { fontSize: 12, color: "#9CA3AF" },
  reasonSelectorPressed: {},
  dropdownArrowPressed: { transform: [{ scale: 1.2 }], color: "#111827" },

  feedbackContainer: { width: "100%", marginBottom: 24 },
  feedbackTitle: {
    fontFamily: "Jua_400Regular",
    fontSize: 18,
    color: "#111827",
    marginBottom: 12,
  },
  feedbackInput: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    fontFamily: "Jua_400Regular",
    fontSize: 14,
    color: "#111827",
    minHeight: 120,
  },

  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
    width: "100%",
  },
  submitButton: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 16,
    borderRadius: 12,
    flex: 1,
    alignItems: "center",
  },
  backButton: {
    backgroundColor: "#E5E7EB",
    paddingVertical: 16,
    borderRadius: 12,
    flex: 1,
    alignItems: "center",
  },
  backButtonText: {
    fontFamily: "Jua_400Regular",
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
  submitButtonActive: { backgroundColor: "#EF4444" },
  submitButtonText: {
    fontFamily: "Jua_400Regular",
    fontSize: 16,
    color: "#9CA3AF",
    textAlign: "center",
  },
  submitButtonTextActive: { color: "#FFFFFF" },

  infoText: {
    fontFamily: "Jua_400Regular",
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 18,
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
  dropdownItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  dropdownItemText: {
    fontFamily: "Jua_400Regular",
    fontSize: 16,
    color: "#111827",
    textAlign: "center",
  },

  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  successMessage: {
    fontFamily: "Jua_400Regular",
    fontSize: 20,
    color: "#111827",
    textAlign: "center",
    lineHeight: 28,
    marginBottom: 24,
  },
  returnButton: {
    backgroundColor: "#1AA179",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  returnButtonText: {
    fontFamily: "Jua_400Regular",
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
  },
});
