import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Href, Link } from "expo-router";

type Props = { title: string; caption?: string; href: Href; tint?: string };

export default function FeatureCard({ title, caption, href, tint = "#e5e7eb" }: Props) {
  return (
    <Link href={href} asChild>
      <TouchableOpacity style={[styles.card, { borderColor: tint }]} activeOpacity={0.8}>
        <View style={[styles.handle, { backgroundColor: tint }]} />
        <View style={styles.body}>
          <Text style={styles.title}>{title}</Text>
          {caption ? <Text style={styles.caption}>{caption}</Text> : null}
        </View>
      </TouchableOpacity>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, borderWidth: 2, borderRadius: 14, padding: 8, alignItems: "center", gap: 10 },
  handle: { width: "50%", height: 10, borderRadius: 6, marginTop: 4 },
  body: { width: "100%", padding: 8, borderRadius: 10, backgroundColor: "#fff", alignItems: "center", gap: 6 },
  title: { textAlign: "center", fontWeight: "700" },
  caption: { color: "#6b7280", fontSize: 12, textAlign: "center" },
});
