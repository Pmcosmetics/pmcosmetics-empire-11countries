import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export default function HomeScreen({ navigation }: any) {
  const [orderType, setOrderType] = useState<'RETAIL' | 'WHOLESALE'>('RETAIL');

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <View style={{
        backgroundColor: '#9333ea',
        padding: 20,
        paddingTop: 40,
        alignItems: 'center',
      }}>
        <Text style={{
          fontSize: 28,
          fontWeight: 'bold',
          color: '#fff',
          marginBottom: 10,
        }}>💄 PM.Cosmetics</Text>
        <Text style={{
          fontSize: 16,
          color: '#fff',
          textAlign: 'center',
        }}>منصة بيع مستحضرات التجميل - جملة وتجزئة</Text>
      </View>

      {/* Order Type Toggle */}
      <View style={{
        flexDirection: 'row',
        gap: 10,
        padding: 20,
        justifyContent: 'center',
      }}>
        <TouchableOpacity
          onPress={() => setOrderType('RETAIL')}
          style={{
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 8,
            backgroundColor: orderType === 'RETAIL' ? '#9333ea' : '#e5e7eb',
          }}
        >
          <Text style={{
            color: orderType === 'RETAIL' ? '#fff' : '#000',
            fontWeight: 'bold',
          }}>🛍️ تجزئة</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setOrderType('WHOLESALE')}
          style={{
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 8,
            backgroundColor: orderType === 'WHOLESALE' ? '#9333ea' : '#e5e7eb',
          }}
        >
          <Text style={{
            color: orderType === 'WHOLESALE' ? '#fff' : '#000',
            fontWeight: 'bold',
          }}>📦 جملة</Text>
        </TouchableOpacity>
      </View>

      {/* Features */}
      <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
        <Text style={{
          fontSize: 20,
          fontWeight: 'bold',
          marginBottom: 15,
        }}>مميزاتنا</Text>
        {[
          { icon: '🚚', title: 'شحن سريع', desc: 'توصيل سريع وآمن' },
          { icon: '💳', title: 'دفع آمن', desc: 'جميع وسائل الدفع' },
          { icon: '⭐', title: 'منتجات موثوقة', desc: 'أفضل العلامات التجارية' },
        ].map((feature, idx) => (
          <View key={idx} style={{
            backgroundColor: '#f3f4f6',
            padding: 15,
            borderRadius: 8,
            marginBottom: 10,
          }}>
            <Text style={{ fontSize: 24, marginBottom: 5 }}>{feature.icon}</Text>
            <Text style={{ fontWeight: 'bold', marginBottom: 3 }}>{feature.title}</Text>
            <Text style={{ color: '#666' }}>{feature.desc}</Text>
          </View>
        ))}
      </View>

      {/* CTA Buttons */}
      <View style={{ paddingHorizontal: 20, marginBottom: 30 }}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Shop')}
          style={{
            backgroundColor: '#9333ea',
            padding: 15,
            borderRadius: 8,
            alignItems: 'center',
            marginBottom: 10,
          }}
        >
          <Text style={{
            color: '#fff',
            fontWeight: 'bold',
            fontSize: 16,
          }}>متابعة التسوق</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
