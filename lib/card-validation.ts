// Card validation utilities for Palestinian Kufiya Store

export interface CardValidation {
  isValid: boolean
  error?: string
}

export interface CardType {
  name: string
  pattern: RegExp
  length: number[]
  cvvLength: number[]
  icon?: string
}

// Supported card types
export const CARD_TYPES: CardType[] = [
  {
    name: "Visa",
    pattern: /^4/,
    length: [13, 16, 19],
    cvvLength: [3],
    icon: "💳",
  },
  {
    name: "Mastercard",
    pattern: /^5[1-5]|^2[2-7]/,
    length: [16],
    cvvLength: [3],
    icon: "💳",
  },
  {
    name: "American Express",
    pattern: /^3[47]/,
    length: [15],
    cvvLength: [4],
    icon: "💳",
  },
  {
    name: "Discover",
    pattern: /^6(?:011|5)/,
    length: [16],
    cvvLength: [3],
    icon: "💳",
  },
  {
    name: "JCB",
    pattern: /^35/,
    length: [16],
    cvvLength: [3],
    icon: "💳",
  },
  {
    name: "Diners Club",
    pattern: /^3[068]/,
    length: [14],
    cvvLength: [3],
    icon: "💳",
  },
]

// Luhn algorithm for card number validation
export function luhnCheck(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, "").split("").map(Number)
  let sum = 0
  let isEven = false

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = digits[i]

    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }

    sum += digit
    isEven = !isEven
  }

  return sum % 10 === 0
}

// Get card type from card number
export function getCardType(cardNumber: string): CardType | null {
  const cleanNumber = cardNumber.replace(/\D/g, "")

  for (const cardType of CARD_TYPES) {
    if (cardType.pattern.test(cleanNumber)) {
      return cardType
    }
  }

  return null
}

// Format card number with spaces
export function formatCardNumber(value: string): string {
  const cleanValue = value.replace(/\D/g, "")
  const cardType = getCardType(cleanValue)

  if (cardType?.name === "American Express") {
    // Format as XXXX XXXXXX XXXXX for Amex
    return cleanValue.replace(/(\d{4})(\d{6})(\d{5})/, "$1 $2 $3")
  } else {
    // Format as XXXX XXXX XXXX XXXX for others
    return cleanValue.replace(/(\d{4})(?=\d)/g, "$1 ")
  }
}

// Format expiry date as MM/YY
export function formatExpiryDate(value: string): string {
  const cleanValue = value.replace(/\D/g, "")
  if (cleanValue.length >= 2) {
    return cleanValue.substring(0, 2) + "/" + cleanValue.substring(2, 4)
  }
  return cleanValue
}

// Validate card number
export function validateCardNumber(cardNumber: string): CardValidation {
  const cleanNumber = cardNumber.replace(/\D/g, "")

  if (!cleanNumber) {
    return { isValid: false, error: "Card number is required" }
  }

  if (cleanNumber.length < 13) {
    return { isValid: false, error: "Card number is too short" }
  }

  const cardType = getCardType(cleanNumber)
  if (!cardType) {
    return { isValid: false, error: "Invalid card type" }
  }

  if (!cardType.length.includes(cleanNumber.length)) {
    return { isValid: false, error: `Invalid ${cardType.name} card number length` }
  }

  if (!luhnCheck(cleanNumber)) {
    return { isValid: false, error: "Invalid card number" }
  }

  return { isValid: true }
}

// Validate expiry date
export function validateExpiryDate(expiryDate: string): CardValidation {
  const cleanValue = expiryDate.replace(/\D/g, "")

  if (!cleanValue) {
    return { isValid: false, error: "Expiry date is required" }
  }

  if (cleanValue.length !== 4) {
    return { isValid: false, error: "Enter expiry date as MM/YY" }
  }

  const month = Number.parseInt(cleanValue.substring(0, 2), 10)
  const year = Number.parseInt(cleanValue.substring(2, 4), 10)

  if (month < 1 || month > 12) {
    return { isValid: false, error: "Invalid month" }
  }

  const currentDate = new Date()
  const currentYear = currentDate.getFullYear() % 100
  const currentMonth = currentDate.getMonth() + 1

  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return { isValid: false, error: "Card has expired" }
  }

  // Don't allow cards that expire more than 20 years in the future
  if (year > currentYear + 20) {
    return { isValid: false, error: "Invalid expiry year" }
  }

  return { isValid: true }
}

// Validate CVV
export function validateCVV(cvv: string, cardNumber: string): CardValidation {
  const cleanCVV = cvv.replace(/\D/g, "")

  if (!cleanCVV) {
    return { isValid: false, error: "CVV is required" }
  }

  const cardType = getCardType(cardNumber)
  if (!cardType) {
    // Default validation if card type unknown
    if (cleanCVV.length < 3 || cleanCVV.length > 4) {
      return { isValid: false, error: "CVV must be 3 or 4 digits" }
    }
  } else {
    if (!cardType.cvvLength.includes(cleanCVV.length)) {
      const expectedLength = cardType.cvvLength[0]
      return { isValid: false, error: `CVV must be ${expectedLength} digits for ${cardType.name}` }
    }
  }

  return { isValid: true }
}

// Validate cardholder name
export function validateCardholderName(name: string): CardValidation {
  const trimmedName = name.trim()

  if (!trimmedName) {
    return { isValid: false, error: "Cardholder name is required" }
  }

  if (trimmedName.length < 2) {
    return { isValid: false, error: "Name is too short" }
  }

  if (trimmedName.length > 50) {
    return { isValid: false, error: "Name is too long" }
  }

  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  const namePattern = /^[a-zA-Z\s\-'.]+$/
  if (!namePattern.test(trimmedName)) {
    return { isValid: false, error: "Name contains invalid characters" }
  }

  // Must contain at least one letter
  if (!/[a-zA-Z]/.test(trimmedName)) {
    return { isValid: false, error: "Name must contain letters" }
  }

  return { isValid: true }
}

// Validate all card fields
export function validateAllCardFields(cardData: {
  cardNumber: string
  expiryDate: string
  cvv: string
  cardholderName: string
}): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}

  const cardNumberValidation = validateCardNumber(cardData.cardNumber)
  if (!cardNumberValidation.isValid) {
    errors.cardNumber = cardNumberValidation.error!
  }

  const expiryValidation = validateExpiryDate(cardData.expiryDate)
  if (!expiryValidation.isValid) {
    errors.expiryDate = expiryValidation.error!
  }

  const cvvValidation = validateCVV(cardData.cvv, cardData.cardNumber)
  if (!cvvValidation.isValid) {
    errors.cvv = cvvValidation.error!
  }

  const nameValidation = validateCardholderName(cardData.cardholderName)
  if (!nameValidation.isValid) {
    errors.cardholderName = nameValidation.error!
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}
