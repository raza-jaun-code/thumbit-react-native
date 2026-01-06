import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, Modal, Animated, TouchableOpacity } from 'react-native';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface CustomAlertProps {
  visible: boolean;
  type: AlertType;
  title: string;
  message: string;
  onClose: () => void;
  confirmText?: string;
  onConfirm?: () => void;
}

export default function CustomAlert({
  visible,
  type,
  title,
  message,
  onClose,
  confirmText = 'OK',
  onConfirm,
}: CustomAlertProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
    }
  }, [visible, scaleAnim, fadeAnim]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={48} color={COLORS.success} strokeWidth={2} />;
      case 'error':
        return <XCircle size={48} color={COLORS.error} strokeWidth={2} />;
      case 'warning':
        return <AlertCircle size={48} color={COLORS.warning} strokeWidth={2} />;
      case 'info':
        return <Info size={48} color={COLORS.secondary} strokeWidth={2} />;
    }
  };

  const getGradientColors = (): [string, string] => {
    switch (type) {
      case 'success':
        return ['rgba(0, 217, 165, 0.1)', 'rgba(0, 217, 165, 0.05)'];
      case 'error':
        return ['rgba(255, 71, 87, 0.1)', 'rgba(255, 71, 87, 0.05)'];
      case 'warning':
        return ['rgba(255, 165, 2, 0.1)', 'rgba(255, 165, 2, 0.05)'];
      case 'info':
        return ['rgba(74, 144, 255, 0.1)', 'rgba(74, 144, 255, 0.05)'];
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={[COLORS.surface, COLORS.surfaceLight]}
            style={styles.gradient}
          >
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>

            <LinearGradient
              colors={getGradientColors()}
              style={styles.iconContainer}
            >
              {getIcon()}
            </LinearGradient>

            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirm}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.buttonText}>{confirmText}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 360,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
  },
  gradient: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    zIndex: 10,
    padding: SPACING.sm,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  message: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
    textAlign: 'center',
    lineHeight: 22,
  },
  confirmButton: {
    width: '100%',
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  buttonText: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
  },
});
