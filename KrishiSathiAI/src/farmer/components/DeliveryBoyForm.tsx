
import React, { useState } from 'react';

import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';

import useDeliveryBoyEligibility from '../hooks/useDeliveryBoyEligibility';

import {
  registerDeliveryBoy,
  type DeliveryBoyRegisterRequest,
} from '../services/deliveryBoyService';

type IconName = React.ComponentProps<
  typeof MaterialCommunityIcons
>['name'];

const FOREST = '#14532D';
const LEAF = '#2E7D32';
const AMBER = '#F5A623';
const MUTED = '#5E7365';
const INK = '#1F2A24';
const ERROR = '#C62828';
const SOFT_GREEN = '#E6F4E6';
const SOFT_AMBER = '#FFF4DB';

const cardShadow = {
  shadowColor: '#000',
  shadowOpacity: 0.05,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
} as const;

type VehicleType =
  | 'BICYCLE'
  | 'BIKE'
  | 'SCOOTER'
  | 'AUTO'
  | 'PICKUP';

const VEHICLES: {
  id: VehicleType;
  label: string;
  icon: IconName;
}[] = [
    { id: 'BICYCLE', label: 'Bicycle', icon: 'bicycle' },
    { id: 'BIKE', label: 'Bike', icon: 'motorbike' },
    { id: 'SCOOTER', label: 'Scooter', icon: 'moped' },
    { id: 'AUTO', label: 'Auto', icon: 'rickshaw' },
    { id: 'PICKUP', label: 'Pickup', icon: 'truck' },
  ];

type FormState = {
  city: string;
  address: string;
  pincode: string;
  vehicleType: VehicleType | '';
  password: string;
  confirmPassword: string;
};

type Errors = Partial<Record<keyof FormState, string>>;

const INITIAL: FormState = {
  city: '',
  address: '',
  pincode: '',
  vehicleType: '',
  password: '',
  confirmPassword: '',
};

type Props = {
  onBack: () => void;
  onSuccess?: () => void;
};

