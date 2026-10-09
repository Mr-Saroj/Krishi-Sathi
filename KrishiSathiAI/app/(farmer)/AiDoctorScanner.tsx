import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDiseaseDetection } from "../../src/farmer/hooks/useDiseaseDetection";

// Icon `color` props can't take classNames, so hex values are kept here.
// The same colors live in tailwind.config.js as: forest, amber, scan.
const SCAN_GREEN = '#7CE08A';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

/* ------------------------------ small pieces ------------------------------ */

function CircleButton({
  icon,
  onPress,
  label,
  active,
  size = 44,
}: {
  icon: IconName;
  onPress: () => void;
  label: string;
  active?: boolean;
  size?: number;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={label}
      // size is dynamic, so width/height/radius stay in style
      style={{ width: size, height: size, borderRadius: size / 2 }}
      className={`items-center justify-center ${active ? 'bg-amber' : 'bg-white/[0.18]'}`}
    >
      <MaterialCommunityIcons name={icon} size={size * 0.5} color="#FFFFFF" />
    </TouchableOpacity>
  );
}

// One L-shaped corner of the viewfinder
const CORNER_CLASS = {
  tl: 'top-0 left-0 border-t-4 border-l-4 rounded-tl-[18px]',
  tr: 'top-0 right-0 border-t-4 border-r-4 rounded-tr-[18px]',
  bl: 'bottom-0 left-0 border-b-4 border-l-4 rounded-bl-[18px]',
  br: 'bottom-0 right-0 border-b-4 border-r-4 rounded-br-[18px]',
} as const;

function Corner({ pos }: { pos: keyof typeof CORNER_CLASS }) {
  return <View className={`absolute w-[34px] h-[34px] border-scan ${CORNER_CLASS[pos]}`} />;
}

/* -------------------------------- Scanner -------------------------------- */

