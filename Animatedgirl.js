import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  Image,
  PanResponder,
  Easing,
} from 'react-native';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: W, height: H } = Dimensions.get('window');

const COLORS = {
  primary: '#FC8019',
  primarySoft: '#FFD7B8',
  bg: '#FFFFFF',
  text: '#3D4152',
  shadow: 'rgba(0,0,0,0.18)',
  glow: 'rgba(252,128,25,0.25)',
};

const MOODS = {
  blink: {
    image: require('./assets/tip.png'),
    phrase: 'Hey there! Tap me to discover tasty deals!',
    audio: require('./assets/Welcome.mp3')
  },
  happy: {
    image: require('./assets/happy.png'),
    phrase: 'Free food for first order!',
    audio: require('./assets/freefood.mp3')
  },
  shock: {
    image: require('./assets/shock.png'),
    phrase: 'Now: Lifetime free delivery!',
    audio: require('./assets/freedelivery.mp3')
  },
  sad: {
    image: require('./assets/sad.png'),
    phrase: 'So hungry… Order quick!',
    audio: require('./assets/ordersomething.mp3')
  },
  tip: {
    image: require('./assets/tip.png'),
    phrase: 'Collect five stars, get ₹150 free!',
    audio: require('./assets/5stars.mp3')
  },
};

const MOOD_CYCLE = ['happy', 'tip', 'shock', 'sad'];
const clamp = (n, min, max) => Math.max(min, Math.min(n, max));

const getNextMood = (currentMood, tapCount) => {
  if (tapCount === 0) return 'happy';
  const index = MOOD_CYCLE.indexOf(currentMood);
  if (index === -1) return MOOD_CYCLE[0];
  return MOOD_CYCLE[(index + 1) % MOOD_CYCLE.length];
};

const storeUserEmail = async (email) => {
  try {
    await AsyncStorage.setItem('@user_email', email);
  } catch (error) {
    console.error('Error storing user email:', error);
  }
};

const getUserEmailFromCache = async () => {
  try {
    const email = await AsyncStorage.getItem('@user_email');
    return email;
  } catch (error) {
    console.error('Error reading user email from storage:', error);
    return null;
  }
};

const setUserLaunchFlag = async (email) => {
  try {
    await AsyncStorage.setItem(`hasLaunchedBefore@${email}`, 'true');
  } catch (error) {
    console.error('Error setting launch flag:', error);
  }
};

const getUserLaunchFlag = async (email) => {
  try {
    return await AsyncStorage.getItem(`hasLaunchedBefore@${email}`);
  } catch (error) {
    console.error('Error getting launch flag:', error);
    return null;
  }
};

