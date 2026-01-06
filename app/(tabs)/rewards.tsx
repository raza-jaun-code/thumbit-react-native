import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Gift, Star } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/constants/theme';
import { useUser } from '@/contexts/UserContext';
import { PRODUCTS } from '@/mocks/products';
import CustomAlert from '@/components/CustomAlert';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - SPACING.lg * 3) / 2;

export default function RewardsScreen() {
  const { user, redeemProduct } = useUser();
  const [alert, setAlert] = useState<{ visible: boolean; type: 'success' | 'error' | 'warning' | 'info'; title: string; message: string }>({
    visible: false,
    type: 'info',
    title: '',
    message: '',
  });

  const handleRedeem = async (product: typeof PRODUCTS[0]) => {
    if (!user) return;

    if (user.rewardPoints < product.pointsRequired) {
      setAlert({
        visible: true,
        type: 'warning',
        title: 'Insufficient Points',
        message: `You need ${product.pointsRequired - user.rewardPoints} more points to redeem this item`,
      });
      return;
    }

    const success = await redeemProduct(product);
    if (success) {
      setAlert({
        visible: true,
        type: 'success',
        title: 'Redeemed Successfully',
        message: `You have successfully redeemed ${product.name}`,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={[COLORS.background, COLORS.surface]}
        style={styles.gradient}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Rewards</Text>
          </View>

          <View style={styles.pointsCard}>
            <View style={styles.pointsGradient}>
              <View style={styles.pointsIcon}>
                <Star size={24} color={COLORS.text} fill={COLORS.text} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.pointsLabel}>Your Points</Text>
                <Text style={styles.pointsAmount}>{user?.rewardPoints || 0}</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Rewards</Text>
            <View style={styles.productsGrid}>
              {PRODUCTS.map((product) => (
                <View key={product.id} style={styles.productCard}>
                  <Image
                    source={{ uri: product.image }}
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={1}>
                      {product.name}
                    </Text>
                    <Text style={styles.productDescription} numberOfLines={2}>
                      {product.description}
                    </Text>
                    <View style={styles.pointsRequired}>
                      <Gift size={14} color={COLORS.accent} />
                      <Text style={styles.pointsRequiredText}>
                        {product.pointsRequired} pts
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.redeemButton,
                        (user?.rewardPoints || 0) < product.pointsRequired && styles.redeemButtonDisabled
                      ]}
                      onPress={() => handleRedeem(product)}
                      activeOpacity={0.7}
                      disabled={(user?.rewardPoints || 0) < product.pointsRequired}
                    >
                      <Text style={[
                        styles.redeemButtonText,
                        (user?.rewardPoints || 0) < product.pointsRequired && styles.redeemButtonTextDisabled
                      ]}>
                        Redeem
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
      <CustomAlert
        visible={alert.visible}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onClose={() => setAlert({ ...alert, visible: false })}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
  },
  pointsCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  pointsGradient: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.accent,
  },
  pointsIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(10, 10, 15, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pointsLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.background,
    marginBottom: SPACING.xs / 2,
  },
  pointsAmount: {
    ...TYPOGRAPHY.h1,
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.background,
  },
  section: {
    paddingHorizontal: SPACING.lg,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  productCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 140,
    backgroundColor: COLORS.surface,
  },
  productInfo: {
    padding: SPACING.sm,
  },
  productName: {
    ...TYPOGRAPHY.body,
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.xs / 2,
  },
  productDescription: {
    ...TYPOGRAPHY.small,
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    lineHeight: 14,
  },
  pointsRequired: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs / 2,
    marginBottom: SPACING.sm,
  },
  pointsRequiredText: {
    ...TYPOGRAPHY.caption,
    fontSize: 13,
    color: COLORS.accent,
    fontWeight: '600',
  },
  redeemButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
  },
  redeemButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  redeemButtonText: {
    ...TYPOGRAPHY.caption,
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '600',
  },
  redeemButtonTextDisabled: {
    color: COLORS.textMuted,
  },
});
