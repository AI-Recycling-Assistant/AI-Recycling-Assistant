import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { useFonts, Jua_400Regular } from "@expo-google-fonts/jua";
import { useState } from "react";
import { useRouter } from "expo-router";
import { useFaqList } from "../../src/features/faq/hooks";
import { Ionicons } from "@expo/vector-icons";

type FAQCategory = {
  id: string;
  title: string;
  emoji: string;
};

const FAQ_CATEGORIES: FAQCategory[] = [
  { id: "general", title: "일반쓰레기", emoji: "🗑️" },
  { id: "plastic", title: "플라스틱", emoji: "🧊" },
  { id: "glass", title: "유리", emoji: "🍷" },
  { id: "vinyl", title: "비닐", emoji: "🛍️" },
  { id: "paper", title: "종이", emoji: "📄" },
  { id: "food", title: "음식물", emoji: "🍎" },
];

export default function FAQMainScreen() {
  const [fontsLoaded] = useFonts({ Jua_400Regular });
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const router = useRouter();
  
  const categoryMap: { [key: string]: string } = {
    "플라스틱": "plastic",
    "종이류": "paper", 
    "유리병": "glass",
    "캔류": "metal",
    "일반쓰레기": "general",
    "기타": "etc"
  };
  
  const { data: faqData, isLoading } = useFaqList({
    q: searchText || undefined,
    category: selectedCategory === "전체" ? undefined : categoryMap[selectedCategory],
    page: 0,
    size: 20
  });
  
  const faqs = faqData?.content || [];

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.phoneContent}
        showsVerticalScrollIndicator={true}
        stickyHeaderIndices={[2]}
      >
        {/* 헤더 섹션 */}
        <View style={styles.headerSection}>
          <View style={styles.topHeader}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={24} color="#111827" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.header}>
            <Text style={styles.brand}>분리배출</Text>
            <Text style={styles.title}>FAQ 빠른가이드</Text>
            <Text style={styles.subtitle}>"궁금한 것들을 빠르게 찾아보세요"</Text>
          </View>

          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="궁금한 내용을 검색해보세요"
              placeholderTextColor="#9CA3AF"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
        </View>

        {/* 스티키 헤더 */}
        <View style={styles.stickyHeader}>
          <Text style={styles.sectionTitle}>카테고리</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
          >
            <TouchableOpacity 
              style={[styles.categoryChip, selectedCategory === "전체" && styles.categoryChipSelected]}
              onPress={() => setSelectedCategory("전체")}
            >
              <Text style={[styles.categoryChipText, selectedCategory === "전체" && styles.categoryChipTextSelected]}>전체</Text>
            </TouchableOpacity>
            {FAQ_CATEGORIES.map((category) => (
              <TouchableOpacity 
                key={category.id} 
                style={[styles.categoryChip, selectedCategory === category.title && styles.categoryChipSelected]}
                onPress={() => setSelectedCategory(category.title)}
              >
                <Text style={styles.categoryChipEmoji}>{category.emoji}</Text>
                <Text style={[styles.categoryChipText, selectedCategory === category.title && styles.categoryChipTextSelected]}>{category.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={styles.sectionTitle}>자주 묻는 질문</Text>
        </View>

        {/* 질문 목록 */}
        <View style={styles.questionsContainer}>
          <View style={styles.questionsList}>
            {isLoading ? (
              <Text style={styles.loadingText}>로딩 중...</Text>
            ) : faqs.length === 0 ? (
              <Text style={styles.emptyText}>검색 결과가 없습니다.</Text>
            ) : (
              faqs.map((faq: any) => (
                <TouchableOpacity 
                  key={faq.id} 
                  style={styles.questionItem}
                  onPress={() => router.push(`/faq/faq-detail?id=${faq.id}`)}
                >
                  <View style={styles.questionContent}>
                    <Text style={styles.questionText}>{faq.question}</Text>
                    <View style={styles.questionMeta}>
                      <View style={styles.categoryTag}>
                        <Text style={styles.categoryTagText}>{faq.category}</Text>
                      </View>
                      <View style={styles.helpfulInfo}>
                        <Ionicons name="thumbs-up-outline" size={12} color="#6B7280" />
                        <Text style={styles.helpfulText}>도움됨 {faq.helpful}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  phoneContent: {
    flex: 1,
  },
  headerSection: {
    paddingTop: 8,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    marginBottom: 8,
  },
  backButton: {
    padding: 8,
  },
  header: {
    alignItems: "center",
    marginBottom: 16,
  },
  brand: {
    fontFamily: "Jua_400Regular",
    fontSize: 18,
    color: "#0F172A",
    letterSpacing: 0.3,
  },
  title: {
    fontFamily: "Jua_400Regular",
    fontSize: 30,
    color: "#0F172A",
    letterSpacing: 0.2,
    marginTop: 4,
  },
  subtitle: {
    fontFamily: "Jua_400Regular",
    fontSize: 14,
    color: "#6B7280",
    marginTop: 6,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
    fontFamily: "Jua_400Regular",
  },
  stickyHeader: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  sectionTitle: {
    fontFamily: "Jua_400Regular",
    fontSize: 20,
    color: "#111827",
    marginBottom: 8,
  },
  categoryScroll: {
    marginBottom: 12,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  categoryChipSelected: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },
  categoryChipEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  categoryChipText: {
    fontSize: 14,
    color: "#6B7280",
    fontFamily: "Jua_400Regular",
  },
  categoryChipTextSelected: {
    color: "#FFFFFF",
  },
  questionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  questionsList: {
    gap: 12,
  },
  questionItem: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 1,
  },
  questionContent: {
    flex: 1,
  },
  questionText: {
    fontSize: 15,
    color: "#111827",
    fontFamily: "Jua_400Regular",
    lineHeight: 22,
    marginBottom: 8,
  },
  questionMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  categoryTag: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryTagText: {
    fontSize: 12,
    color: "#6B7280",
    fontFamily: "Jua_400Regular",
  },
  helpfulInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  helpfulText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
  },
  loadingText: {
    textAlign: "center",
    fontSize: 16,
    color: "#6B7280",
    marginTop: 40,
    fontFamily: "Jua_400Regular",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#6B7280",
    marginTop: 40,
    fontFamily: "Jua_400Regular",
  },
});