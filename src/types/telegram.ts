// Telegram Bot API response types
export interface TelegramResponse<T = unknown> {
  ok: boolean;
  result?: T;
  description?: string;
  error_code?: number;
}

export interface TelegramBot {
  id: number;
  is_bot: boolean;
  first_name: string;
  username: string;
  can_join_groups: boolean;
  can_read_all_group_messages: boolean;
  supports_inline_queries: boolean;
}

export interface TelegramMessage {
  message_id: number;
  from: TelegramBot;
  chat: {
    id: number;
    type: string;
  };
  date: number;
  text: string;
}

export interface TelegramSendMessageResponse {
  ok: boolean;
  result: TelegramMessage;
  description?: string;
}

export interface TelegramBotInfo {
  name?: string;
  short_description?: string;
  description?: string;
}
