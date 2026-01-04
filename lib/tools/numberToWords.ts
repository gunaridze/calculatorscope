/**
 * Утилита для конвертации чисел в слова
 * Поддерживает большие числа (до 300 цифр), научную нотацию, валюты и различные форматы
 */

export type ConversionMode = 'words' | 'check_writing' | 'currency' | 'currency_vat'
export type Currency = 'USD' | 'GBP' | 'EUR' | 'PLN' | 'RUB'
export type TextCase = 'lowercase' | 'UPPERCASE' | 'Title Case' | 'Sentence case'

export interface NumberToWordsOptions {
  mode: ConversionMode
  currency?: Currency
  vatRate?: number
  textCase?: TextCase
}

export interface NumberToWordsResult {
  textResult: string
  calculatedTotal?: number
  vatAmount?: number
  principalAmount?: number
}

// Английские числительные
const ONES = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine']
const TEENS = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen']
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']
const SCALES = ['', 'thousand', 'million', 'billion', 'trillion', 'quadrillion', 'quintillion', 'sextillion', 'septillion', 'octillion', 'nonillion', 'decillion']

// Названия валют и их дробных единиц
const CURRENCY_INFO: Record<Currency, { name: string; plural: string; fractional: string; fractionalPlural: string }> = {
  USD: { name: 'dollar', plural: 'dollars', fractional: 'cent', fractionalPlural: 'cents' },
  GBP: { name: 'pound', plural: 'pounds', fractional: 'penny', fractionalPlural: 'pence' },
  EUR: { name: 'euro', plural: 'euros', fractional: 'cent', fractionalPlural: 'cents' },
  PLN: { name: 'zloty', plural: 'zlotys', fractional: 'grosz', fractionalPlural: 'groszy' },
  RUB: { name: 'рубль', plural: 'рублей', fractional: 'копейка', fractionalPlural: 'копеек' }
}

// Русские склонения для рублей
function getRubDeclension(amount: number): string {
  const mod10 = amount % 10
  const mod100 = amount % 100
  
  if (mod100 >= 11 && mod100 <= 19) {
    return CURRENCY_INFO.RUB.plural
  }
  if (mod10 === 1) {
    return CURRENCY_INFO.RUB.name
  }
  if (mod10 >= 2 && mod10 <= 4) {
    return 'рубля'
  }
  return CURRENCY_INFO.RUB.plural
}

// Русские склонения для копеек
function getKopekDeclension(amount: number): string {
  const mod10 = amount % 10
  const mod100 = amount % 100
  
  if (mod100 >= 11 && mod100 <= 19) {
    return CURRENCY_INFO.RUB.fractionalPlural
  }
  if (mod10 === 1) {
    return CURRENCY_INFO.RUB.fractional
  }
  if (mod10 >= 2 && mod10 <= 4) {
    return 'копейки'
  }
  return CURRENCY_INFO.RUB.fractionalPlural
}

/**
 * Парсит число из строки, поддерживая научную нотацию и большие числа
 */
function parseNumber(input: string | number): { integer: string; decimal: string; isNegative: boolean } {
  let str = String(input).trim().replace(/,/g, '')
  const isNegative = str.startsWith('-')
  if (isNegative) str = str.substring(1)
  
  // Обработка научной нотации (1e100, 1E100, 1e+100, 1e-5)
  if (/[eE]/.test(str)) {
    const [base, exp] = str.split(/[eE]/)
    const exponent = parseInt(exp.replace('+', ''), 10)
    const baseNum = parseFloat(base)
    
    if (exponent > 0) {
      // Положительная степень - умножаем
      const result = baseNum * Math.pow(10, exponent)
      str = result.toFixed(0)
    } else {
      // Отрицательная степень - делим
      const result = baseNum / Math.pow(10, Math.abs(exponent))
      str = result.toString()
    }
  }
  
  // Разделяем на целую и дробную части
  const parts = str.split('.')
  const integer = parts[0] || '0'
  const decimal = parts[1] || ''
  
  return { integer, decimal, isNegative }
}

/**
 * Конвертирует число от 0 до 999 в слова (английский)
 */
