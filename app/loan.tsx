import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { X, DollarSign, Calendar, FileText } from 'lucide-react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/constants/theme';
import FingerprintModal from '@/components/FingerprintModal';
import CustomAlert from '@/components/CustomAlert';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '@/contexts/UserContext';

export default function LoanRequestScreen() {
  const router = useRouter();
  const { submitLoanRequest } = useUser(); // ✅ use your existing UserContext method

  const [formData, setFormData] = useState({
    amount: '',
    duration: '',
    purpose: '',
  });
  const [showFingerprintModal, setShowFingerprintModal] = useState(false);
  const [alert, setAlert] = useState({
    visible: false,
    type: 'info' as 'success' | 'error' | 'warning' | 'info',
    title: '',
    message: '',
    onConfirm: undefined as (() => void) | undefined,
  });

  // 🔹 Basic validation
  const handleSubmit = () => {
    const amountNum = parseFloat(formData.amount);
    const durationNum = parseInt(formData.duration);

    if (!formData.amount || isNaN(amountNum) || amountNum <= 0) {
      return showAlert('warning', 'Invalid Amount', 'Please enter a valid loan amount.');
    }

    if (!formData.duration || isNaN(durationNum) || durationNum <= 0) {
      return showAlert('warning', 'Invalid Duration', 'Please enter a valid loan duration (in months).');
    }

    if (!formData.purpose.trim()) {
      return showAlert('warning', 'Purpose Required', 'Please enter the purpose of your loan.');
    }

    setShowFingerprintModal(true);
  };

  // 🔹 Helper to simplify showing alerts
  const showAlert = (
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message: string,
    onConfirm?: () => void
  ) => {
    setAlert({
      visible: true,
      type,
      title,
      message,
      onConfirm,
    });
  };

  // 🔹 Run biometric auth, then call submitLoanRequest
  const handleBiometricAuth = async () => {
    try {
      if (Platform.OS === 'web') {
        await handleLoanSubmit();
        return;
      }

      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        setShowFingerprintModal(false);
        return showAlert(
          'warning',
          'Biometric Not Available',
          'Please set up biometric authentication on your device.'
        );
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to submit loan request',
        fallbackLabel: 'Use passcode',
      });

      if (result.success) {
        await handleLoanSubmit();
      } else {
        setShowFingerprintModal(false);
        showAlert('error', 'Authentication Failed', 'Biometric authentication was not successful.');
      }
    } catch (error) {
      console.error('Loan request error:', error);
      setShowFingerprintModal(false);
      showAlert('error', 'Error', 'An error occurred while submitting your request.');
    }
  };

  // 🔹 Submits the loan request through your UserContext function
  const handleLoanSubmit = async () => {
    setShowFingerprintModal(false);

    const success = await submitLoanRequest({
      amount: parseFloat(formData.amount),
      duration: parseInt(formData.duration),
      purpose: formData.purpose,
    });

    if (success) {
      showAlert(
        'success',
        'Loan Request Submitted',
        'Your loan request has been submitted successfully and an email confirmation has been sent.',
        () => router.back()
      );
    } else {
      showAlert('error', 'Error', 'Failed to submit loan request. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[COLORS.background, COLORS.surface]} style={styles.gradient}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Loan Request</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
                <X size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>Quick Loan Application</Text>
                <Text style={styles.infoText}>
                  Apply for a personal loan with competitive rates and flexible repayment options.
                </Text>
              </View>

              <View style={styles.form}>
                <InputField
                  icon={<DollarSign size={20} color={COLORS.textSecondary} />}
                  placeholder="Loan Amount"
                  value={formData.amount}
                  onChangeText={(text : string) => setFormData({ ...formData, amount: text })}
                  keyboardType="decimal-pad"
                />

                <InputField
                  icon={<Calendar size={20} color={COLORS.textSecondary} />}
                  placeholder="Duration (months)"
                  value={formData.duration}
                  onChangeText={(text : string) => setFormData({ ...formData, duration: text })}
                  keyboardType="number-pad"
                />

                <InputField
                  icon={<FileText size={20} color={COLORS.textSecondary} />}
                  placeholder="Purpose of Loan"
                  value={formData.purpose}
                  onChangeText={(text : string) => setFormData({ ...formData, purpose: text })}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  isTextArea
                />

                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} activeOpacity={0.8}>
                  <LinearGradient
                    colors={[COLORS.accent, COLORS.warning]}
                    style={styles.buttonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.buttonText}>Submit Request</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <FingerprintModal
        visible={showFingerprintModal}
        onClose={() => setShowFingerprintModal(false)}
        onAuthenticate={handleBiometricAuth}
        title="Confirm Loan Request"
        subtitle="Verify your identity to submit the loan application"
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

// 💡 Input component for neat reuse
const InputField = ({
  icon,
  isTextArea,
  ...props
}: {
  icon: React.ReactNode;
  isTextArea?: boolean;
  [key: string]: any;
}) => (
  <View style={[styles.inputContainer, isTextArea && styles.textAreaContainer]}>
    <View style={styles.inputIcon}>{icon}</View>
    <TextInput
      style={[styles.input, isTextArea && styles.textArea]}
      placeholderTextColor={COLORS.textMuted}
      {...props}
    />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  content: { flex: 1, padding: SPACING.xl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  title: { ...TYPOGRAPHY.h2, color: COLORS.text },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: { flex: 1 },
  infoCard: { backgroundColor: COLORS.surfaceLight, padding: SPACING.lg, borderRadius: RADIUS.md, marginBottom: SPACING.lg },
  infoTitle: { ...TYPOGRAPHY.h4, color: COLORS.text, marginBottom: SPACING.xs },
  infoText: { ...TYPOGRAPHY.body, color: COLORS.textSecondary },
  form: { gap: SPACING.lg },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textAreaContainer: { alignItems: 'flex-start', paddingVertical: SPACING.md },
  inputIcon: { marginRight: SPACING.sm },
  input: { flex: 1, ...TYPOGRAPHY.body, color: COLORS.text, paddingVertical: SPACING.md },
  textArea: { minHeight: 100 },
  submitButton: { borderRadius: RADIUS.md, overflow: 'hidden', marginTop: SPACING.md },
  buttonGradient: { paddingVertical: SPACING.md + 2, alignItems: 'center' },
  buttonText: { ...TYPOGRAPHY.h4, color: COLORS.text },
});