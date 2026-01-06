import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { X, DollarSign } from 'lucide-react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/constants/theme';
import { useUser } from '@/contexts/UserContext';
import FingerprintModal from '@/components/FingerprintModal';
import CustomAlert from '@/components/CustomAlert';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ReceiveMoneyScreen() {
  const router = useRouter();
  const { addTransaction } = useUser();
  
  const [amount, setAmount] = useState<string>('');
  const [showFingerprintModal, setShowFingerprintModal] = useState<boolean>(false);
  const [alert, setAlert] = useState<{ visible: boolean; type: 'success' | 'error' | 'warning' | 'info'; title: string; message: string }>(
{
    visible: false,
    type: 'info',
    title: '',
    message: '',
  });

  const handleReceive = () => {
    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      setAlert({
        visible: true,
        type: 'warning',
        title: 'Invalid Amount',
        message: 'Please enter a valid amount',
      });
      return;
    }

    setShowFingerprintModal(true);
  };

  const handleBiometricAuth = async () => {
    try {
      if (Platform.OS === 'web') {
        await addTransaction({
          type: 'receive',
          amount: parseFloat(amount),
          sender: 'External',
        });
        setShowFingerprintModal(false);
        setAlert({
          visible: true,
          type: 'success',
          title: 'Received Successfully',
          message: `Successfully received $${amount}`,
          onConfirm: () => router.back(),
        } as any);
        return;
      }

      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        setShowFingerprintModal(false);
        setAlert({
          visible: true,
          type: 'warning',
          title: 'Biometric Not Available',
          message: 'Please set up biometric authentication on your device',
        });
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to receive money',
        fallbackLabel: 'Use passcode',
      });

      if (result.success) {
        await addTransaction({
          type: 'receive',
          amount: parseFloat(amount)
        });
        setShowFingerprintModal(false);
        setAlert({
          visible: true,
          type: 'success',
          title: 'Received Successfully',
          message: `Successfully received $${amount}`,
          onConfirm: () => router.back(),
        } as any);
      } else {
        setShowFingerprintModal(false);
        setAlert({
          visible: true,
          type: 'error',
          title: 'Authentication Failed',
          message: 'Biometric authentication was not successful',
        });
      }
    } catch (error) {
      console.error('Receive money error:', error);
      setShowFingerprintModal(false);
      setAlert({
        visible: true,
        type: 'error',
        title: 'Error',
        message: 'An error occurred during the transaction',
      });
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.background, COLORS.surface]}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Receive Money</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => router.back()}
              >
                <X size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoText}>
                Enter the amount to receive money securely
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <DollarSign size={20} color={COLORS.textSecondary} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Amount"
                  placeholderTextColor={COLORS.textMuted}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                />
              </View>

              <TouchableOpacity
                style={styles.receiveButton}
                onPress={handleReceive}
                activeOpacity={0.8}
              >
                <View style={styles.buttonGradient}>
                  <Text style={styles.buttonText}>Receive Money</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <FingerprintModal
        visible={showFingerprintModal}
        onClose={() => setShowFingerprintModal(false)}
        onAuthenticate={handleBiometricAuth}
        title="Confirm Receipt"
        subtitle="Verify your identity to complete the transaction"
      />

      <CustomAlert
        visible={alert.visible}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onClose={() => setAlert({ ...alert, visible: false })}
        onConfirm={(alert as any).onConfirm}
      />
    </View>
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
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCard: {
    backgroundColor: 'rgba(0, 217, 165, 0.15)',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(0, 217, 165, 0.3)',
  },
  infoText: {
    ...TYPOGRAPHY.body,
    color: COLORS.success,
    textAlign: 'center',
  },
  form: {
    gap: SPACING.lg,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    paddingVertical: SPACING.md,
  },
  receiveButton: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    marginTop: SPACING.md,
  },
  buttonGradient: {
    paddingVertical: SPACING.md + 2,
    alignItems: 'center',
    backgroundColor: COLORS.success,
  },
  buttonText: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
  },
});