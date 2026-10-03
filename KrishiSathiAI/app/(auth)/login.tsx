import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';

const LOGO = require('../../assets/app_logo.png');
const PLACEHOLDER = '#8FA396';
const MUTED = '#5E7365';

type Errors = Partial<Record<'mobile' | 'password', string>>;

/** Label + bordered input box + error text */
function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <View className="mb-4">
      <Text className="mb-1.5 text-sm font-semibold text-ink">{label}</Text>
      <View
        className={`h-14 flex-row items-center rounded-2xl border-[1.5px] bg-paper px-4 ${
          error ? 'border-red-500' : 'border-line'
        }`}
      >
        {children}
      </View>
      {!!error && <Text className="mt-1 text-[13px] text-red-600">{error}</Text>}
    </View>
  );
}

export default function Login() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  // The logo PNG has wide margins, so crop to the artwork
  const logoW = Math.min(width - 64, 300);

  const validate = () => {
    const e: Errors = {};
    if (!/^[6-9]\d{9}$/.test(mobile)) e.mobile = 'Enter a 10-digit mobile number';
    if (password.length < 6) e.password = 'Password must be at least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      // TODO: call your login API here, e.g.
      // await api.post('/auth/login', { mobile, password });
      router.replace('/' as any); // change to your home screen
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-wheat-soft">
      <StatusBar barStyle="dark-content" backgroundColor="#FBF1DA" />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header: centered logo + title */}
            <View className="items-center px-6 pb-6 pt-6">
              <View
                className="items-center justify-center overflow-hidden"
                style={{ width: logoW, height: logoW * 0.54 }}
              >
                <Image
                  source={LOGO}
                  style={{ width: logoW * 1.15, height: logoW * 1.15 }}
                  resizeMode="contain"
                  accessibilityLabel="Krishi Sathi AI logo"
                />
              </View>
              <Text className="mt-4 text-center text-[28px] font-extrabold leading-8 text-forest">
                Welcome back
              </Text>
              <Text className="mt-2 max-w-[300px] text-center text-[15px] leading-[22px] text-muted">
                Log in to continue with crop advice, weather alerts and market prices.
              </Text>
            </View>

            {/* Form card */}
            <View className="flex-1 rounded-t-[32px] bg-white px-6 pb-8 pt-7">
              <Field label="Mobile number" error={errors.mobile}>
                <Text className="text-base font-semibold text-ink">+91</Text>
                <View className="mx-3 h-6 w-px bg-line" />
                <TextInput
                  className="h-full flex-1 text-base text-ink"
                  placeholder="Enter Your Registered mobile number"
                  placeholderTextColor={PLACEHOLDER}
                  value={mobile}
                  onChangeText={(t) => setMobile(t.replace(/\D/g, '').slice(0, 10))}
                  keyboardType="number-pad"
                  maxLength={10}
                  textContentType="telephoneNumber"
                  autoComplete="tel"
                />
              </Field>

              <Field label="Password" error={errors.password}>
                <MaterialCommunityIcons name="lock-outline" size={22} color={MUTED} />
                <TextInput
                  className="ml-3 h-full flex-1 text-base text-ink"
                  placeholder="Enter your password"
                  placeholderTextColor={PLACEHOLDER}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  textContentType="password"
                  autoComplete="password"
                  returnKeyType="done"
                  onSubmitEditing={onLogin}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((v) => !v)}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                >
                  <MaterialCommunityIcons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={22}
                    color={MUTED}
                  />
                </TouchableOpacity>
              </Field>

              <View className="-mt-1 items-end">
                <Link
                  href={'/forgot-password' as any}
                  className="text-sm font-semibold text-leaf"
                >
                  Forgot password?
                </Link>
              </View>

              <TouchableOpacity
                className="mt-5 h-14 items-center justify-center rounded-2xl bg-forest"
                onPress={onLogin}
                disabled={loading}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Log in"
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-lg font-bold text-white">Log in</Text>
                )}
              </TouchableOpacity>

              <View className="mt-6 flex-row items-center justify-center">
                <Text className="text-base text-muted">New to Krishi Sathi? </Text>
                <Link href={'/register' as any} className="text-base font-bold text-leaf">
                  Register
                </Link>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView> 
    </View>
  );
}