function convertHundreds(num: number): string {
  if (num === 0) return ''
  
  let result = ''
  const hundreds = Math.floor(num / 100)
  const remainder = num % 100
  
  if (hundreds > 0) {
    result += ONES[hundreds] + ' hundred'
    if (remainder > 0) result += ' '
  }
  
  if (remainder >= 10 && remainder < 20) {
    result += TEENS[remainder - 10]
  } else {
    const tens = Math.floor(remainder / 10)
    const ones = remainder % 10
    if (tens > 0) {
      result += TENS[tens]
      if (ones > 0) result += '-'
    }
    if (ones > 0) {
      result += ONES[ones]
    }
  }
  
  return result
}

/**
 * Конвертирует большое целое число в слова
 * Поддерживает числа до 300 цифр
 */
function convertIntegerToWords(integerStr: string): string {
  if (integerStr === '0') return 'zero'
  
  // Удаляем ведущие нули
  integerStr = integerStr.replace(/^0+/, '') || '0'
  
  // Разбиваем на группы по 3 цифры справа налево
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
    const groupWords = convertHundreds(group)
    
    if (groupWords) {
      words.push(groupWords)
      if (scaleIndex > 0 && SCALES[scaleIndex]) {
        words.push(SCALES[scaleIndex])
      }
    }
  }
  
  return words.join(' ')
}

/**
 * Применяет регистр к тексту
 * Предполагается, что входной текст уже в нижнем регистре
 */
function applyTextCase(text: string, textCase: TextCase): string {
  // Убеждаемся, что текст в нижнем регистре
  const lowerText = text.toLowerCase()
  
  switch (textCase) {
    case 'UPPERCASE':
      return lowerText.toUpperCase()
    case 'lowercase':
      return lowerText
    case 'Title Case':
      // Каждое слово с заглавной буквы
      return lowerText.split(' ').map(word => {
        if (word.length === 0) return word
        return word.charAt(0).toUpperCase() + word.slice(1)
      }).join(' ')
    case 'Sentence case':
      // Первая буква заглавная, остальные строчные
      if (lowerText.length === 0) return lowerText
      return lowerText.charAt(0).toUpperCase() + lowerText.slice(1)
    default:
      return lowerText
  }
}

/**
 * Конвертирует дробную часть в слова для формата чека (XX/100)
 */
function convertDecimalToFraction(decimalStr: string, currency: Currency): string {
  // Берем только первые 2 цифры (центы/копейки)
  const cents = decimalStr.substring(0, 2).padEnd(2, '0').substring(0, 2)
  const centsNum = parseInt(cents, 10)
  
  if (currency === 'RUB') {
    return `${cents} ${getKopekDeclension(centsNum)}`
  }
  
  return `${cents}/100`
}

/**
 * Основная функция конвертации числа в слова
 */
