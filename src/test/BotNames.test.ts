import { describe, it, expect } from 'vitest'

// Test the CSV parsing logic
function parseCSV(csvData: string): { languageCode: string; text: string }[] {
  return csvData
    .split("\n")
    .map((row) => row.trim())
    .filter((row) => row)
    .map((row) => {
      const [languageCode, ...textParts] = row.split(",");
      const text = textParts.join(",").trim();
      const cleanText = text.match(/^"(.*)"$/) ? text.slice(1, -1) : text;
      return {
        languageCode: languageCode.trim(),
        text: cleanText,
      };
    });
}

describe('BotNames Component Logic', () => {
  describe('CSV Parsing', () => {
    it('should parse CSV data correctly', () => {
      const csvData = 'en,Test Bot\nes,Bot de Prueba\nde,Test Bot'
      const result = parseCSV(csvData)

      expect(result).toEqual([
        { languageCode: 'en', text: 'Test Bot' },
        { languageCode: 'es', text: 'Bot de Prueba' },
        { languageCode: 'de', text: 'Test Bot' }
      ])
    })

    it('should handle quoted CSV values', () => {
      const csvData = 'en,"Test Bot with quotes"\nes,Bot de Prueba'
      const result = parseCSV(csvData)

      expect(result).toEqual([
        { languageCode: 'en', text: 'Test Bot with quotes' },
        { languageCode: 'es', text: 'Bot de Prueba' }
      ])
    })

    it('should handle empty lines', () => {
      const csvData = 'en,Test Bot\n\n\nes,Bot de Prueba'
      const result = parseCSV(csvData)

      expect(result).toEqual([
        { languageCode: 'en', text: 'Test Bot' },
        { languageCode: 'es', text: 'Bot de Prueba' }
      ])
    })

    it('should handle commas in text', () => {
      const csvData = 'en,"Test Bot, with commas"\nes,Bot de Prueba'
      const result = parseCSV(csvData)

      expect(result).toEqual([
        { languageCode: 'en', text: 'Test Bot, with commas' },
        { languageCode: 'es', text: 'Bot de Prueba' }
      ])
    })

    it('should handle empty CSV data', () => {
      const csvData = ''
      const result = parseCSV(csvData)

      expect(result).toEqual([])
    })

    it('should handle single row CSV', () => {
      const csvData = 'en,Test Bot'
      const result = parseCSV(csvData)

      expect(result).toEqual([
        { languageCode: 'en', text: 'Test Bot' }
      ])
    })

    it('should handle CSV with trailing newline', () => {
      const csvData = 'en,Test Bot\nes,Bot de Prueba\n'
      const result = parseCSV(csvData)

      expect(result).toEqual([
        { languageCode: 'en', text: 'Test Bot' },
        { languageCode: 'es', text: 'Bot de Prueba' }
      ])
    })
  })
})
