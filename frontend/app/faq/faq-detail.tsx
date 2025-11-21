import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFonts, Jua_400Regular } from "@expo-google-fonts/jua";
import { useState, useEffect, useRef } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useFaqDetail, useFaqVote } from "../../src/features/faq/hooks";

export default function FAQDetailScreen() {
  const [fontsLoaded] = useFonts({ Jua_400Regular });
  const [isHelpful, setIsHelpful] = useState(false);
  const [helpfulPressed, setHelpfulPressed] = useState(false);
  const [sharePressed, setSharePressed] = useState(false);
  const [relatedPressed, setRelatedPressed] = useState<{[key: number]: boolean}>({});
  const [backPressed, setBackPressed] = useState(false);
  const [feedbackPressed, setFeedbackPressed] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  const { data: faq, isLoading } = useFaqDetail(Number(id));
  const voteMutation = useFaqVote();
  
  const getCategoryKorean = (category: string) => {
    const categoryKoreanMap: { [key: string]: string } = {
      "plastic": "플라스틱",
      "paper": "종이",
      "glass": "유리",
      "vinyl": "비닐",
      "general": "일반쓰레기",
      "food": "음식물"
    };
    return categoryKoreanMap[category] || category;
  };
  
  const handleVote = () => {
    if (!faq) return;
    voteMutation.mutate({
      id: faq.id,
      voteData: {
        userId: "temp-user-id", // 실제 사용자 ID로 교체 필요
        vote: "UP"
      }
    });
    setIsHelpful(true);
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
            <Text style={styles.categoryText}>{getCategoryKorean(faq.wasteType || faq.category)}</Text>
          </View>
          <Text style={styles.questionTitle}>{faq.question}</Text>
          <View style={styles.questionMeta}>
            <View style={styles.helpfulInfo}>
              <Ionicons name="thumbs-up-outline" size={16} color="#6B7280" />
              <Text style={styles.helpfulText}>도움됨 {faq.likeCount}</Text>
            </View>
            <Text style={styles.dateText}>{new Date(faq.createdAt).toLocaleDateString('ko-KR')}</Text>
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
          style={[styles.helpfulButton, helpfulPressed && styles.helpfulButtonHover]}
          onPressIn={() => setHelpfulPressed(true)}
          onPressOut={() => setHelpfulPressed(false)}
          onPress={handleVote}
        >
          <Ionicons 
            name="thumbs-up-outline" 
            size={helpfulPressed ? 24 : 20} 
            color={helpfulPressed ? "#3B82F6" : "#6B7280"} 
            style={helpfulPressed && { transform: [{ rotate: '5deg' }] }}
          />
          <Text style={[styles.helpfulButtonText, helpfulPressed && styles.helpfulButtonTextHover]}>도움이 되었어요</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.shareButton, sharePressed && styles.shareButtonHover]}
          onPressIn={() => setSharePressed(true)}
          onPressOut={() => setSharePressed(false)}
        >
          <Ionicons 
            name="share-outline" 
            size={sharePressed ? 24 : 20} 
            color={sharePressed ? "#3B82F6" : "#6B7280"} 
            style={sharePressed && { transform: [{ translateY: -3 }, { scale: 1.2 }] }}
          />
          <Text style={[styles.shareButtonText, sharePressed && styles.shareButtonTextHover]}>공유하기</Text>
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

      {/* 관련 질문 */}
      <View style={styles.relatedContainer}>
        <Text style={styles.relatedTitle}>관련 질문</Text>
        <View style={styles.relatedList}>
          <TouchableOpacity 
            style={[styles.relatedItem, relatedPressed[0] && styles.relatedItemPressed]}
            onPressIn={() => setRelatedPressed(prev => ({...prev, 0: true}))}
            onPressOut={() => setRelatedPressed(prev => ({...prev, 0: false}))}
          >
            <Text style={styles.relatedQuestion}>플라스틱 뚜껑과 본체를 분리해야 하나요?</Text>
            <Ionicons name="chevron-forward-outline" size={16} color="#6B7280" style={[styles.relatedArrow, relatedPressed[0] && styles.relatedArrowVisible]} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.relatedItem, relatedPressed[1] && styles.relatedItemPressed]}
            onPressIn={() => setRelatedPressed(prev => ({...prev, 1: true}))}
            onPressOut={() => setRelatedPressed(prev => ({...prev, 1: false}))}
          >
            <Text style={styles.relatedQuestion}>페트병 라벨 제거가 필수인가요?</Text>
            <Ionicons name="chevron-forward-outline" size={16} color="#6B7280" style={[styles.relatedArrow, relatedPressed[1] && styles.relatedArrowVisible]} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.relatedItem, relatedPressed[2] && styles.relatedItemPressed]}
            onPressIn={() => setRelatedPressed(prev => ({...prev, 2: true}))}
            onPressOut={() => setRelatedPressed(prev => ({...prev, 2: false}))}
          >
            <Text style={styles.relatedQuestion}>플라스틱 용기 세척은 어느 정도까지?</Text>
            <Ionicons name="chevron-forward-outline" size={16} color="#6B7280" style={[styles.relatedArrow, relatedPressed[2] && styles.relatedArrowVisible]} />
          </TouchableOpacity>
        </View>
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
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  helpfulButton: {
    flex: 1,
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
  helpfulButtonText: {
    fontFamily: "Jua_400Regular",
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 6,
  },
  helpfulButtonTextHover: {
    color: "#3B82F6",
  },
  shareButtonHover: {
    backgroundColor: "#EBF4FF",
    borderColor: "#3B82F6",
  },
  shareButtonTextHover: {
    color: "#3B82F6",
  },
  shareButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  shareButtonText: {
    fontFamily: "Jua_400Regular",
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 6,
  },
  relatedContainer: {
    marginBottom: 24,
  },
  relatedTitle: {
    fontFamily: "Jua_400Regular",
    fontSize: 18,
    color: "#111827",
    marginBottom: 16,
  },
  relatedList: {
    gap: 12,
  },
  relatedItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  relatedItemPressed: {
    backgroundColor: "#F3F4F6",
  },
  relatedArrow: {
    opacity: 0,
  },
  relatedArrowVisible: {
    opacity: 1,
  },
  relatedQuestion: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
    fontFamily: "Jua_400Regular",
    marginRight: 12,
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