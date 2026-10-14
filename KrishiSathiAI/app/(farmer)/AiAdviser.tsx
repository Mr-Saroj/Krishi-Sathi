
import React, { useEffect, useState } from "react";
import { BackHandler, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import useKeyboardVisible from "../../src/farmer/hooks/useKeyboardVisible";
import ChatHistoryList from "../../src/farmer/components/ChatHistoryList";
import NewChat from "../../src/farmer/components/NewChat";
import OldChat from "../../src/farmer/components/OldChat";
import type { Chat } from "../../src/farmer/components/types";

type Screen =
  | { name: "history" }
  | { name: "new" }
  | { name: "old"; chat: Chat };

export default function AiAdviser() {
  const insets = useSafeAreaInsets();
  const kbVisible = useKeyboardVisible();

  const navHeight = 64 + Math.max(insets.bottom, 8);

  const [screen, setScreen] = useState<Screen>({
    name: "history",
  });

  const goHistory = () => setScreen({ name: "history" });

  useEffect(() => {
    const sub = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (screen.name !== "history") {
          goHistory();
          return true;
        }

        return false;
      }
    );

    return () => sub.remove();
  }, [screen.name]);

  return (
    <View style={{ flex: 1 }}>
      {screen.name === "history" && (
        <ChatHistoryList
          bottomSpace={navHeight}
          onNewChat={() => setScreen({ name: "new" })}
          onOpenChat={(id) => {
            // Next: fetch this conversation's messages by ID.
            console.log("Selected conversation:", id);
          }}
        />
      )}

      {screen.name === "new" && (
        <NewChat
          onBack={goHistory}
          onSave={(updatedChat) => {
            // Return to history after saving.
            goHistory();
          }}
          kbVisible={kbVisible}
          navHeight={navHeight}
        />
      )}

      {screen.name === "old" && (
        <OldChat
          key={screen.chat.id}
          chat={screen.chat}
          onBack={goHistory}
          onSave={(updatedChat) => {
            goHistory();
          }}
          kbVisible={kbVisible}
          navHeight={navHeight}
        />
      )}
    </View>
  );
}
