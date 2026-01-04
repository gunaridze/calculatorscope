/**
 * Утилита для конвертации чисел в слова
 * Поддерживает большие числа (до 300 цифр), научную нотацию, валюты и различные форматы
 * Поддерживает локализацию для: en, ru, de, es, fr, it, pl, lv
 */

export type ConversionMode = 'words' | 'check_writing' | 'currency' | 'currency_vat'
export type Currency = 'USD' | 'GBP' | 'EUR' | 'PLN' | 'RUB'
export type TextCase = 'lowercase' | 'UPPERCASE' | 'Title Case' | 'Sentence case'
export type Language = 'en' | 'ru' | 'de' | 'es' | 'fr' | 'it' | 'pl' | 'lv'

export interface NumberToWordsOptions {
  mode: ConversionMode
  currency?: Currency
  vatRate?: number
  textCase?: TextCase
  language?: Language
}

export interface NumberToWordsResult {
  textResult: string
  calculatedTotal?: number
  vatAmount?: number
  principalAmount?: number
}

// Интерфейс для локализованной информации о валюте
interface CurrencyInfo {
  name: string  // единственное число
  plural: string  // множественное число
  fractional: string  // дробная единица (единственное)
  fractionalPlural: string  // дробная единица (множественное)
}

// Интерфейс для процессора локализации
interface LocaleProcessor {
  // Конвертация чисел
  convertHundreds(num: number): string
  convertIntegerToWords(integerStr: string): string
  convertDecimalToWords(decimalStr: string): string
  
  // Валюты
  getCurrencyName(currency: Currency, amount: number): string
  getFractionalName(currency: Currency, amount: number): string
  
  // Служебные
  getMinusWord(): string
  getAndWord(): string
  getVatPhrase(vatRate: number, vatAmount: string): string
  getZeroWord(): string
  getHundredthWord(singular: boolean): string
  getFractionalWord(decimalLength: number, decimalNum: number): string
}

// ============================================================================
// ПАРСИНГ ЧИСЕЛ (общий для всех языков)
// ============================================================================

function parseNumber(input: string | number): { integer: string; decimal: string; isNegative: boolean } {
  let str = String(input).trim().replace(/,/g, '').replace(/\s/g, '')
  const isNegative = str.startsWith('-')
  if (isNegative) str = str.substring(1)
  
  if (/[eE]/.test(str)) {
    const [base, exp] = str.split(/[eE]/)
    const exponent = parseInt(exp.replace('+', ''), 10)
    const baseNum = parseFloat(base)
    
    if (exponent > 0) {
      const result = baseNum * Math.pow(10, exponent)
      str = result.toFixed(0)
    } else {
      const result = baseNum / Math.pow(10, Math.abs(exponent))
      str = result.toString()
    }
  }
  
  const parts = str.split('.')
  const integer = parts[0] || '0'
  const decimal = parts[1] || ''
  
  return { integer, decimal, isNegative }
}

// ============================================================================
// ПРИМЕНЕНИЕ РЕГИСТРА (общее для всех языков)
// ============================================================================

function applyTextCase(text: string, textCase: TextCase): string {
  const lowerText = text.toLowerCase()
  
  switch (textCase) {
    case 'UPPERCASE':
      return lowerText.toUpperCase()
    case 'lowercase':
      return lowerText
    case 'Title Case':
      return lowerText.split(' ').map(word => {
        if (word.length === 0) return word
        return word.charAt(0).toUpperCase() + word.slice(1)
      }).join(' ')
    case 'Sentence case':
      if (lowerText.length === 0) return lowerText
      return lowerText.charAt(0).toUpperCase() + lowerText.slice(1)
    default:
      return lowerText
  }
}

// ============================================================================
// АНГЛИЙСКИЙ (EN)
// ============================================================================

const EN_ONES = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine']
const EN_TEENS = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen']
const EN_TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']
const EN_SCALES = [
  '', 'thousand', 'million', 'billion', 'trillion', 'quadrillion', 'quintillion', 'sextillion', 'septillion', 'octillion', 'nonillion', 'decillion',
  'undecillion', 'duodecillion', 'tredecillion', 'quattuordecillion', 'quindecillion', 'sexdecillion', 'septendecillion', 'octodecillion', 'novemdecillion', 'vigintillion',
  'unvigintillion', 'duovigintillion', 'trevigintillion', 'quattuorvigintillion', 'quinvigintillion', 'sexvigintillion', 'septenvigintillion', 'octovigintillion', 'novemvigintillion', 'trigintillion',
  'untrigintillion', 'duotrigintillion', 'tretrigintillion', 'quattuortrigintillion', 'quintrigintillion', 'sextrigintillion', 'septentrigintillion', 'octotrigintillion', 'novemtrigintillion', 'quadragintillion',
  'unquadragintillion', 'duoquadragintillion', 'trequadragintillion', 'quattuorquadragintillion', 'quinquadragintillion', 'sexquadragintillion', 'septenquadragintillion', 'octoquadragintillion', 'novemquadragintillion', 'quinquagintillion',
  'unquinquagintillion', 'duoquinquagintillion', 'trequinquagintillion', 'quattuorquinquagintillion', 'quinquinquagintillion', 'sexquinquagintillion', 'septenquinquagintillion', 'octoquinquagintillion', 'novemquinquagintillion', 'sexagintillion',
  'unsexagintillion', 'duosexagintillion', 'tresexagintillion', 'quattuorsexagintillion', 'quinsexagintillion', 'sexsexagintillion', 'septensexagintillion', 'octosexagintillion', 'novemsexagintillion', 'septuagintillion',
  'unseptuagintillion', 'duoseptuagintillion', 'treseptuagintillion', 'quattuorseptuagintillion', 'quinseptuagintillion', 'sexseptuagintillion', 'septenseptuagintillion', 'octoseptuagintillion', 'novemseptuagintillion', 'octogintillion',
  'unoctogintillion', 'duooctogintillion', 'treoctogintillion', 'quattuoroctogintillion', 'quinoctogintillion', 'sexoctogintillion', 'septenoctogintillion', 'octooctogintillion', 'novemoctogintillion', 'nonagintillion',
  'unnonagintillion', 'duononagintillion', 'trenonagintillion', 'quattuornonagintillion', 'quinnonagintillion', 'sexnonagintillion', 'septennonagintillion', 'octononagintillion', 'novemnonagintillion'
]

const EN_CURRENCIES: Record<Currency, CurrencyInfo> = {
  USD: { name: 'dollar', plural: 'dollars', fractional: 'cent', fractionalPlural: 'cents' },
  GBP: { name: 'pound', plural: 'pounds', fractional: 'penny', fractionalPlural: 'pence' },
  EUR: { name: 'euro', plural: 'euros', fractional: 'cent', fractionalPlural: 'cents' },
  PLN: { name: 'zloty', plural: 'zlotys', fractional: 'grosz', fractionalPlural: 'groszy' },
  RUB: { name: 'ruble', plural: 'rubles', fractional: 'kopeck', fractionalPlural: 'kopecks' }
}

const enProcessor: LocaleProcessor = {
  convertHundreds(num: number): string {
    if (num === 0) return ''
    
    let result = ''
    const hundreds = Math.floor(num / 100)
    const remainder = num % 100
    
    if (hundreds > 0) {
      result += EN_ONES[hundreds] + ' hundred'
      if (remainder > 0) result += ' '
    }
    
    if (remainder >= 10 && remainder < 20) {
      result += EN_TEENS[remainder - 10]
    } else {
      const tens = Math.floor(remainder / 10)
      const ones = remainder % 10
      if (tens > 0) {
        result += EN_TENS[tens]
        if (ones > 0) result += '-'
      }
      if (ones > 0) {
        result += EN_ONES[ones]
      }
    }
    
    return result
  },
  
  convertIntegerToWords(integerStr: string): string {
    if (integerStr === '0') return 'zero'
    integerStr = integerStr.replace(/^0+/, '') || '0'
    
    const groups: string[] = []
    for (let i = integerStr.length; i > 0; i -= 3) {
      const start = Math.max(0, i - 3)
      groups.unshift(integerStr.substring(start, i))
    }
    
    const words: string[] = []
    for (let i = 0; i < groups.length; i++) {
      const group = parseInt(groups[i], 10)
      if (group === 0) continue
      
      const scaleIndex = groups.length - 1 - i
      const groupWords = this.convertHundreds(group)
      
      if (groupWords) {
        words.push(groupWords)
        if (scaleIndex > 0 && EN_SCALES[scaleIndex]) {
          words.push(EN_SCALES[scaleIndex])
        }
      }
    }
    
    return words.join(' ')
  },
  
  convertDecimalToWords(decimalStr: string): string {
    const decimalClean = decimalStr.replace(/^0+/, '') || '0'
    return this.convertIntegerToWords(decimalClean)
  },
  
  getCurrencyName(currency: Currency, amount: number): string {
    const info = EN_CURRENCIES[currency]
    return amount === 1 ? info.name : info.plural
  },
  
  getFractionalName(currency: Currency, amount: number): string {
    const info = EN_CURRENCIES[currency]
    return amount === 1 ? info.fractional : info.fractionalPlural
  },
  
  getMinusWord(): string { return 'minus' },
  getAndWord(): string { return 'and' },
  getVatPhrase(vatRate: number, vatAmount: string): string {
    return `, including vat (${vatRate}%) in the amount of ${vatAmount}`
  },
  getZeroWord(): string { return 'zero' },
  getHundredthWord(singular: boolean): string {
    return singular ? 'hundredth' : 'hundredths'
  },
  getFractionalWord(decimalLength: number, decimalNum: number): string {
    // Массив дробных частей: индекс соответствует количеству знаков после запятой
    // Формат: [единственное число, множественное число]
    const fractionalWords: Record<number, [string, string]> = {
      1: ['tenth', 'tenths'],
      2: ['hundredth', 'hundredths'],
      3: ['thousandth', 'thousandths'],
      4: ['ten-thousandth', 'ten-thousandths'],
      5: ['hundred-thousandth', 'hundred-thousandths'],
      6: ['millionth', 'millionths'],
      7: ['ten-millionth', 'ten-millionths'],
      8: ['hundred-millionth', 'hundred-millionths'],
      9: ['billionth', 'billionths'],
      10: ['ten-billionth', 'ten-billionths'],
      11: ['hundred-billionth', 'hundred-billionths'],
      12: ['trillionth', 'trillionths'],
      15: ['quadrillionth', 'quadrillionths'],
      18: ['quintillionth', 'quintillionths'],
      21: ['sextillionth', 'sextillionths'],
      24: ['septillionth', 'septillionths'],
      27: ['octillionth', 'octillionths'],
      30: ['nonillionth', 'nonillionths'],
      33: ['decillionth', 'decillionths'],
      36: ['undecillionth', 'undecillionths'],
      39: ['duodecillionth', 'duodecillionths'],
      42: ['tredecillionth', 'tredecillionths'],
      45: ['quattuordecillionth', 'quattuordecillionths'],
      48: ['quindecillionth', 'quindecillionths'],
      51: ['sexdecillionth', 'sexdecillionths'],
      54: ['septendecillionth', 'septendecillionths'],
      57: ['octodecillionth', 'octodecillionths'],
      60: ['novemdecillionth', 'novemdecillionths'],
      63: ['vigintillionth', 'vigintillionths'],
      66: ['unvigintillionth', 'unvigintillionths'],
      69: ['duovigintillionth', 'duovigintillionths'],
      72: ['trevigintillionth', 'trevigintillionths'],
      75: ['quattuorvigintillionth', 'quattuorvigintillionths'],
      78: ['quinvigintillionth', 'quinvigintillionths'],
      81: ['sexvigintillionth', 'sexvigintillionths'],
      84: ['septenvigintillionth', 'septenvigintillionths'],
      87: ['octovigintillionth', 'octovigintillionths'],
      90: ['novemvigintillionth', 'novemvigintillionths'],
      93: ['trigintillionth', 'trigintillionths'],
      96: ['untrigintillionth', 'untrigintillionths'],
      99: ['duotrigintillionth', 'duotrigintillionths'],
      102: ['tretrigintillionth', 'tretrigintillionths'],
      105: ['quattuortrigintillionth', 'quattuortrigintillionths'],
      108: ['quintrigintillionth', 'quintrigintillionths'],
      111: ['sextrigintillionth', 'sextrigintillionths'],
      114: ['septentrigintillionth', 'septentrigintillionths'],
      117: ['octotrigintillionth', 'octotrigintillionths'],
      120: ['novemtrigintillionth', 'novemtrigintillionths'],
      123: ['quadragintillionth', 'quadragintillionths'],
      126: ['unquadragintillionth', 'unquadragintillionths'],
      129: ['duoquadragintillionth', 'duoquadragintillionths'],
      132: ['trequadragintillionth', 'trequadragintillionths'],
      135: ['quattuorquadragintillionth', 'quattuorquadragintillionths'],
      138: ['quinquadragintillionth', 'quinquadragintillionths'],
      141: ['sexquadragintillionth', 'sexquadragintillionths'],
      144: ['septenquadragintillionth', 'septenquadragintillionths'],
      147: ['octoquadragintillionth', 'octoquadragintillionths'],
      150: ['novemquadragintillionth', 'novemquadragintillionths'],
      153: ['quinquagintillionth', 'quinquagintillionths'],
      156: ['unquinquagintillionth', 'unquinquagintillionths'],
      159: ['duoquinquagintillionth', 'duoquinquagintillionths'],
      162: ['trequinquagintillionth', 'trequinquagintillionths'],
      165: ['quattuorquinquagintillionth', 'quattuorquinquagintillionths'],
      168: ['quinquinquagintillionth', 'quinquinquagintillionths'],
      171: ['sexquinquagintillionth', 'sexquinquagintillionths'],
      174: ['septenquinquagintillionth', 'septenquinquagintillionths'],
      177: ['octoquinquagintillionth', 'octoquinquagintillionths'],
      180: ['novemquinquagintillionth', 'novemquinquagintillionths'],
      183: ['sexagintillionth', 'sexagintillionths'],
      186: ['unsexagintillionth', 'unsexagintillionths'],
      189: ['duosexagintillionth', 'duosexagintillionths'],
      192: ['tresexagintillionth', 'tresexagintillionths'],
      195: ['quattuorsexagintillionth', 'quattuorsexagintillionths'],
      198: ['quinsexagintillionth', 'quinsexagintillionths'],
      201: ['sexsexagintillionth', 'sexsexagintillionths'],
      204: ['septensexagintillionth', 'septensexagintillionths'],
      207: ['octosexagintillionth', 'octosexagintillionths'],
      210: ['novemsexagintillionth', 'novemsexagintillionths'],
      213: ['septuagintillionth', 'septuagintillionths'],
      216: ['unseptuagintillionth', 'unseptuagintillionths'],
      219: ['duoseptuagintillionth', 'duoseptuagintillionths'],
      222: ['treseptuagintillionth', 'treseptuagintillionths'],
      225: ['quattuorseptuagintillionth', 'quattuorseptuagintillionths'],
      228: ['quinseptuagintillionth', 'quinseptuagintillionths'],
      231: ['sexseptuagintillionth', 'sexseptuagintillionths'],
      234: ['septenseptuagintillionth', 'septenseptuagintillionths'],
      237: ['octoseptuagintillionth', 'octoseptuagintillionths'],
      240: ['novemseptuagintillionth', 'novemseptuagintillionths'],
      243: ['octogintillionth', 'octogintillionths'],
      246: ['unoctogintillionth', 'unoctogintillionths'],
      249: ['duooctogintillionth', 'duooctogintillionths'],
      252: ['treoctogintillionth', 'treoctogintillionths'],
      255: ['quattuoroctogintillionth', 'quattuoroctogintillionths'],
      258: ['quinoctogintillionth', 'quinoctogintillionths'],
      261: ['sexoctogintillionth', 'sexoctogintillionths'],
      264: ['septenoctogintillionth', 'septenoctogintillionths'],
      267: ['octooctogintillionth', 'octooctogintillionths'],
      270: ['novemoctogintillionth', 'novemoctogintillionths'],
      273: ['nonagintillionth', 'nonagintillionths'],
      276: ['unnonagintillionth', 'unnonagintillionths'],
      279: ['duononagintillionth', 'duononagintillionths'],
      282: ['trenonagintillionth', 'trenonagintillionths'],
      285: ['quattuornonagintillionth', 'quattuornonagintillionths'],
      288: ['quinnonagintillionth', 'quinnonagintillionths'],
      291: ['sexnonagintillionth', 'sexnonagintillionths'],
      294: ['septennonagintillionth', 'septennonagintillionths'],
      297: ['octononagintillionth', 'octononagintillionths'],
      300: ['novemnonagintillionth', 'novemnonagintillionths']
    }
    
    // Находим ближайшее значение или используем дефолт
    let word = fractionalWords[decimalLength]
    if (!word) {
      // Если точного совпадения нет, ищем ближайшее меньшее значение
      const keys = Object.keys(fractionalWords).map(Number).sort((a, b) => b - a)
      const closest = keys.find(k => k <= decimalLength)
      word = closest ? fractionalWords[closest] : ['hundredth', 'hundredths']
    }
    
    // В английском: 1 - единственное, остальное - множественное
    return decimalNum === 1 ? word[0] : word[1]
  }
}

// ============================================================================
// РУССКИЙ (RU)
// ============================================================================

