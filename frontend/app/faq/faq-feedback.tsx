import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFonts, Jua_400Regular } from "@expo-google-fonts/jua";
import { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useFaqFeedback } from "../../src/features/faq/hooks";

export default function FAQFeedbackScreen() {
  const [fontsLoaded] = useFonts({ Jua_400Regular });
  const router = useRouter();
  const { faqId } = useLocalSearchParams();
  
  const [feedback, setFeedback] = useState("");
  const [reasonPressed, setReasonPressed] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const reasons = ["오류 신고", "내용 개선 요청", "기능 개선 요청", "기타"];
  const feedbackMutation = useFaqFeedback();

  if (!fontsLoaded) return null;

  const handleSubmit = async () => {
    if (!selectedReason) {
      alert('사유를 선택해주세요.');
      return;
    }
    if (!feedback.trim()) {
      alert('상세 내용을 입력해주세요.');
      return;
    }
    
    try {
      await feedbackMutation.mutateAsync({
        userId: "temp-user-id", // 실제 사용자 ID로 교체 필요
        content: `[사유: ${selectedReason}] ${feedback}`,
        category: selectedReason
      });
      setShowSuccess(true);
    } catch (error) {
      alert('피드백 제출에 실패했습니다.');
    }
  };

  if (showSuccess) {
    return (
      <View style={styles.successContainer}>
        <Text style={styles.successMessage}>
          피드백이 제출되었습니다.{"\n"}
          소중한 의견 감사합니다!
        </Text>
        <TouchableOpacity 
          style={styles.successButton}
          onPress={() => router.back()}
        >
          <Text style={styles.successButtonText}>FAQ로 돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={true}
    >


      {/* 메인 콘텐츠 */}
      <View style={styles.mainContent}>
        {/* 사유 선택 */}
        <View style={styles.reasonContainer}>
          <Text style={styles.reasonTitle}>사유</Text>
          <TouchableOpacity 
          style={[styles.reasonSelector, reasonPressed && styles.reasonSelectorPressed]}
          onPressIn={() => setReasonPressed(true)}
          onPressOut={() => setReasonPressed(false)}
          onPress={() => setIsDropdownOpen(true)}
        >
            <Text style={[styles.reasonText, selectedReason && styles.reasonTextSelected]}>
              {selectedReason || "사유를 선택해주세요"}
            </Text>
            <Text style={[styles.dropdownArrow, reasonPressed && styles.dropdownArrowPressed]}>▼</Text>
          </TouchableOpacity>
        </View>
        
        {/* 상세 내용 입력 */}
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackTitle}>상세 내용</Text>
          <TextInput
            style={styles.feedbackInput}
            placeholder="구체적인 내용을 입력해주세요"
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            value={feedback}
            onChangeText={setFeedback}
          />
        </View>

        {/* 제출 버튼 */}
        <TouchableOpacity 
          style={[styles.submitButton, feedback.trim() && selectedReason && styles.submitButtonActive]}
          onPress={handleSubmit}
        >
          <Text style={[styles.submitButtonText, feedback.trim() && selectedReason && styles.submitButtonTextActive]}>
            피드백 제출하기
          </Text>
        </TouchableOpacity>

        {/* 안내 텍스트 */}
        <Text style={styles.infoText}>
          제출해주신 피드백은 서비스 개선에 소중히 활용됩니다.
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
                style={[styles.dropdownItem, index < reasons.length - 1 && styles.dropdownItemBorder]}
                onPress={() => {
                  setSelectedReason(reason);
                  setIsDropdownOpen(false);
                }}
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
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: 24,
    paddingTop: 8,
  },
  backButton: {
    padding: 4,
  },

  placeholder: {
    width: 32,
  },
  mainContent: {
    alignItems: "center",
  },
  reasonContainer: {
    width: "100%",
    marginBottom: 24,
  },
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
  reasonTextSelected: {
    color: "#111827",
  },
  dropdownArrow: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  reasonSelectorPressed: {
    // No visual change for selector itself
  },
  dropdownArrowPressed: {
    transform: [{ scale: 1.2 }],
    color: "#111827",
  },

  feedbackContainer: {
    width: "100%",
    marginBottom: 32,
  },
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
  submitButton: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: "100%",
    marginBottom: 24,
  },
  submitButtonActive: {
    backgroundColor: "#6B7280",
  },
  submitButtonText: {
    fontFamily: "Jua_400Regular",
    fontSize: 16,
    color: "#9CA3AF",
    textAlign: "center",
  },
  submitButtonTextActive: {
    color: "#FFFFFF",
  },
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
  dropdownItem: {
    padding: 16,
  },
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
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  successMessage: {
    fontFamily: "Jua_400Regular",
    fontSize: 20,
    color: "#111827",
    marginBottom: 40,
    textAlign: "center",
    lineHeight: 28,
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
});