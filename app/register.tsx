import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Animated, ScrollView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowLeft, User as UserIcon, Mail, Phone, Lock } from 'lucide-react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/constants/theme';
import { useUser } from '@/contexts/UserContext';
import FingerprintModal from '@/components/FingerprintModal';
import CustomAlert from '@/components/CustomAlert';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useUser();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showFingerprintModal, setShowFingerprintModal] = useState<boolean>(false);
  const [alert, setAlert] = useState<{ visible: boolean; type: 'success' | 'error' | 'warning' | 'info'; title: string; message: string }>({
    visible: false,
    type: 'info',
    title: '',
    message: '',
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const validateForm = () => {
    if (!formData.name.trim()) {
      setAlert({
        visible: true,
        type: 'warning',
        title: 'Name Required',
        message: 'Please enter your full name',
      });
      return false;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      setAlert({
        visible: true,
        type: 'warning',
        title: 'Invalid Email',
        message: 'Please enter a valid email address',
      });
      return false;
    }

    if (!formData.phone.trim() || formData.phone.length < 10) {
      setAlert({
        visible: true,
        type: 'warning',
        title: 'Invalid Phone',
        message: 'Please enter a valid phone number',
      });
      return false;
    }

    if (!formData.password || formData.password.length < 6) {
      setAlert({
        visible: true,
        type: 'warning',
        title: 'Weak Password',
        message: 'Password must be at least 6 characters long',
      });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setAlert({
        visible: true,
        type: 'error',
        title: 'Password Mismatch',
        message: 'Passwords do not match',
      });
      return false;
    }

    return true;
  };

  const handleRegister = () => {
    if (!validateForm()) return;
    setShowFingerprintModal(true);
  };

  const handleBiometricAuth = async () => {
    try {
      if (Platform.OS === 'web') {
        await register({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        });
        setShowFingerprintModal(false);
        setAlert({
          visible: true,
          type: 'success',
          title: 'Registration Successful',
          message: 'Your account has been created successfully',
          onConfirm: () => router.replace('/login'),
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
        promptMessage: 'Verify your identity',
        fallbackLabel: 'Use passcode',
      });

      if (result.success) {
        await register({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        });
        setShowFingerprintModal(false);
        setAlert({
          visible: true,
          type: 'success',
          title: 'Registration Successful',
          message: 'Your account has been created successfully',
          onConfirm: () => router.replace('/login'),
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
      console.error('Registration error:', error);
      setShowFingerprintModal(false);
      setAlert({
        visible: true,
        type: 'error',
        title: 'Error',
        message: 'An error occurred during registration',
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
          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color={COLORS.text} />
            </TouchableOpacity>

            <View style={styles.header}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Join us today</Text>
            </View>

            <ScrollView
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <View style={styles.inputIcon}>
                    <UserIcon size={20} color={COLORS.textSecondary} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    placeholderTextColor={COLORS.textMuted}
                    value={formData.name}
                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                    autoCapitalize="words"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <View style={styles.inputIcon}>
                    <Mail size={20} color={COLORS.textSecondary} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Email Address"
                    placeholderTextColor={COLORS.textMuted}
                    value={formData.email}
                    onChangeText={(text) => setFormData({ ...formData, email: text })}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <View style={styles.inputIcon}>
                    <Phone size={20} color={COLORS.textSecondary} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Phone Number"
                    placeholderTextColor={COLORS.textMuted}
                    value={formData.phone}
                    onChangeText={(text) => setFormData({ ...formData, phone: text })}
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <View style={styles.inputIcon}>
                    <Lock size={20} color={COLORS.textSecondary} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor={COLORS.textMuted}
                    value={formData.password}
                    onChangeText={(text) => setFormData({ ...formData, password: text })}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <View style={styles.inputIcon}>
                    <Lock size={20} color={COLORS.textSecondary} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    placeholderTextColor={COLORS.textMuted}
                    value={formData.confirmPassword}
                    onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>

                <TouchableOpacity
                  style={styles.registerButton}
                  onPress={handleRegister}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[COLORS.primary, COLORS.primaryDark]}
                    style={styles.buttonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.buttonText}>Register with Fingerprint</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <View style={styles.loginContainer}>
                  <Text style={styles.loginText}>Already have an account? </Text>
                  <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.loginLink}>Login</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>

      <FingerprintModal
        visible={showFingerprintModal}
        onClose={() => setShowFingerprintModal(false)}
        onAuthenticate={handleBiometricAuth}
        title="Verify Identity"
        subtitle="Scan your fingerprint to complete registration"
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  form: {
    gap: SPACING.md,
    paddingBottom: SPACING.xl,
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
  registerButton: {
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  loginText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  loginLink: {
    ...TYPOGRAPHY.body,
    color: COLORS.primary,
    fontWeight: '600',
  },
});
