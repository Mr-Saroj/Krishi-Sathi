// Main page: shows history list, and opens NewChat (+) or OldChat (tap on a history box)
import React, { useEffect, useState } from 'react';
import { BackHandler, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useKeyboardVisible from '../../src/farmer/hooks/useKeyboardVisible';
import ChatHistoryList from '../../src/farmer/components/ChatHistoryList';
import NewChat from '../../src/farmer/components/NewChat';
import OldChat from '../../src/farmer/components/OldChat';
import { Chat } from '../../src/farmer/components/types';

type Screen = { name: 'history' } | { name: 'new' } | { name: 'old'; chat: Chat };

export default function AiAdviser() {
  const insets = useSafeAreaInsets();
  const kbVisible = useKeyboardVisible();
  const navHeight = 64 + Math.max(insets.bottom, 8); // space for the bottom bar

  const [chats, setChats] = useState<Chat[]>([]);
  const [screen, setScreen] = useState<Screen>({ name: 'history' });

  const goHistory = () => setScreen({ name: 'history' });

  // Android back button: chat -> history list
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (screen.name !== 'history') {
        goHistory();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [screen]);

  // Save / update a chat in history (newest on top)
  const saveChat = (updated: Chat) =>
    setChats((prev) => [updated, ...prev.filter((c) => c.id !== updated.id)]);

  return (
    <View style={{ flex: 1 }}>
      {screen.name === 'history' && (
        <ChatHistoryList
          chats={chats}
          bottomSpace={navHeight}
          onNewChat={() => setScreen({ name: 'new' })}
          onOpenChat={(id) => {
            const chat = chats.find((c) => c.id === id);
            if (chat) setScreen({ name: 'old', chat });
          }}
        />
      )}

      {screen.name === 'new' && (
        <NewChat onBack={goHistory} onSave={saveChat} kbVisible={kbVisible} navHeight={navHeight} />
      )}

      {screen.name === 'old' && (
        <OldChat
          key={screen.chat.id}
          chat={screen.chat}
          onBack={goHistory}
          onSave={saveChat}
          kbVisible={kbVisible}
          navHeight={navHeight}
        />
      )}
    </View>
  );
}