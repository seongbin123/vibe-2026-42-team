import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, FlatList, StyleSheet,
  TouchableOpacity, ActivityIndicator, RefreshControl, ScrollView,
} from 'react-native';
import { API_BASE } from '../constants/api';
import { colors } from '../constants/theme';
import BookCard from '../components/BookCard';

const DEPARTMENTS = ['전체', '컴퓨터학과', '경영학과', '전자공학과', '기계공학과', '건축학과', '간호학과', '사회복지학과', '영어영문학과', '기타'];
const CONDITIONS = ['전체', '상', '중', '하'];

export default function HomeScreen({ navigation }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('전체');
  const [condition, setCondition] = useState('전체');

  const loadBooks = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/books`);
      const data = await res.json();
      setBooks(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadBooks();
    const unsubscribe = navigation.addListener('focus', loadBooks);
    return unsubscribe;
  }, [navigation, loadBooks]);

  const filtered = books.filter(b => {
    const q = search.toLowerCase();
    const matchSearch = !q || b.title.toLowerCase().includes(q) ||
      (b.subject && b.subject.toLowerCase().includes(q)) ||
      (b.author && b.author.toLowerCase().includes(q));
    const matchDept = dept === '전체' || b.department === dept;
    const matchCond = condition === '전체' || b.condition === condition;
    return matchSearch && matchDept && matchCond;
  });

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 검색창 */}
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="책 제목, 과목, 저자 검색..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* 학과 필터 */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {DEPARTMENTS.map(d => (
          <TouchableOpacity
            key={d}
            style={[styles.filterChip, dept === d && styles.filterChipActive]}
            onPress={() => setDept(d)}
          >
            <Text style={[styles.filterChipText, dept === d && styles.filterChipTextActive]}>{d}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 상태 필터 */}
      <View style={styles.conditionRow}>
        {CONDITIONS.map(c => (
          <TouchableOpacity
            key={c}
            style={[styles.condChip, condition === c && styles.condChipActive]}
            onPress={() => setCondition(c)}
          >
            <Text style={[styles.condChipText, condition === c && styles.condChipTextActive]}>{c}</Text>
          </TouchableOpacity>
        ))}
        <Text style={styles.countText}>총 {filtered.length}권</Text>
      </View>

      {/* 책 목록 */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <BookCard
            book={item}
            onPress={() => navigation.navigate('Detail', { book: item })}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadBooks(); }} colors={[colors.primary]} />}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>등록된 책이 없습니다 😢</Text>
          </View>
        }
      />

      {/* 등록 버튼 */}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('Register')}>
        <Text style={styles.fabText}>+ 책 등록</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 2,
    borderColor: colors.border,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: colors.text },
  filterRow: { marginBottom: 8, maxHeight: 44 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterChipText: { fontSize: 13, color: colors.textMuted, fontWeight: '600' },
  filterChipTextActive: { color: colors.white },
  conditionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8,
  },
  condChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  condChipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  condChipText: { fontSize: 13, color: colors.textMuted, fontWeight: '600' },
  condChipTextActive: { color: colors.white },
  countText: { marginLeft: 'auto', fontSize: 13, color: colors.textMuted },
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  emptyText: { fontSize: 16, color: colors.textMuted },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    backgroundColor: colors.accent,
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: { color: colors.white, fontWeight: '700', fontSize: 15 },
});
