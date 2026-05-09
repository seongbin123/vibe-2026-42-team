import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../constants/theme';

const conditionStyle = {
  상: colors.conditionGood,
  중: colors.conditionMid,
  하: colors.conditionBad,
};

export default function BookCard({ book, onPress }) {
  return (
    <TouchableOpacity style={[styles.card, book.is_sold && styles.soldCard]} onPress={onPress} activeOpacity={0.75}>
      {book.is_sold && (
        <View style={styles.soldBadge}>
          <Text style={styles.soldBadgeText}>판매완료</Text>
        </View>
      )}
      <Text style={styles.title} numberOfLines={2}>{book.title}</Text>
      <Text style={styles.author} numberOfLines={1}>{book.author || '저자 미상'}</Text>

      <View style={styles.tags}>
        {book.department ? (
          <View style={styles.tagDept}>
            <Text style={styles.tagDeptText}>{book.department}</Text>
          </View>
        ) : null}
        {book.subject ? (
          <View style={styles.tagSubject}>
            <Text style={styles.tagSubjectText}>{book.subject}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.bottom}>
        <Text style={styles.price}>{Number(book.price).toLocaleString()}원</Text>
        <View style={[styles.conditionBadge, { backgroundColor: conditionStyle[book.condition]?.bg }]}>
          <Text style={[styles.conditionText, { color: conditionStyle[book.condition]?.text }]}>
            {book.condition}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  soldCard: { opacity: 0.5 },
  soldBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#888',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 8,
  },
  soldBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
    lineHeight: 22,
  },
  author: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 10,
  },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  tagDept: {
    backgroundColor: '#e8f0fb',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  tagDeptText: { fontSize: 12, fontWeight: '600', color: colors.primary },
  tagSubject: {
    backgroundColor: '#fff3e0',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  tagSubjectText: { fontSize: 12, fontWeight: '600', color: '#b35c00' },
  bottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: 17, fontWeight: '700', color: colors.primary },
  conditionBadge: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  conditionText: { fontSize: 12, fontWeight: '700' },
});
