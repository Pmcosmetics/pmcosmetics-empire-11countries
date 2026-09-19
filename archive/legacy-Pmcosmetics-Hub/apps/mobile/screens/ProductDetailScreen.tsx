import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useSelector } from 'react-redux';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export default function ProductDetailScreen({ route, navigation }: any) {
  const { productId } = route.params;
  const [product, setProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const token = useSelector((state: any) => state.auth.token);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/products/${productId}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Failed to fetch product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!token) {
      navigation.navigate('Login');
      return;
    }

    try {
      await axios.post(
        `${API_URL}/api/cart/items`,
        {
          productId,
          quantity,
          price: product.price,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert('تم إضافة المنتج إلى السلة');
      navigation.goBack();
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('فشل الإضافة إلى السلة');
    }
  };

  if (loading || !product) {
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
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Product Image */}
      <View style={{
        height: 300,
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Text style={{ fontSize: 80 }}>💄</Text>
      </View>

      {/* Product Info */}
      <View style={{ padding: 20 }}>
        <Text style={{
          fontSize: 24,
          fontWeight: 'bold',
          marginBottom: 8,
        }}>{product.name}</Text>

        <Text style={{
          fontSize: 18,
          color: '#666',
          marginBottom: 12,
        }}>{product.nameAr}</Text>

        {/* Price */}
        <Text style={{
          fontSize: 28,
          fontWeight: 'bold',
          color: '#9333ea',
          marginBottom: 12,
        }}>{product.price} ريال</Text>

        {/* Rating */}
        <Text style={{
          fontSize: 14,
          color: '#666',
          marginBottom: 12,
        }}>⭐ {product.rating || 0} ({product.reviewCount || 0} تقييم)</Text>

        {/* Description */}
        <Text style={{
          fontSize: 16,
          lineHeight: 24,
          color: '#666',
          marginBottom: 20,
        }}>{product.description}</Text>

        {/* Stock Status */}
        <Text style={{
          fontSize: 14,
          marginBottom: 20,
          color: product.stock > 0 ? '#10b981' : '#ef4444',
        }}>
          {product.stock > 0 ? `متوفر - ${product.stock} وحدة` : 'غير متوفر'}
        </Text>

        {/* Quantity Selector */}
        {product.stock > 0 && (
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 20,
            gap: 10,
          }}>
            <TouchableOpacity
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#e5e7eb',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 20 }}>−</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{quantity}</Text>
            <TouchableOpacity
              onPress={() => setQuantity(Math.min(product.stock, quantity + 1))}
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#e5e7eb',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 20 }}>+</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Add to Cart Button */}
        {product.stock > 0 && (
          <TouchableOpacity
            onPress={handleAddToCart}
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
            }}>🛒 إضافة إلى السلة</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}
