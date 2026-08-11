import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, FlatList, TouchableOpacity, Image } from 'react-native';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export default function ShopScreen({ navigation }: any) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderType, setOrderType] = useState<'RETAIL' | 'WHOLESALE'>('RETAIL');

  useEffect(() => {
    fetchProducts();
  }, [orderType]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/products`, {
        params: { type: orderType, limit: 20 },
      });
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderProduct = ({ item }: any) => {
    const displayPrice =
      orderType === 'WHOLESALE' ? item.wholesalePrice || item.price : item.price;

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
        style={{
          backgroundColor: '#fff',
          borderRadius: 8,
          marginBottom: 15,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: '#e5e7eb',
        }}
      >
        {/* Image */}
        <View style={{
          height: 150,
          backgroundColor: '#f3f4f6',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          {item.images?.[0] ? (
            <Image
              source={{ uri: item.images[0].url }}
              style={{ width: '100%', height: '100%' }}
            />
          ) : (
            <Text style={{ fontSize: 40 }}>💄</Text>
          )}
        </View>

        {/* Info */}
        <View style={{ padding: 12 }}>
          <Text style={{
            fontWeight: 'bold',
            fontSize: 14,
            marginBottom: 4,
          }}>{item.name}</Text>

          <Text style={{
            color: '#9333ea',
            fontWeight: 'bold',
            fontSize: 16,
            marginBottom: 8,
          }}>{displayPrice} ريال</Text>

          <Text style={{
            fontSize: 12,
            color: item.stock > 0 ? '#10b981' : '#ef4444',
          }}>
            {item.stock > 0 ? `متوفر (${item.stock})` : 'غير متوفر'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

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
          marginBottom: 15,
        }}>المتجر</Text>

        {/* Order Type Toggle */}
        <View style={{
          flexDirection: 'row',
          gap: 10,
        }}>
          <TouchableOpacity
            onPress={() => setOrderType('RETAIL')}
            style={{
              flex: 1,
              paddingVertical: 8,
              borderRadius: 6,
              backgroundColor: orderType === 'RETAIL' ? '#fff' : 'rgba(255,255,255,0.2)',
            }}
          >
            <Text style={{
              color: orderType === 'RETAIL' ? '#9333ea' : '#fff',
              fontWeight: 'bold',
              textAlign: 'center',
            }}>🛍️ تجزئة</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setOrderType('WHOLESALE')}
            style={{
              flex: 1,
              paddingVertical: 8,
              borderRadius: 6,
              backgroundColor: orderType === 'WHOLESALE' ? '#fff' : 'rgba(255,255,255,0.2)',
            }}
          >
            <Text style={{
              color: orderType === 'WHOLESALE' ? '#9333ea' : '#fff',
              fontWeight: 'bold',
              textAlign: 'center',
            }}>📦 جملة</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Products List */}
      {loading ? (
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Text>جاري التحميل...</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 15 }}
          numColumns={2}
          columnWrapperStyle={{ gap: 10 }}
        />
      )}
    </View>
  );
}
