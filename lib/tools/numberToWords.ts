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
const EN_SCALES = ['', 'thousand', 'million', 'billion', 'trillion', 'quadrillion', 'quintillion', 'sextillion', 'septillion', 'octillion', 'nonillion', 'decillion']

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
    const words: Record<number, { singular: string; plural: string }> = {
      1: { singular: 'tenth', plural: 'tenths' },
      2: { singular: 'hundredth', plural: 'hundredths' },
      3: { singular: 'thousandth', plural: 'thousandths' },
      4: { singular: 'ten-thousandth', plural: 'ten-thousandths' },
      5: { singular: 'hundred-thousandth', plural: 'hundred-thousandths' },
      6: { singular: 'millionth', plural: 'millionths' }
    }
    const word = words[decimalLength] || words[2]
    return decimalNum === 1 ? word.singular : word.plural
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
const RU_SCALES = ['', 'тысяча', 'миллион', 'миллиард', 'триллион', 'квадриллион', 'квинтиллион', 'секстиллион', 'септиллион', 'октиллион', 'нониллион', 'дециллион']
const RU_SCALES_GENITIVE_SINGULAR = ['', 'тысячи', 'миллиона', 'миллиарда', 'триллиона', 'квадриллиона', 'квинтиллиона', 'секстиллиона', 'септиллиона', 'октиллиона', 'нониллиона', 'дециллиона']
const RU_SCALES_GENITIVE_PLURAL = ['', 'тысяч', 'миллионов', 'миллиардов', 'триллионов', 'квадриллионов', 'квинтиллионов', 'секстиллионов', 'септиллионов', 'октиллионов', 'нониллионов', 'дециллионов']

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
    const decimalClean = decimalStr.replace(/^0+/, '') || '0'
    return this.convertIntegerToWords(decimalClean)
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
    const words: Record<number, { singular: string; plural: string }> = {
      1: { singular: 'десятая', plural: 'десятых' },
      2: { singular: 'сотая', plural: 'сотых' },
      3: { singular: 'тысячная', plural: 'тысячных' },
      4: { singular: 'десятитысячная', plural: 'десятитысячных' },
      5: { singular: 'стотысячная', plural: 'стотысячных' },
      6: { singular: 'миллионная', plural: 'миллионных' }
    }
    const word = words[decimalLength] || words[2]
    return getRuDeclension(decimalNum, [word.singular, word.singular, word.plural])
  }
}

// ============================================================================
// НЕМЕЦКИЙ (DE)
// ============================================================================

const DE_ONES = ['', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun']
const DE_TEENS = ['zehn', 'elf', 'zwölf', 'dreizehn', 'vierzehn', 'fünfzehn', 'sechzehn', 'siebzehn', 'achtzehn', 'neunzehn']
const DE_TENS = ['', '', 'zwanzig', 'dreißig', 'vierzig', 'fünfzig', 'sechzig', 'siebzig', 'achtzig', 'neunzig']
const DE_SCALES = ['', 'tausend', 'Million', 'Milliarde', 'Billion', 'Billiarde', 'Trillion', 'Trilliarde', 'Quadrillion', 'Quadrilliarde']

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
    const words: Record<number, { singular: string; plural: string }> = {
      1: { singular: 'Zehntel', plural: 'Zehntel' },
      2: { singular: 'Hundertstel', plural: 'Hundertstel' },
      3: { singular: 'Tausendstel', plural: 'Tausendstel' },
      4: { singular: 'Zehntausendstel', plural: 'Zehntausendstel' },
      5: { singular: 'Hunderttausendstel', plural: 'Hunderttausendstel' },
      6: { singular: 'Millionstel', plural: 'Millionstel' }
    }
    const word = words[decimalLength] || words[2]
    return word.plural
  }
}

// ============================================================================
// ИСПАНСКИЙ (ES)
// ============================================================================

const ES_ONES = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve']
const ES_ONES_FEMININE = ['', 'una', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve']
const ES_TEENS = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve']
const ES_TENS = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa']
const ES_SCALES = ['', 'mil', 'millón', 'mil millones', 'billón', 'mil billones', 'trillón', 'mil trillones']

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
    const words: Record<number, { singular: string; plural: string }> = {
      1: { singular: 'décima', plural: 'décimas' },
      2: { singular: 'centésima', plural: 'centésimas' },
      3: { singular: 'milésima', plural: 'milésimas' },
      4: { singular: 'diezmilésima', plural: 'diezmilésimas' },
      5: { singular: 'cienmilésima', plural: 'cienmilésimas' },
      6: { singular: 'millonésima', plural: 'millonésimas' }
    }
    const word = words[decimalLength] || words[2]
    return decimalNum === 1 ? word.singular : word.plural
  }
}

// ============================================================================
// ФРАНЦУЗСКИЙ (FR)
// ============================================================================

