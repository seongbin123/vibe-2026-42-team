import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  ScrollView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { API_BASE } from '../constants/api';
import { colors } from '../constants/theme';

const DEPARTMENTS = ['', '컴퓨터학과', '경영학과', '전자공학과', '기계공학과', '건축학과', '간호학과', '사회복지학과', '영어영문학과', '기타'];
const CONDITIONS = ['상', '중', '하'];

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({
    title: '', author: '', subject: '', department: '',
    price: '', condition: '', description: '', contact: '',
  });
  const [loading, setLoading] = useState(false);

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const validate = () => {
    if (!form.title.trim()) return '책 제목을 입력해주세요.';
    if (!form.price) return '가격을 입력해주세요.';
    if (!form.condition) return '책 상태를 선택해주세요.';
    if (!form.contact.trim()) return '연락처를 입력해주세요.';
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) return Alert.alert('입력 오류', err);

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: parseInt(form.price),
          author: form.author || null,
          subject: form.subject || null,
          department: form.department || null,
          description: form.description || null,
        }),
      });

      if (!res.ok) throw new Error();
      Alert.alert('등록 완료', '책이 등록되었습니다! 📚', [
        { text: '확인', onPress: () => navigation.goBack() }
      ]);
    } catch {
      Alert.alert('오류', '등록에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <Field label="책 제목 *">
          <TextInput style={styles.input} placeholder="예: 자료구조론" value={form.title} onChangeText={v => set('title', v)} />
        </Field>

        <Field label="저자">
          <TextInput style={styles.input} placeholder="예: 홍길동" value={form.author} onChangeText={v => set('author', v)} />
        </Field>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Field label="과목명">
              <TextInput style={styles.input} placeholder="예: 자료구조" value={form.subject} onChangeText={v => set('subject', v)} />
            </Field>
          </View>
          <View style={{ width: 12 }} />
          <View style={{ flex: 1 }}>
            <Field label="가격 (원) *">
              <TextInput style={styles.input} placeholder="예: 8000" keyboardType="numeric" value={form.price} onChangeText={v => set('price', v)} />
            </Field>
          </View>
        </View>

        <Field label="학과">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 4 }} contentContainerStyle={{ gap: 8 }}>
            {DEPARTMENTS.slice(1).map(d => (
              <TouchableOpacity
                key={d}
                style={[styles.chip, form.department === d && styles.chipActive]}
                onPress={() => set('department', form.department === d ? '' : d)}
              >
                <Text style={[styles.chipText, form.department === d && styles.chipTextActive]}>{d}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Field>

        <Field label="책 상태 *">
          <View style={styles.conditionRow}>
            {CONDITIONS.map(c => (
              <TouchableOpacity
                key={c}
                style={[styles.condBtn, form.condition === c && styles.condBtnActive]}
                onPress={() => set('condition', c)}
              >
                <Text style={[styles.condBtnText, form.condition === c && styles.condBtnTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Field>

        <Field label="설명">
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="책 상태, 필기 여부 등 자유롭게 작성해주세요"
            multiline
            numberOfLines={4}
            value={form.description}
            onChangeText={v => set('description', v)}
            textAlignVertical="top"
          />
        </Field>

        <Field label="연락처 (카톡 ID 또는 전화번호) *">
          <TextInput style={styles.input} placeholder="예: kakao123 또는 010-1234-5678" value={form.contact} onChangeText={v => set('contact', v)} />
        </Field>

        <TouchableOpacity
          style={[styles.submitBtn, loading && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitText}>{loading ? '등록 중...' : '📚 등록하기'}</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, children }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 13, fontWeight: '700', color: '#555', marginBottom: 6 }}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  row: { flexDirection: 'row' },
  input: {
    backgroundColor: colors.white,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: colors.text,
  },
  textarea: { minHeight: 100, paddingTop: 12 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  chipTextActive: { color: colors.white },
  conditionRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  condBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  condBtnActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  condBtnText: { fontSize: 15, fontWeight: '700', color: colors.textMuted },
  condBtnTextActive: { color: colors.white },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  submitText: { color: colors.white, fontSize: 17, fontWeight: '700' },
});
