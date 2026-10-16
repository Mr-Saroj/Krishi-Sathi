
import { api } from "../../services/api";

export interface ConversationResponse {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
}

export interface ChatMessageResponse {
  id: string;
  conversationId: string;
  role: "USER" | "ASSISTANT";
  content: string;
  status: "STREAMING" | "COMPLETED" | "FAILED";
  createdAt: string;
  updatedAt: string;
}

export interface ChatStreamRequest {
  prompt: string;
  conversationId?: string;
  topK?: number;
}

export interface ChatStreamResponse {
  data: string;
  conversationId?: string;
}

export const chatService = {
  // Fetch all conversations belonging to the logged-in farmer.
  async getMyConversations(): Promise<ConversationResponse[]> {
    const response = await api.get<ConversationResponse[]>(
      "/chat/conversations"
    );

    return response.data;
  },

  // Fetch messages for a selected conversation.
  async getConversationMessages(
    conversationId: string
  ): Promise<ChatMessageResponse[]> {
    const response = await api.get<ChatMessageResponse[]>(
      `/chat/conversations/${encodeURIComponent(conversationId)}/messages`
    );

    return response.data;
  },

  // Delete a conversation.
  async deleteConversation(
    conversationId: string
  ): Promise<void> {
    await api.delete(
      `/chat/conversations/${encodeURIComponent(conversationId)}`
    );
  },

  // Start a new conversation or continue an existing one.

  async sendMessage(
    request: ChatStreamRequest
  ): Promise<ChatStreamResponse> {
    const response = await api.post<string>(
      "/chat/stream",
      {
        prompt: request.prompt,
        ...(request.conversationId
          ? { conversationId: request.conversationId }
          : {}),
        topK: request.topK ?? 4,
      },
      {
        responseType: "text",
        transformResponse: [(data) => data],
      }
    );

    const conversationId =
      response.headers["x-conversation-id"] ?? undefined;

    console.log("[Chat API] Status:", response.status);
    console.log("[Chat API] Headers:", response.headers);
    console.log("[Chat API] Conversation ID:", conversationId);
    console.log("[Chat API] Response preview:", response.data?.slice(0, 200));

    return {
      data: response.data,
      conversationId,
    };
  },

};