export function numberToWords(
  value: string | number,
  options: NumberToWordsOptions
): NumberToWordsResult {
  const { mode, currency = 'USD', vatRate = 0, textCase = 'Sentence case' } = options
  
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
  let result = convertIntegerToWords(integer).toLowerCase()
  
  // Обрабатываем отрицательные числа
  if (isNegative) {
    result = 'minus ' + result
  }
  
  // Обрабатываем режимы конвертации
  if (mode === 'words') {
    // Просто слова, без валюты
    // Добавляем дробную часть, если есть
    if (decimal && parseInt(decimal) > 0) {
      // Удаляем ведущие нули из дробной части
      const decimalClean = decimal.replace(/^0+/, '') || '0'
      const decimalWords = convertIntegerToWords(decimalClean).toLowerCase()
      result = result + ` point ${decimalWords}`
    }
    // Применяем регистр ко всему результату
    result = applyTextCase(result, textCase)
    return { textResult: result, calculatedTotal }
  }
  
  if (mode === 'check_writing') {
    // Формат чека: "Five thousand... and 62/100 dollars"
    const currencyName = parseInt(integer) === 1 
      ? CURRENCY_INFO[currency].name.toLowerCase()
      : CURRENCY_INFO[currency].plural.toLowerCase()
    
    if (decimal && parseInt(decimal) > 0) {
      const fraction = convertDecimalToFraction(decimal, currency)
      result = result + ` and ${fraction} ${currencyName}`
    } else {
      result = result + ` ${currencyName}`
    }
    
    // Применяем регистр ко всему результату
    result = applyTextCase(result, textCase)
    return { textResult: result, calculatedTotal }
  }
  
  if (mode === 'currency' || mode === 'currency_vat') {
    // Стандартный валютный формат: "ten dollars and fifty cents"
    let currencyName: string
    const integerNum = parseInt(integer) || 0
    
    if (currency === 'RUB') {
      currencyName = getRubDeclension(integerNum).toLowerCase()
    } else {
      currencyName = integerNum === 1 
        ? CURRENCY_INFO[currency].name.toLowerCase()
        : CURRENCY_INFO[currency].plural.toLowerCase()
    }
    
    result = result + ` ${currencyName}`
    
    // Добавляем дробную часть
    if (decimal && parseInt(decimal) > 0) {
      const cents = decimal.substring(0, 2).padEnd(2, '0').substring(0, 2)
      const centsNum = parseInt(cents, 10)
      
      let fractionalName: string
      if (currency === 'RUB') {
        fractionalName = getKopekDeclension(centsNum).toLowerCase()
      } else {
        fractionalName = centsNum === 1 
          ? CURRENCY_INFO[currency].fractional.toLowerCase()
          : CURRENCY_INFO[currency].fractionalPlural.toLowerCase()
      }
      
      const centsWords = convertIntegerToWords(cents).toLowerCase()
      result += ` and ${centsWords} ${fractionalName}`
    } else {
      // Если нет дробной части, добавляем "00 копеек/центов"
      if (currency === 'RUB') {
        result += ` 00 ${getKopekDeclension(0).toLowerCase()}`
      } else {
        result += ` and zero ${CURRENCY_INFO[currency].fractionalPlural.toLowerCase()}`
      }
    }
    
    // Для режима currency_vat добавляем информацию о НДС
    if (mode === 'currency_vat' && vatAmount !== undefined && principalAmount !== undefined && vatRate > 0) {
      // Конвертируем сумму НДС в слова (всегда в нижнем регистре)
      const vatStr = vatAmount.toFixed(2)
      const vatParts = vatStr.split('.')
      const vatInteger = vatParts[0]
      const vatDecimal = vatParts[1] || '00'
      
      let vatWords = convertIntegerToWords(vatInteger).toLowerCase()
      const vatIntegerNum = parseInt(vatInteger) || 0
      
      let vatCurrencyName: string
      if (currency === 'RUB') {
        vatCurrencyName = getRubDeclension(vatIntegerNum).toLowerCase()
      } else {
        vatCurrencyName = vatIntegerNum === 1 
          ? CURRENCY_INFO[currency].name.toLowerCase()
          : CURRENCY_INFO[currency].plural.toLowerCase()
      }
      
      vatWords = vatWords + ` ${vatCurrencyName}`
      
      // Добавляем дробную часть для НДС
      if (parseInt(vatDecimal) > 0) {
        const vatCents = vatDecimal.substring(0, 2).padEnd(2, '0').substring(0, 2)
        const vatCentsNum = parseInt(vatCents, 10)
        
        let vatFractionalName: string
        if (currency === 'RUB') {
          vatFractionalName = getKopekDeclension(vatCentsNum).toLowerCase()
        } else {
          vatFractionalName = vatCentsNum === 1 
            ? CURRENCY_INFO[currency].fractional.toLowerCase()
            : CURRENCY_INFO[currency].fractionalPlural.toLowerCase()
        }
        
        const vatCentsWords = convertIntegerToWords(vatCents).toLowerCase()
        vatWords += ` and ${vatCentsWords} ${vatFractionalName}`
      } else {
        if (currency === 'RUB') {
          vatWords += ` 00 ${getKopekDeclension(0).toLowerCase()}`
        } else {
          vatWords += ` and zero ${CURRENCY_INFO[currency].fractionalPlural.toLowerCase()}`
        }
      }
      
      // Формируем полный результат с информацией о НДС (все в нижнем регистре)
      if (currency === 'RUB') {
        result += `, в том числе ндс (${vatRate}%) в размере ${vatWords}`
      } else {
        result += `, including vat (${vatRate}%) in the amount of ${vatWords}`
      }
    }
    
    // Применяем регистр ко всему результату
    result = applyTextCase(result, textCase)
    return { textResult: result, calculatedTotal, vatAmount, principalAmount }
  }
  
  return { textResult: result, calculatedTotal, vatAmount, principalAmount }
}

