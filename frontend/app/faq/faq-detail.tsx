import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFonts, Jua_400Regular } from "@expo-google-fonts/jua";
import { useState, useEffect, useRef } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useFaqDetail, useFaqVote } from "../../src/features/faq/hooks";
import { faqApi } from "../../src/features/faq/api";

export default function FAQDetailScreen() {
  const [fontsLoaded] = useFonts({ Jua_400Regular });
  const [isHelpful, setIsHelpful] = useState(false);
  const [helpfulPressed, setHelpfulPressed] = useState(false);

  const [backPressed, setBackPressed] = useState(false);
  const [feedbackPressed, setFeedbackPressed] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  const { data: faq, isLoading } = useFaqDetail(Number(id));
  const voteMutation = useFaqVote();
  
  // 페이지 로드 시 투표 상태 확인
  useEffect(() => {
    if (faq) {
      faqApi.getVoteStatus(faq.id, "1")
        .then(response => {
          setIsHelpful(response.hasVoted);
        })
        .catch(error => {
          console.error('투표 상태 확인 실패:', error);
        });
    }
  }, [faq]);
  
  // ✅ DB에 한글로 저장되어 있으므로 그대로 반환
  const getCategoryKorean = (value: string) => {
    if (!value) return "";
    return value; // DB에 이미 한글로 저장됨
  };
  
  const handleVote = () => {
    if (!faq || voteMutation.isPending) return;
    
    voteMutation.mutate({
      id: faq.id,
      voteData: {
        userId: "1", // 임시 사용자 ID
        vote: "LIKE"
      }
    }, {
      onSuccess: () => {
        setIsHelpful(!isHelpful); // 토글
      },
      onError: (error) => {
        console.error('투표 실패:', error);
      }
    });
  };
  
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);
  
  const navigateToFeedback = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      router.push('/faq/faq-feedback');
    });
  };

  if (!fontsLoaded) return null;

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          transform: [{
            translateX: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [400, 0],
            })
          }]
        }
      ]}
    >
      {/* TopBar */}
      <View style={styles.topBar}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>FAQ</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollContainer} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={true}
      >

      {/* 질문 */}
      {isLoading ? (
        <Text style={styles.loadingText}>로딩 중...</Text>
      ) : faq ? (
        <View style={styles.questionContainer}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {getCategoryKorean(faq.wasteType || faq.category)}
            </Text>
          </View>
          <Text style={styles.questionTitle}>{faq.question}</Text>
          <View style={styles.questionMeta}>
            <View style={styles.helpfulInfo}>
              <Ionicons name="thumbs-up-outline" size={16} color="#6B7280" />
              <Text style={styles.helpfulText}>도움됨 {faq.likeCount}</Text>
            </View>
            <Text style={styles.dateText}>
              {new Date(faq.createdAt).toLocaleDateString('ko-KR')}
            </Text>
          </View>
        </View>
      ) : (
        <Text style={styles.errorText}>FAQ를 불러올 수 없습니다.</Text>
      )}

      {/* 내용 */}
      {faq && (
        <View style={styles.contentContainer}>
          <Text style={styles.contentText}>{faq.answer}</Text>
        </View>
      )}

      {/* 도움됨 버튼 */}
      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={[styles.helpfulButton, isHelpful && styles.helpfulButtonActive]}
          onPressIn={() => setHelpfulPressed(true)}
          onPressOut={() => setHelpfulPressed(false)}
          onPress={handleVote}
          disabled={voteMutation.isPending}
        >
          <Ionicons 
            name={isHelpful ? "thumbs-up" : "thumbs-up-outline"}
            size={20} 
            color={isHelpful ? "#3B82F6" : "#6B7280"} 
          />
          <Text style={[styles.helpfulButtonText, isHelpful && styles.helpfulButtonTextActive]}>
            {voteMutation.isPending ? "제출 중..." : isHelpful ? "도움됨" : "도움이 되었어요"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 피드백 버튼 */}
      <View style={styles.feedbackContainer}>
        <TouchableOpacity 
          style={[styles.feedbackButton, feedbackPressed && styles.feedbackButtonPressed]}
          onPressIn={() => setFeedbackPressed(true)}
          onPressOut={() => setFeedbackPressed(false)}
          onPress={() => router.push('/faq/faq-feedback')}
        >
          <Text style={styles.feedbackButtonText}>피드백하기</Text>
          <Ionicons 
            name="arrow-forward-outline" 
            size={14} 
            color="#9CA3AF" 
            style={[styles.feedbackArrow, feedbackPressed && styles.feedbackArrowVisible]} 
          />
        </TouchableOpacity>
      </View>

      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  topBarTitle: {
    fontFamily: "Jua_400Regular",
    fontSize: 18,
    color: "#111827",
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    paddingTop: 8,
  },
  backButton: {
    padding: 4,
  },
  backButtonPressed: {
    transform: [{ scale: 1.1 }],
  },
  placeholder: {
    width: 32,
  },
  questionContainer: {
    marginBottom: 24,
  },
  categoryBadge: {
    backgroundColor: "#EBF4FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  categoryText: {
    fontFamily: "Jua_400Regular",
    fontSize: 12,
    color: "#3B82F6",
  },
  questionTitle: {
    fontFamily: "Jua_400Regular",
    fontSize: 22,
    color: "#111827",
    lineHeight: 32,
    marginBottom: 12,
  },
  questionMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  helpfulInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  helpfulText: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 6,
  },
  dateText: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  contentContainer: {
    marginBottom: 32,
  },
  contentText: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
  },
  boldText: {
    fontWeight: "600",
    color: "#111827",
  },
  actionContainer: {
    marginBottom: 16,
  },
  helpfulButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  helpfulButtonHover: {
    backgroundColor: "#EBF4FF",
    borderColor: "#3B82F6",
  },
  helpfulButtonActive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#3B82F6",
    borderWidth: 2,
  },
  helpfulButtonText: {
    fontFamily: "Jua_400Regular",
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 6,
  },
  helpfulButtonTextHover: {
    color: "#3B82F6",
  },
  helpfulButtonTextActive: {
    color: "#3B82F6",
  },
  feedbackContainer: {
    alignItems: "flex-end",
    marginBottom: 24,
    marginTop: 4,
    marginRight: -12,
  },
  feedbackButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingRight: 16,
    paddingLeft: 16,
  },
  feedbackButtonPressed: {
    transform: [{ translateX: -18 }],
  },
  feedbackButtonText: {
    fontFamily: "Jua_400Regular",
    fontSize: 14,
    color: "#9CA3AF",
  },
  feedbackArrow: {
    opacity: 0,
    marginLeft: 4,
  },
  feedbackArrowVisible: {
    opacity: 1,
  },
  loadingText: {
    textAlign: "center",
    fontSize: 16,
    color: "#6B7280",
    marginTop: 40,
    fontFamily: "Jua_400Regular",
  },
  errorText: {
    textAlign: "center",
    fontSize: 16,
    color: "#EF4444",
    marginTop: 40,
    fontFamily: "Jua_400Regular",
  },
});