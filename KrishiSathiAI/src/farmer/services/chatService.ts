
import { api } from "../../services/api";

export interface ConversationResponse {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
}

export const chatService = {
  async getMyConversations(): Promise<ConversationResponse[]> {
    const response = await api.get<ConversationResponse[]>(
      "/chat/conversations"
    );

    return response.data;
  },
};
