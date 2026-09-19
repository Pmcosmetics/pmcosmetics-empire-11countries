import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import axios from 'axios';
import { useSelector } from 'react-redux';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export default function WishlistScreen() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = useSelector((state: any) => state.auth.token);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWishlist(response.data);
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      await axios.delete(`${API_URL}/api/wishlist/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchWishlist();
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
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

  if (wishlist.length === 0) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Text style={{ fontSize: 40, marginBottom: 10 }}>❤️</Text>
        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>قائمة المفضلة فارغة</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <FlatList
        data={wishlist}
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
              <Text style={{ color: '#9333ea', fontWeight: 'bold', marginBottom: 4 }}>
                {item.product.price} ريال
              </Text>
              <Text style={{ color: '#666', fontSize: 12 }}>
                {item.product.stock > 0 ? 'متوفر' : 'غير متوفر'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handleRemoveFromWishlist(item.product.id)}
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
        contentContainerStyle={{ paddingVertical: 20 }}
      />
    </View>
  );
}