const FR_ONES = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf']
const FR_TEENS = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf']
const FR_TENS = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix']
const FR_SCALES = ['', 'mille', 'million', 'milliard', 'billion', 'billiard', 'trillion', 'trilliard']

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
    const words: Record<number, { singular: string; plural: string }> = {
      1: { singular: 'dixième', plural: 'dixièmes' },
      2: { singular: 'centième', plural: 'centièmes' },
      3: { singular: 'millième', plural: 'millièmes' },
      4: { singular: 'dix-millième', plural: 'dix-millièmes' },
      5: { singular: 'cent-millième', plural: 'cent-millièmes' },
      6: { singular: 'millionième', plural: 'millionièmes' }
    }
    const word = words[decimalLength] || words[2]
    return decimalNum === 1 ? word.singular : word.plural
  }
}

// ============================================================================
// ИТАЛЬЯНСКИЙ (IT)
// ============================================================================

const IT_ONES = ['', 'uno', 'due', 'tre', 'quattro', 'cinque', 'sei', 'sette', 'otto', 'nove']
const IT_TEENS = ['dieci', 'undici', 'dodici', 'tredici', 'quattordici', 'quindici', 'sedici', 'diciassette', 'diciotto', 'diciannove']
const IT_TENS = ['', '', 'venti', 'trenta', 'quaranta', 'cinquanta', 'sessanta', 'settanta', 'ottanta', 'novanta']
const IT_SCALES = ['', 'mille', 'milione', 'miliardo', 'bilione', 'biliardo', 'trilione', 'triliardo']

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
    const words: Record<number, { singular: string; plural: string }> = {
      1: { singular: 'decimo', plural: 'decimi' },
      2: { singular: 'centesimo', plural: 'centesimi' },
      3: { singular: 'millesimo', plural: 'millesimi' },
      4: { singular: 'decimillesimo', plural: 'decimillesimi' },
      5: { singular: 'centomillesimo', plural: 'centomillesimi' },
      6: { singular: 'milionesimo', plural: 'milionesimi' }
    }
    const word = words[decimalLength] || words[2]
    return decimalNum === 1 ? word.singular : word.plural
  }
}

// ============================================================================
// ПОЛЬСКИЙ (PL)
// ============================================================================

const PL_ONES = ['', 'jeden', 'dwa', 'trzy', 'cztery', 'pięć', 'sześć', 'siedem', 'osiem', 'dziewięć']
const PL_TEENS = ['dziesięć', 'jedenaście', 'dwanaście', 'trzynaście', 'czternaście', 'piętnaście', 'szesnaście', 'siedemnaście', 'osiemnaście', 'dziewiętnaście']
const PL_TENS = ['', '', 'dwadzieścia', 'trzydzieści', 'czterdzieści', 'pięćdziesiąt', 'sześćdziesiąt', 'siedemdziesiąt', 'osiemdziesiąt', 'dziewięćdziesiąt']
const PL_HUNDREDS = ['', 'sto', 'dwieście', 'trzysta', 'czterysta', 'pięćset', 'sześćset', 'siedemset', 'osiemset', 'dziewięćset']
const PL_SCALES = ['', 'tysiąc', 'milion', 'miliard', 'bilion', 'biliard', 'trylion', 'tryliard']

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
    const words: Record<number, { singular: string; plural: string }> = {
      1: { singular: 'dziesiąta', plural: 'dziesiąte' },
      2: { singular: 'setna', plural: 'setne' },
      3: { singular: 'tysięczna', plural: 'tysięczne' },
      4: { singular: 'dziesięciotysięczna', plural: 'dziesięciotysięczne' },
      5: { singular: 'stutysięczna', plural: 'stutysięczne' },
      6: { singular: 'milionowa', plural: 'milionowe' }
    }
    const word = words[decimalLength] || words[2]
    return getPlDeclension(decimalNum, [word.singular, word.singular, word.plural])
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
const LV_SCALES = ['', 'tūkstotis', 'miljons', 'miljards', 'biljons', 'biliards', 'triljons', 'triliards']
const LV_SCALES_PLURAL = ['', 'tūkstoši', 'miljoni', 'miljardi', 'biljoni', 'biliardi', 'triljoni', 'triliardi']

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
    const words: Record<number, { singular: string; plural: string }> = {
      1: { singular: 'desmitdaļa', plural: 'desmitdaļas' },
      2: { singular: 'simtdaļa', plural: 'simtdaļas' },
      3: { singular: 'tūkstošdaļa', plural: 'tūkstošdaļas' },
      4: { singular: 'desmittūkstošdaļa', plural: 'desmittūkstošdaļas' },
      5: { singular: 'simttūkstošdaļa', plural: 'simttūkstošdaļas' },
      6: { singular: 'miljonā daļa', plural: 'miljonā daļas' }
    }
    const word = words[decimalLength] || words[2]
    return getLvDeclension(decimalNum, [word.singular, word.singular, word.plural])
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
