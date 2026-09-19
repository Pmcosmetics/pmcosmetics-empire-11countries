import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useSelector } from 'react-redux';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export default function CartScreen({ navigation }: any) {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const token = useSelector((state: any) => state.auth.token);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(response.data);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await axios.delete(`${API_URL}/api/cart/items/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCart();
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const calculateTotal = () => {
    return (cart?.items || []).reduce((sum: number, item: any) => {
      return sum + (item.price * item.quantity);
    }, 0);
  };

  if (loading) {
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

  if (!cart?.items || cart.items.length === 0) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
      }}>
        <Text style={{ fontSize: 40, marginBottom: 10 }}>🛒</Text>
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 20 }}>سلتك فارغة</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Shop')}
          style={{
            backgroundColor: '#9333ea',
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>ابدأ التسوق</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <View style={{
        backgroundColor: '#9333ea',
        padding: 20,
        paddingTop: 40,
      }}>
        <Text style={{
          fontSize: 24,
          fontWeight: 'bold',
          color: '#fff',
        }}>🛒 السلة</Text>
      </View>

      {/* Items List */}
      <FlatList
        data={cart.items}
        renderItem={({ item }) => (
          <View style={{
            backgroundColor: '#fff',
            marginHorizontal: 15,
            marginVertical: 8,
            borderRadius: 8,
            padding: 12,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>
                {item.product.name}
              </Text>
              <Text style={{ color: '#666' }}>الكمية: {item.quantity}</Text>
              <Text style={{ fontWeight: 'bold', color: '#9333ea' }}>
                {item.price * item.quantity} ريال
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handleRemoveItem(item.id)}
              style={{
                backgroundColor: '#fee2e2',
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 6,
              }}
            >
              <Text style={{ color: '#dc2626' }}>حذف</Text>
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      {/* Total & Checkout */}
      <View style={{
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        padding: 20,
      }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 15,
        }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold' }}>المجموع:</Text>
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: '#9333ea',
          }}>{calculateTotal()} ريال</Text>
        </View>
        <TouchableOpacity
          style={{
            backgroundColor: '#9333ea',
            paddingVertical: 15,
            borderRadius: 8,
            alignItems: 'center',
          }}
        >
          <Text style={{
            color: '#fff',
            fontWeight: 'bold',
            fontSize: 16,
          }}>متابعة الدفع</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
