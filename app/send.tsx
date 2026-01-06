import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { X, User as UserIcon, DollarSign } from 'lucide-react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/constants/theme';
import { useUser } from '@/contexts/UserContext';
import FingerprintModal from '@/components/FingerprintModal';
import CustomAlert from '@/components/CustomAlert';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SendMoneyScreen() {
  const router = useRouter();
  const { user, addTransaction } = useUser();

  const [recipient, setRecipient] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [showFingerprintModal, setShowFingerprintModal] = useState<boolean>(false);
  const [alert, setAlert] = useState<{
    visible: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({
    visible: false,
    type: 'info',
    title: '',
    message: '',
  });

  // 🔹 Validate fields before triggering fingerprint
  const handleSend = () => {
    if (!recipient.trim()) {
      setAlert({
        visible: true,
        type: 'warning',
        title: 'Recipient Required',
        message: 'Please enter recipient name',
      });
      return;
    }

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

    if (amountNum > (user?.balance || 0)) {
      setAlert({
        visible: true,
        type: 'error',
        title: 'Insufficient Balance',
        message: 'You do not have enough balance for this transaction',
      });
      return;
    }

    setShowFingerprintModal(true);
  };

  // 🔹 Perform the actual send after biometric success
  const performSend = async () => {
    const success = await addTransaction({
      type: 'send',
      amount: parseFloat(amount),
      recipient,
    });

    setShowFingerprintModal(false);

    if (success) {
      setAlert({
        visible: true,
        type: 'success',
        title: 'Transfer Successful',
        message: `Successfully sent $${amount} to ${recipient}`,
        onConfirm: () => router.back(),
      });
    } else {
      setAlert({
        visible: true,
        type: 'error',
        title: 'Transaction Failed',
        message: 'Recipient not found or insufficient balance.',
      });
    }
  };

  // 🔹 Handle biometric authentication
  const handleBiometricAuth = async () => {
    try {
      if (Platform.OS === 'web') {
        await performSend();
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
        promptMessage: 'Authenticate to send money',
        fallbackLabel: 'Use passcode',
      });

      if (result.success) {
        await performSend();
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
      console.error('Send money error:', error);
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
      <LinearGradient colors={[COLORS.background, COLORS.surface]} style={styles.gradient}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Send Money</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
                <X size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>Available Balance</Text>
              <Text style={styles.balanceAmount}>
                ${(user?.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <UserIcon size={20} color={COLORS.textSecondary} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Recipient Name"
                  placeholderTextColor={COLORS.textMuted}
                  value={recipient}
                  onChangeText={setRecipient}
                  autoCapitalize="words"
                />
              </View>

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

              <TouchableOpacity style={styles.sendButton} onPress={handleSend} activeOpacity={0.8}>
                <LinearGradient
                  colors={[COLORS.primary, COLORS.primaryDark]}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.buttonText}>Send Money</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <FingerprintModal
        visible={showFingerprintModal}
        onClose={() => setShowFingerprintModal(false)}
        onAuthenticate={handleBiometricAuth}
        title="Confirm Transfer"
        subtitle="Verify your identity to complete the transaction"
      />

      <CustomAlert
        visible={alert.visible}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onClose={() => setAlert({ ...alert, visible: false })}
        onConfirm={alert.onConfirm}
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
  balanceCard: {
    backgroundColor: COLORS.surfaceLight,
    padding: SPACING.lg,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.xl,
  },
  balanceLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  balanceAmount: {
    ...TYPOGRAPHY.h1,
    fontSize: 32,
    color: COLORS.text,
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
  sendButton: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    marginTop: SPACING.md,
  },
  buttonGradient: {
    paddingVertical: SPACING.md + 2,
    alignItems: 'center',
  },
  buttonText: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
  },
});