export default function FloatingGirlAssistant({
  defaultVisible = true,
  size = 72,
  startDock = 'right',
  bottomOffset = 96,
  snapToEdges = true,
  userEmail = null,
}) {
  const [visible, setVisible] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(null);
  const [currentUserEmail, setCurrentUserEmail] = useState(userEmail);
  const [mood, setMood] = useState('blink');
  const [speech, setSpeech] = useState('');
  const [showSpeech, setShowSpeech] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [sound, setSound] = useState();

  // Floating UI state
  const startX = startDock === 'right' ? W - size - 16 : 16;
  const startY = H - bottomOffset - size;

  const pos = useRef(new Animated.ValueXY({ x: startX, y: startY })).current;
  const floatY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  // Load the user email from storage if not provided
  useEffect(() => {
    const fetchEmail = async () => {
      if (!userEmail) {
        const cachedEmail = await getUserEmailFromCache();
        setCurrentUserEmail(cachedEmail);
      } else {
        setCurrentUserEmail(userEmail);
        await storeUserEmail(userEmail);
      }
    };
    fetchEmail();
  }, [userEmail]);

  // Check first launch for current user
  useEffect(() => {
    const checkUserFirstTime = async () => {
      if (!currentUserEmail) {
        setIsFirstTime(false);
        setVisible(false);
        return;
      }

      try {
        const launched = await getUserLaunchFlag(currentUserEmail);
        if (launched === null) {
          setIsFirstTime(true);
          setVisible(true);
          await setUserLaunchFlag(currentUserEmail);
        } else {
          setIsFirstTime(false);
          setVisible(false);
        }
      } catch (error) {
        setIsFirstTime(false);
        setVisible(false);
      }
    };
    checkUserFirstTime();
  }, [currentUserEmail]);

  // Audio config
  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
  }, []);

  // Show welcome on first launch for this user
  useEffect(() => {
    if (isFirstTime && visible) {
      showPhraseAndAudio('blink');
    }
  }, [isFirstTime, visible]);

  // Idle float animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, { toValue: -4, duration: 1400, useNativeDriver: true, easing: Easing.inOut(Easing.quad) }),
        Animated.timing(floatY, { toValue: 0,  duration: 1400, useNativeDriver: true, easing: Easing.inOut(Easing.quad) }),
      ])
    ).start();
  }, []);

  // Cleanup sound
  useEffect(() => {
    return sound
      ? () => { sound.unloadAsync(); }
      : undefined;
  }, [sound]);

  // panResponder setup
  const MIN_EDGE = 8;
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => visible,
        onMoveShouldSetPanResponder: (_, g) => visible && (Math.abs(g.dx) > 2 || Math.abs(g.dy) > 2),
        onPanResponderGrant: () => {
          pos.stopAnimation();
          pos.setOffset({ x: pos.x.__getValue(), y: pos.y.__getValue() });
          pos.setValue({ x: 0, y: 0 });
        },
        onPanResponderMove: Animated.event([null, { dx: pos.x, dy: pos.y }], { useNativeDriver: false }),
        onPanResponderRelease: () => {
          pos.flattenOffset();
          const x = clamp(pos.x.__getValue(), MIN_EDGE, W - size - MIN_EDGE);
          const y = clamp(pos.y.__getValue(), MIN_EDGE, H - size - bottomOffset);
          if (snapToEdges) {
            const dockX = x + size / 2 < W / 2 ? MIN_EDGE : W - size - MIN_EDGE;
            Animated.spring(pos, { toValue: { x: dockX, y }, useNativeDriver: false, friction: 6 }).start();
          } else {
            Animated.spring(pos, { toValue: { x, y }, useNativeDriver: false, friction: 6 }).start();
          }
        },
      }),
    [visible, size, bottomOffset, snapToEdges]
  );

  const tapBounce = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.18, duration: 120, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
  };

  const playAudio = async (audioFile) => {
    try {
      if (sound) await sound.unloadAsync();
      const { sound: newSound } = await Audio.Sound.createAsync(audioFile, { shouldPlay: true, volume: 1 });
      setSound(newSound);
      await newSound.playAsync();
    } catch (error) {
      console.log('Audio playback error:', error);
    }
  };

  const showPhraseAndAudio = (moodKey) => {
    const moodData = MOODS[moodKey];
    if (moodData) {
      setSpeech(moodData.phrase);
      setShowSpeech(true);
      setTimeout(() => setShowSpeech(false), 3500);
      playAudio(moodData.audio);
    }
  };

  const onTapGirl = () => {
    setTapCount(prev => {
      const newCount = prev + 1;
      const nextMood = getNextMood(mood, newCount - 1);
      setMood(nextMood);
      tapBounce();
      setTimeout(() => showPhraseAndAudio(nextMood), 120);
      return newCount;
    });
  };

  const moodImage = MOODS[mood]?.image || MOODS.happy.image;

  if (!visible) return null;

  return (
    <Animated.View
      style={[styles.actor, { transform: [{ translateX: pos.x }, { translateY: pos.y }] }]}
      pointerEvents="box-none"
    >
      {showSpeech && (
        <View style={styles.bubbleContainer}>
          <View style={styles.bubble}>
            <Text style={styles.bubbleText} numberOfLines={2}>{speech}</Text>
          </View>
          <View style={styles.tailSide} />
        </View>
      )}

      <TouchableOpacity onPress={() => setVisible(false)} style={styles.closeBtn} activeOpacity={0.85}>
        <Text style={styles.closeTxt}>×</Text>
      </TouchableOpacity>

      <Animated.View
        style={[
          styles.panArea,
          { width: size + 24, height: size + 24, transform: [{ translateY: floatY }, { scale }] },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity activeOpacity={0.9} onPress={onTapGirl} style={styles.girlButton}>
          <View style={styles.glow} />
          <Image source={moodImage} style={{ width: size, height: size }} resizeMode="contain" />
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  actor: { position: 'absolute', zIndex: 9999 },
  panArea: { alignItems: 'center', justifyContent: 'center' },
  girlButton: {
    alignItems: 'center', 
    justifyContent: 'center', 
    borderRadius: 999, 
    overflow: 'visible',
  },
  glow: { 
    position: 'absolute', 
    width: 64, 
    height: 64, 
    borderRadius: 32, 
    backgroundColor: COLORS.glow 
  },
  closeBtn: {
    position: 'absolute', 
    top: 5, 
    left: 5, 
    width: 24, 
    height: 24, 
    borderRadius: 12,
    backgroundColor: COLORS.primary, 
    alignItems: 'center', 
    justifyContent: 'center', 
    zIndex: 10,
    shadowColor: COLORS.shadow, 
    shadowOpacity: 0.25, 
    shadowRadius: 3, 
    shadowOffset: { width: 0, height: 1 },
    elevation: 3, 
    borderWidth: 1, 
    borderColor: COLORS.primarySoft,
  },
  closeTxt: { color: '#fff', fontSize: 16, fontWeight: '900', lineHeight: 16 },
  bubbleContainer: {
    position: 'absolute',
    right: 58,
    top: -32,
    width: 140,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 5,
  },
  bubble: {
    backgroundColor: COLORS.bg,
    borderColor: COLORS.primary,
    borderWidth: 2,
    borderRadius: 9,
    paddingVertical: 6,
    paddingHorizontal: 8,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.23,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
    flex: 1,
  },
  bubbleText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 10,
    lineHeight: 13,
    textAlign: 'left',
  },
  tailSide: {
    width: 0,
    height: 0,
    borderTopWidth: 5,
    borderTopColor: 'transparent',
    borderBottomWidth: 5,
    borderBottomColor: 'transparent',
    borderLeftWidth: 7,
    borderLeftColor: COLORS.primary,
    marginLeft: -1,
  },
});
