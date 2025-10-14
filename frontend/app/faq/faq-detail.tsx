import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFonts, Jua_400Regular } from "@expo-google-fonts/jua";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "expo-router";

export default function FAQDetailScreen() {
  const [fontsLoaded] = useFonts({ Jua_400Regular });
  const [isHelpful, setIsHelpful] = useState(false);
  const [helpfulPressed, setHelpfulPressed] = useState(false);
  const [sharePressed, setSharePressed] = useState(false);
  const [relatedPressed, setRelatedPressed] = useState({});
  const [backPressed, setBackPressed] = useState(false);
  const [feedbackPressed, setFeedbackPressed] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const router = useRouter();
  
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
      router.push('/faq/feedback');
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
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={[styles.backButton, backPressed && styles.backButtonPressed]}
          onPressIn={() => setBackPressed(true)}
          onPressOut={() => setBackPressed(false)}
        >
          <Ionicons name="chevron-back" size={32} color="#111827" />
        </TouchableOpacity>
        <View style={styles.placeholder} />
      </View>

      {/* 질문 */}
      <View style={styles.questionContainer}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>플라스틱</Text>
        </View>
        <Text style={styles.questionTitle}>플라스틱 용기에 라벨을 떼야 하나요?</Text>
        <View style={styles.questionMeta}>
          <View style={styles.helpfulInfo}>
            <Ionicons name="thumbs-up-outline" size={16} color="#6B7280" />
            <Text style={styles.helpfulText}>도움됨 124</Text>
          </View>
          <Text style={styles.dateText}>2024.01.15</Text>
        </View>
      </View>

      {/* 내용 */}
      <View style={styles.contentContainer}>
        <Text style={styles.contentText}>
          플라스틱 용기에 붙어있는 라벨은 가능한 한 제거해주시는 것이 좋습니다.{'\n\n'}
          
          <Text style={styles.boldText}>🔍 라벨 제거가 필요한 이유</Text>{'\n'}
          • 재활용 과정에서 라벨이 섞이면 품질이 떨어집니다{'\n'}
          • 라벨의 접착제 성분이 재활용을 방해할 수 있습니다{'\n'}
          • 깨끗한 플라스틱일수록 재활용 효율이 높아집니다{'\n\n'}
          
          <Text style={styles.boldText}>📋 라벨 제거 단계</Text>{'\n'}
          1️⃣ 따뜻한 물에 담가 접착제를 불려주세요{'\n'}
          2️⃣ 손으로 천천히 떼어내주세요{'\n'}
          3️⃣ 남은 접착제는 중성세제로 제거해주세요{'\n\n'}
          
          <Text style={styles.boldText}>💡 꿀팁</Text>{'\n'}
          라벨이 잘 떨어지지 않는다면, 무리하게 제거하지 마시고 그대로 배출하셔도 됩니다.
        </Text>
      </View>

      {/* 도움됨 버튼 */}
      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={[styles.helpfulButton, helpfulPressed && styles.helpfulButtonHover]}
          onPressIn={() => setHelpfulPressed(true)}
          onPressOut={() => setHelpfulPressed(false)}
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
          onPress={navigateToFeedback}
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
});