export default function AiDoctorScanner({ onClose }: { onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const FRAME = Math.min(width * 0.78, 320);

  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const [torch, setTorch] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const {
    loading: analyzing,
    result,
    error,
    detectDisease,
    reset,
  } = useDiseaseDetection();

  // scan line going up and down inside the frame
  const line = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (photoUri) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(line, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(line, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [photoUri]);

  const takePhoto = async () => {
    try {
      const photo = await cameraRef.current?.takePictureAsync({ quality: 0.7 });
      if (photo?.uri) setPhotoUri(photo.uri);
    } catch (e) {
      console.warn('Capture failed', e);
    }
  };

  const pickFromGallery = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (!res.canceled) setPhotoUri(res.assets[0].uri);
  };

  const analyze = async () => {
    if (!photoUri) return;

    try {
      const prediction = await detectDisease(photoUri);

      Alert.alert(
        "Disease Detection Result",
        `Disease: ${prediction.disease.replace(/_/g, " ")}\n` +
        `Confidence: ${prediction.confidence}%`
      );
    } catch (err) {
      Alert.alert(
        "Detection Failed",
        err instanceof Error
          ? err.message
          : "Unable to detect the disease."
      );
    }
  };

  /* ---------------------------- permission states --------------------------- */

  if (!permission) {
    return (
      <View className="absolute inset-0 items-center justify-center bg-forest">
        <ActivityIndicator color="#FFFFFF" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="absolute inset-0 items-center justify-center bg-forest p-8">
        <MaterialCommunityIcons name="camera-off-outline" size={56} color="#FFFFFF" />
        <Text className="mt-4 text-xl font-extrabold text-white">Camera access needed</Text>
        <Text className="mt-2 text-center text-sm text-white/[0.85]">
          Allow the camera so AI Doctor can check your crop leaf.
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          className="mt-6 rounded-[26px] bg-amber px-7 py-3.5"
          accessibilityRole="button"
        >
          <Text className="text-[15px] font-extrabold text-white">Allow camera</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onClose} className="mt-4" accessibilityRole="button">
          <Text className="font-semibold text-white/80">Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  /* ------------------------------ preview state ----------------------------- */

  if (photoUri) {
    return (
      <View className="absolute inset-0 bg-black">
        <Image source={{ uri: photoUri }} className="absolute inset-0 h-full w-full" resizeMode="cover" />

        <View
          className="absolute left-0 right-0 top-0 flex-row items-center justify-between px-4 pb-2"
          style={{ paddingTop: insets.top + 8 }}
        >
          <CircleButton icon="close" label="Close" onPress={onClose} />
          <Text className="text-lg font-extrabold text-white">Check photo</Text>
          <View className="w-11" />
        </View>

        {analyzing && (
          <View className="absolute inset-0 items-center justify-center bg-black/[0.55]">
            <ActivityIndicator size="large" color={SCAN_GREEN} />
            <Text className="mt-3 text-lg font-extrabold text-white">Checking your crop...</Text>
          </View>
        )}

        <View
          className="absolute bottom-0 left-0 right-0 flex-row items-center gap-3 px-5 pt-4"
          style={{ paddingBottom: insets.bottom + 20 }}
        >
          <TouchableOpacity
            onPress={() => {
              reset();
              setPhotoUri(null);
            }}
            disabled={analyzing}
            className="h-[52px] flex-row items-center justify-center gap-2 rounded-[26px] bg-white/20 px-[22px]"
          >
            <MaterialCommunityIcons
              name="camera-retake-outline"
              size={20}
              color="#FFFFFF"
            />
            <Text className="text-[15px] font-bold text-white">
              Retake
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={analyze}
            disabled={analyzing}
            className={`h-[52px] flex-1 flex-row items-center justify-center gap-2 rounded-[26px] bg-[#2E7D32] ${analyzing ? 'opacity-50' : ''
              }`}
            accessibilityRole="button"
          >
            <MaterialCommunityIcons name="leaf" size={20} color="#FFFFFF" />
            <Text className="text-[15px] font-bold text-white">Check disease</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  /* ------------------------------ camera state ------------------------------ */

  return (
    <View className="absolute inset-0 bg-black">
      {/* CameraView is a third-party component, so it keeps a plain style prop */}
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" enableTorch={torch} />

      {/* Dimmed mask with a clear square window */}
      <View className="absolute inset-0" pointerEvents="none">
        <View className="flex-1 bg-black/[0.55]" />
        <View className="flex-row" style={{ height: FRAME }}>
          <View className="flex-1 bg-black/[0.55]" />
          <View style={{ width: FRAME, height: FRAME }}>
            <Corner pos="tl" />
            <Corner pos="tr" />
            <Corner pos="bl" />
            <Corner pos="br" />
            <Animated.View
              className="absolute left-[10px] right-[10px] h-[3px] rounded-sm bg-scan"
              style={{
                // glow + animated transform must stay in style
                shadowColor: SCAN_GREEN,
                shadowOpacity: 0.9,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 0 },
                elevation: 6,
                transform: [{ translateY: line.interpolate({ inputRange: [0, 1], outputRange: [8, FRAME - 11] }) }],
              }}
            />
          </View>
          <View className="flex-1 bg-black/[0.55]" />
        </View>
        <View className="flex-1 items-center bg-black/[0.55] pt-5">
          <Text className="text-[15px] font-bold text-white">Keep the affected leaf inside the frame</Text>
          <Text className="mt-1 text-[13px] text-white/75">Use daylight for a clearer result</Text>
        </View>
      </View>

      {/* Top bar */}
      <View
        className="absolute left-0 right-0 top-0 flex-row items-center justify-between px-4 pb-2"
        style={{ paddingTop: insets.top + 8 }}
      >
        <CircleButton icon="close" label="Close scanner" onPress={onClose} />
        <Text className="text-lg font-extrabold text-white">AI Doctor</Text>
        <CircleButton
          icon={torch ? 'flashlight' : 'flashlight-off'}
          label="Toggle torch"
          active={torch}
          onPress={() => setTorch((t) => !t)}
        />
      </View>

      {/* Bottom controls */}
      <View
        className="absolute bottom-0 left-0 right-0 flex-row items-center justify-around gap-3 px-5 pt-4"
        style={{ paddingBottom: insets.bottom + 20 }}
      >
        <CircleButton icon="image-outline" label="Pick from gallery" onPress={pickFromGallery} size={52} />

        <TouchableOpacity
          onPress={takePhoto}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Take photo"
          className="h-[78px] w-[78px] items-center justify-center rounded-full border-4 border-white"
        >
          <View className="h-[58px] w-[58px] rounded-full bg-white" />
        </TouchableOpacity>

        <View className="w-[52px]" />
      </View>
    </View>
  );
}