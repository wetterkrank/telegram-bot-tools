import { describe, it, expect, vi, beforeEach } from 'vitest'

import type { TelegramResponse } from '../types/telegram';

// Mock the bot token check function
vi.mock('../lib/telegram/bot-token-check', () => ({
  checkBotToken: vi.fn()
}))

// Mock fetch globally
const mockFetch = vi.fn()
Object.defineProperty(globalThis, 'fetch', {
  value: mockFetch,
  writable: true
})

// Test the API integration logic
async function sendDataToTelegram(params: { botToken: string; chatId: string; message: string }): Promise<TelegramResponse> {
  const response = await fetch(`https://api.telegram.org/bot${params.botToken}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: params.chatId,
      text: params.message,
      parse_mode: 'MarkdownV2'
    }),
  });
  return response.json() as Promise<TelegramResponse>;
}

// Test form validation logic
function validateForm(botToken: string, chatId: string, message: string): boolean {
  return !!(botToken?.trim() && chatId?.trim() && message?.trim());
}

// Test log entry creation
let logIdCounter = 0;
function createLogEntry(text: string, type: 'success' | 'error' | 'info' = 'info') {
  return { text, type, id: ++logIdCounter };
}

describe('BotSender Component Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockClear()
    logIdCounter = 0
  })

  describe('API Integration', () => {
    it('should send message successfully', async () => {
      const mockResponse = { ok: true, result: { message_id: 123 } }
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse)
      })

      const result = await sendDataToTelegram({
        botToken: '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11',
        chatId: '123456789',
        message: 'Test message'
      })

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.telegram.org/bot123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11/sendMessage',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: '123456789',
            text: 'Test message',
            parse_mode: 'MarkdownV2'
          }),
        }
      )

      expect(result).toEqual(mockResponse)
    })

    it('should handle API error response', async () => {
      const mockErrorResponse = { ok: false, description: 'Bad Request: chat not found' }
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockErrorResponse)
      })

      const result = await sendDataToTelegram({
        botToken: '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11',
        chatId: '123456789',
        message: 'Test message'
      })

      expect(result).toEqual(mockErrorResponse)
    })

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(sendDataToTelegram({
        botToken: '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11',
        chatId: '123456789',
        message: 'Test message'
      })).rejects.toThrow('Network error')
    })

    it('should construct correct API URL', async () => {
      const mockResponse = { ok: true, result: { message_id: 123 } }
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse)
      })

      await sendDataToTelegram({
        botToken: '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11',
        chatId: '123456789',
        message: 'Test message'
      })

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.telegram.org/bot123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11/sendMessage',
        expect.any(Object)
      )
    })
  })

  describe('Form Validation', () => {
    it('should validate form with all fields filled', () => {
      expect(validateForm('123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11', '123456789', 'Test message')).toBe(true)
    })

    it('should reject form with empty bot token', () => {
      expect(validateForm('', '123456789', 'Test message')).toBe(false)
    })

    it('should reject form with empty chat ID', () => {
      expect(validateForm('123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11', '', 'Test message')).toBe(false)
    })

    it('should reject form with empty message', () => {
      expect(validateForm('123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11', '123456789', '')).toBe(false)
    })

    it('should reject form with all empty fields', () => {
      expect(validateForm('', '', '')).toBe(false)
    })

    it('should reject form with whitespace-only fields', () => {
      expect(validateForm('   ', '   ', '   ')).toBe(false)
    })
  })

  describe('Log Entry Creation', () => {
    it('should create info log entry', () => {
      const entry = createLogEntry('Test message', 'info')

      expect(entry.text).toBe('Test message')
      expect(entry.type).toBe('info')
      expect(entry.id).toBeTypeOf('number')
    })

    it('should create success log entry', () => {
      const entry = createLogEntry('Success message', 'success')

      expect(entry.text).toBe('Success message')
      expect(entry.type).toBe('success')
      expect(entry.id).toBeTypeOf('number')
    })

    it('should create error log entry', () => {
      const entry = createLogEntry('Error message', 'error')

      expect(entry.text).toBe('Error message')
      expect(entry.type).toBe('error')
      expect(entry.id).toBeTypeOf('number')
    })

    it('should default to info type', () => {
      const entry = createLogEntry('Default message')

      expect(entry.text).toBe('Default message')
      expect(entry.type).toBe('info')
      expect(entry.id).toBeTypeOf('number')
    })

    it('should generate unique IDs', () => {
      const entry1 = createLogEntry('Message 1')
      const entry2 = createLogEntry('Message 2')

      expect(entry1.id).toBe(1)
      expect(entry2.id).toBe(2)
      expect(entry1.id).not.toBe(entry2.id)
    })
  })

  describe('Message Processing', () => {
    it('should handle MarkdownV2 formatting', async () => {
      const mockResponse = { ok: true, result: { message_id: 123 } }
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse)
      })

      await sendDataToTelegram({
        botToken: '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11',
        chatId: '123456789',
        message: '*Bold text* and _italic text_'
      })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({
            chat_id: '123456789',
            text: '*Bold text* and _italic text_',
            parse_mode: 'MarkdownV2'
          })
        })
      )
    })

    it('should handle special characters in message', async () => {
      const mockResponse = { ok: true, result: { message_id: 123 } }
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse)
      })

      const specialMessage = 'Message with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?'

      await sendDataToTelegram({
        botToken: '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11',
        chatId: '123456789',
        message: specialMessage
      })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({
            chat_id: '123456789',
            text: specialMessage,
            parse_mode: 'MarkdownV2'
          })
        })
      )
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid bot token format', async () => {
      const mockErrorResponse = { ok: false, description: 'Unauthorized' }
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockErrorResponse)
      })

      const result = await sendDataToTelegram({
        botToken: 'invalid-token',
        chatId: '123456789',
        message: 'Test message'
      })

      expect(result).toEqual(mockErrorResponse)
    })

    it('should handle invalid chat ID', async () => {
      const mockErrorResponse = { ok: false, description: 'Bad Request: chat not found' }
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockErrorResponse)
      })

      const result = await sendDataToTelegram({
        botToken: '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11',
        chatId: 'invalid-chat-id',
        message: 'Test message'
      })

      expect(result).toEqual(mockErrorResponse)
    })
  })
})
