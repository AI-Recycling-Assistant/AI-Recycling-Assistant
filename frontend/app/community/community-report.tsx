import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFonts, Jua_400Regular } from "@expo-google-fonts/jua";
import { useState } from "react";

export default function CommunityReportScreen() {
  const [fontsLoaded] = useFonts({ Jua_400Regular });

  const [feedback, setFeedback] = useState("");
  const [reasonPressed, setReasonPressed] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const reasons = ["스팸/광고", "욕설/비방", "음란물", "개인정보 노출", "기타"];

  if (!fontsLoaded) return null;

  const handleSubmit = () => {
    if (selectedReason && feedback.trim()) {
      setIsSubmitted(true);
    } else {
      alert('신고 사유와 상세 내용을 모두 입력해주세요.');
    }
  };

  if (isSubmitted) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <Text style={styles.successMessage}>
            신고가 접수되었습니다.{"\n"}
            검토 후 조치하겠습니다.
          </Text>
          <TouchableOpacity style={styles.returnButton}>
            <Text style={styles.returnButtonText}>쓰담이들로 돌아가기</Text>
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
    >


      {/* 메인 콘텐츠 */}
      <View style={styles.mainContent}>
        {/* 제목 */}
        <Text style={styles.title}>게시글 신고하기</Text>
        <Text style={styles.subtitle}>부적절한 게시글을 신고해주세요</Text>

        {/* 사유 선택 */}
        <View style={styles.reasonContainer}>
          <Text style={styles.reasonTitle}>신고 사유</Text>
          <TouchableOpacity 
          style={[styles.reasonSelector, reasonPressed && styles.reasonSelectorPressed]}
          onPressIn={() => setReasonPressed(true)}
          onPressOut={() => setReasonPressed(false)}
          onPress={() => setIsDropdownOpen(true)}
        >
            <Text style={[styles.reasonText, selectedReason && styles.reasonTextSelected]}>
              {selectedReason || "신고 사유를 선택해주세요"}
            </Text>
            <Text style={[styles.dropdownArrow, reasonPressed && styles.dropdownArrowPressed]}>▼</Text>
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
          />
        </View>

        {/* 버튼들 */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.backButton}>
            <Text style={styles.backButtonText}>돌아가기</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.submitButton, (selectedReason && feedback.trim()) && styles.submitButtonActive]}
            onPress={handleSubmit}
          >
            <Text style={[styles.submitButtonText, (selectedReason && feedback.trim()) && styles.submitButtonTextActive]}>
              신고하기
            </Text>
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
    paddingTop: 80,
    paddingBottom: 40,
  },

  mainContent: {
    alignItems: "center",
  },
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
    marginBottom: 32,
    textAlign: "center",
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
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  submitButton: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    flex: 1,
  },
  backButton: {
    backgroundColor: "#E5E7EB",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    flex: 1,
  },
  backButtonText: {
    fontFamily: "Jua_400Regular",
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
  submitButtonActive: {
    backgroundColor: "#EF4444",
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
    marginBottom: 40,
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