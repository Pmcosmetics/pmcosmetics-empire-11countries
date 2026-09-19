import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useSelector } from 'react-redux';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export default function OrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = useSelector((state: any) => state.auth.token);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
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

  if (orders.length === 0) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Text style={{ fontSize: 40, marginBottom: 10 }}>📦</Text>
        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>لا توجد طلبات حتى الآن</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <FlatList
        data={orders}
        renderItem={({ item }) => (
          <View style={{
            backgroundColor: '#fff',
            marginHorizontal: 15,
            marginVertical: 8,
            borderRadius: 8,
            padding: 12,
          }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>{item.orderNumber}</Text>
            <Text style={{ color: '#666', marginBottom: 4 }}>التاريخ: {new Date(item.createdAt).toLocaleDateString('ar-SA')}</Text>
            <Text style={{ marginBottom: 4 }}>المبلغ: <Text style={{ fontWeight: 'bold', color: '#9333ea' }}>{item.total} ريال</Text></Text>
            <Text style={{
              marginBottom: 8,
              paddingHorizontal: 8,
              paddingVertical: 4,
              backgroundColor: item.status === 'DELIVERED' ? '#dcfce7' : '#fef3c7',
              color: item.status === 'DELIVERED' ? '#166534' : '#92400e',
              borderRadius: 4,
              overflow: 'hidden',
              alignSelf: 'flex-start',
            }}>
              {item.status}
            </Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 20 }}
      />
    </View>
  );
}
