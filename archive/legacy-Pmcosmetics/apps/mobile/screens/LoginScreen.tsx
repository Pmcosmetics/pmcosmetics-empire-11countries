import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import axios from 'axios';
import { useDispatch } from 'react-redux';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export default function LoginScreen({ navigation }: any) {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      });

      dispatch({ type: 'SET_TOKEN', payload: response.data.token });
      navigation.reset({ index: 0, routes: [{ name: 'HomeTab' }] });
    } catch (err: any) {
      setError(err.response?.data?.error || 'فشل تسجيل الدخول');
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
        }}>تسجيل الدخول</Text>
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

        {/* Email Input */}
        <Text style={{
          fontSize: 14,
          fontWeight: 'bold',
          marginBottom: 8,
        }}>البريد الإلكتروني</Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: '#e5e7eb',
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 12,
            marginBottom: 20,
            backgroundColor: '#fff',
          }}
          placeholder="example@email.com"
          value={email}
          onChangeText={setEmail}
          editable={!loading}
        />

        {/* Password Input */}
        <Text style={{
          fontSize: 14,
          fontWeight: 'bold',
          marginBottom: 8,
        }}>كلمة المرور</Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: '#e5e7eb',
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 12,
            marginBottom: 30,
            backgroundColor: '#fff',
          }}
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />

        {/* Login Button */}
        <TouchableOpacity
          onPress={handleLogin}
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
          }}>{loading ? 'جاري الدخول...' : 'دخول'}</Text>
        </TouchableOpacity>

        {/* Register Link */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Register')}
          style={{ alignItems: 'center' }}
        >
          <Text style={{ color: '#666' }}>ليس لديك حساب؟ </Text>
          <Text style={{ color: '#9333ea', fontWeight: 'bold' }}>إنشاء حساب جديد</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
