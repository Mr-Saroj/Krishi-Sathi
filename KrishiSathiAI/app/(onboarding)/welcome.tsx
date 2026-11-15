import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const LOGO = require('../../assets/app_logo.png');

// Where to go when the splash ends. Change to a route that exists in your app.
const NEXT_ROUTE = '/login';

// Total time the splash stays on screen (ms)
const SPLASH_DURATION = 3200;

// Colors taken from the logo
const COLORS = {
  forest: '#14532D',
  leaf: '#22863A',
  wheat: '#E8B93C',
  wheatSoft: '#FFF6DA',
  paper: '#F8FBF8',
  muted: '#5B6B60',
};

/* ---------- Expanding ripple ring behind the logo ---------- */
function Ripple({ size, delay }: { size: number; delay: number }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(progress, {
          toValue: 1,
          duration: 2400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [delay, progress]);

  const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [1, 1.7] });
  const opacity = progress.interpolate({
    inputRange: [0, 0.2, 1],
    outputRange: [0, 0.3, 0],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.ripple,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          opacity,
          transform: [{ scale }],
        },
      ]}
    />
  );
}

/* ---------- Rotating ring of "circuit" dots ---------- */
function OrbitRing({ size }: { size: number }) {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 9000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [spin]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const DOTS = 20;
  const radius = size / 2;
  const dots = useMemo(
    () =>
      Array.from({ length: DOTS }).map((_, i) => {
        const angle = (i / DOTS) * Math.PI * 2;
        const big = i % 5 === 0;
        const d = big ? 10 : 5;
        return {
          key: i,
          d,
          left: radius + radius * Math.cos(angle) - d / 2,
          top: radius + radius * Math.sin(angle) - d / 2,
          color: big ? COLORS.wheat : COLORS.leaf,
          opacity: big ? 1 : 0.5,
        };
      }),
    [radius],
  );

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        width: size,
        height: size,
        transform: [{ rotate }],
      }}
    >
      {dots.map((d) => (
        <View
          key={d.key}
          style={{
            position: 'absolute',
            left: d.left,
            top: d.top,
            width: d.d,
            height: d.d,
            borderRadius: d.d / 2,
            backgroundColor: d.color,
            opacity: d.opacity,
          }}
        />
      ))}
    </Animated.View>
  );
}

/* ---------- Splash screen ---------- */
export default function Splash() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  // Full logo size (shown uncropped)
  const logoSize = Math.min(width * 0.62, 280);
  // Ring is bigger than the logo's diagonal so it never touches the logo corners
  const ringSize = logoSize * 1.45;
  const stageSize = ringSize + 24;

  // Animated values
  const screenOpacity = useRef(new Animated.Value(1)).current;
  const logoScale = useRef(new Animated.Value(0.4)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoTilt = useRef(new Animated.Value(0)).current;
  const float = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(24)).current;
  const tagOpacity = useRef(new Animated.Value(0)).current;
  const tagY = useRef(new Animated.Value(16)).current;
  const barOpacity = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1) Logo pops in with a spring and a small tilt that settles
    const logoIn = Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 5,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(logoTilt, {
          toValue: 1,
          duration: 450,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(logoTilt, {
          toValue: 0,
          friction: 4,
          useNativeDriver: true,
        }),
      ]),
    ]);

    // 2) Title and tagline slide up
    const textIn = Animated.stagger(180, [
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 550,
          useNativeDriver: true,
        }),
        Animated.timing(titleY, {
          toValue: 0,
          duration: 550,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(tagOpacity, {
          toValue: 1,
          duration: 550,
          useNativeDriver: true,
        }),
        Animated.timing(tagY, {
          toValue: 0,
          duration: 550,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]);

    // 3) Progress bar fills up
    const barIn = Animated.parallel([
      Animated.timing(barOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(progress, {
        toValue: 1,
        duration: SPLASH_DURATION - 1400,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: false,
      }),
    ]);

    // Gentle floating loop for the logo
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: 1,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    const intro = Animated.sequence([logoIn, Animated.parallel([textIn, barIn])]);

    intro.start();
    floatLoop.start();

    // Fade out and move on
    const timer = setTimeout(() => {
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => router.replace(NEXT_ROUTE as any));
    }, SPLASH_DURATION);

    return () => {
      clearTimeout(timer);
      intro.stop();
      floatLoop.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const floatY = float.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });
  const tilt = logoTilt.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-6deg'],
  });
  const barWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[styles.root, { opacity: screenOpacity }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.paper} />

      {/* Soft decorative blobs */}
      <View style={[styles.blob, styles.blobTop]} />
      <View style={[styles.blob, styles.blobBottom]} />

      <SafeAreaView style={styles.safe}>
        {/* Center stage */}
        <View style={styles.center}>
          <View
            style={{
              width: stageSize,
              height: stageSize,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ripple size={logoSize * 0.9} delay={0} />
            <Ripple size={logoSize * 0.9} delay={800} />
            <Ripple size={logoSize * 0.9} delay={1600} />

            <Animated.View style={{ opacity: logoOpacity }}>
              <OrbitRing size={ringSize} />
            </Animated.View>

            {/* Full logo, no cropping, no circle mask */}
            <Animated.View
              style={{
                width: logoSize,
                height: logoSize,
                opacity: logoOpacity,
                transform: [
                  { translateY: floatY },
                  { scale: logoScale },
                  { rotate: tilt },
                ],
              }}
            >
              <Image
                source={LOGO}
                style={{ width: logoSize, height: logoSize }}
                resizeMode="contain"
                accessibilityLabel="Krishi Sathi AI logo"
              />
            </Animated.View>
          </View>

          {/* App name */}
          <Animated.View
            style={{
              opacity: titleOpacity,
              transform: [{ translateY: titleY }],
              alignItems: 'center',
              marginTop: 4,
            }}
          >
            <Text style={styles.title}>
              Krishi Sathi <Text style={styles.titleAccent}>AI</Text>
            </Text>
          </Animated.View>

          <Animated.Text
            style={[
              styles.tagline,
              { opacity: tagOpacity, transform: [{ translateY: tagY }] },
            ]}
          >
            Smart farming, in simple words
          </Animated.Text>
        </View>

        {/* Footer: loader */}
        <Animated.View style={[styles.footer, { opacity: barOpacity }]}>
          <View style={styles.track}>
            <Animated.View style={[styles.fill, { width: barWidth }]} />
          </View>
          <Text style={styles.loading}>Preparing your farm assistant...</Text>
        </Animated.View>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.paper,
  },
  safe: {
    flex: 1,
    justifyContent: 'space-between',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  ripple: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: COLORS.wheat,
    backgroundColor: COLORS.wheatSoft,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: COLORS.forest,
    letterSpacing: 0.4,
  },
  titleAccent: {
    color: COLORS.wheat,
  },
  tagline: {
    marginTop: 8,
    fontSize: 16,
    color: COLORS.muted,
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 48,
    paddingBottom: 36,
  },
  track: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    backgroundColor: '#DDE9DF',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: COLORS.leaf,
  },
  loading: {
    marginTop: 12,
    fontSize: 13,
    color: COLORS.muted,
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
  },
  blobTop: {
    width: 320,
    height: 320,
    top: -140,
    right: -120,
    backgroundColor: 'rgba(34,134,58,0.10)',
  },
  blobBottom: {
    width: 360,
    height: 360,
    bottom: -170,
    left: -140,
    backgroundColor: 'rgba(232,185,60,0.16)',
  },
});