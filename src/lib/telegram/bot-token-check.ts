import type { TelegramResponse, TelegramBot } from '../../types/telegram';

export interface ValidationResult {
  success: boolean;
  message: string;
}

export async function checkBotToken(token: string): Promise<ValidationResult> {
  if (!token) {
    return { success: false, message: 'No token provided' };
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const data = await response.json() as TelegramResponse<TelegramBot>;

    if (data.ok && data.result) {
      const { first_name, username } = data.result;
      return { success: true, message: `Provided token for @${username} (${first_name})` };
    } else {
      return { success: false, message: data.description || "Invalid bot token" };
    }
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Connection error" };
  }
}
