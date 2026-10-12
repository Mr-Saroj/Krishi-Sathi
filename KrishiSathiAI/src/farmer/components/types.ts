export type Msg = { id: string; from: 'bot' | 'user'; text: string };

export type Chat = {
  id: string;
  title: string;
  updatedAt: number;
  messages: Msg[];
};

export const WELCOME_TEXT =
  'Namaskar! 🙏 I am your Krishi AI Adviser. Ask me anything about your crops, fertilizer, pests, weather or mandi.';

export const makeNewChat = (): Chat => ({
  id: `c${Date.now()}`,
  title: 'New chat',
  updatedAt: Date.now(),
  messages: [{ id: 'm0', from: 'bot', text: WELCOME_TEXT }],
});

// Chat title = first question of the user
export const titleFrom = (messages: Msg[]) => {
  const first = messages.find((m) => m.from === 'user');
  if (!first) return 'New chat';
  return first.text.length > 40 ? first.text.slice(0, 40) + '…' : first.text;
};