// ==================== FIELD ====================

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  keyboardType,
  maxLength,
  multiline,
  autoCapitalize,
  rightIcon,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  error?: string;
  keyboardType?: 'default' | 'number-pad';
  maxLength?: number;
  multiline?: boolean;
  autoCapitalize?: 'none' | 'words' | 'characters' | 'sentences';
  rightIcon?: IconName;
}) {
  return (
    <View className="mb-4">
      <Text
        className="mb-1.5 text-[13px] font-bold"
        style={{ color: INK }}
      >
        {label}
      </Text>

      <View
        className="flex-row items-center rounded-2xl bg-white px-4"
        style={{
          minHeight: multiline ? 84 : 48,
          borderWidth: 1.5,
          borderColor: error ? ERROR : '#DDE8DD',
        }}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={MUTED}
          keyboardType={keyboardType}
          maxLength={maxLength}
          multiline={multiline}
          autoCapitalize={autoCapitalize}
          accessibilityLabel={label}
          className="flex-1 text-[14px]"
          style={{
            color: INK,
            paddingTop: multiline ? 12 : 0,
            paddingBottom: multiline ? 12 : 0,
            minHeight: multiline ? 84 : 48,
            textAlignVertical: multiline ? 'top' : 'center',
          }}
        />

        {rightIcon ? (
          <MaterialCommunityIcons
            name={rightIcon}
            size={22}
            color={LEAF}
          />
        ) : null}
      </View>

      {error ? (
        <Text
          className="mt-1 text-[12px]"
          style={{ color: ERROR }}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}

// ==================== PASSWORD FIELD ====================

function PasswordField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  error?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <View className="mb-4">
      <Text
        className="mb-1.5 text-[13px] font-bold"
        style={{ color: INK }}
      >
        {label}
      </Text>

      <View
        className="h-12 flex-row items-center rounded-2xl bg-white px-4"
        style={{
          borderWidth: 1.5,
          borderColor: error ? ERROR : '#DDE8DD',
        }}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={MUTED}
          secureTextEntry={!visible}
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="newPassword"
          accessibilityLabel={label}
          className="flex-1 text-[14px]"
          style={{ color: INK }}
        />

        <TouchableOpacity
          onPress={() => setVisible((v) => !v)}
          hitSlop={{
            top: 10,
            bottom: 10,
            left: 10,
            right: 10,
          }}
          accessibilityRole="button"
          accessibilityLabel={
            visible ? 'Hide password' : 'Show password'
          }
        >
          <MaterialCommunityIcons
            name={visible ? 'eye-off-outline' : 'eye-outline'}
            size={22}
            color={MUTED}
          />
        </TouchableOpacity>
      </View>

      {error ? (
        <Text
          className="mt-1 text-[12px]"
          style={{ color: ERROR }}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}

// ==================== MAIN FORM ====================

export default function DeliveryBoyForm({
  onBack,
  onSuccess,
}: Props) {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const {
    status,
    checkedCity,
    error: eligibilityError,
    verifyCity,
    resetVerification,
  } = useDeliveryBoyEligibility();

  const set = <K extends keyof FormState>(
    key: K,
    value: FormState[K]
  ) => {
    setForm((f) => ({ ...f, [key]: value }));

    if (errors[key]) {
      setErrors((e) => ({ ...e, [key]: undefined }));
    }

    setSubmitError('');
  };

  // Reset verification when farmer changes city
  const onCityChange = (t: string) => {
    set('city', t);
    resetVerification();
  };

  // ==================== CHECK ELIGIBILITY ====================

  const handleVerify = async () => {
    setErrors((e) => ({ ...e, city: undefined }));
    await verifyCity(form.city);
  };

  // ==================== VALIDATION ====================

  const validate = (): boolean => {
    const e: Errors = {};

    if (form.address.trim().length < 8) {
      e.address = 'Enter your full address';
    }

    if (!/^\d{6}$/.test(form.pincode)) {
      e.pincode = 'Enter a 6-digit pincode';
    }

    if (!form.vehicleType) {
      e.vehicleType = 'Choose your vehicle';
    }

    if (
      form.password.length < 8 ||
      !/[A-Za-z]/.test(form.password) ||
      !/\d/.test(form.password)
    ) {
      e.password =
        'Use at least 8 characters with a letter and a number';
    }

    if (form.confirmPassword !== form.password) {
      e.confirmPassword = 'Passwords do not match';
    }

    setErrors(e);

    return Object.keys(e).length === 0;
  };

  // ==================== REGISTER DELIVERY BOY ====================

  const handleSubmit = async () => {
    if (submitting) return;

    // Ensure city has been verified
    if (
      status !== 'available' ||
      form.city.trim() !== checkedCity
    ) {
      setSubmitError('Please verify your city before registering.');
      return;
    }

    if (!validate()) return;

    setSubmitting(true);
    setSubmitError('');

    try {
      const payload: DeliveryBoyRegisterRequest = {
        city: checkedCity,
        address: form.address.trim(),
        pincode: form.pincode.trim(),
        vehicleType: form.vehicleType,
        password: form.password,
      };

      // Call backend registration API
      const response = await registerDeliveryBoy(payload);

      console.log('DELIVERY BOY REGISTRATION SUCCESS:', response);

      if (response.success) {
        setSubmitted(true);
      } else {
        setSubmitError(
          response.message || 'Registration failed. Please try again.'
        );
      }
    } catch (err: any) {
      console.log('DELIVERY BOY REGISTRATION FAILED:', err);

      const responseData = err?.response?.data;

      const message =
        typeof responseData === 'string'
          ? responseData
          : responseData?.message ||
          'Registration failed. Please check your connection and try again.';

      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const finish = () => {
    onSuccess ? onSuccess() : onBack();
  };

  // ==================== SUCCESS VIEW ====================

  if (submitted) {
    return (
      <View className="flex-1 items-center justify-center px-8">
        <View
          className="h-24 w-24 items-center justify-center rounded-full"
          style={{ backgroundColor: LEAF }}
        >
          <MaterialCommunityIcons
            name="check"
            size={52}
            color="#FFFFFF"
          />
        </View>

        <Text
          className="mt-6 text-center text-[22px] font-extrabold"
          style={{ color: INK }}
        >
          Registration successful
        </Text>

        <Text
          className="mt-2 text-center text-[14px]"
          style={{ color: MUTED }}
        >
          You are now registered as a delivery boy with Krishi Sathi AI.
        </Text>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={finish}
          className="mt-8 w-full items-center rounded-full py-3.5"
          style={{ backgroundColor: AMBER }}
          accessibilityRole="button"
          accessibilityLabel="Back to shop"
        >
          <Text
            className="text-[15px] font-extrabold"
            style={{ color: INK }}
          >
            Back to shop
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ==================== FORM VIEW ====================

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View className="flex-row items-center px-4 pb-2 pt-3">
        <TouchableOpacity
          onPress={onBack}
          className="h-10 w-10 items-center justify-center rounded-full bg-white"
          style={cardShadow}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={22}
            color={INK}
          />
        </TouchableOpacity>

        <Text
          className="ml-3 text-[18px] font-extrabold"
          style={{ color: INK }}
        >
          Join as a Delivery Boy
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 130,
        }}
      >
        {/* Intro */}
        <View
          className="mb-5 flex-row items-center rounded-3xl p-4"
          style={{ backgroundColor: FOREST }}
        >
          <MaterialCommunityIcons
            name="moped"
            size={34}
            color={AMBER}
          />

          <Text
            className="ml-3 flex-1 text-[13px]"
            style={{ color: '#CFE8D2' }}
          >
            Deliver seeds, fertilizers and tools to farmers near you and earn
            on every order.
          </Text>
        </View>

        {/* Step 1: City */}
        <Field
          label="City or village"
          value={form.city}
          onChangeText={onCityChange}
          placeholder="e.g. Bhubaneswar"
          error={errors.city || eligibilityError}
          autoCapitalize="words"
          rightIcon={
            status === 'available' ? 'check-circle' : undefined
          }
        />

        {/* Verify button */}
        {(status === 'idle' || status === 'checking') && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleVerify}
            disabled={
              status === 'checking' ||
              form.city.trim().length === 0
            }
            className="mb-2 flex-row items-center justify-center rounded-full py-3.5"
            style={{
              backgroundColor: LEAF,
              opacity:
                status === 'checking' ||
                  form.city.trim().length === 0
                  ? 0.55
                  : 1,
            }}
            accessibilityRole="button"
            accessibilityLabel="Verify sellers in your location"
          >
            {status === 'checking' ? (
              <>
                <ActivityIndicator color="#FFFFFF" />
                <Text className="ml-2 text-[15px] font-extrabold text-white">
                  Checking sellers...
                </Text>
              </>
            ) : (
              <>
                <MaterialCommunityIcons
                  name="map-search-outline"
                  size={20}
                  color="#FFFFFF"
                />
                <Text className="ml-2 text-[15px] font-extrabold text-white">
                  Verify sellers in my location
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* No seller available */}
        {status === 'unavailable' && (
          <View
            className="mb-2 rounded-3xl p-5"
            style={{ backgroundColor: SOFT_AMBER }}
          >
            <View className="flex-row items-center">
              <View
                className="h-12 w-12 items-center justify-center rounded-full"
                style={{ backgroundColor: AMBER }}
              >
                <MaterialCommunityIcons
                  name="storefront-outline"
                  size={26}
                  color={INK}
                />
              </View>

              <Text
                className="ml-3 flex-1 text-[16px] font-extrabold"
                style={{ color: INK }}
              >
                No seller available in {checkedCity}
              </Text>
            </View>

            <Text
              className="mt-3 text-[13px]"
              style={{ color: MUTED }}
            >
              You are not eligible to become a delivery boy in this
              location because no seller is available in your city.
            </Text>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={resetVerification}
              className="mt-4 items-center rounded-full py-3"
              style={{ borderWidth: 1.5, borderColor: FOREST }}
              accessibilityRole="button"
              accessibilityLabel="Try a different city"
            >
              <Text
                className="text-[14px] font-extrabold"
                style={{ color: FOREST }}
              >
                Try a different city
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Eligible: Show remaining fields */}
        {status === 'available' && (
          <>
            <View
              className="mb-5 flex-row items-center rounded-2xl p-3"
              style={{ backgroundColor: SOFT_GREEN }}
            >
              <MaterialCommunityIcons
                name="check-decagram"
                size={24}
                color={LEAF}
              />

              <Text
                className="ml-2 flex-1 text-[13px] font-bold"
                style={{ color: FOREST }}
              >
                Sellers are available in {checkedCity}. You are
                eligible! Complete your details below.
              </Text>
            </View>

            {/* Address */}
            <Field
              label="Address"
              value={form.address}
              onChangeText={(t) => set('address', t)}
              placeholder="House no., street, landmark"
              error={errors.address}
              multiline
            />

            {/* Pincode */}
            <Field
              label="Pincode"
              value={form.pincode}
              onChangeText={(t) =>
                set('pincode', t.replace(/\D/g, ''))
              }
              placeholder="6-digit pincode"
              error={errors.pincode}
              keyboardType="number-pad"
              maxLength={6}
            />

            {/* Vehicle */}
            <Text
              className="mb-3 mt-2 text-[13px] font-bold"
              style={{ color: INK }}
            >
              Your vehicle
            </Text>

            <View className="mb-1 flex-row flex-wrap">
              {VEHICLES.map((v) => {
                const active = form.vehicleType === v.id;

                return (
                  <TouchableOpacity
                    key={v.id}
                    activeOpacity={0.85}
                    onPress={() => set('vehicleType', v.id)}
                    className="mb-3 mr-3 flex-row items-center rounded-full px-4 py-2.5"
                    style={{
                      backgroundColor: active ? LEAF : '#FFFFFF',
                      borderWidth: 1.5,
                      borderColor: active ? LEAF : '#DDE8DD',
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={v.label}
                    accessibilityState={{ selected: active }}
                  >
                    <MaterialCommunityIcons
                      name={v.icon}
                      size={20}
                      color={active ? '#FFFFFF' : LEAF}
                    />

                    <Text
                      className="ml-2 text-[13px] font-bold"
                      style={{
                        color: active ? '#FFFFFF' : INK,
                      }}
                    >
                      {v.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {errors.vehicleType ? (
              <Text
                className="mb-3 text-[12px]"
                style={{ color: ERROR }}
              >
                {errors.vehicleType}
              </Text>
            ) : null}

            {/* Password */}
            <Text
              className="mb-3 mt-4 text-[16px] font-extrabold"
              style={{ color: FOREST }}
            >
              Create your login password
            </Text>

            <PasswordField
              label="Password"
              value={form.password}
              onChangeText={(t) => set('password', t)}
              placeholder="At least 8 characters"
              error={errors.password}
            />

            <PasswordField
              label="Confirm password"
              value={form.confirmPassword}
              onChangeText={(t) => set('confirmPassword', t)}
              placeholder="Type the password again"
              error={errors.confirmPassword}
            />

            {/* Registration error */}
            {submitError ? (
              <View
                className="mb-3 rounded-xl p-3"
                style={{ backgroundColor: '#FDECEC' }}
              >
                <Text
                  style={{ color: ERROR, fontSize: 13 }}
                >
                  {submitError}
                </Text>
              </View>
            ) : null}

            {/* Submit */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleSubmit}
              disabled={submitting}
              className="mt-2 items-center rounded-full py-3.5"
              style={{
                backgroundColor: AMBER,
                opacity: submitting ? 0.7 : 1,
              }}
              accessibilityRole="button"
              accessibilityLabel="Submit application"
            >
              {submitting ? (
                <View className="flex-row items-center">
                  <ActivityIndicator color={INK} />
                  <Text
                    className="ml-2 text-[15px] font-extrabold"
                    style={{ color: INK }}
                  >
                    Registering...
                  </Text>
                </View>
              ) : (
                <Text
                  className="text-[15px] font-extrabold"
                  style={{ color: INK }}
                >
                  Register as Delivery Boy
                </Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