const RU_ONES = ['', 'один', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять']
const RU_ONES_FEMININE = ['', 'одна', 'две', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять']
const RU_TEENS = ['десять', 'одиннадцать', 'двенадцать', 'тринадцать', 'четырнадцать', 'пятнадцать', 'шестнадцать', 'семнадцать', 'восемнадцать', 'девятнадцать']
const RU_TENS = ['', '', 'двадцать', 'тридцать', 'сорок', 'пятьдесят', 'шестьдесят', 'семьдесят', 'восемьдесят', 'девяносто']
const RU_HUNDREDS = ['', 'сто', 'двести', 'триста', 'четыреста', 'пятьсот', 'шестьсот', 'семьсот', 'восемьсот', 'девятьсот']
const RU_SCALES = [
  '', 'тысяча', 'миллион', 'миллиард', 'триллион', 'квадриллион', 'квинтиллион', 'секстиллион', 'септиллион', 'октиллион', 'нониллион', 'дециллион',
  'ундециллион', 'дуодециллион', 'тредециллион', 'кваттордециллион', 'квиндециллион', 'сексдециллион', 'септендециллион', 'октодециллион', 'новемдециллион', 'вигинтиллион',
  'унвигинтиллион', 'дуовигинтиллион', 'тревигинтиллион', 'кватторвигинтиллион', 'квинвигинтиллион', 'сексвигинтиллион', 'септенвигинтиллион', 'октовигинтиллион', 'новемвигинтиллион', 'тригинтиллион',
  'унтригинтиллион', 'дуотригинтиллион', 'третригинтиллион', 'кваттортригинтиллион', 'квинтригинтиллион', 'секстригинтиллион', 'септентригинтиллион', 'октотригинтиллион', 'новемтригинтиллион', 'квадрагинтиллион',
  'унквадрагинтиллион', 'дуоквадрагинтиллион', 'треквадрагинтиллион', 'кватторквадрагинтиллион', 'квинквадрагинтиллион', 'сексквадрагинтиллион', 'септенквадрагинтиллион', 'октоквадрагинтиллион', 'новемквадрагинтиллион', 'квинквагинтиллион',
  'унквинквагинтиллион', 'дуоквинквагинтиллион', 'треквинквагинтиллион', 'кватторквинквагинтиллион', 'квинквинквагинтиллион', 'сексквинквагинтиллион', 'септенквинквагинтиллион', 'октоквинквагинтиллион', 'новемквинквагинтиллион', 'сексагинтиллион',
  'унсексагинтиллион', 'дуосексагинтиллион', 'трисексагинтиллион', 'кватторсексагинтиллион', 'квинтсексагинтиллион', 'секстсексагинтиллион', 'септенсексагинтиллион', 'октосексагинтиллион', 'новемсексагинтиллион', 'сепсептагинтиллион',
  'унсепсептагинтиллион', 'дуосепсептагинтиллион', 'трисепсептагинтиллион', 'кватторсепсептагинтиллион', 'квинтсепсептагинтиллион', 'секстсепсептагинтиллион', 'септенсепсептагинтиллион', 'октосепсептагинтиллион', 'новемсепсептагинтиллион', 'октогинтиллион',
  'уноктогинтиллион', 'дуоктогинтиллион', 'триоктогинтиллион', 'кваттороктогинтиллион', 'квинтоктогинтиллион', 'сексоктогинтиллион', 'септентоктогинтиллион', 'октоктогинтиллион', 'новемоктогинтиллион', 'нонагинтиллион',
  'уннонагинтиллион', 'дуононагинтиллион', 'тринонагинтиллион', 'кватторнонагинтиллион', 'квинтнонагинтиллион', 'секcнонагинтиллион', 'септеннонагинтиллион', 'октонoнагинтиллион', 'новемнонагинтиллион'
]

const RU_SCALES_GENITIVE_SINGULAR = [
  '', 'тысячи', 'миллиона', 'миллиарда', 'триллиона', 'квадриллиона', 'квинтиллиона', 'секстиллиона', 'септиллиона', 'октиллиона', 'нониллиона', 'дециллиона',
  'ундециллиона', 'дуодециллиона', 'тредециллиона', 'кваттордециллиона', 'квиндециллиона', 'сексдециллиона', 'септендециллиона', 'октодециллиона', 'новемдециллиона', 'вигинтиллиона',
  'унвигинтиллиона', 'дуовигинтиллиона', 'тревигинтиллиона', 'кватторвигинтиллиона', 'квинвигинтиллиона', 'сексвигинтиллиона', 'септенвигинтиллиона', 'октовигинтиллиона', 'новемвигинтиллиона', 'тригинтиллиона',
  'унтригинтиллиона', 'дуотригинтиллиона', 'третригинтиллиона', 'кваттортригинтиллиона', 'квинтригинтиллиона', 'секстригинтиллиона', 'септентригинтиллиона', 'октотригинтиллиона', 'новемтригинтиллиона', 'квадрагинтиллиона',
  'унквадрагинтиллиона', 'дуоквадрагинтиллиона', 'треквадрагинтиллиона', 'кватторквадрагинтиллиона', 'квинквадрагинтиллиона', 'сексквадрагинтиллиона', 'септенквадрагинтиллиона', 'октоквадрагинтиллиона', 'новемквадрагинтиллиона', 'квинквагинтиллиона',
  'унквинквагинтиллиона', 'дуоквинквагинтиллиона', 'треквинквагинтиллиона', 'кватторквинквагинтиллиона', 'квинквинквагинтиллиона', 'сексквинквагинтиллиона', 'септенквинквагинтиллиона', 'октоквинквагинтиллиона', 'новемквинквагинтиллиона', 'сексагинтиллиона',
  'унсексагинтиллиона', 'дуосексагинтиллиона', 'трисексагинтиллиона', 'кватторсексагинтиллиона', 'квинтсексагинтиллиона', 'секстсексагинтиллиона', 'септенсексагинтиллиона', 'октосексагинтиллиона', 'новемсексагинтиллиона', 'сепсептагинтиллиона',
  'унсепсептагинтиллиона', 'дуосепсептагинтиллиона', 'трисепсептагинтиллиона', 'кватторсепсептагинтиллиона', 'квинтсепсептагинтиллиона', 'секстсепсептагинтиллиона', 'септенсепсептагинтиллиона', 'октосепсептагинтиллиона', 'новемсепсептагинтиллиона', 'октогинтиллиона',
  'уноктогинтиллиона', 'дуоктогинтиллиона', 'триоктогинтиллиона', 'кваттороктогинтиллиона', 'квинтоктогинтиллиона', 'сексоктогинтиллиона', 'септентоктогинтиллиона', 'октоктогинтиллиона', 'новемоктогинтиллиона', 'нонагинтиллиона',
  'уннонагинтиллиона', 'дуононагинтиллиона', 'тринонагинтиллиона', 'кватторнонагинтиллиона', 'квинтнонагинтиллиона', 'секcнонагинтиллиона', 'септеннонагинтиллиона', 'октонoнагинтиллиона', 'новемнонагинтиллиона'
]

const RU_SCALES_GENITIVE_PLURAL = [
  '', 'тысяч', 'миллионов', 'миллиардов', 'триллионов', 'квадриллионов', 'квинтиллионов', 'секстиллионов', 'септиллионов', 'октиллионов', 'нониллионов', 'дециллионов',
  'ундециллионов', 'дуодециллионов', 'тредециллионов', 'кваттордециллионов', 'квиндециллионов', 'сексдециллионов', 'септендециллионов', 'октодециллионов', 'новемдециллионов', 'вигинтиллионов',
  'унвигинтиллионов', 'дуовигинтиллионов', 'тревигинтиллионов', 'кватторвигинтиллионов', 'квинвигинтиллионов', 'сексвигинтиллионов', 'септенвигинтиллионов', 'октовигинтиллионов', 'новемвигинтиллионов', 'тригинтиллионов',
  'унтригинтиллионов', 'дуотригинтиллионов', 'третригинтиллионов', 'кваттортригинтиллионов', 'квинтригинтиллионов', 'секстригинтиллионов', 'септентригинтиллионов', 'октотригинтиллионов', 'новемтригинтиллионов', 'квадрагинтиллионов',
  'унквадрагинтиллионов', 'дуоквадрагинтиллионов', 'треквадрагинтиллионов', 'кватторквадрагинтиллионов', 'квинквадрагинтиллионов', 'сексквадрагинтиллионов', 'септенквадрагинтиллионов', 'октоквадрагинтиллионов', 'новемквадрагинтиллионов', 'квинквагинтиллионов',
  'унквинквагинтиллионов', 'дуоквинквагинтиллионов', 'треквинквагинтиллионов', 'кватторквинквагинтиллионов', 'квинквинквагинтиллионов', 'сексквинквагинтиллионов', 'септенквинквагинтиллионов', 'октоквинквагинтиллионов', 'новемквинквагинтиллионов', 'сексагинтиллионов',
  'унсексагинтиллионов', 'дуосексагинтиллионов', 'трисексагинтиллионов', 'кватторсексагинтиллионов', 'квинтсексагинтиллионов', 'секстсексагинтиллионов', 'септенсексагинтиллионов', 'октосексагинтиллионов', 'новемсексагинтиллионов', 'сепсептагинтиллионов',
  'унсепсептагинтиллионов', 'дуосепсептагинтиллионов', 'трисепсептагинтиллионов', 'кватторсепсептагинтиллионов', 'квинтсепсептагинтиллионов', 'секстсепсептагинтиллионов', 'септенсепсептагинтиллионов', 'октосепсептагинтиллионов', 'новемсепсептагинтиллионов', 'октогинтиллионов',
  'уноктогинтиллионов', 'дуоктогинтиллионов', 'триоктогинтиллионов', 'кваттороктогинтиллионов', 'квинтоктогинтиллионов', 'сексоктогинтиллионов', 'септентоктогинтиллионов', 'октоктогинтиллионов', 'новемоктогинтиллионов', 'нонагинтиллионов',
  'уннонагинтиллионов', 'дуононагинтиллионов', 'тринонагинтиллионов', 'кватторнонагинтиллионов', 'квинтнонагинтиллионов', 'секcнонагинтиллионов', 'септеннонагинтиллионов', 'октонoнагинтиллионов', 'новемнонагинтиллионов'
]

const RU_CURRENCIES: Record<Currency, CurrencyInfo> = {
  USD: { name: 'доллар США', plural: 'долларов США', fractional: 'цент', fractionalPlural: 'центов' },
  GBP: { name: 'фунт стерлингов', plural: 'фунтов стерлингов', fractional: 'пенс', fractionalPlural: 'пенсов' },
  EUR: { name: 'евро', plural: 'евро', fractional: 'цент', fractionalPlural: 'центов' },
  PLN: { name: 'злотый', plural: 'злотых', fractional: 'грош', fractionalPlural: 'грошей' },
  RUB: { name: 'рубль', plural: 'рублей', fractional: 'копейка', fractionalPlural: 'копеек' }
}

function getRuDeclension(num: number, forms: [string, string, string]): string {
  const mod10 = num % 10
  const mod100 = num % 100
  if (mod100 >= 11 && mod100 <= 19) return forms[2]
  if (mod10 === 1) return forms[0]
  if (mod10 >= 2 && mod10 <= 4) return forms[1]
  return forms[2]
}

function getRuScaleDeclension(scaleIndex: number, num: number): string {
  if (scaleIndex === 0) return ''
  // Для больших чисел используем правильные склонения
  const forms: [string, string, string] = [
    RU_SCALES[scaleIndex],  // 1 (именительный)
    RU_SCALES_GENITIVE_SINGULAR[scaleIndex],  // 2, 3, 4 (родительный единственного)
    RU_SCALES_GENITIVE_PLURAL[scaleIndex]  // 5+ (родительный множественного)
  ]
  return getRuDeclension(num, forms)
}

const ruProcessor: LocaleProcessor = {
  convertHundreds(num: number): string {
    if (num === 0) return ''
    
    const hundreds = Math.floor(num / 100)
    const remainder = num % 100
    let result = ''
    
    if (hundreds > 0) {
      result += RU_HUNDREDS[hundreds]
      if (remainder > 0) result += ' '
    }
    
    if (remainder >= 10 && remainder < 20) {
      result += RU_TEENS[remainder - 10]
    } else {
      const tens = Math.floor(remainder / 10)
      const ones = remainder % 10
      if (tens > 0) {
        result += RU_TENS[tens]
        if (ones > 0) result += ' '
      }
      if (ones > 0) {
        result += RU_ONES[ones]
      }
    }
    
    return result
  },
  
  convertIntegerToWords(integerStr: string): string {
    if (integerStr === '0') return 'ноль'
    integerStr = integerStr.replace(/^0+/, '') || '0'
    
    const groups: string[] = []
    for (let i = integerStr.length; i > 0; i -= 3) {
      const start = Math.max(0, i - 3)
      groups.unshift(integerStr.substring(start, i))
    }
    
    const words: string[] = []
    for (let i = 0; i < groups.length; i++) {
      const group = parseInt(groups[i], 10)
      if (group === 0) continue
      
      const scaleIndex = groups.length - 1 - i
      let groupWords = ''
      
      if (scaleIndex === 1) { // тысячи - женский род
        const hundreds = Math.floor(group / 100)
        const remainder = group % 100
        
        if (hundreds > 0) {
          groupWords += RU_HUNDREDS[hundreds] + ' '
        }
        
        if (remainder >= 10 && remainder < 20) {
          groupWords += RU_TEENS[remainder - 10]
        } else {
          const tens = Math.floor(remainder / 10)
          const ones = remainder % 10
          if (tens > 0) {
            groupWords += RU_TENS[tens]
            if (ones > 0) groupWords += ' '
          }
          if (ones > 0) {
            groupWords += RU_ONES_FEMININE[ones]
          }
        }
      } else {
        groupWords = this.convertHundreds(group)
      }
      
      if (groupWords) {
        words.push(groupWords)
        const scaleWord = getRuScaleDeclension(scaleIndex, group)
        if (scaleWord) {
          words.push(scaleWord)
        }
      }
    }
    
    return words.join(' ')
  },
  
  convertDecimalToWords(decimalStr: string): string {
    // Для дробных частей в русском языке используется женский род
    const decimalClean = decimalStr.replace(/^0+/, '') || '0'
    if (decimalClean === '0') return 'ноль'
    
    const num = parseInt(decimalClean, 10)
    if (num === 0) return 'ноль'
    
    // Используем женский род для дробных частей
    const hundreds = Math.floor(num / 100)
    const remainder = num % 100
    let result = ''
    
    if (hundreds > 0) {
      result += RU_HUNDREDS[hundreds]
      if (remainder > 0) result += ' '
    }
    
    if (remainder >= 10 && remainder < 20) {
      result += RU_TEENS[remainder - 10]
    } else {
      const tens = Math.floor(remainder / 10)
      const ones = remainder % 10
      if (tens > 0) {
        result += RU_TENS[tens]
        if (ones > 0) result += ' '
      }
      if (ones > 0) {
        // Используем женский род для единиц в дробных частях
        result += RU_ONES_FEMININE[ones]
      }
    }
    
    return result
  },
  
  getCurrencyName(currency: Currency, amount: number): string {
    const info = RU_CURRENCIES[currency]
    if (currency === 'RUB') {
      return getRuDeclension(amount, [info.name, 'рубля', info.plural])
    }
    return getRuDeclension(amount, [info.name, info.name, info.plural])
  },
  
  getFractionalName(currency: Currency, amount: number): string {
    const info = RU_CURRENCIES[currency]
    return getRuDeclension(amount, [info.fractional, 'копейки', info.fractionalPlural])
  },
  
  getMinusWord(): string { return 'минус' },
  getAndWord(): string { return 'и' },
  getVatPhrase(vatRate: number, vatAmount: string): string {
    return `, в том числе ндс (${vatRate}%) в размере ${vatAmount}`
  },
  getZeroWord(): string { return 'ноль' },
  getHundredthWord(singular: boolean): string {
    return singular ? 'сотая' : 'сотых'
  },
  getFractionalWord(decimalLength: number, decimalNum: number): string {
    // Массив дробных частей: индекс соответствует количеству знаков после запятой
    // Формат: [единственное число, множественное число]
    const fractionalWords: Record<number, [string, string]> = {
      1: ['десятая', 'десятых'],
      2: ['сотая', 'сотых'],
      3: ['тысячная', 'тысячных'],
      4: ['десятитысячная', 'десятитысячных'],
      5: ['стотысячная', 'стотысячных'],
      6: ['миллионная', 'миллионных'],
      7: ['десятимиллионная', 'десятимиллионных'],
      8: ['стомиллионная', 'стомиллионных'],
      9: ['миллиардная', 'миллиардных'],
      10: ['десятимиллиардная', 'десятимиллиардных'],
      11: ['стомиллиардная', 'стомиллиардных'],
      12: ['триллионная', 'триллионных'],
      15: ['квадриллионная', 'квадриллионных'],
      18: ['квинтиллионная', 'квинтиллионных'],
      21: ['секстиллионная', 'секстиллионных'],
      24: ['септиллионная', 'септиллионных'],
      27: ['октиллионная', 'октиллионных'],
      30: ['нониллионная', 'нониллионных'],
      33: ['дециллионная', 'дециллионных'],
      36: ['ундециллионная', 'ундециллионных'],
      39: ['дуодециллионная', 'дуодециллионных'],
      42: ['тредециллионная', 'тредециллионных'],
      45: ['кваттордециллионная', 'кваттордециллионных'],
      48: ['квиндециллионная', 'квиндециллионных'],
      51: ['сексдециллионная', 'сексдециллионных'],
      54: ['септендециллионная', 'септендециллионных'],
      57: ['октодециллионная', 'октодециллионных'],
      60: ['новемдециллионная', 'новемдециллионных'],
      63: ['вигинтиллионная', 'вигинтиллионных'],
      66: ['унвигинтиллионная', 'унвигинтиллионных'],
      69: ['дуовигинтиллионная', 'дуовигинтиллионных'],
      72: ['тревигинтиллионная', 'тревигинтиллионных'],
      75: ['кватторвигинтиллионная', 'кватторвигинтиллионных'],
      78: ['квинвигинтиллионная', 'квинвигинтиллионных'],
      81: ['сексвигинтиллионная', 'сексвигинтиллионных'],
      84: ['септенвигинтиллионная', 'септенвигинтиллионных'],
      87: ['октовигинтиллионная', 'октовигинтиллионных'],
      90: ['новемвигинтиллионная', 'новемвигинтиллионных'],
      93: ['тригинтиллионная', 'тригинтиллионных'],
      96: ['унтригинтиллионная', 'унтригинтиллионных'],
      99: ['дуотригинтиллионная', 'дуотригинтиллионных'],
      102: ['третригинтиллионная', 'третригинтиллионных'],
      105: ['кваттортригинтиллионная', 'кваттортригинтиллионных'],
      108: ['квинтригинтиллионная', 'квинтригинтиллионных'],
      111: ['секстригинтиллионная', 'секстригинтиллионных'],
      114: ['септентригинтиллионная', 'септентригинтиллионных'],
      117: ['октотригинтиллионная', 'октотригинтиллионных'],
      120: ['новемтригинтиллионная', 'новемтригинтиллионных'],
      123: ['квадрагинтиллионная', 'квадрагинтиллионных'],
      126: ['унквадрагинтиллионная', 'унквадрагинтиллионных'],
      129: ['дуоквадрагинтиллионная', 'дуоквадрагинтиллионных'],
      132: ['треквадрагинтиллионная', 'треквадрагинтиллионных'],
      135: ['кватторквадрагинтиллионная', 'кватторквадрагинтиллионных'],
      138: ['квинквадрагинтиллионная', 'квинквадрагинтиллионных'],
      141: ['сексквадрагинтиллионная', 'сексквадрагинтиллионных'],
      144: ['септенквадрагинтиллионная', 'септенквадрагинтиллионных'],
      147: ['октоквадрагинтиллионная', 'октоквадрагинтиллионных'],
      150: ['новемквадрагинтиллионная', 'новемквадрагинтиллионных'],
      153: ['квинквагинтиллионная', 'квинквагинтиллионных'],
      156: ['унквинквагинтиллионная', 'унквинквагинтиллионных'],
      159: ['дуоквинквагинтиллионная', 'дуоквинквагинтиллионных'],
      162: ['треквинквагинтиллионная', 'треквинквагинтиллионных'],
      165: ['кватторквинквагинтиллионная', 'кватторквинквагинтиллионных'],
      168: ['квинквинквагинтиллионная', 'квинквинквагинтиллионных'],
      171: ['сексквинквагинтиллионная', 'сексквинквагинтиллионных'],
      174: ['септенквинквагинтиллионная', 'септенквинквагинтиллионных'],
      177: ['октоквинквагинтиллионная', 'октоквинквагинтиллионных'],
      180: ['новемквинквагинтиллионная', 'новемквинквагинтиллионных'],
      183: ['сексагинтиллионная', 'сексагинтиллионных'],
      186: ['унсексагинтиллионная', 'унсексагинтиллионных'],
      189: ['дуосексагинтиллионная', 'дуосексагинтиллионных'],
      192: ['трисексагинтиллионная', 'трисексагинтиллионных'],
      195: ['кватторсексагинтиллионная', 'кватторсексагинтиллионных'],
      198: ['квинтсексагинтиллионная', 'квинтсексагинтиллионных'],
      201: ['секстсексагинтиллионная', 'секстсексагинтиллионных'],
      204: ['септенсексагинтиллионная', 'септенсексагинтиллионных'],
      207: ['октосексагинтиллионная', 'октосексагинтиллионных'],
      210: ['новемсексагинтиллионная', 'новемсексагинтиллионных'],
      213: ['сепсептагинтиллионная', 'сепсептагинтиллионных'],
      216: ['унсепсептагинтиллионная', 'унсепсептагинтиллионных'],
      219: ['дуосепсептагинтиллионная', 'дуосепсептагинтиллионных'],
      222: ['трисепсептагинтиллионная', 'трисепсептагинтиллионных'],
      225: ['кватторсепсептагинтиллионная', 'кватторсепсептагинтиллионных'],
      228: ['квинтсепсептагинтиллионная', 'квинтсепсептагинтиллионных'],
      231: ['секстсепсептагинтиллионная', 'секстсепсептагинтиллионных'],
      234: ['септенсепсептагинтиллионная', 'септенсепсептагинтиллионных'],
      237: ['октосепсептагинтиллионная', 'октосепсептагинтиллионных'],
      240: ['новемсепсептагинтиллионная', 'новемсепсептагинтиллионных'],
      243: ['октогинтиллионная', 'октогинтиллионных'],
      246: ['уноктогинтиллионная', 'уноктогинтиллионных'],
      249: ['дуоктогинтиллионная', 'дуоктогинтиллионных'],
      252: ['триоктогинтиллионная', 'триоктогинтиллионных'],
      255: ['кваттороктогинтиллионная', 'кваттороктогинтиллионных'],
      258: ['квинтоктогинтиллионная', 'квинтоктогинтиллионных'],
      261: ['сексоктогинтиллионная', 'сексоктогинтиллионных'],
      264: ['септентоктогинтиллионная', 'септентоктогинтиллионных'],
      267: ['октоктогинтиллионная', 'октоктогинтиллионных'],
      270: ['новемоктогинтиллионная', 'новемоктогинтиллионных'],
      273: ['нонагинтиллионная', 'нонагинтиллионных'],
      276: ['уннонагинтиллионная', 'уннонагинтиллионных'],
      279: ['дуононагинтиллионная', 'дуононагинтиллионных'],
      282: ['тринонагинтиллионная', 'тринонагинтиллионных'],
      285: ['кватторнонагинтиллионная', 'кватторнонагинтиллионных'],
      288: ['квинтнонагинтиллионная', 'квинтнонагинтиллионных'],
      291: ['секcнонагинтиллионная', 'секcнонагинтиллионных'],
      294: ['септеннонагинтиллионная', 'септеннонагинтиллионных'],
      297: ['октонoнагинтиллионная', 'октонoнагинтиллионных'],
      300: ['новемнонагинтиллионная', 'новемнонагинтиллионных']
    }
    
    // Находим ближайшее значение или используем дефолт
    let word = fractionalWords[decimalLength]
    if (!word) {
      // Если точного совпадения нет, ищем ближайшее меньшее значение
      const keys = Object.keys(fractionalWords).map(Number).sort((a, b) => b - a)
      const closest = keys.find(k => k <= decimalLength)
      word = closest ? fractionalWords[closest] : ['сотая', 'сотых']
    }
    
    // Используем склонение: 1 - единственное, 2-4 - единственное, 5+ - множественное
    return getRuDeclension(decimalNum, [word[0], word[0], word[1]])
  }
}

// ============================================================================
// НЕМЕЦКИЙ (DE)
// ============================================================================

const DE_ONES = ['', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun']
const DE_TEENS = ['zehn', 'elf', 'zwölf', 'dreizehn', 'vierzehn', 'fünfzehn', 'sechzehn', 'siebzehn', 'achtzehn', 'neunzehn']
const DE_TENS = ['', '', 'zwanzig', 'dreißig', 'vierzig', 'fünfzig', 'sechzig', 'siebzig', 'achtzig', 'neunzig']
const DE_SCALES = [
  '', 'tausend', 'Million', 'Milliarde', 'Billion', 'Billiarde', 'Trillion', 'Trilliarde', 'Quadrillion', 'Quadrilliarde', 'Quintillion', 'Quintilliarde',
  'Sextillion', 'Sextilliarde', 'Septillion', 'Septilliarde', 'Oktillion', 'Oktilliarde', 'Nonillion', 'Nonilliarde', 'Dezillion', 'Dezilliarde',
  'Undezillion', 'Duodezillion', 'Tredezillion', 'Quattuorde dezillion', 'Quindezillion', 'Sexdezillion', 'Septendezillion', 'Oktodezillion', 'Novemdezillion', 'Vigintillion',
  'Unvigintillion', 'Duovigintillion', 'Trevigintillion', 'Quattuorvigintillion', 'Quinvigintillion', 'Sexvigintillion', 'Septenvigintillion', 'Oktovigintillion', 'Novemvigintillion', 'Trigintillion',
  'Untrigintillion', 'Duotrigintillion', 'Tretrigintillion', 'Quattuortrigintillion', 'Quintrigintillion', 'Sextrigintillion', 'Septentrigintillion', 'Oktotrigintillion', 'Novemtrigintillion', 'Quadragintillion',
  'Unquadragintillion', 'Duoquadragintillion', 'Trequadragintillion', 'Quattuorquadragintillion', 'Quinquadragintillion', 'Sexquadragintillion', 'Septenquadragintillion', 'Octoquadragintillion', 'Novemquadragintillion', 'Quinquagintillion',
  'Unquinquagintillion', 'Duoquinquagintillion', 'Trequinquagintillion', 'Quattuorquinquagintillion', 'Quinquinquagintillion', 'Sexquinquagintillion', 'Septenquinquagintillion', 'Octoquinquagintillion', 'Novemquinquagintillion', 'Sexagintillion',
  'Unsexagintillion', 'Duosexagintillion', 'Tresexagintillion', 'Quattuorsexagintillion', 'Quinsexagintillion', 'Sexsexagintillion', 'Septensexagintillion', 'Octosexagintillion', 'Novemsexagintillion', 'Septuagintillion',
  'Unseptuagintillion', 'Duoseptuagintillion', 'Treseptuagintillion', 'Quattuorseptuagintillion', 'Quinseptuagintillion', 'Sexseptuagintillion', 'Septenseptuagintillion', 'Octoseptuagintillion', 'Novemseptuagintillion', 'Octogintillion',
  'Unoctogintillion', 'Duooctogintillion', 'Treoctogintillion', 'Quattuoroctogintillion', 'Quinoctogintillion', 'Sexoctogintillion', 'Septenoctogintillion', 'Octooctogintillion', 'Novemoctogintillion', 'Nonagintillion',
  'Unnonagintillion', 'Duononagintillion', 'Trenonagintillion', 'Quattuornonagintillion', 'Quinnonagintillion', 'Sexnonagintillion', 'Septennonagintillion', 'Octononagintillion', 'Novemnonagintillion'
]

const DE_CURRENCIES: Record<Currency, CurrencyInfo> = {
  USD: { name: 'US-Dollar', plural: 'US-Dollar', fractional: 'Cent', fractionalPlural: 'Cent' },
  GBP: { name: 'britisches Pfund', plural: 'britische Pfund', fractional: 'Penny', fractionalPlural: 'Pence' },
  EUR: { name: 'Euro', plural: 'Euro', fractional: 'Cent', fractionalPlural: 'Cent' },
  PLN: { name: 'Złoty', plural: 'Złoty', fractional: 'Grosz', fractionalPlural: 'Grosze' },
  RUB: { name: 'Rubel', plural: 'Rubel', fractional: 'Kopeke', fractionalPlural: 'Kopeken' }
}

const deProcessor: LocaleProcessor = {
  convertHundreds(num: number): string {
    if (num === 0) return ''
    
    let result = ''
    const hundreds = Math.floor(num / 100)
    const remainder = num % 100
    
    if (hundreds > 0) {
      if (hundreds === 1) {
        result += 'einhundert'
      } else {
        result += DE_ONES[hundreds] + 'hundert'
      }
      if (remainder > 0) result += 'und'
    }
    
    if (remainder >= 10 && remainder < 20) {
      result += DE_TEENS[remainder - 10]
    } else if (remainder > 0) {
      const ones = remainder % 10
      const tens = Math.floor(remainder / 10)
      if (ones > 0) {
        if (ones === 1) {
          result += 'ein'
        } else {
          result += DE_ONES[ones]
        }
        if (tens > 0) result += 'und'
      }
      if (tens > 0) {
        result += DE_TENS[tens]
      }
    }
    
    return result
  },
  
  convertIntegerToWords(integerStr: string): string {
    if (integerStr === '0') return 'null'
    integerStr = integerStr.replace(/^0+/, '') || '0'
    
    const groups: string[] = []
    for (let i = integerStr.length; i > 0; i -= 3) {
      const start = Math.max(0, i - 3)
      groups.unshift(integerStr.substring(start, i))
    }
    
    const words: string[] = []
    for (let i = 0; i < groups.length; i++) {
      const group = parseInt(groups[i], 10)
      if (group === 0) continue
      
      const scaleIndex = groups.length - 1 - i
      const groupWords = this.convertHundreds(group)
      
      if (groupWords) {
        words.push(groupWords)
        if (scaleIndex > 0 && DE_SCALES[scaleIndex]) {
          const scale = DE_SCALES[scaleIndex]
          if (scaleIndex === 1) {
            words.push(scale)
          } else {
            words.push(group === 1 ? scale : scale + 'en')
          }
        }
      }
    }
    
    return words.join('')
  },
  
  convertDecimalToWords(decimalStr: string): string {
    const decimalClean = decimalStr.replace(/^0+/, '') || '0'
    return this.convertIntegerToWords(decimalClean)
  },
  
  getCurrencyName(currency: Currency, amount: number): string {
    const info = DE_CURRENCIES[currency]
    return info.plural
  },
  
  getFractionalName(currency: Currency, amount: number): string {
    const info = DE_CURRENCIES[currency]
    return info.fractionalPlural
  },
  
  getMinusWord(): string { return 'minus' },
  getAndWord(): string { return 'und' },
  getVatPhrase(vatRate: number, vatAmount: string): string {
    return `, einschließlich MwSt (${vatRate}%) in Höhe von ${vatAmount}`
  },
  getZeroWord(): string { return 'null' },
  getHundredthWord(singular: boolean): string {
    return singular ? 'Hundertstel' : 'Hundertstel'
  },
  getFractionalWord(decimalLength: number, decimalNum: number): string {
    // Массив дробных частей: индекс соответствует количеству знаков после запятой
    // В немецком языке дробные части не изменяются по числу (всегда одинаково)
    const fractionalWords: Record<number, string> = {
      1: 'Zehntel',
      2: 'Hundertstel',
      3: 'Tausendstel',
      4: 'Zehntausendstel',
      5: 'Hunderttausendstel',
      6: 'Millionstel',
      7: 'Zehnmillionstel',
      8: 'Hundertmillionstel',
      9: 'Milliardstel',
      10: 'Zehnmilliardstel',
      11: 'Hundertmilliardstel',
      12: 'Billionstel',
      15: 'Billiardstel',
      18: 'Trillionstel',
      21: 'Trilliardstel',
      24: 'Quadrillionstel',
      27: 'Quadrilliardstel',
      30: 'Quintillionstel',
      33: 'Quintilliardstel',
      36: 'Sextillionstel',
      39: 'Sextilliardstel',
      42: 'Septillionstel',
      45: 'Septilliardstel',
      48: 'Oktillionstel',
      51: 'Oktilliardstel',
      54: 'Nonillionstel',
      57: 'Nonilliardstel',
      60: 'Dezillionstel',
      63: 'Dezilliardstel',
      66: 'Undezillionstel',
      69: 'Duodezillionstel',
      72: 'Tredezillionstel',
      75: 'Quattuorde zillionstel',
      78: 'Quindezillionstel',
      81: 'Sexdezillionstel',
      84: 'Septendezillionstel',
      87: 'Oktodezillionstel',
      90: 'Novemdezillionstel',
      93: 'Vigintillionstel',
      96: 'Unvigintillionstel',
      99: 'Duovigintillionstel',
      102: 'Trevigintillionstel',
      105: 'Quattuorvigintillionstel',
      108: 'Quinvigintillionstel',
      111: 'Sexvigintillionstel',
      114: 'Septenvigintillionstel',
      117: 'Oktovigintillionstel',
      120: 'Novemvigintillionstel',
      123: 'Trigintillionstel',
      126: 'Untrigintillionstel',
      129: 'Duotrigintillionstel',
      132: 'Tretrigintillionstel',
      135: 'Quattuortrigintillionstel',
      138: 'Quintrigintillionstel',
      141: 'Sextrigintillionstel',
      144: 'Septentrigintillionstel',
      147: 'Oktotrigintillionstel',
      150: 'Novemtrigintillionstel',
      153: 'Quadragintillionstel',
      156: 'Unquadragintillionstel',
      159: 'Duoquadragintillionstel',
      162: 'Trequadragintillionstel',
      165: 'Quattuorquadragintillionstel',
      168: 'Quinquadragintillionstel',
      171: 'Sexquadragintillionstel',
      174: 'Septenquadragintillionstel',
      177: 'Octoquadragintillionstel',
      180: 'Novemquadragintillionstel',
      183: 'Quinquagintillionstel',
      186: 'Unquinquagintillionstel',
      189: 'Duoquinquagintillionstel',
      192: 'Trequinquagintillionstel',
      195: 'Quattuorquinquagintillionstel',
      198: 'Quinquinquagintillionstel',
      201: 'Sexquinquagintillionstel',
      204: 'Septenquinquagintillionstel',
      207: 'Octoquinquagintillionstel',
      210: 'Novemquinquagintillionstel',
      213: 'Sexagintillionstel',
      216: 'Unsexagintillionstel',
      219: 'Duosexagintillionstel',
      222: 'Tresexagintillionstel',
      225: 'Quattuorsexagintillionstel',
      228: 'Quinsexagintillionstel',
      231: 'Sexsexagintillionstel',
      234: 'Septensexagintillionstel',
      237: 'Octosexagintillionstel',
      240: 'Novemsexagintillionstel',
      243: 'Septuagintillionstel',
      246: 'Unseptuagintillionstel',
      249: 'Duoseptuagintillionstel',
      252: 'Treseptuagintillionstel',
      255: 'Quattuorseptuagintillionstel',
      258: 'Quinseptuagintillionstel',
      261: 'Sexseptuagintillionstel',
      264: 'Septenseptuagintillionstel',
      267: 'Octoseptuagintillionstel',
      270: 'Novemseptuagintillionstel',
      273: 'Octogintillionstel',
      276: 'Unoctogintillionstel',
      279: 'Duooctogintillionstel',
      282: 'Treoctogintillionstel',
      285: 'Quattuoroctogintillionstel',
      288: 'Quinoctogintillionstel',
      291: 'Sexoctogintillionstel',
      294: 'Septenoctogintillionstel',
      297: 'Octooctogintillionstel',
      300: 'Novemoctogintillionstel'
    }
    
    // Находим ближайшее значение или используем дефолт
    let word = fractionalWords[decimalLength]
    if (!word) {
      // Если точного совпадения нет, ищем ближайшее меньшее значение
      const keys = Object.keys(fractionalWords).map(Number).sort((a, b) => b - a)
      const closest = keys.find(k => k <= decimalLength)
      word = closest ? fractionalWords[closest] : 'Hundertstel'
    }
    
    // В немецком языке дробные части не изменяются по числу
    return word
  }
}

// ============================================================================
// ИСПАНСКИЙ (ES)
// ============================================================================

const ES_ONES = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve']
const ES_ONES_FEMININE = ['', 'una', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve']
const ES_TEENS = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve']
const ES_TENS = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa']
const ES_SCALES = [
  '', 'mil', 'millón', 'mil millones', 'billón', 'mil billones', 'trillón', 'mil trillones', 'cuatrillón', 'mil cuatrillones', 'quintillón', 'mil quintillones',
  'sextillón', 'mil sextillones', 'septillón', 'mil septillones', 'octillón', 'mil octillones', 'nonillón', 'mil nonillones', 'decillón', 'mil decillones',
  'undecillón', 'mil undecillones', 'duodecillón', 'mil duodecillones', 'tredecillón', 'mil tredecillones', 'cuatuordecillón', 'mil cuatuordecillones', 'quindecillón', 'mil quindecillones',
  'sexdecillón', 'mil sexdecillones', 'septendecillón', 'mil septendecillones', 'octodecillón', 'mil octodecillones', 'novemdecillón', 'mil novemdecillones', 'vigintillón', 'mil vigintillones',
  'unvigintillón', 'mil unvigintillones', 'duovigintillón', 'mil duovigintillones', 'trevigintillón', 'mil trevigintillones', 'cuatuorvigintillón', 'mil cuatuorvigintillones', 'quinvigintillón', 'mil quinvigintillones',
  'sexvigintillón', 'mil sexvigintillones', 'septenvigintillón', 'mil septenvigintillones', 'octovigintillón', 'mil octovigintillones', 'novemvigintillón', 'mil novemvigintillones', 'trigintillón', 'mil trigintillones',
  'untrigintillón', 'mil untrigintillones', 'duotrigintillón', 'mil duotrigintillones', 'tretrigintillón', 'mil tretrigintillones', 'cuatuortrigintillón', 'mil cuatuortrigintillones', 'quintrigintillón', 'mil quintrigintillones',
  'sextrigintillón', 'mil sextrigintillones', 'septentrigintillón', 'mil septentrigintillones', 'octotrigintillón', 'mil octotrigintillones', 'novemtrigintillón', 'mil novemtrigintillones', 'cuadragintillón', 'mil cuadragintillones',
  'uncuadragintillón', 'mil uncuadragintillones', 'duocuadragintillón', 'mil duocuadragintillones', 'trecuadragintillón', 'mil trecuadragintillones', 'cuatuorcuadragintillón', 'mil cuatuorcuadragintillones', 'quincuadragintillón', 'mil quincuadragintillones',
  'sexcuadragintillón', 'mil sexcuadragintillones', 'septencuadragintillón', 'mil septencuadragintillones', 'octocuadragintillón', 'mil octocuadragintillones', 'novemcuadragintillón', 'mil novemcuadragintillones', 'quincuagintillón', 'mil quincuagintillones',
  'unquincuagintillón', 'mil unquincuagintillones', 'duoquincuagintillón', 'mil duoquincuagintillones', 'trequincuagintillón', 'mil trequincuagintillones', 'cuatuorquincuagintillón', 'mil cuatuorquincuagintillones', 'quinquincuagintillón', 'mil quinquincuagintillones',
  'sexquincuagintillón', 'mil sexquincuagintillones', 'septenquincuagintillón', 'mil septenquincuagintillones', 'octoquincuagintillón', 'mil octoquincuagintillones', 'novemquincuagintillón', 'mil novemquincuagintillones', 'sexagintillón', 'mil sexagintillones',
  'unsexagintillón', 'mil unsexagintillones', 'duosexagintillón', 'mil duosexagintillones', 'tresexagintillón', 'mil tresexagintillones', 'cuatuorsexagintillón', 'mil cuatuorsexagintillones', 'quinsexagintillón', 'mil quinsexagintillones',
  'sexsexagintillón', 'mil sexsexagintillones', 'septensexagintillón', 'mil septensexagintillones', 'octosexagintillón', 'mil octosexagintillones', 'novemsexagintillón', 'mil novemsexagintillones', 'septuagintillón', 'mil septuagintillones',
  'unseptuagintillón', 'mil unseptuagintillones', 'duoseptuagintillón', 'mil duoseptuagintillones', 'treseptuagintillón', 'mil treseptuagintillones', 'cuatuorseptuagintillón', 'mil cuatuorseptuagintillones', 'quinseptuagintillón', 'mil quinseptuagintillones',
  'sexseptuagintillón', 'mil sexseptuagintillones', 'septenseptuagintillón', 'mil septenseptuagintillones', 'octoseptuagintillón', 'mil octoseptuagintillones', 'novemseptuagintillón', 'mil novemseptuagintillones', 'octogintillón', 'mil octogintillones',
  'unoctogintillón', 'mil unoctogintillones', 'duooctogintillón', 'mil duooctogintillones', 'treoctogintillón', 'mil treoctogintillones', 'cuatuoroctogintillón', 'mil cuatuoroctogintillones', 'quinoctogintillón', 'mil quinoctogintillones',
  'sexoctogintillón', 'mil sexoctogintillones', 'septenoctogintillón', 'mil septenoctogintillones', 'octooctogintillón', 'mil octooctogintillones', 'novemoctogintillón', 'mil novemoctogintillones', 'nonagintillón', 'mil nonagintillones',
  'unnonagintillón', 'mil unnonagintillones', 'duononagintillón', 'mil duononagintillones', 'trenonagintillón', 'mil trenonagintillones', 'cuatuornonagintillón', 'mil cuatuornonagintillones', 'quinnonagintillón', 'mil quinnonagintillones',
  'sexnonagintillón', 'mil sexnonagintillones', 'septennonagintillón', 'mil septennonagintillones', 'octononagintillón', 'mil octononagintillones', 'novemnonagintillón', 'mil novemnonagintillones'
]

const ES_CURRENCIES: Record<Currency, CurrencyInfo> = {
  USD: { name: 'dólar estadounidense', plural: 'dólares estadounidenses', fractional: 'centavo', fractionalPlural: 'centavos' },
  GBP: { name: 'libra esterlina', plural: 'libras esterlinas', fractional: 'penique', fractionalPlural: 'peniques' },
  EUR: { name: 'euro', plural: 'euros', fractional: 'céntimo', fractionalPlural: 'céntimos' },
  PLN: { name: 'esloti', plural: 'eslotis', fractional: 'grosz', fractionalPlural: 'groszy' },
  RUB: { name: 'rublo', plural: 'rublos', fractional: 'kopek', fractionalPlural: 'kopeks' }
}

const esProcessor: LocaleProcessor = {
  convertHundreds(num: number): string {
    if (num === 0) return ''
    
    let result = ''
    const hundreds = Math.floor(num / 100)
    const remainder = num % 100
    
    if (hundreds > 0) {
      if (hundreds === 1) {
        result += 'cien'
      } else if (hundreds === 5) {
        result += 'quinientos'
      } else if (hundreds === 7) {
        result += 'setecientos'
      } else if (hundreds === 9) {
        result += 'novecientos'
      } else {
        result += ES_ONES[hundreds] + 'cientos'
      }
      if (remainder > 0) result += ' '
    }
    
    if (remainder >= 10 && remainder < 20) {
      result += ES_TEENS[remainder - 10]
    } else {
      const tens = Math.floor(remainder / 10)
      const ones = remainder % 10
      if (tens > 0) {
        if (tens === 2 && ones === 0) {
          result += 'veinte'
        } else if (tens === 2) {
          result += 'veinti' + ES_ONES[ones]
        } else {
          result += ES_TENS[tens]
          if (ones > 0) result += ' y '
        }
      }
      if (ones > 0 && tens !== 2) {
        result += ES_ONES[ones]
      }
    }
    
    return result
  },
  
  convertIntegerToWords(integerStr: string): string {
    if (integerStr === '0') return 'cero'
    integerStr = integerStr.replace(/^0+/, '') || '0'
    
    const groups: string[] = []
    for (let i = integerStr.length; i > 0; i -= 3) {
      const start = Math.max(0, i - 3)
      groups.unshift(integerStr.substring(start, i))
    }
    
    const words: string[] = []
    for (let i = 0; i < groups.length; i++) {
      const group = parseInt(groups[i], 10)
      if (group === 0) continue
      
      const scaleIndex = groups.length - 1 - i
      let groupWords = this.convertHundreds(group)
      
      if (groupWords) {
        if (scaleIndex === 1 && group === 1) {
          words.push('mil')
        } else if (scaleIndex === 1) {
          words.push(groupWords)
          words.push('mil')
        } else {
          words.push(groupWords)
          if (scaleIndex > 0 && ES_SCALES[scaleIndex]) {
            words.push(ES_SCALES[scaleIndex])
          }
        }
      }
    }
    
    return words.join(' ')
  },
  
  convertDecimalToWords(decimalStr: string): string {
    const decimalClean = decimalStr.replace(/^0+/, '') || '0'
    return this.convertIntegerToWords(decimalClean)
  },
  
  getCurrencyName(currency: Currency, amount: number): string {
    const info = ES_CURRENCIES[currency]
    return amount === 1 ? info.name : info.plural
  },
  
  getFractionalName(currency: Currency, amount: number): string {
    const info = ES_CURRENCIES[currency]
    return amount === 1 ? info.fractional : info.fractionalPlural
  },
  
  getMinusWord(): string { return 'menos' },
  getAndWord(): string { return 'y' },
  getVatPhrase(vatRate: number, vatAmount: string): string {
    return `, incluido el IVA (${vatRate}%) por un importe de ${vatAmount}`
  },
  getZeroWord(): string { return 'cero' },
  getHundredthWord(singular: boolean): string {
    return singular ? 'centésima' : 'centésimas'
  },
  getFractionalWord(decimalLength: number, decimalNum: number): string {
    // Массив дробных частей: индекс соответствует количеству знаков после запятой
    // Формат: [единственное число, множественное число]
    const fractionalWords: Record<number, [string, string]> = {
      1: ['décima', 'décimas'],
      2: ['centésima', 'centésimas'],
      3: ['milésima', 'milésimas'],
      4: ['diezmilésima', 'diezmilésimas'],
      5: ['cienmilésima', 'cienmilésimas'],
      6: ['millonésima', 'millonésimas'],
      7: ['diezmillonésima', 'diezmillonésimas'],
      8: ['cienmillonésima', 'cienmillonésimas'],
      9: ['milmillonésima', 'milmillonésimas'],
      10: ['diezmilmillonésima', 'diezmilmillonésimas'],
      11: ['cienmilmillonésima', 'cienmilmillonésimas'],
      12: ['billonésima', 'billonésimas'],
      15: ['milbillonésima', 'milbillonésimas'],
      18: ['trillonésima', 'trillonésimas'],
      21: ['miltrillonésima', 'miltrillonésimas'],
      24: ['cuatrillonésima', 'cuatrillonésimas'],
      27: ['milcuatrillonésima', 'milcuatrillonésimas'],
      30: ['quintillonésima', 'quintillonésimas'],
      33: ['milquintillonésima', 'milquintillonésimas'],
      36: ['sextillonésima', 'sextillonésimas'],
      39: ['milsextillonésima', 'milsextillonésimas'],
      42: ['septillonésima', 'septillonésimas'],
      45: ['milseptillonésima', 'milseptillonésimas'],
      48: ['octillonésima', 'octillonésimas'],
      51: ['miloctillonésima', 'miloctillonésimas'],
      54: ['nonillonésima', 'nonillonésimas'],
      57: ['milnonillonésima', 'milnonillonésimas'],
      60: ['decillonésima', 'decillonésimas'],
      63: ['mildecillonésima', 'mildecillonésimas'],
      66: ['undecillonésima', 'undecillonésimas'],
      69: ['milundecillonésima', 'milundecillonésimas'],
      72: ['duodecillonésima', 'duodecillonésimas'],
      75: ['milduodecillonésima', 'milduodecillonésimas'],
      78: ['tredecillonésima', 'tredecillonésimas'],
      81: ['miltredecillonésima', 'miltredecillonésimas'],
      84: ['cuatuordecillonésima', 'cuatuordecillonésimas'],
      87: ['milcuatuordecillonésima', 'milcuatuordecillonésimas'],
      90: ['quindecillonésima', 'quindecillonésimas'],
      93: ['milquindecillonésima', 'milquindecillonésimas'],
      96: ['sexdecillonésima', 'sexdecillonésimas'],
      99: ['milsexdecillonésima', 'milsexdecillonésimas'],
      102: ['septendecillonésima', 'septendecillonésimas'],
      105: ['milseptendecillonésima', 'milseptendecillonésimas'],
      108: ['octodecillonésima', 'octodecillonésimas'],
      111: ['miloctodecillonésima', 'miloctodecillonésimas'],
      114: ['novemdecillonésima', 'novemdecillonésimas'],
      117: ['milnovemdecillonésima', 'milnovemdecillonésimas'],
      120: ['vigintillonésima', 'vigintillonésimas'],
      123: ['milvigintillonésima', 'milvigintillonésimas'],
      126: ['unvigintillonésima', 'unvigintillonésimas'],
      129: ['milunvigintillonésima', 'milunvigintillonésimas'],
      132: ['duovigintillonésima', 'duovigintillonésimas'],
      135: ['milduovigintillonésima', 'milduovigintillonésimas'],
      138: ['trevigintillonésima', 'trevigintillonésimas'],
      141: ['miltrevigintillonésima', 'miltrevigintillonésimas'],
      144: ['cuatuorvigintillonésima', 'cuatuorvigintillonésimas'],
      147: ['milcuatuorvigintillonésima', 'milcuatuorvigintillonésimas'],
      150: ['quinvigintillonésima', 'quinvigintillonésimas'],
      153: ['milquinvigintillonésima', 'milquinvigintillonésimas'],
      156: ['sexvigintillonésima', 'sexvigintillonésimas'],
      159: ['milsexvigintillonésima', 'milsexvigintillonésimas'],
      162: ['septenvigintillonésima', 'septenvigintillonésimas'],
      165: ['milseptenvigintillonésima', 'milseptenvigintillonésimas'],
      168: ['octovigintillonésima', 'octovigintillonésimas'],
      171: ['miloctovigintillonésima', 'miloctovigintillonésimas'],
      174: ['novemvigintillonésima', 'novemvigintillonésimas'],
      177: ['milnovemvigintillonésima', 'milnovemvigintillonésimas'],
      180: ['trigintillonésima', 'trigintillonésimas'],
      183: ['miltrigintillonésima', 'miltrigintillonésimas'],
      186: ['untrigintillonésima', 'untrigintillonésimas'],
      189: ['miluntrigintillonésima', 'miluntrigintillonésimas'],
      192: ['duotrigintillonésima', 'duotrigintillonésimas'],
      195: ['milduotrigintillonésima', 'milduotrigintillonésimas'],
      198: ['tretrigintillonésima', 'tretrigintillonésimas'],
      201: ['miltretrigintillonésima', 'miltretrigintillonésimas'],
      204: ['cuatuortrigintillonésima', 'cuatuortrigintillonésimas'],
      207: ['milcuatuortrigintillonésima', 'milcuatuortrigintillonésimas'],
      210: ['quintrigintillonésima', 'quintrigintillonésimas'],
      213: ['milquintrigintillonésima', 'milquintrigintillonésimas'],
      216: ['sextrigintillonésima', 'sextrigintillonésimas'],
      219: ['milsextrigintillonésima', 'milsextrigintillonésimas'],
      222: ['septentrigintillonésima', 'septentrigintillonésimas'],
      225: ['milseptentrigintillonésima', 'milseptentrigintillonésimas'],
      228: ['octotrigintillonésima', 'octotrigintillonésimas'],
      231: ['miloctotrigintillonésima', 'miloctotrigintillonésimas'],
      234: ['novemtrigintillonésima', 'novemtrigintillonésimas'],
      237: ['milnovemtrigintillonésima', 'milnovemtrigintillonésimas'],
      240: ['cuadragintillonésima', 'cuadragintillonésimas'],
      243: ['milcuadragintillonésima', 'milcuadragintillonésimas'],
      246: ['uncuadragintillonésima', 'uncuadragintillonésimas'],
      249: ['miluncuadragintillonésima', 'miluncuadragintillonésimas'],
      252: ['duocuadragintillonésima', 'duocuadragintillonésimas'],
      255: ['milduocuadragintillonésima', 'milduocuadragintillonésimas'],
      258: ['trecuadragintillonésima', 'trecuadragintillonésimas'],
      261: ['miltrecuadragintillonésima', 'miltrecuadragintillonésimas'],
      264: ['cuatuorcuadragintillonésima', 'cuatuorcuadragintillonésimas'],
      267: ['milcuatuorcuadragintillonésima', 'milcuatuorcuadragintillonésimas'],
      270: ['quincuadragintillonésima', 'quincuadragintillonésimas'],
      273: ['milquincuadragintillonésima', 'milquincuadragintillonésimas'],
      276: ['sexcuadragintillonésima', 'sexcuadragintillonésimas'],
      279: ['milsexcuadragintillonésima', 'milsexcuadragintillonésimas'],
      282: ['septencuadragintillonésima', 'septencuadragintillonésimas'],
      285: ['milseptencuadragintillonésima', 'milseptencuadragintillonésimas'],
      288: ['octocuadragintillonésima', 'octocuadragintillonésimas'],
      291: ['miloctocuadragintillonésima', 'miloctocuadragintillonésimas'],
      294: ['novemcuadragintillonésima', 'novemcuadragintillonésimas'],
      297: ['milnovemcuadragintillonésima', 'milnovemcuadragintillonésimas'],
      300: ['quincuagintillonésima', 'quincuagintillonésimas']
    }
    
    // Находим ближайшее значение или используем дефолт
    let word = fractionalWords[decimalLength]
    if (!word) {
      // Если точного совпадения нет, ищем ближайшее меньшее значение
      const keys = Object.keys(fractionalWords).map(Number).sort((a, b) => b - a)
      const closest = keys.find(k => k <= decimalLength)
      word = closest ? fractionalWords[closest] : ['centésima', 'centésimas']
    }
    
    // В испанском языке: 1 - единственное, остальное - множественное
    return decimalNum === 1 ? word[0] : word[1]
  }
}

// ============================================================================
// ФРАНЦУЗСКИЙ (FR)
// ============================================================================

const FR_ONES = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf']
const FR_TEENS = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf']
const FR_TENS = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix']
const FR_SCALES = [
  '', 'mille', 'million', 'milliard', 'billion', 'billiard', 'trillion', 'trilliard', 'quadrillion', 'quadrilliard', 'quintillion', 'quintilliard',
  'sextillion', 'sextilliard', 'septillion', 'septilliard', 'octillion', 'octilliard', 'nonillion', 'nonilliard', 'décillion', 'décilliard',
  'undécillion', 'duodécillion', 'tredécillion', 'quattuordécillion', 'quindécillion', 'sexdécillion', 'septendécillion', 'octodécillion', 'novemdécillion', 'vigintillion',
  'unvigintillion', 'duovigintillion', 'trevigintillion', 'quattuorvigintillion', 'quinvigintillion', 'sexvigintillion', 'septenvigintillion', 'octovigintillion', 'novemvigintillion', 'trigintillion',
  'untrigintillion', 'duotrigintillion', 'tretrigintillion', 'quattuortrigintillion', 'quintrigintillion', 'sextrigintillion', 'septentrigintillion', 'octotrigintillion', 'novemtrigintillion', 'quadragintillion',
  'unquadragintillion', 'duoquadragintillion', 'trequadragintillion', 'quattuorquadragintillion', 'quinquadragintillion', 'sexquadragintillion', 'septenquadragintillion', 'octoquadragintillion', 'novemquadragintillion', 'quinquagintillion',
  'unquinquagintillion', 'duoquinquagintillion', 'trequinquagintillion', 'quattuorquinquagintillion', 'quinquinquagintillion', 'sexquinquagintillion', 'septenquinquagintillion', 'octoquinquagintillion', 'novemquinquagintillion', 'sexagintillion',
  'unsexagintillion', 'duosexagintillion', 'tresexagintillion', 'quattuorsexagintillion', 'quinsexagintillion', 'sexsexagintillion', 'septensexagintillion', 'octosexagintillion', 'novemsexagintillion', 'septuagintillion',
  'unseptuagintillion', 'duoseptuagintillion', 'treseptuagintillion', 'quattuorseptuagintillion', 'quinseptuagintillion', 'sexseptuagintillion', 'septenseptuagintillion', 'octoseptuagintillion', 'novemseptuagintillion', 'octogintillion',
  'unoctogintillion', 'duooctogintillion', 'treoctogintillion', 'quattuoroctogintillion', 'quinoctogintillion', 'sexoctogintillion', 'septenoctogintillion', 'octooctogintillion', 'novemoctogintillion', 'nonagintillion',
  'unnonagintillion', 'duononagintillion', 'trenonagintillion', 'quattuornonagintillion', 'quinnonagintillion', 'sexnonagintillion', 'septennonagintillion', 'octononagintillion', 'novemnonagintillion'
]

const FR_CURRENCIES: Record<Currency, CurrencyInfo> = {
  USD: { name: 'dollar américain', plural: 'dollars américains', fractional: 'cent', fractionalPlural: 'cents' },
  GBP: { name: 'livre sterling', plural: 'livres sterling', fractional: 'penny', fractionalPlural: 'pence' },
  EUR: { name: 'euro', plural: 'euros', fractional: 'centime', fractionalPlural: 'centimes' },
  PLN: { name: 'zloty', plural: 'zlotys', fractional: 'grosz', fractionalPlural: 'groszy' },
  RUB: { name: 'rouble', plural: 'roubles', fractional: 'kopek', fractionalPlural: 'kopeks' }
}

function frConvertTens(num: number): string {
  if (num < 10) return FR_ONES[num]
  if (num < 20) return FR_TEENS[num - 10]
  
  const tens = Math.floor(num / 10)
  const ones = num % 10
  
  if (tens === 7) { // 70-79: soixante-dix, soixante-onze...
    if (ones === 0) return 'soixante-dix'
    if (ones === 1) return 'soixante-et-onze'
    return 'soixante-' + FR_TEENS[ones]
  }
  
  if (tens === 8) { // 80-89: quatre-vingt, quatre-vingt-un...
    if (ones === 0) return 'quatre-vingts'
    if (ones === 1) return 'quatre-vingt-un'
    return 'quatre-vingt-' + FR_ONES[ones]
  }
  
  if (tens === 9) { // 90-99: quatre-vingt-dix, quatre-vingt-onze...
    if (ones === 0) return 'quatre-vingt-dix'
    if (ones === 1) return 'quatre-vingt-onze'
    return 'quatre-vingt-' + FR_TEENS[ones]
  }
  
  // 20-69: обычные десятки
  let result = FR_TENS[tens]
  if (ones === 1 && tens === 2) {
    result += '-et-un'
  } else if (ones > 0) {
    result += '-' + FR_ONES[ones]
  } else if (tens === 8) {
    result += 's'
  }
  
  return result
}

const frProcessor: LocaleProcessor = {
  convertHundreds(num: number): string {
    if (num === 0) return ''
    
    let result = ''
    const hundreds = Math.floor(num / 100)
    const remainder = num % 100
    
    if (hundreds > 0) {
      if (hundreds === 1) {
        result += 'cent'
      } else {
        result += FR_ONES[hundreds] + ' cent'
      }
      if (remainder === 0 && hundreds > 1) {
        result += 's'
      }
      if (remainder > 0) result += ' '
    }
    
    if (remainder > 0) {
      result += frConvertTens(remainder)
    }
    
    return result
  },
  
  convertIntegerToWords(integerStr: string): string {
    if (integerStr === '0') return 'zéro'
    integerStr = integerStr.replace(/^0+/, '') || '0'
    
    const groups: string[] = []
    for (let i = integerStr.length; i > 0; i -= 3) {
      const start = Math.max(0, i - 3)
      groups.unshift(integerStr.substring(start, i))
    }
    
    const words: string[] = []
    for (let i = 0; i < groups.length; i++) {
      const group = parseInt(groups[i], 10)
      if (group === 0) continue
      
      const scaleIndex = groups.length - 1 - i
      let groupWords = this.convertHundreds(group)
      
      if (groupWords) {
        if (scaleIndex === 1 && group === 1) {
          words.push('mille')
        } else {
          words.push(groupWords)
          if (scaleIndex > 0 && FR_SCALES[scaleIndex]) {
            const scale = FR_SCALES[scaleIndex]
            if (scaleIndex === 2 && group > 1) {
              words.push(scale + 's')
            } else {
              words.push(scale)
            }
          }
        }
      }
    }
    
    return words.join(' ')
  },
  
  convertDecimalToWords(decimalStr: string): string {
    const decimalClean = decimalStr.replace(/^0+/, '') || '0'
    return this.convertIntegerToWords(decimalClean)
  },
  
  getCurrencyName(currency: Currency, amount: number): string {
    const info = FR_CURRENCIES[currency]
    return amount === 1 ? info.name : info.plural
  },
  
  getFractionalName(currency: Currency, amount: number): string {
    const info = FR_CURRENCIES[currency]
    return amount === 1 ? info.fractional : info.fractionalPlural
  },
  
  getMinusWord(): string { return 'moins' },
  getAndWord(): string { return 'et' },
  getVatPhrase(vatRate: number, vatAmount: string): string {
    return `, TVA incluse (${vatRate}%) d'un montant de ${vatAmount}`
  },
  getZeroWord(): string { return 'zéro' },
  getHundredthWord(singular: boolean): string {
    return singular ? 'centième' : 'centièmes'
  },
  getFractionalWord(decimalLength: number, decimalNum: number): string {
    // Массив дробных частей: индекс соответствует количеству знаков после запятой
    // Формат: [единственное число, множественное число]
    const fractionalWords: Record<number, [string, string]> = {
      1: ['dixième', 'dixièmes'],
      2: ['centième', 'centièmes'],
      3: ['millième', 'millièmes'],
      4: ['dix-millième', 'dix-millièmes'],
      5: ['cent-millième', 'cent-millièmes'],
      6: ['millionième', 'millionièmes'],
      7: ['dix-millionième', 'dix-millionièmes'],
      8: ['cent-millionième', 'cent-millionièmes'],
      9: ['milliardième', 'milliardièmes'],
      10: ['dix-milliardième', 'dix-milliardièmes'],
      11: ['cent-milliardième', 'cent-milliardièmes'],
      12: ['billionième', 'billionièmes'],
      15: ['billiardième', 'billiardièmes'],
      18: ['trillionième', 'trillionièmes'],
      21: ['trilliardième', 'trilliardièmes'],
      24: ['quadrillionième', 'quadrillionièmes'],
      27: ['quadrilliardième', 'quadrilliardièmes'],
      30: ['quintillionième', 'quintillionièmes'],
      33: ['quintilliardième', 'quintilliardièmes'],
      36: ['sextillionième', 'sextillionièmes'],
      39: ['sextilliardième', 'sextilliardièmes'],
      42: ['septillionième', 'septillionièmes'],
      45: ['septilliardième', 'septilliardièmes'],
      48: ['octillionième', 'octillionièmes'],
      51: ['octilliardième', 'octilliardièmes'],
      54: ['nonillionième', 'nonillionièmes'],
      57: ['nonilliardième', 'nonilliardièmes'],
      60: ['décillionième', 'décillionièmes'],
      63: ['décilliardième', 'décilliardièmes'],
      66: ['undécillionième', 'undécillionièmes'],
      69: ['duodécillionième', 'duodécillionièmes'],
      72: ['tredécillionième', 'tredécillionièmes'],
      75: ['quattuordécillionième', 'quattuordécillionièmes'],
      78: ['quindécillionième', 'quindécillionièmes'],
      81: ['sexdécillionième', 'sexdécillionièmes'],
      84: ['septendécillionième', 'septendécillionièmes'],
      87: ['octodécillionième', 'octodécillionièmes'],
      90: ['novemdécillionième', 'novemdécillionièmes'],
      93: ['vigintillionième', 'vigintillionièmes'],
      96: ['unvigintillionième', 'unvigintillionièmes'],
      99: ['duovigintillionième', 'duovigintillionièmes'],
      102: ['trevigintillionième', 'trevigintillionièmes'],
      105: ['quattuorvigintillionième', 'quattuorvigintillionièmes'],
      108: ['quinvigintillionième', 'quinvigintillionièmes'],
      111: ['sexvigintillionième', 'sexvigintillionièmes'],
      114: ['septenvigintillionième', 'septenvigintillionièmes'],
      117: ['octovigintillionième', 'octovigintillionièmes'],
      120: ['novemvigintillionième', 'novemvigintillionièmes'],
      123: ['trigintillionième', 'trigintillionièmes'],
      126: ['untrigintillionième', 'untrigintillionièmes'],
      129: ['duotrigintillionième', 'duotrigintillionièmes'],
      132: ['tretrigintillionième', 'tretrigintillionièmes'],
      135: ['quattuortrigintillionième', 'quattuortrigintillionièmes'],
      138: ['quintrigintillionième', 'quintrigintillionièmes'],
      141: ['sextrigintillionième', 'sextrigintillionièmes'],
      144: ['septentrigintillionième', 'septentrigintillionièmes'],
      147: ['octotrigintillionième', 'octotrigintillionièmes'],
      150: ['novemtrigintillionième', 'novemtrigintillionièmes'],
      153: ['quadragintillionième', 'quadragintillionièmes'],
      156: ['unquadragintillionième', 'unquadragintillionièmes'],
      159: ['duoquadragintillionième', 'duoquadragintillionièmes'],
      162: ['trequadragintillionième', 'trequadragintillionièmes'],
      165: ['quattuorquadragintillionième', 'quattuorquadragintillionièmes'],
      168: ['quinquadragintillionième', 'quinquadragintillionièmes'],
      171: ['sexquadragintillionième', 'sexquadragintillionièmes'],
      174: ['septenquadragintillionième', 'septenquadragintillionièmes'],
      177: ['octoquadragintillionième', 'octoquadragintillionièmes'],
      180: ['novemquadragintillionième', 'novemquadragintillionièmes'],
      183: ['quinquagintillionième', 'quinquagintillionièmes'],
      186: ['unquinquagintillionième', 'unquinquagintillionièmes'],
      189: ['duoquinquagintillionième', 'duoquinquagintillionièmes'],
      192: ['trequinquagintillionième', 'trequinquagintillionièmes'],
      195: ['quattuorquinquagintillionième', 'quattuorquinquagintillionièmes'],
      198: ['quinquinquagintillionième', 'quinquinquagintillionièmes'],
      201: ['sexquinquagintillionième', 'sexquinquagintillionièmes'],
      204: ['septenquinquagintillionième', 'septenquinquagintillionièmes'],
      207: ['octoquinquagintillionième', 'octoquinquagintillionièmes'],
      210: ['novemquinquagintillionième', 'novemquinquagintillionièmes'],
      213: ['sexagintillionième', 'sexagintillionièmes'],
      216: ['unsexagintillionième', 'unsexagintillionièmes'],
      219: ['duosexagintillionième', 'duosexagintillionièmes'],
      222: ['tresexagintillionième', 'tresexagintillionièmes'],
      225: ['quattuorsexagintillionième', 'quattuorsexagintillionièmes'],
      228: ['quinsexagintillionième', 'quinsexagintillionièmes'],
      231: ['sexsexagintillionième', 'sexsexagintillionièmes'],
      234: ['septensexagintillionième', 'septensexagintillionièmes'],
      237: ['octosexagintillionième', 'octosexagintillionièmes'],
      240: ['novemsexagintillionième', 'novemsexagintillionièmes'],
      243: ['septuagintillionième', 'septuagintillionièmes'],
      246: ['unseptuagintillionième', 'unseptuagintillionièmes'],
      249: ['duoseptuagintillionième', 'duoseptuagintillionièmes'],
      252: ['treseptuagintillionième', 'treseptuagintillionièmes'],
      255: ['quattuorseptuagintillionième', 'quattuorseptuagintillionièmes'],
      258: ['quinseptuagintillionième', 'quinseptuagintillionièmes'],
      261: ['sexseptuagintillionième', 'sexseptuagintillionièmes'],
      264: ['septenseptuagintillionième', 'septenseptuagintillionièmes'],
      267: ['octoseptuagintillionième', 'octoseptuagintillionièmes'],
      270: ['novemseptuagintillionième', 'novemseptuagintillionièmes'],
      273: ['octogintillionième', 'octogintillionièmes'],
      276: ['unoctogintillionième', 'unoctogintillionièmes'],
      279: ['duooctogintillionième', 'duooctogintillionièmes'],
      282: ['treoctogintillionième', 'treoctogintillionièmes'],
      285: ['quattuoroctogintillionième', 'quattuoroctogintillionièmes'],
      288: ['quinoctogintillionième', 'quinoctogintillionièmes'],
      291: ['sexoctogintillionième', 'sexoctogintillionièmes'],
      294: ['septenoctogintillionième', 'septenoctogintillionièmes'],
      297: ['octooctogintillionième', 'octooctogintillionièmes'],
      300: ['novemoctogintillionième', 'novemoctogintillionièmes']
    }
    
    // Находим ближайшее значение или используем дефолт
    let word = fractionalWords[decimalLength]
    if (!word) {
      // Если точного совпадения нет, ищем ближайшее меньшее значение
      const keys = Object.keys(fractionalWords).map(Number).sort((a, b) => b - a)
      const closest = keys.find(k => k <= decimalLength)
      word = closest ? fractionalWords[closest] : ['centième', 'centièmes']
    }
    
    // Во французском языке: 1 - единственное, остальное - множественное
    return decimalNum === 1 ? word[0] : word[1]
  }
}

// ============================================================================
// ИТАЛЬЯНСКИЙ (IT)
// ============================================================================

const IT_ONES = ['', 'uno', 'due', 'tre', 'quattro', 'cinque', 'sei', 'sette', 'otto', 'nove']
const IT_TEENS = ['dieci', 'undici', 'dodici', 'tredici', 'quattordici', 'quindici', 'sedici', 'diciassette', 'diciotto', 'diciannove']
const IT_TENS = ['', '', 'venti', 'trenta', 'quaranta', 'cinquanta', 'sessanta', 'settanta', 'ottanta', 'novanta']
const IT_SCALES = [
  '', 'mille', 'milione', 'miliardo', 'bilione', 'biliardo', 'trilione', 'triliardo', 'quadrilione', 'quadriliardo', 'quintilione', 'quintiliardo',
  'sestilione', 'sestiliardo', 'settilione', 'settiliardo', 'ottilione', 'ottiliardo', 'nonilione', 'noniliardo', 'decilione', 'deciliardo',
  'undecilione', 'duodecilione', 'tredecilione', 'quattuorde cilione', 'quindecilione', 'sestdecilione', 'settendecilione', 'ottodecilione', 'novemdecilione', 'vigintilione',
  'unvigintilione', 'duovigintilione', 'trevigintilione', 'quattuorvigintilione', 'quinvigintilione', 'sestvigintilione', 'settenvigintilione', 'ottovigintilione', 'novemvigintilione', 'trigintilione',
  'untrigintilione', 'duotrigintilione', 'tretrigintilione', 'quattuortrigintilione', 'quintrigintilione', 'sestrigintilione', 'settentrigintilione', 'ottotrigintilione', 'novemtrigintilione', 'quadragintilione',
  'unquadragintilione', 'duoquadragintilione', 'trequadragintilione', 'quattuorquadragintilione', 'quinquadragintilione', 'sestquadragintilione', 'settenquadragintilione', 'ottoquadragintilione', 'novemquadragintilione', 'quinquagintilione',
  'unquinquagintilione', 'duoquinquagintilione', 'trequinquagintilione', 'quattuorquinquagintilione', 'quinquinquagintilione', 'sestquinquagintilione', 'settenquinquagintilione', 'ottoquinquagintilione', 'novemquinquagintilione', 'sestagintilione',
  'unsestagintilione', 'duosestagintilione', 'tresestagintilione', 'quattuorsestagintilione', 'quinsestagintilione', 'sestsestagintilione', 'settensestagintilione', 'ottosestagintilione', 'novemsestagintilione', 'settantagintilione',
  'unsettantagintilione', 'duosettantagintilione', 'tresettantagintilione', 'quattuorsettantagintilione', 'quinsettantagintilione', 'sestsettantagintilione', 'settensettantagintilione', 'ottosettantagintilione', 'novemsettantagintilione', 'ottantagintilione',
  'unottantagintilione', 'duoottantagintilione', 'treottantagintilione', 'quattuorottantagintilione', 'quinottantagintilione', 'sestottantagintilione', 'settenottantagintilione', 'ottoottantagintilione', 'novemottantagintilione', 'nonantagintilione',
  'unnonantagintilione', 'duononantagintilione', 'trenonantagintilione', 'quattuornonantagintilione', 'quinnonantagintilione', 'sestnonantagintilione', 'settennonantagintilione', 'ottononantagintilione', 'novemnonantagintilione'
]

const IT_CURRENCIES: Record<Currency, CurrencyInfo> = {
  USD: { name: 'dollaro statunitense', plural: 'dollari statunitensi', fractional: 'centesimo', fractionalPlural: 'centesimi' },
  GBP: { name: 'sterlina britannica', plural: 'sterline britanniche', fractional: 'penny', fractionalPlural: 'pence' },
  EUR: { name: 'euro', plural: 'euro', fractional: 'centesimo', fractionalPlural: 'centesimi' },
  PLN: { name: 'zloty', plural: 'zloty', fractional: 'grosz', fractionalPlural: 'groszy' },
  RUB: { name: 'rublo', plural: 'rubli', fractional: 'kopek', fractionalPlural: 'kopeks' }
}

const itProcessor: LocaleProcessor = {
  convertHundreds(num: number): string {
    if (num === 0) return ''
    
    let result = ''
    const hundreds = Math.floor(num / 100)
    const remainder = num % 100
    
    if (hundreds > 0) {
      if (hundreds === 1) {
        result += 'cento'
      } else {
        result += IT_ONES[hundreds] + 'cento'
      }
    }
    
    if (remainder >= 10 && remainder < 20) {
      result += IT_TEENS[remainder - 10]
    } else if (remainder > 0) {
      const tens = Math.floor(remainder / 10)
      const ones = remainder % 10
      if (tens > 0) {
        let tensWord = IT_TENS[tens]
        if (ones === 1 || ones === 8) {
          tensWord = tensWord.slice(0, -1)
        }
        result += tensWord
      }
      if (ones > 0) {
        result += IT_ONES[ones]
      }
    }
    
    return result
  },
  
  convertIntegerToWords(integerStr: string): string {
    if (integerStr === '0') return 'zero'
    integerStr = integerStr.replace(/^0+/, '') || '0'
    
    const groups: string[] = []
    for (let i = integerStr.length; i > 0; i -= 3) {
      const start = Math.max(0, i - 3)
      groups.unshift(integerStr.substring(start, i))
    }
    
    const words: string[] = []
    for (let i = 0; i < groups.length; i++) {
      const group = parseInt(groups[i], 10)
      if (group === 0) continue
      
      const scaleIndex = groups.length - 1 - i
      const groupWords = this.convertHundreds(group)
      
      if (groupWords) {
        if (scaleIndex === 1 && group === 1) {
          words.push('mille')
        } else {
          words.push(groupWords)
          if (scaleIndex > 0 && IT_SCALES[scaleIndex]) {
            const scale = IT_SCALES[scaleIndex]
            if (scaleIndex === 2 && group > 1) {
              words.push(scale.replace('e', 'i'))
            } else {
              words.push(scale)
            }
          }
        }
      }
    }
    
    return words.join('')
  },
  
  convertDecimalToWords(decimalStr: string): string {
    const decimalClean = decimalStr.replace(/^0+/, '') || '0'
    return this.convertIntegerToWords(decimalClean)
  },
  
  getCurrencyName(currency: Currency, amount: number): string {
    const info = IT_CURRENCIES[currency]
    return amount === 1 ? info.name : info.plural
  },
  
  getFractionalName(currency: Currency, amount: number): string {
    const info = IT_CURRENCIES[currency]
    return amount === 1 ? info.fractional : info.fractionalPlural
  },
  
  getMinusWord(): string { return 'meno' },
  getAndWord(): string { return 'e' },
  getVatPhrase(vatRate: number, vatAmount: string): string {
    return `, IVA inclusa (${vatRate}%) per un importo di ${vatAmount}`
  },
  getZeroWord(): string { return 'zero' },
  getHundredthWord(singular: boolean): string {
    return singular ? 'centesimo' : 'centesimi'
  },
  getFractionalWord(decimalLength: number, decimalNum: number): string {
    // Массив дробных частей: индекс соответствует количеству знаков после запятой
    // Формат: [единственное число, множественное число]
    const fractionalWords: Record<number, [string, string]> = {
      1: ['decimo', 'decimi'],
      2: ['centesimo', 'centesimi'],
      3: ['millesimo', 'millesimi'],
      4: ['decimillesimo', 'decimillesimi'],
      5: ['centomillesimo', 'centomillesimi'],
      6: ['milionesimo', 'milionesimi'],
      7: ['diecimilionesimo', 'diecimilionesimi'],
      8: ['centomilionesimo', 'centomilionesimi'],
      9: ['miliardesimo', 'miliardesimi'],
      10: ['diecimiliardesimo', 'diecimiliardesimi'],
      11: ['centomiliardesimo', 'centomiliardesimi'],
      12: ['bilionesimo', 'bilionesimi'],
      15: ['biliardesimo', 'biliardesimi'],
      18: ['trilionesimo', 'trilionesimi'],
      21: ['triliardesimo', 'triliardesimi'],
      24: ['quadrilionesimo', 'quadrilionesimi'],
      27: ['quadriliardesimo', 'quadriliardesimi'],
      30: ['quintilionesimo', 'quintilionesimi'],
      33: ['quintiliardesimo', 'quintiliardesimi'],
      36: ['sestilionesimo', 'sestilionesimi'],
      39: ['sestiliardesimo', 'sestiliardesimi'],
      42: ['settilionesimo', 'settilionesimi'],
      45: ['settiliardesimo', 'settiliardesimi'],
      48: ['ottilionesimo', 'ottilionesimi'],
      51: ['ottiliardesimo', 'ottiliardesimi'],
      54: ['nonilionesimo', 'nonilionesimi'],
      57: ['noniliardesimo', 'noniliardesimi'],
      60: ['decilionesimo', 'decilionesimi'],
      63: ['deciliardesimo', 'deciliardesimi'],
      66: ['undecilionesimo', 'undecilionesimi'],
      69: ['duodecilionesimo', 'duodecilionesimi'],
      72: ['tredecilionesimo', 'tredecilionesimi'],
      75: ['quattuorde cilionesimo', 'quattuorde cilionesimi'],
      78: ['quindecilionesimo', 'quindecilionesimi'],
      81: ['sestdecilionesimo', 'sestdecilionesimi'],
      84: ['settendecilionesimo', 'settendecilionesimi'],
      87: ['ottodecilionesimo', 'ottodecilionesimi'],
      90: ['novemdecilionesimo', 'novemdecilionesimi'],
      93: ['vigintilionesimo', 'vigintilionesimi'],
      96: ['unvigintilionesimo', 'unvigintilionesimi'],
      99: ['duovigintilionesimo', 'duovigintilionesimi'],
      102: ['trevigintilionesimo', 'trevigintilionesimi'],
      105: ['quattuorvigintilionesimo', 'quattuorvigintilionesimi'],
      108: ['quinvigintilionesimo', 'quinvigintilionesimi'],
      111: ['sestvigintilionesimo', 'sestvigintilionesimi'],
      114: ['settenvigintilionesimo', 'settenvigintilionesimi'],
      117: ['ottovigintilionesimo', 'ottovigintilionesimi'],
      120: ['novemvigintilionesimo', 'novemvigintilionesimi'],
      123: ['trigintilionesimo', 'trigintilionesimi'],
      126: ['untrigintilionesimo', 'untrigintilionesimi'],
      129: ['duotrigintilionesimo', 'duotrigintilionesimi'],
      132: ['tretrigintilionesimo', 'tretrigintilionesimi'],
      135: ['quattuortrigintilionesimo', 'quattuortrigintilionesimi'],
      138: ['quintrigintilionesimo', 'quintrigintilionesimi'],
      141: ['sestrigintilionesimo', 'sestrigintilionesimi'],
      144: ['settentrigintilionesimo', 'settentrigintilionesimi'],
      147: ['ottotrigintilionesimo', 'ottotrigintilionesimi'],
      150: ['novemtrigintilionesimo', 'novemtrigintilionesimi'],
      153: ['quadragintilionesimo', 'quadragintilionesimi'],
      156: ['unquadragintilionesimo', 'unquadragintilionesimi'],
      159: ['duoquadragintilionesimo', 'duoquadragintilionesimi'],
      162: ['trequadragintilionesimo', 'trequadragintilionesimi'],
      165: ['quattuorquadragintilionesimo', 'quattuorquadragintilionesimi'],
      168: ['quinquadragintilionesimo', 'quinquadragintilionesimi'],
      171: ['sestquadragintilionesimo', 'sestquadragintilionesimi'],
      174: ['settenquadragintilionesimo', 'settenquadragintilionesimi'],
      177: ['ottoquadragintilionesimo', 'ottoquadragintilionesimi'],
      180: ['novemquadragintilionesimo', 'novemquadragintilionesimi'],
      183: ['quinquagintilionesimo', 'quinquagintilionesimi'],
      186: ['unquinquagintilionesimo', 'unquinquagintilionesimi'],
      189: ['duoquinquagintilionesimo', 'duoquinquagintilionesimi'],
      192: ['trequinquagintilionesimo', 'trequinquagintilionesimi'],
      195: ['quattuorquinquagintilionesimo', 'quattuorquinquagintilionesimi'],
      198: ['quinquinquagintilionesimo', 'quinquinquagintilionesimi'],
      201: ['sestquinquagintilionesimo', 'sestquinquagintilionesimi'],
      204: ['settenquinquagintilionesimo', 'settenquinquagintilionesimi'],
      207: ['ottoquinquagintilionesimo', 'ottoquinquagintilionesimi'],
      210: ['novemquinquagintilionesimo', 'novemquinquagintilionesimi'],
      213: ['sestagintilionesimo', 'sestagintilionesimi'],
      216: ['unsestagintilionesimo', 'unsestagintilionesimi'],
      219: ['duosestagintilionesimo', 'duosestagintilionesimi'],
      222: ['tresestagintilionesimo', 'tresestagintilionesimi'],
      225: ['quattuorsestagintilionesimo', 'quattuorsestagintilionesimi'],
      228: ['quinsestagintilionesimo', 'quinsestagintilionesimi'],
      231: ['sestsestagintilionesimo', 'sestsestagintilionesimi'],
      234: ['settensestagintilionesimo', 'settensestagintilionesimi'],
      237: ['ottosestagintilionesimo', 'ottosestagintilionesimi'],
      240: ['novemsestagintilionesimo', 'novemsestagintilionesimi'],
      243: ['settantagintilionesimo', 'settantagintilionesimi'],
      246: ['unsettantagintilionesimo', 'unsettantagintilionesimi'],
      249: ['duosettantagintilionesimo', 'duosettantagintilionesimi'],
      252: ['tresettantagintilionesimo', 'tresettantagintilionesimi'],
      255: ['quattuorsettantagintilionesimo', 'quattuorsettantagintilionesimi'],
      258: ['quinsettantagintilionesimo', 'quinsettantagintilionesimi'],
      261: ['sestsettantagintilionesimo', 'sestsettantagintilionesimi'],
      264: ['settensettantagintilionesimo', 'settensettantagintilionesimi'],
      267: ['ottosettantagintilionesimo', 'ottosettantagintilionesimi'],
      270: ['novemsettantagintilionesimo', 'novemsettantagintilionesimi'],
      273: ['ottantagintilionesimo', 'ottantagintilionesimi'],
      276: ['unottantagintilionesimo', 'unottantagintilionesimi'],
      279: ['duoottantagintilionesimo', 'duoottantagintilionesimi'],
      282: ['treottantagintilionesimo', 'treottantagintilionesimi'],
      285: ['quattuorottantagintilionesimo', 'quattuorottantagintilionesimi'],
      288: ['quinottantagintilionesimo', 'quinottantagintilionesimi'],
      291: ['sestottantagintilionesimo', 'sestottantagintilionesimi'],
      294: ['settenottantagintilionesimo', 'settenottantagintilionesimi'],
      297: ['ottoottantagintilionesimo', 'ottoottantagintilionesimi'],
      300: ['novemottantagintilionesimo', 'novemottantagintilionesimi']
    }
    
    // Находим ближайшее значение или используем дефолт
    let word = fractionalWords[decimalLength]
    if (!word) {
      // Если точного совпадения нет, ищем ближайшее меньшее значение
      const keys = Object.keys(fractionalWords).map(Number).sort((a, b) => b - a)
      const closest = keys.find(k => k <= decimalLength)
      word = closest ? fractionalWords[closest] : ['centesimo', 'centesimi']
    }
    
    // В итальянском языке: 1 - единственное, остальное - множественное
    return decimalNum === 1 ? word[0] : word[1]
  }
}

// ============================================================================
// ПОЛЬСКИЙ (PL)
// ============================================================================

const PL_ONES = ['', 'jeden', 'dwa', 'trzy', 'cztery', 'pięć', 'sześć', 'siedem', 'osiem', 'dziewięć']
const PL_TEENS = ['dziesięć', 'jedenaście', 'dwanaście', 'trzynaście', 'czternaście', 'piętnaście', 'szesnaście', 'siedemnaście', 'osiemnaście', 'dziewiętnaście']
const PL_TENS = ['', '', 'dwadzieścia', 'trzydzieści', 'czterdzieści', 'pięćdziesiąt', 'sześćdziesiąt', 'siedemdziesiąt', 'osiemdziesiąt', 'dziewięćdziesiąt']
const PL_HUNDREDS = ['', 'sto', 'dwieście', 'trzysta', 'czterysta', 'pięćset', 'sześćset', 'siedemset', 'osiemset', 'dziewięćset']
const PL_SCALES = [
  '', 'tysiąc', 'milion', 'miliard', 'bilion', 'biliard', 'trylion', 'tryliard', 'kwadrylion', 'kwadryliard', 'kwintylion', 'kwintyliard',
  'sekstylion', 'sekstyliard', 'septylion', 'septyliard', 'oktylion', 'oktyliard', 'nonylion', 'nonyliard', 'decylion', 'decyliard',
  'undecylion', 'duodecylion', 'tredecylion', 'kwatuordecylion', 'kwindecylion', 'seksdecylion', 'septendecylion', 'oktodecylion', 'nowemdecylion', 'wigintylion',
  'unwigintylion', 'duowigintylion', 'trewigintylion', 'kwatuorwigintylion', 'kwinwigintylion', 'sekswigintylion', 'septenwigintylion', 'oktowigintylion', 'nowemwigintylion', 'trigintylion',
  'untrigintylion', 'duotrigintylion', 'tretrigintylion', 'kwatuortrigintylion', 'kwintrigintylion', 'sekstrigintylion', 'septentrigintylion', 'oktotrigintylion', 'nowemtrigintylion', 'kwadragintylion',
  'unkwadragintylion', 'duokwadragintylion', 'trekwadragintylion', 'kwatuorkwadragintylion', 'kwinkwadragintylion', 'sekskwadragintylion', 'septenkwadragintylion', 'oktokwadragintylion', 'nowemkwadragintylion', 'kwinkwagintylion',
  'unkwinkwagintylion', 'duokwinkwagintylion', 'trekwinkwagintylion', 'kwatuorkwinkwagintylion', 'kwinkwinkwagintylion', 'sekskwinkwagintylion', 'septenkwinkwagintylion', 'oktokwinkwagintylion', 'nowemkwinkwagintylion', 'seksagintylion',
  'unseksagintylion', 'duoseksagintylion', 'treseksagintylion', 'kwatuorseksagintylion', 'kwinseksagintylion', 'seksseksagintylion', 'septenseksagintylion', 'oktoseksagintylion', 'nowemseksagintylion', 'septuagintylion',
  'unseptuagintylion', 'duoseptuagintylion', 'treseptuagintylion', 'kwatuorseptuagintylion', 'kwinseptuagintylion', 'seksseptuagintylion', 'septenseptuagintylion', 'oktoseptuagintylion', 'nowemseptuagintylion', 'oktagintylion',
  'unoktagintylion', 'duoktagintylion', 'treoktagintylion', 'kwatuoroktagintylion', 'kwinoktagintylion', 'seksoktagintylion', 'septenoktagintylion', 'oktooktagintylion', 'nowemoktagintylion', 'nonagintylion',
  'unnonagintylion', 'duononagintylion', 'trenonagintylion', 'kwatuornonagintylion', 'kwinnonagintylion', 'seksnonagintylion', 'septennonagintylion', 'oktononagintylion', 'nowemnonagintylion'
]

function getPlDeclension(num: number, forms: [string, string, string]): string {
  const mod10 = num % 10
  const mod100 = num % 100
  if (mod100 >= 11 && mod100 <= 19) return forms[2]
  if (mod10 === 1) return forms[0]
  if (mod10 >= 2 && mod10 <= 4) return forms[1]
  return forms[2]
}

const PL_CURRENCIES: Record<Currency, CurrencyInfo> = {
  USD: { name: 'dolar amerykański', plural: 'dolary amerykańskie', fractional: 'cent', fractionalPlural: 'centy' },
  GBP: { name: 'funt szterling', plural: 'funty szterlingi', fractional: 'pens', fractionalPlural: 'pensy' },
  EUR: { name: 'euro', plural: 'euro', fractional: 'cent', fractionalPlural: 'centy' },
  PLN: { name: 'złoty', plural: 'złote', fractional: 'grosz', fractionalPlural: 'grosze' },
  RUB: { name: 'rubel', plural: 'ruble', fractional: 'kopiejka', fractionalPlural: 'kopiejki' }
}

const plProcessor: LocaleProcessor = {
  convertHundreds(num: number): string {
    if (num === 0) return ''
    
    let result = ''
    const hundreds = Math.floor(num / 100)
    const remainder = num % 100
    
    if (hundreds > 0) {
      result += PL_HUNDREDS[hundreds]
      if (remainder > 0) result += ' '
    }
    
    if (remainder >= 10 && remainder < 20) {
      result += PL_TEENS[remainder - 10]
    } else {
      const tens = Math.floor(remainder / 10)
      const ones = remainder % 10
      if (tens > 0) {
        result += PL_TENS[tens]
        if (ones > 0) result += ' '
      }
      if (ones > 0) {
        result += PL_ONES[ones]
      }
    }
    
    return result
  },
  
  convertIntegerToWords(integerStr: string): string {
    if (integerStr === '0') return 'zero'
    integerStr = integerStr.replace(/^0+/, '') || '0'
    
    const groups: string[] = []
    for (let i = integerStr.length; i > 0; i -= 3) {
      const start = Math.max(0, i - 3)
      groups.unshift(integerStr.substring(start, i))
    }
    
    const words: string[] = []
    for (let i = 0; i < groups.length; i++) {
      const group = parseInt(groups[i], 10)
      if (group === 0) continue
      
      const scaleIndex = groups.length - 1 - i
      const groupWords = this.convertHundreds(group)
      
      if (groupWords) {
        words.push(groupWords)
        if (scaleIndex > 0 && PL_SCALES[scaleIndex]) {
          const scale = PL_SCALES[scaleIndex]
          const declension = getPlDeclension(group, [scale, scale + 'y', scale + 'ów'])
          words.push(declension)
        }
      }
    }
    
    return words.join(' ')
  },
  
  convertDecimalToWords(decimalStr: string): string {
    const decimalClean = decimalStr.replace(/^0+/, '') || '0'
    return this.convertIntegerToWords(decimalClean)
  },
  
  getCurrencyName(currency: Currency, amount: number): string {
    const info = PL_CURRENCIES[currency]
    return getPlDeclension(amount, [info.name, info.name, info.plural])
  },
  
  getFractionalName(currency: Currency, amount: number): string {
    const info = PL_CURRENCIES[currency]
    return getPlDeclension(amount, [info.fractional, info.fractional, info.fractionalPlural])
  },
  
  getMinusWord(): string { return 'minus' },
  getAndWord(): string { return 'i' },
  getVatPhrase(vatRate: number, vatAmount: string): string {
    return `, w tym VAT (${vatRate}%) w kwocie ${vatAmount}`
  },
  getZeroWord(): string { return 'zero' },
  getHundredthWord(singular: boolean): string {
    return singular ? 'setna' : 'setne'
  },
  getFractionalWord(decimalLength: number, decimalNum: number): string {
    // Массив дробных частей: индекс соответствует количеству знаков после запятой
    // Формат: [единственное число, множественное число]
    const fractionalWords: Record<number, [string, string]> = {
      1: ['dziesiąta', 'dziesiąte'],
      2: ['setna', 'setne'],
      3: ['tysięczna', 'tysięczne'],
      4: ['dziesięciotysięczna', 'dziesięciotysięczne'],
      5: ['stutysięczna', 'stutysięczne'],
      6: ['milionowa', 'milionowe'],
      7: ['dziesięciomilionowa', 'dziesięciomilionowe'],
      8: ['stumilionowa', 'stumilionowe'],
      9: ['miliardowa', 'miliardowe'],
      10: ['dziesięciomiliardowa', 'dziesięciomiliardowe'],
      11: ['stumiliardowa', 'stumiliardowe'],
      12: ['bilionowa', 'bilionowe'],
      15: ['biliardowa', 'biliardowe'],
      18: ['trylionowa', 'trylionowe'],
      21: ['tryliardowa', 'tryliardowe'],
      24: ['kwadrylionowa', 'kwadrylionowe'],
      27: ['kwadryliardowa', 'kwadryliardowe'],
      30: ['kwintylionowa', 'kwintylionowe'],
      33: ['kwintyliardowa', 'kwintyliardowe'],
      36: ['sekstylionowa', 'sekstylionowe'],
      39: ['sekstyliardowa', 'sekstyliardowe'],
      42: ['septylionowa', 'septylionowe'],
      45: ['septyliardowa', 'septyliardowe'],
      48: ['oktylionowa', 'oktylionowe'],
      51: ['oktyliardowa', 'oktyliardowe'],
      54: ['nonylionowa', 'nonylionowe'],
      57: ['nonyliardowa', 'nonyliardowe'],
      60: ['decylionowa', 'decylionowe'],
      63: ['decyliardowa', 'decyliardowe'],
      66: ['undecylionowa', 'undecylionowe'],
      69: ['duodecylionowa', 'duodecylionowe'],
      72: ['tredecylionowa', 'tredecylionowe'],
      75: ['kwatuordecylionowa', 'kwatuordecylionowe'],
      78: ['kwindecylionowa', 'kwindecylionowe'],
      81: ['seksdecylionowa', 'seksdecylionowe'],
      84: ['septendecylionowa', 'septendecylionowe'],
      87: ['oktodecylionowa', 'oktodecylionowe'],
      90: ['nowemdecylionowa', 'nowemdecylionowe'],
      93: ['wigintylionowa', 'wigintylionowe'],
      96: ['unwigintylionowa', 'unwigintylionowe'],
      99: ['duowigintylionowa', 'duowigintylionowe'],
      102: ['trewigintylionowa', 'trewigintylionowe'],
      105: ['kwatuorwigintylionowa', 'kwatuorwigintylionowe'],
      108: ['kwinwigintylionowa', 'kwinwigintylionowe'],
      111: ['sekswigintylionowa', 'sekswigintylionowe'],
      114: ['septenwigintylionowa', 'septenwigintylionowe'],
      117: ['oktowigintylionowa', 'oktowigintylionowe'],
      120: ['nowemwigintylionowa', 'nowemwigintylionowe'],
      123: ['trigintylionowa', 'trigintylionowe'],
      126: ['untrigintylionowa', 'untrigintylionowe'],
      129: ['duotrigintylionowa', 'duotrigintylionowe'],
      132: ['tretrigintylionowa', 'tretrigintylionowe'],
      135: ['kwatuortrigintylionowa', 'kwatuortrigintylionowe'],
      138: ['kwintrigintylionowa', 'kwintrigintylionowe'],
      141: ['sekstrigintylionowa', 'sekstrigintylionowe'],
      144: ['septentrigintylionowa', 'septentrigintylionowe'],
      147: ['oktotrigintylionowa', 'oktotrigintylionowe'],
      150: ['nowemtrigintylionowa', 'nowemtrigintylionowe'],
      153: ['kwadragintylionowa', 'kwadragintylionowe'],
      156: ['unkwadragintylionowa', 'unkwadragintylionowe'],
      159: ['duokwadragintylionowa', 'duokwadragintylionowe'],
      162: ['trekwadragintylionowa', 'trekwadragintylionowe'],
      165: ['kwatuorkwadragintylionowa', 'kwatuorkwadragintylionowe'],
      168: ['kwinkwadragintylionowa', 'kwinkwadragintylionowe'],
      171: ['sekskwadragintylionowa', 'sekskwadragintylionowe'],
      174: ['septenkwadragintylionowa', 'septenkwadragintylionowe'],
      177: ['oktokwadragintylionowa', 'oktokwadragintylionowe'],
      180: ['nowemkwadragintylionowa', 'nowemkwadragintylionowe'],
      183: ['kwinkwagintylionowa', 'kwinkwagintylionowe'],
      186: ['unkwinkwagintylionowa', 'unkwinkwagintylionowe'],
      189: ['duokwinkwagintylionowa', 'duokwinkwagintylionowe'],
      192: ['trekwinkwagintylionowa', 'trekwinkwagintylionowe'],
      195: ['kwatuorkwinkwagintylionowa', 'kwatuorkwinkwagintylionowe'],
      198: ['kwinkwinkwagintylionowa', 'kwinkwinkwagintylionowe'],
      201: ['sekskwinkwagintylionowa', 'sekskwinkwagintylionowe'],
      204: ['septenkwinkwagintylionowa', 'septenkwinkwagintylionowe'],
      207: ['oktokwinkwagintylionowa', 'oktokwinkwagintylionowe'],
      210: ['nowemkwinkwagintylionowa', 'nowemkwinkwagintylionowe'],
      213: ['seksagintylionowa', 'seksagintylionowe'],
      216: ['unseksagintylionowa', 'unseksagintylionowe'],
      219: ['duoseksagintylionowa', 'duoseksagintylionowe'],
      222: ['treseksagintylionowa', 'treseksagintylionowe'],
      225: ['kwatuorseksagintylionowa', 'kwatuorseksagintylionowe'],
      228: ['kwinseksagintylionowa', 'kwinseksagintylionowe'],
      231: ['seksseksagintylionowa', 'seksseksagintylionowe'],
      234: ['septenseksagintylionowa', 'septenseksagintylionowe'],
      237: ['oktoseksagintylionowa', 'oktoseksagintylionowe'],
      240: ['nowemseksagintylionowa', 'nowemseksagintylionowe'],
      243: ['septuagintylionowa', 'septuagintylionowe'],
      246: ['unseptuagintylionowa', 'unseptuagintylionowe'],
      249: ['duoseptuagintylionowa', 'duoseptuagintylionowe'],
      252: ['treseptuagintylionowa', 'treseptuagintylionowe'],
      255: ['kwatuorseptuagintylionowa', 'kwatuorseptuagintylionowe'],
      258: ['kwinseptuagintylionowa', 'kwinseptuagintylionowe'],
      261: ['seksseptuagintylionowa', 'seksseptuagintylionowe'],
      264: ['septenseptuagintylionowa', 'septenseptuagintylionowe'],
      267: ['oktoseptuagintylionowa', 'oktoseptuagintylionowe'],
      270: ['nowemseptuagintylionowa', 'nowemseptuagintylionowe'],
      273: ['oktagintylionowa', 'oktagintylionowe'],
      276: ['unoktagintylionowa', 'unoktagintylionowe'],
      279: ['duoktagintylionowa', 'duoktagintylionowe'],
      282: ['treoktagintylionowa', 'treoktagintylionowe'],
      285: ['kwatuoroktagintylionowa', 'kwatuoroktagintylionowe'],
      288: ['kwinoktagintylionowa', 'kwinoktagintylionowe'],
      291: ['seksoktagintylionowa', 'seksoktagintylionowe'],
      294: ['septenoktagintylionowa', 'septenoktagintylionowe'],
      297: ['oktooktagintylionowa', 'oktooktagintylionowe'],
      300: ['nowemoktagintylionowa', 'nowemoktagintylionowe']
    }
    
    // Находим ближайшее значение или используем дефолт
    let word = fractionalWords[decimalLength]
    if (!word) {
      // Если точного совпадения нет, ищем ближайшее меньшее значение
      const keys = Object.keys(fractionalWords).map(Number).sort((a, b) => b - a)
      const closest = keys.find(k => k <= decimalLength)
      word = closest ? fractionalWords[closest] : ['setna', 'setne']
    }
    
    // Используем склонение: 1 - единственное, 2-4 - единственное, 5+ - множественное
    return getPlDeclension(decimalNum, [word[0], word[0], word[1]])
  }
}

// ============================================================================
// ЛАТЫШСКИЙ (LV)
// ============================================================================

const LV_ONES = ['', 'viens', 'divi', 'trīs', 'četri', 'pieci', 'seši', 'septiņi', 'astoņi', 'deviņi']
const LV_ONES_FEMININE = ['', 'viena', 'divas', 'trīs', 'četras', 'piecas', 'sešas', 'septiņas', 'astoņas', 'deviņas']
const LV_TEENS = ['desmit', 'vienpadsmit', 'divpadsmit', 'trīspadsmit', 'četrpadsmit', 'piecpadsmit', 'sešpadsmit', 'septiņpadsmit', 'astoņpadsmit', 'deviņpadsmit']
const LV_TENS = ['', '', 'divdesmit', 'trīsdesmit', 'četrdesmit', 'piecdesmit', 'sešdesmit', 'septiņdesmit', 'astoņdesmit', 'deviņdesmit']
const LV_HUNDREDS = ['', 'simts', 'divi simti', 'trīs simti', 'četri simti', 'pieci simti', 'seši simti', 'septiņi simti', 'astoņi simti', 'deviņi simti']
const LV_SCALES = [
  '', 'tūkstotis', 'miljons', 'miljards', 'biljons', 'biliards', 'triljons', 'triliards', 'kvadriljons', 'kvadriliards', 'kvintiljons', 'kvintiliards',
  'sekstiljons', 'sekstiliards', 'septiljons', 'septiliards', 'oktiljons', 'oktiliards', 'noniljons', 'noniliards', 'deciljons', 'deciliards',
  'undeciljons', 'duodeciljons', 'tredeciljons', 'kvatuordeciljons', 'kvindeciljons', 'seksdeciljons', 'septendeciljons', 'oktodeciljons', 'novemdeciljons', 'vigintiljons',
  'unvigintiljons', 'duovigintiljons', 'trevigintiljons', 'kvatuorvigintiljons', 'kvinvigintiljons', 'seksvigintiljons', 'septenvigintiljons', 'oktovigintiljons', 'novemvigintiljons', 'trigintiljons',
  'untrigintiljons', 'duotrigintiljons', 'tretrigintiljons', 'kvatuortrigintiljons', 'kvintrigintiljons', 'sekstrigintiljons', 'septentrigintiljons', 'oktotrigintiljons', 'novemtrigintiljons', 'kvadragintiljons',
  'unkvadragintiljons', 'duokvadragintiljons', 'trekvadragintiljons', 'kvatuorkvadragintiljons', 'kvinkvadragintiljons', 'sekskvadragintiljons', 'septenkvadragintiljons', 'oktokvadragintiljons', 'novemkvadragintiljons', 'kvinkvagintiljons',
  'unkvinkvagintiljons', 'duokvinkvagintiljons', 'trekvinkvagintiljons', 'kvatuorkvinkvagintiljons', 'kvinkvinkvagintiljons', 'sekskvinkvagintiljons', 'septenkvinkvagintiljons', 'oktokvinkvagintiljons', 'novemkvinkvagintiljons', 'seksagintiljons',
  'unseksagintiljons', 'duoseksagintiljons', 'treseksagintiljons', 'kvatuorseksagintiljons', 'kvinseksagintiljons', 'seksseksagintiljons', 'septenseksagintiljons', 'oktoseksagintiljons', 'novemseksagintiljons', 'septuagintiljons',
  'unseptuagintiljons', 'duoseptuagintiljons', 'treseptuagintiljons', 'kvatuorseptuagintiljons', 'kvinseptuagintiljons', 'seksseptuagintiljons', 'septenseptuagintiljons', 'oktoseptuagintiljons', 'novemseptuagintiljons', 'oktagintiljons',
  'unoktagintiljons', 'duoktagintiljons', 'treoktagintiljons', 'kvatuoroktagintiljons', 'kvinoktagintiljons', 'seksoktagintiljons', 'septenoktagintiljons', 'oktooktagintiljons', 'novemoktagintiljons', 'nonagintiljons',
  'unnonagintiljons', 'duononagintiljons', 'trenonagintiljons', 'kvatuornonagintiljons', 'kvinnonagintiljons', 'seksnonagintiljons', 'septennonagintiljons', 'oktononagintiljons', 'novemnonagintiljons'
]

const LV_SCALES_PLURAL = [
  '', 'tūkstoši', 'miljoni', 'miljardi', 'biljoni', 'biliardi', 'triljoni', 'triliardi', 'kvadriljoni', 'kvadriliardi', 'kvintiljoni', 'kvintiliardi',
  'sekstiljoni', 'sekstiliardi', 'septiljoni', 'septiliardi', 'oktiljoni', 'oktiliardi', 'noniljoni', 'noniliardi', 'deciljoni', 'deciliardi',
  'undeciljoni', 'duodeciljoni', 'tredeciljoni', 'kvatuordeciljoni', 'kvindeciljoni', 'seksdeciljoni', 'septendeciljoni', 'oktodeciljoni', 'novemdeciljoni', 'vigintiljoni',
  'unvigintiljoni', 'duovigintiljoni', 'trevigintiljoni', 'kvatuorvigintiljoni', 'kvinvigintiljoni', 'seksvigintiljoni', 'septenvigintiljoni', 'oktovigintiljoni', 'novemvigintiljoni', 'trigintiljoni',
  'untrigintiljoni', 'duotrigintiljoni', 'tretrigintiljoni', 'kvatuortrigintiljoni', 'kvintrigintiljoni', 'sekstrigintiljoni', 'septentrigintiljoni', 'oktotrigintiljoni', 'novemtrigintiljoni', 'kvadragintiljoni',
  'unkvadragintiljoni', 'duokvadragintiljoni', 'trekvadragintiljoni', 'kvatuorkvadragintiljoni', 'kvinkvadragintiljoni', 'sekskvadragintiljoni', 'septenkvadragintiljoni', 'oktokvadragintiljoni', 'novemkvadragintiljoni', 'kvinkvagintiljoni',
  'unkvinkvagintiljoni', 'duokvinkvagintiljoni', 'trekvinkvagintiljoni', 'kvatuorkvinkvagintiljoni', 'kvinkvinkvagintiljoni', 'sekskvinkvagintiljoni', 'septenkvinkvagintiljoni', 'oktokvinkvagintiljoni', 'novemkvinkvagintiljoni', 'seksagintiljoni',
  'unseksagintiljoni', 'duoseksagintiljoni', 'treseksagintiljoni', 'kvatuorseksagintiljoni', 'kvinseksagintiljoni', 'seksseksagintiljoni', 'septenseksagintiljoni', 'oktoseksagintiljoni', 'novemseksagintiljoni', 'septuagintiljoni',
  'unseptuagintiljoni', 'duoseptuagintiljoni', 'treseptuagintiljoni', 'kvatuorseptuagintiljoni', 'kvinseptuagintiljoni', 'seksseptuagintiljoni', 'septenseptuagintiljoni', 'oktoseptuagintiljoni', 'novemseptuagintiljoni', 'oktagintiljoni',
  'unoktagintiljoni', 'duoktagintiljoni', 'treoktagintiljoni', 'kvatuoroktagintiljoni', 'kvinoktagintiljoni', 'seksoktagintiljoni', 'septenoktagintiljoni', 'oktooktagintiljoni', 'novemoktagintiljoni', 'nonagintiljoni',
  'unnonagintiljoni', 'duononagintiljoni', 'trenonagintiljoni', 'kvatuornonagintiljoni', 'kvinnonagintiljoni', 'seksnonagintiljoni', 'septennonagintiljoni', 'oktononagintiljoni', 'novemnonagintiljoni'
]

function getLvDeclension(num: number, forms: [string, string, string]): string {
  const mod10 = num % 10
  const mod100 = num % 100
  if (mod100 >= 11 && mod100 <= 19) return forms[2]
  if (mod10 === 1) return forms[0]
  if (mod10 >= 2 && mod10 <= 4) return forms[1]
  return forms[2]
}

// Определяет правильное склонение для больших чисел (miljons, miljards - мужской род)
function getLvScaleDeclension(scaleIndex: number, group: number): string {
  if (scaleIndex === 0) return ''
  const mod10 = group % 10
  const mod100 = group % 100
  
  // Для больших чисел (miljons, miljards) всегда мужской род
  if (mod100 >= 11 && mod100 <= 19) {
    return LV_SCALES_PLURAL[scaleIndex] || LV_SCALES[scaleIndex] + 'i'
  }
  if (mod10 === 1) {
    return LV_SCALES[scaleIndex]
  }
  if (mod10 >= 2 && mod10 <= 4) {
    return LV_SCALES_PLURAL[scaleIndex] || LV_SCALES[scaleIndex] + 'i'
  }
  return LV_SCALES_PLURAL[scaleIndex] || LV_SCALES[scaleIndex] + 'i'
}

const LV_CURRENCIES: Record<Currency, CurrencyInfo> = {
  USD: { name: 'ASV dolārs', plural: 'ASV dolāri', fractional: 'cents', fractionalPlural: 'centi' },
  GBP: { name: 'Lielbritānijas mārciņa', plural: 'Lielbritānijas mārciņas', fractional: 'penss', fractionalPlural: 'pensi' },
  EUR: { name: 'eiro', plural: 'eiro', fractional: 'cents', fractionalPlural: 'centi' },
  PLN: { name: 'zloti', plural: 'zloti', fractional: 'grosz', fractionalPlural: 'groszi' },
  RUB: { name: 'krievijas rublis', plural: 'krievijas rubļi', fractional: 'kapeika', fractionalPlural: 'kapeikas' }
}

const lvProcessor: LocaleProcessor = {
  convertHundreds(num: number): string {
    if (num === 0) return ''
    
    let result = ''
    const hundreds = Math.floor(num / 100)
    const remainder = num % 100
    
    if (hundreds > 0) {
      result += LV_HUNDREDS[hundreds]
      if (remainder > 0) result += ' '
    }
    
    if (remainder >= 10 && remainder < 20) {
      result += LV_TEENS[remainder - 10]
    } else {
      const tens = Math.floor(remainder / 10)
      const ones = remainder % 10
      if (tens > 0) {
        result += LV_TENS[tens]
        if (ones > 0) result += ' '
      }
      if (ones > 0) {
        result += LV_ONES[ones]
      }
    }
    
    return result
  },
  
  convertIntegerToWords(integerStr: string): string {
    if (integerStr === '0') return 'nulle'
    integerStr = integerStr.replace(/^0+/, '') || '0'
    
    const groups: string[] = []
    for (let i = integerStr.length; i > 0; i -= 3) {
      const start = Math.max(0, i - 3)
      groups.unshift(integerStr.substring(start, i))
    }
    
    const words: string[] = []
    for (let i = 0; i < groups.length; i++) {
      const group = parseInt(groups[i], 10)
      if (group === 0) continue
      
      const scaleIndex = groups.length - 1 - i
      let groupWords = ''
      
      if (scaleIndex > 0) {
        // Для больших чисел (miljons, miljards) используем мужской род
        const hundreds = Math.floor(group / 100)
        const remainder = group % 100
        
        if (hundreds > 0) {
          groupWords += LV_HUNDREDS[hundreds]
          if (remainder > 0) groupWords += ' '
        }
        
        if (remainder >= 10 && remainder < 20) {
          groupWords += LV_TEENS[remainder - 10]
        } else {
          const tens = Math.floor(remainder / 10)
          const ones = remainder % 10
          if (tens > 0) {
            groupWords += LV_TENS[tens]
            if (ones > 0) groupWords += ' '
          }
          if (ones > 0) {
            // Используем мужской род для больших чисел
            groupWords += LV_ONES[ones]
          }
        }
      } else {
        // Для единиц используем обычную логику
        groupWords = this.convertHundreds(group)
      }
      
      if (groupWords) {
        words.push(groupWords)
        if (scaleIndex > 0 && LV_SCALES[scaleIndex]) {
          // Правильное склонение для больших чисел
          const scaleWord = getLvScaleDeclension(scaleIndex, group)
          words.push(scaleWord)
        }
      }
    }
    
    return words.join(' ')
  },
  
  convertDecimalToWords(decimalStr: string): string {
    const decimalClean = decimalStr.replace(/^0+/, '') || '0'
    return this.convertIntegerToWords(decimalClean)
  },
  
  getCurrencyName(currency: Currency, amount: number): string {
    const info = LV_CURRENCIES[currency]
    return getLvDeclension(amount, [info.name, info.name, info.plural])
  },
  
  getFractionalName(currency: Currency, amount: number): string {
    const info = LV_CURRENCIES[currency]
    return getLvDeclension(amount, [info.fractional, info.fractional, info.fractionalPlural])
  },
  
  getMinusWord(): string { return 'mīnus' },
  getAndWord(): string { return 'un' },
  getVatPhrase(vatRate: number, vatAmount: string): string {
    return `, ieskaitot PVN (${vatRate}%) summu ${vatAmount}`
  },
  getZeroWord(): string { return 'nulle' },
  getHundredthWord(singular: boolean): string {
    return singular ? 'simtdaļa' : 'simtdaļas'
  },
  getFractionalWord(decimalLength: number, decimalNum: number): string {
    // Массив дробных частей: индекс соответствует количеству знаков после запятой
    // Формат: [единственное число, множественное число]
    const fractionalWords: Record<number, [string, string]> = {
      1: ['desmitdaļa', 'desmitdaļas'],
      2: ['simtdaļa', 'simtdaļas'],
      3: ['tūkstošdaļa', 'tūkstošdaļas'],
      4: ['desmittūkstošdaļa', 'desmittūkstošdaļas'],
      5: ['simttūkstošdaļa', 'simttūkstošdaļas'],
      6: ['miljonā daļa', 'miljonā daļas'],
      7: ['desmitmiljonā daļa', 'desmitmiljonā daļas'],
      8: ['simtmiljonā daļa', 'simtmiljonā daļas'],
      9: ['miljardā daļa', 'miljardā daļas'],
      10: ['desmitmiljardā daļa', 'desmitmiljardā daļas'],
      11: ['simtmiljardā daļa', 'simtmiljardā daļas'],
      12: ['biljonā daļa', 'biljonā daļas'],
      15: ['kvadriljonā daļa', 'kvadriljonā daļas'],
      18: ['kvintiljonā daļa', 'kvintiljonā daļas'],
      21: ['sekstiljonā daļa', 'sekstiljonā daļas'],
      24: ['septiljonā daļa', 'septiljonā daļas'],
      27: ['oktiljonā daļa', 'oktiljonā daļas'],
      30: ['noniljonā daļa', 'noniljonā daļas'],
      33: ['deciljonā daļa', 'deciljonā daļas'],
      36: ['undeciljonā daļa', 'undeciljonā daļas'],
      39: ['duodeciljonā daļa', 'duodeciljonā daļas'],
      42: ['tredeciljonā daļa', 'tredeciljonā daļas'],
      45: ['kvatuordeciljonā daļa', 'kvatuordeciljonā daļas'],
      48: ['kvindeciljonā daļa', 'kvindeciljonā daļas'],
      51: ['seksdeciljonā daļa', 'seksdeciljonā daļas'],
      54: ['septendeciljonā daļa', 'septendeciljonā daļas'],
      57: ['oktodeciljonā daļa', 'oktodeciljonā daļas'],
      60: ['novemdeciljonā daļa', 'novemdeciljonā daļas'],
      63: ['vigintiljonā daļa', 'vigintiljonā daļas'],
      66: ['unvigintiljonā daļa', 'unvigintiljonā daļas'],
      69: ['duovigintiljonā daļa', 'duovigintiljonā daļas'],
      72: ['trevigintiljonā daļa', 'trevigintiljonā daļas'],
      75: ['kvatuorvigintiljonā daļa', 'kvatuorvigintiljonā daļas'],
      78: ['kvinvigintiljonā daļa', 'kvinvigintiljonā daļas'],
      81: ['seksvigintiljonā daļa', 'seksvigintiljonā daļas'],
      84: ['septenvigintiljonā daļa', 'septenvigintiljonā daļas'],
      87: ['oktovigintiljonā daļa', 'oktovigintiljonā daļas'],
      90: ['novemvigintiljonā daļa', 'novemvigintiljonā daļas'],
      93: ['trigintiljonā daļa', 'trigintiljonā daļas'],
      96: ['untrigintiljonā daļa', 'untrigintiljonā daļas'],
      99: ['duotrigintiljonā daļa', 'duotrigintiljonā daļas'],
      102: ['tretrigintiljonā daļa', 'tretrigintiljonā daļas'],
      105: ['kvatuortrigintiljonā daļa', 'kvatuortrigintiljonā daļas'],
      108: ['kvintrigintiljonā daļa', 'kvintrigintiljonā daļas'],
      111: ['sekstrigintiljonā daļa', 'sekstrigintiljonā daļas'],
      114: ['septentrigintiljonā daļa', 'septentrigintiljonā daļas'],
      117: ['oktotrigintiljonā daļa', 'oktotrigintiljonā daļas'],
      120: ['novemtrigintiljonā daļa', 'novemtrigintiljonā daļas'],
      123: ['kvadragintiljonā daļa', 'kvadragintiljonā daļas'],
      126: ['unkvadragintiljonā daļa', 'unkvadragintiljonā daļas'],
      129: ['duokvadragintiljonā daļa', 'duokvadragintiljonā daļas'],
      132: ['trekvadragintiljonā daļa', 'trekvadragintiljonā daļas'],
      135: ['kvatuorkvadragintiljonā daļa', 'kvatuorkvadragintiljonā daļas'],
      138: ['kvinkvadragintiljonā daļa', 'kvinkvadragintiljonā daļas'],
      141: ['sekskvadragintiljonā daļa', 'sekskvadragintiljonā daļas'],
      144: ['septenkvadragintiljonā daļa', 'septenkvadragintiljonā daļas'],
      147: ['oktokvadragintiljonā daļa', 'oktokvadragintiljonā daļas'],
      150: ['novemkvadragintiljonā daļa', 'novemkvadragintiljonā daļas'],
      153: ['kvinkvagintiljonā daļa', 'kvinkvagintiljonā daļas'],
      156: ['unkvinkvagintiljonā daļa', 'unkvinkvagintiljonā daļas'],
      159: ['duokvinkvagintiljonā daļa', 'duokvinkvagintiljonā daļas'],
      162: ['trekvinkvagintiljonā daļa', 'trekvinkvagintiljonā daļas'],
      165: ['kvatuorkvinkvagintiljonā daļa', 'kvatuorkvinkvagintiljonā daļas'],
      168: ['kvinkvinkvagintiljonā daļa', 'kvinkvinkvagintiljonā daļas'],
      171: ['sekskvinkvagintiljonā daļa', 'sekskvinkvagintiljonā daļas'],
      174: ['septenkvinkvagintiljonā daļa', 'septenkvinkvagintiljonā daļas'],
      177: ['oktokvinkvagintiljonā daļa', 'oktokvinkvagintiljonā daļas'],
      180: ['novemkvinkvagintiljonā daļa', 'novemkvinkvagintiljonā daļas'],
      183: ['seksagintiljonā daļa', 'seksagintiljonā daļas'],
      186: ['unseksagintiljonā daļa', 'unseksagintiljonā daļas'],
      189: ['duoseksagintiljonā daļa', 'duoseksagintiljonā daļas'],
      192: ['treseksagintiljonā daļa', 'treseksagintiljonā daļas'],
      195: ['kvatuorseksagintiljonā daļa', 'kvatuorseksagintiljonā daļas'],
      198: ['kvinseksagintiljonā daļa', 'kvinseksagintiljonā daļas'],
      201: ['seksseksagintiljonā daļa', 'seksseksagintiljonā daļas'],
      204: ['septenseksagintiljonā daļa', 'septenseksagintiljonā daļas'],
      207: ['oktoseksagintiljonā daļa', 'oktoseksagintiljonā daļas'],
      210: ['novemseksagintiljonā daļa', 'novemseksagintiljonā daļas'],
      213: ['septuagintiljonā daļa', 'septuagintiljonā daļas'],
      216: ['unseptuagintiljonā daļa', 'unseptuagintiljonā daļas'],
      219: ['duoseptuagintiljonā daļa', 'duoseptuagintiljonā daļas'],
      222: ['treseptuagintiljonā daļa', 'treseptuagintiljonā daļas'],
      225: ['kvatuorseptuagintiljonā daļa', 'kvatuorseptuagintiljonā daļas'],
      228: ['kvinseptuagintiljonā daļa', 'kvinseptuagintiljonā daļas'],
      231: ['seksseptuagintiljonā daļa', 'seksseptuagintiljonā daļas'],
      234: ['septenseptuagintiljonā daļa', 'septenseptuagintiljonā daļas'],
      237: ['oktoseptuagintiljonā daļa', 'oktoseptuagintiljonā daļas'],
      240: ['novemseptuagintiljonā daļa', 'novemseptuagintiljonā daļas'],
      243: ['oktagintiljonā daļa', 'oktagintiljonā daļas'],
      246: ['unoktagintiljonā daļa', 'unoktagintiljonā daļas'],
      249: ['duoktagintiljonā daļa', 'duoktagintiljonā daļas'],
      252: ['treoktagintiljonā daļa', 'treoktagintiljonā daļas'],
      255: ['kvatuoroktagintiljonā daļa', 'kvatuoroktagintiljonā daļas'],
      258: ['kvinoktagintiljonā daļa', 'kvinoktagintiljonā daļas'],
      261: ['seksoktagintiljonā daļa', 'seksoktagintiljonā daļas'],
      264: ['septenoktagintiljonā daļa', 'septenoktagintiljonā daļas'],
      267: ['oktooktagintiljonā daļa', 'oktooktagintiljonā daļas'],
      270: ['novemoktagintiljonā daļa', 'novemoktagintiljonā daļas'],
      273: ['nonagintiljonā daļa', 'nonagintiljonā daļas'],
      276: ['unnonagintiljonā daļa', 'unnonagintiljonā daļas'],
      279: ['duononagintiljonā daļa', 'duononagintiljonā daļas'],
      282: ['trenonagintiljonā daļa', 'trenonagintiljonā daļas'],
      285: ['kvatuornonagintiljonā daļa', 'kvatuornonagintiljonā daļas'],
      288: ['kvinnonagintiljonā daļa', 'kvinnonagintiljonā daļas'],
      291: ['seksnonagintiljonā daļa', 'seksnonagintiljonā daļas'],
      294: ['septennonagintiljonā daļa', 'septennonagintiljonā daļas'],
      297: ['oktononagintiljonā daļa', 'oktononagintiljonā daļas'],
      300: ['novemnonagintiljonā daļa', 'novemnonagintiljonā daļas']
    }
    
    // Находим ближайшее значение или используем дефолт
    let word = fractionalWords[decimalLength]
    if (!word) {
      // Если точного совпадения нет, ищем ближайшее меньшее значение
      const keys = Object.keys(fractionalWords).map(Number).sort((a, b) => b - a)
      const closest = keys.find(k => k <= decimalLength)
      word = closest ? fractionalWords[closest] : ['simtdaļa', 'simtdaļas']
    }
    
    // Используем склонение: 1 - единственное, 2-4 - единственное, 5+ - множественное
    return getLvDeclension(decimalNum, [word[0], word[0], word[1]])
  }
}

// ============================================================================
// РЕГИСТР ПРОЦЕССОРОВ
// ============================================================================

const processors: Record<Language, LocaleProcessor> = {
  en: enProcessor,
  ru: ruProcessor,
  de: deProcessor,
  es: esProcessor,
  fr: frProcessor,
  it: itProcessor,
  pl: plProcessor,
  lv: lvProcessor
}

// ============================================================================
// ОСНОВНАЯ ФУНКЦИЯ
// ============================================================================

export function numberToWords(
  value: string | number,
  options: NumberToWordsOptions
): NumberToWordsResult {
  const { 
    mode, 
    currency = 'USD', 
    vatRate = 0, 
    textCase = 'Sentence case',
    language = 'en'
  } = options
  
  const processor = processors[language]
  if (!processor) {
    throw new Error(`Unsupported language: ${language}`)
  }
  
  // Парсим входное число
  let { integer, decimal, isNegative } = parseNumber(value)
  
  // Режим currency_vat: сначала вычисляем итоговую сумму с НДС
  let calculatedTotal: number | undefined
  let vatAmount: number | undefined
  let principalAmount: number | undefined
  
  if (mode === 'currency_vat' && vatRate > 0) {
    const originalValue = parseFloat(`${integer}.${decimal}`) || 0
    principalAmount = originalValue
    vatAmount = originalValue * (vatRate / 100)
    calculatedTotal = originalValue + vatAmount
    const totalStr = calculatedTotal.toFixed(2)
    const parts = totalStr.split('.')
    integer = parts[0]
    decimal = parts[1] || ''
  }
  
  // Конвертируем целую часть (всегда в нижнем регистре)
  let result = processor.convertIntegerToWords(integer).toLowerCase()
  
  // Обрабатываем отрицательные числа
  if (isNegative) {
    result = processor.getMinusWord() + ' ' + result
  }
  
  // Обрабатываем режимы конвертации
  if (mode === 'words') {
    // Просто слова, без валюты
    if (decimal && parseInt(decimal) > 0) {
      // Определяем количество знаков после запятой (не удаляем ведущие нули для определения длины)
      const decimalLength = decimal.length
      const decimalClean = decimal.replace(/^0+/, '') || '0'
      const decimalNum = parseInt(decimalClean, 10)
      const decimalWords = processor.convertDecimalToWords(decimalClean).toLowerCase()
      
      const andWord = processor.getAndWord()
      // Используем правильное название дробной части в зависимости от количества знаков
      const fractionalWord = processor.getFractionalWord(decimalLength, decimalNum)
      result = result + ` ${andWord} ${decimalWords} ${fractionalWord}`
    }
    result = applyTextCase(result, textCase)
    return { textResult: result, calculatedTotal }
  }
  
  if (mode === 'check_writing') {
    // Формат чека
    const integerNum = parseInt(integer) || 0
    const currencyName = processor.getCurrencyName(currency, integerNum).toLowerCase()
    
    if (decimal && parseInt(decimal) > 0) {
      const cents = decimal.substring(0, 2).padEnd(2, '0').substring(0, 2)
      const centsNum = parseInt(cents, 10)
      const fractionalName = processor.getFractionalName(currency, centsNum).toLowerCase()
      
      if (language === 'ru') {
        result = result + ` ${currencyName} ${cents} ${fractionalName}`
      } else {
        result = result + ` ${processor.getAndWord()} ${cents}/100 ${currencyName}`
      }
    } else {
      result = result + ` ${currencyName}`
    }
    
    result = applyTextCase(result, textCase)
    return { textResult: result, calculatedTotal }
  }
  
  if (mode === 'currency' || mode === 'currency_vat') {
    // Стандартный валютный формат
    const integerNum = parseInt(integer) || 0
    const currencyName = processor.getCurrencyName(currency, integerNum).toLowerCase()
    
    result = result + ` ${currencyName}`
    
    // Добавляем дробную часть
    if (decimal && parseInt(decimal) > 0) {
      const cents = decimal.substring(0, 2).padEnd(2, '0').substring(0, 2)
      const centsNum = parseInt(cents, 10)
      const fractionalName = processor.getFractionalName(currency, centsNum).toLowerCase()
      const centsWords = processor.convertDecimalToWords(cents).toLowerCase()
      
      result += ` ${processor.getAndWord()} ${centsWords} ${fractionalName}`
    } else {
      const zeroWord = processor.getZeroWord().toLowerCase()
      const fractionalName = processor.getFractionalName(currency, 0).toLowerCase()
      result += ` ${processor.getAndWord()} ${zeroWord} ${fractionalName}`
    }
    
    // Для режима currency_vat добавляем информацию о НДС
    if (mode === 'currency_vat' && vatAmount !== undefined && principalAmount !== undefined && vatRate > 0) {
      const vatStr = vatAmount.toFixed(2)
      const vatParts = vatStr.split('.')
      const vatInteger = vatParts[0]
      const vatDecimal = vatParts[1] || '00'
      
      let vatWords = processor.convertIntegerToWords(vatInteger).toLowerCase()
      const vatIntegerNum = parseInt(vatInteger) || 0
      const vatCurrencyName = processor.getCurrencyName(currency, vatIntegerNum).toLowerCase()
      
      vatWords = vatWords + ` ${vatCurrencyName}`
      
      if (parseInt(vatDecimal) > 0) {
        const vatCents = vatDecimal.substring(0, 2).padEnd(2, '0').substring(0, 2)
        const vatCentsNum = parseInt(vatCents, 10)
        const vatFractionalName = processor.getFractionalName(currency, vatCentsNum).toLowerCase()
        const vatCentsWords = processor.convertDecimalToWords(vatCents).toLowerCase()
        vatWords += ` ${processor.getAndWord()} ${vatCentsWords} ${vatFractionalName}`
      } else {
        const zeroWord = processor.getZeroWord().toLowerCase()
        const vatFractionalName = processor.getFractionalName(currency, 0).toLowerCase()
        vatWords += ` ${processor.getAndWord()} ${zeroWord} ${vatFractionalName}`
      }
      
      result += processor.getVatPhrase(vatRate, vatWords)
    }
    
    result = applyTextCase(result, textCase)
    return { textResult: result, calculatedTotal, vatAmount, principalAmount }
  }
  
  return { textResult: result, calculatedTotal, vatAmount, principalAmount }
}
