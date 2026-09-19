import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export default function RegisterScreen({ navigation }: any) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (formData.password !== formData.confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axios.post(`${API_URL}/api/auth/register`, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });

      navigation.navigate('Login');
    } catch (err: any) {
      setError(err.response?.data?.error || 'فشل التسجيل');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <View style={{
        backgroundColor: '#9333ea',
        padding: 30,
        paddingTop: 60,
        alignItems: 'center',
      }}>
        <Text style={{
          fontSize: 28,
          fontWeight: 'bold',
          color: '#fff',
          marginBottom: 10,
        }}>إنشاء حساب جديد</Text>
      </View>

      <View style={{ padding: 20 }}>
        {error && (
          <View style={{
            backgroundColor: '#fee2e2',
            borderRadius: 8,
            padding: 12,
            marginBottom: 20,
          }}>
            <Text style={{ color: '#dc2626' }}>{error}</Text>
          </View>
        )}

        {/* Form Fields */}
        {[
          { label: 'الاسم الأول', key: 'firstName', placeholder: 'أحمد' },
          { label: 'الاسم الأخير', key: 'lastName', placeholder: 'محمد' },
          { label: 'البريد الإلكتروني', key: 'email', placeholder: 'example@email.com' },
          { label: 'رقم الهاتف', key: 'phone', placeholder: '201000000000' },
          { label: 'كلمة المرور', key: 'password', placeholder: '••••••••', secure: true },
          { label: 'تأكيد كلمة المرور', key: 'confirmPassword', placeholder: '••••••••', secure: true },
        ].map((field) => (
          <View key={field.key}>
            <Text style={{
              fontSize: 14,
              fontWeight: 'bold',
              marginBottom: 8,
            }}>{field.label}</Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#e5e7eb',
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 12,
                marginBottom: 16,
                backgroundColor: '#fff',
              }}
              placeholder={field.placeholder}
              value={formData[field.key as keyof typeof formData]}
              onChangeText={(value) => setFormData({
                ...formData,
                [field.key]: value,
              })}
              secureTextEntry={field.secure}
              editable={!loading}
            />
          </View>
        ))}

        {/* Register Button */}
        <TouchableOpacity
          onPress={handleRegister}
          disabled={loading}
          style={{
            backgroundColor: loading ? '#d1d5db' : '#9333ea',
            paddingVertical: 15,
            borderRadius: 8,
            alignItems: 'center',
            marginBottom: 15,
          }}
        >
          <Text style={{
            color: '#fff',
            fontWeight: 'bold',
            fontSize: 16,
          }}>{loading ? 'جاري الإنشاء...' : 'إنشاء حساب'}</Text>
        </TouchableOpacity>

        {/* Login Link */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={{ alignItems: 'center' }}
        >
          <Text style={{ color: '#666' }}>هل لديك حساب بالفعل؟ </Text>
          <Text style={{ color: '#9333ea', fontWeight: 'bold' }}>تسجيل دخول</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
