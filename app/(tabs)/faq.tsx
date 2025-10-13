import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFonts, Jua_400Regular } from "@expo-google-fonts/jua";
import { useState } from "react";

type FAQCategory = {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  count: number;
};

const FAQ_CATEGORIES: FAQCategory[] = [
  { id: "plastic", title: "플라스틱", icon: "water-outline", color: "#3B82F6", count: 12 },
  { id: "paper", title: "종이류", icon: "document-outline", color: "#F59E0B", count: 8 },
  { id: "glass", title: "유리병", icon: "wine-outline", color: "#10B981", count: 6 },
  { id: "metal", title: "캔류", icon: "hardware-chip-outline", color: "#6B7280", count: 5 },
  { id: "general", title: "일반쓰레기", icon: "trash-outline", color: "#EF4444", count: 15 },
  { id: "etc", title: "기타", icon: "help-circle-outline", color: "#8B5CF6", count: 9 },
];

export default function FAQScreen() {
  const [fontsLoaded] = useFonts({ Jua_400Regular });
  const [searchText, setSearchText] = useState("");

  if (!fontsLoaded) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.brand}>분리배출</Text>
        <Text style={styles.title}>FAQ 빠른가이드</Text>
        <Text style={styles.subtitle}>"궁금한 것들을 빠르게 찾아보세요"</Text>
      </View>

      {/* 검색바 */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#6B7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="궁금한 내용을 검색해보세요"
          placeholderTextColor="#9CA3AF"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* 카테고리 그리드 */}
      <View style={styles.categoriesContainer}>
        <Text style={styles.sectionTitle}>카테고리별 가이드</Text>
        <View style={styles.grid}>
          {FAQ_CATEGORIES.map((category) => (
            <TouchableOpacity key={category.id} style={styles.categoryCard} activeOpacity={0.8}>
              <View style={[styles.iconContainer, { backgroundColor: `${category.color}15` }]}>
                <Ionicons name={category.icon} size={28} color={category.color} />
              </View>
              <Text style={styles.categoryTitle}>{category.title}</Text>
              <Text style={styles.categoryCount}>{category.count}개 항목</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 인기 질문 */}
      <View style={styles.popularContainer}>
        <Text style={styles.sectionTitle}>자주 묻는 질문</Text>
        <View style={styles.popularList}>
          <TouchableOpacity style={styles.popularItem}>
            <Text style={styles.popularQuestion}>플라스틱 용기에 라벨을 떼야 하나요?</Text>
            <Ionicons name="chevron-forward-outline" size={16} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.popularItem}>
            <Text style={styles.popularQuestion}>음식물이 묻은 종이는 어떻게 버리나요?</Text>
            <Ionicons name="chevron-forward-outline" size={16} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.popularItem}>
            <Text style={styles.popularQuestion}>깨진 유리병도 재활용이 가능한가요?</Text>
            <Ionicons name="chevron-forward-outline" size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>
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
    paddingVertical: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
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
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
    fontFamily: "Jua_400Regular",
  },
  categoriesContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: "Jua_400Regular",
    fontSize: 20,
    color: "#111827",
    marginBottom: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  categoryCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  categoryTitle: {
    fontFamily: "Jua_400Regular",
    fontSize: 16,
    color: "#111827",
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 12,
    color: "#6B7280",
  },
  popularContainer: {
    marginBottom: 24,
  },
  popularList: {
    gap: 12,
  },
  popularItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  popularQuestion: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
    fontFamily: "Jua_400Regular",
    marginRight: 12,
  },
});