import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Alert, ScrollView, Linking,
} from 'react-native';
import { API_BASE } from '../constants/api';
import { colors } from '../constants/theme';

const conditionStyle = {
  상: colors.conditionGood,
  중: colors.conditionMid,
  하: colors.conditionBad,
};

export default function DetailScreen({ route, navigation }) {
  const { book } = route.params;
  const [isSold, setIsSold] = useState(book.is_sold);
  const [loading, setLoading] = useState(false);

  const handleMarkSold = () => {
    Alert.alert('판매완료', '판매완료로 처리하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '확인', onPress: async () => {
          setLoading(true);
          try {
            await fetch(`${API_BASE}/books/${book.id}`, { method: 'PATCH' });
            setIsSold(true);
            Alert.alert('완료', '판매완료 처리되었습니다.', [
              { text: '확인', onPress: () => navigation.goBack() }
            ]);
          } catch {
            Alert.alert('오류', '처리에 실패했습니다.');
          } finally {
            setLoading(false);
          }
        }
      }
    ]);
  };

  const handleContact = () => {
    const contact = book.contact;
    if (contact.startsWith('010')) {
      Linking.openURL(`tel:${contact.replace(/-/g, '')}`);
    } else {
      Alert.alert('연락처', `카카오톡 ID: ${contact}`);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 상태 + 가격 */}
      <View style={styles.topRow}>
        <View style={[styles.conditionBadge, { backgroundColor: conditionStyle[book.condition]?.bg }]}>
          <Text style={[styles.conditionText, { color: conditionStyle[book.condition]?.text }]}>
            상태: {book.condition}
          </Text>
        </View>
        {isSold && (
          <View style={styles.soldBadge}>
            <Text style={styles.soldText}>판매완료</Text>
          </View>
        )}
      </View>

      <Text style={styles.price}>{Number(book.price).toLocaleString()}원</Text>
      <Text style={styles.title}>{book.title}</Text>
      {book.author ? <Text style={styles.author}>저자: {book.author}</Text> : null}

      {/* 정보 */}
      <View style={styles.infoBox}>
        <InfoRow label="과목" value={book.subject} />
        <InfoRow label="학과" value={book.department} />
        <InfoRow label="등록일" value={book.created_at?.slice(0, 10)} />
      </View>

      {/* 설명 */}
      {book.description ? (
        <View style={styles.descBox}>
          <Text style={styles.descLabel}>설명</Text>
          <Text style={styles.descText}>{book.description}</Text>
        </View>
      ) : null}

      {/* 연락하기 */}
      <TouchableOpacity style={styles.contactBtn} onPress={handleContact}>
        <Text style={styles.contactBtnText}>💬 판매자에게 연락하기</Text>
        <Text style={styles.contactValue}>{book.contact}</Text>
      </TouchableOpacity>

      {/* 판매완료 버튼 */}
      {!isSold && (
        <TouchableOpacity
          style={[styles.soldBtn, loading && { opacity: 0.6 }]}
          onPress={handleMarkSold}
          disabled={loading}
        >
          <Text style={styles.soldBtnText}>판매완료로 표시하기</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  conditionBadge: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5 },
  conditionText: { fontSize: 13, fontWeight: '700' },
  soldBadge: { backgroundColor: '#888', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5 },
  soldText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  price: { fontSize: 28, fontWeight: '800', color: colors.primary, marginBottom: 6 },
  title: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 4, lineHeight: 28 },
  author: { fontSize: 14, color: colors.textMuted, marginBottom: 16 },
  infoBox: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 4,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  infoLabel: { fontSize: 14, color: colors.textMuted, fontWeight: '600' },
  infoValue: { fontSize: 14, color: colors.text, fontWeight: '500' },
  descBox: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
  },
  descLabel: { fontSize: 13, fontWeight: '700', color: colors.textMuted, marginBottom: 6 },
  descText: { fontSize: 15, color: colors.text, lineHeight: 22 },
  contactBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginBottom: 12,
  },
  contactBtnText: { color: colors.white, fontSize: 16, fontWeight: '700', marginBottom: 4 },
  contactValue: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  soldBtn: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  soldBtnText: { fontSize: 15, color: colors.textMuted, fontWeight: '600' },
});
