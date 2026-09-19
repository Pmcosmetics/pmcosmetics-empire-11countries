import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useSelector } from 'react-redux';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export default function ProfileScreen({ navigation }: any) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const token = useSelector((state: any) => state.auth.token);

  useEffect(() => {
    if (!token) {
      navigation.navigate('Login');
    } else {
      fetchUser();
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !user) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Text>جاري التحميل...</Text>
      </View>
    );
  }

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
          fontSize: 40,
          marginBottom: 10,
        }}>👤</Text>
        <Text style={{
          fontSize: 24,
          fontWeight: 'bold',
          color: '#fff',
        }}>{user.firstName} {user.lastName}</Text>
      </View>

      {/* User Info */}
      <View style={{ padding: 20 }}>
        <View style={{
          backgroundColor: '#fff',
          borderRadius: 8,
          padding: 16,
          marginBottom: 16,
        }}>
          <Text style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>البريد الإلكتروني</Text>
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 16 }}>{user.email}</Text>
          
          <Text style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>الهاتف</Text>
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 16 }}>{user.phone}</Text>
          
          <Text style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>الدور</Text>
          <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{user.role}</Text>
        </View>

        {/* Menu Items */}
        {[
          { icon: '📦', label: 'طلباتي', screen: 'Orders' },
          { icon: '❤️', label: 'قائمة المفضلة', screen: 'Wishlist' },
          { icon: '📍', label: 'العناوين المحفوظة', action: 'address' },
          { icon: '⚙️', label: 'الإعدادات', action: 'settings' },
        ].map((item, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() => navigation.navigate(item.screen)}
            style={{
              backgroundColor: '#fff',
              borderRadius: 8,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 20, marginRight: 12 }}>{item.icon}</Text>
              <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{item.label}</Text>
            </View>
            <Text style={{ color: '#9333ea' }}>›</Text>
          </TouchableOpacity>
        ))}

        {/* Logout Button */}
        <TouchableOpacity
          style={{
            backgroundColor: '#fee2e2',
            borderRadius: 8,
            padding: 16,
            alignItems: 'center',
            marginTop: 20,
          }}
        >
          <Text style={{
            color: '#dc2626',
            fontWeight: 'bold',
            fontSize: 16,
          }}>تسجيل الخروج</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
