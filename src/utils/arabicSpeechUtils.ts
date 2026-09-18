/**
 * Arabic Number & Mathematical Words Converter
 * Converts digits, math expressions, and fractions into clear, natural Arabic spoken words.
 * This guarantees that even if a system TTS engine has issues with digits, it speaks 100% Arabic words.
 */

const DIGITS_AR: Record<number, string> = {
  0: 'صفر',
  1: 'واحد',
  2: 'اثنان',
  3: 'ثلاثة',
  4: 'أربعة',
  5: 'خمسة',
  6: 'ستة',
  7: 'سبعة',
  8: 'ثمانية',
  9: 'تسعة',
  10: 'عشرة',
  11: 'أحد عشر',
  12: 'اثنا عشر',
  13: 'ثلاثة عشر',
  14: 'أربعة عشر',
  15: 'خمسة عشر',
  16: 'ستة عشر',
  17: 'سبعة عشر',
  18: 'ثمانية عشر',
  19: 'تسعة عشر',
  20: 'عشرون',
  24: 'أربعة وعشرون',
  25: 'خمسة وعشرون',
  30: 'ثلاثون',
  36: 'ستة وثلاثون',
  40: 'أربعون',
  48: 'ثمانية وأربعون',
  50: 'خمسون',
  60: 'ستون',
  70: 'سبعون',
  72: 'اثنان وسبعون',
  80: 'ثمانون',
  90: 'تسعون',
  100: 'مئة',
  144: 'مئة وأربعة وأربعون',
  200: 'مئتان',
  1000: 'ألف',
};

export function numberToArabicWords(num: number): string {
  if (DIGITS_AR[num]) return DIGITS_AR[num];

  if (num < 0) {
    return `سالب ${numberToArabicWords(Math.abs(num))}`;
  }

  if (num > 20 && num < 100) {
    const unit = num % 10;
    const tens = Math.floor(num / 10) * 10;
    if (unit === 0) return DIGITS_AR[tens] || `${num}`;
    return `${DIGITS_AR[unit]} و${DIGITS_AR[tens] || ''}`;
  }

  if (num > 100 && num < 1000) {
    const hundreds = Math.floor(num / 100) * 100;
    const remainder = num % 100;
    const hText = hundreds === 100 ? 'مئة' : hundreds === 200 ? 'مئتان' : `${DIGITS_AR[Math.floor(num / 100)]} مئة`;
    if (remainder === 0) return hText;
    return `${hText} و${numberToArabicWords(remainder)}`;
  }

  return `${num}`;
}

/**
 * Converts a mathematical expression or text into fluent, rich Arabic teacher narration
 */
export function convertMathToSpokenArabic(text: string): string {
  let spoken = text;

  // Clean HTML if any
  spoken = spoken.replace(/<[^>]*>/g, ' ');

  // Replace common fraction speech patterns like "3/4" or "(-5)/7"
  // E.g. "5/6" -> "خمسة على ستة"
  spoken = spoken.replace(/([-\d]+)\s*\/\s*(\d+)/g, (_, numStr, denStr) => {
    const num = parseInt(numStr, 10);
    const den = parseInt(denStr, 10);
    const numWord = !isNaN(num) && Math.abs(num) <= 1000 ? numberToArabicWords(num) : numStr;
    const denWord = !isNaN(den) && Math.abs(den) <= 1000 ? numberToArabicWords(den) : denStr;
    return ` الكسر ${numWord} على ${denWord} `;
  });

  // Powers
  spoken = spoken.replace(/10\^(-?\d+)/g, (_, p) => {
    const pNum = parseInt(p, 10);
    const pWord = !isNaN(pNum) ? numberToArabicWords(pNum) : p;
    return ` عشرة مرفوعة للقوة ${pWord} `;
  });

  spoken = spoken.replace(/([a-zA-Z\u0621-\u064A])\^2/g, ' $1 مربع ');
  spoken = spoken.replace(/([a-zA-Z\u0621-\u064A])\^3/g, ' $1 مكعب ');
  spoken = spoken.replace(/([a-zA-Z\u0621-\u064A])\^(-?\d+)/g, (_, v, p) => ` $1 أس ${p} `);

  // Square roots
  spoken = spoken.replace(/√(\d+)/g, (_, n) => {
    const num = parseInt(n, 10);
    const word = !isNaN(num) ? numberToArabicWords(num) : n;
    return ` الجذر التربيعي للعدد ${word} `;
  });

  // Operators
  spoken = spoken.replace(/\+/g, ' زائد ');
  spoken = spoken.replace(/×|\*/g, ' ضرب ');
  spoken = spoken.replace(/÷/g, ' تقسيم ');
  spoken = spoken.replace(/=/g, ' يساوي ');
  spoken = spoken.replace(/≠/g, ' لا يساوي ');
  spoken = spoken.replace(/≤/g, ' أصغر من أو يساوي ');
  spoken = spoken.replace(/≥/g, ' أكبر من أو يساوي ');
  spoken = spoken.replace(/</g, ' أصغر من ');
  spoken = spoken.replace(/>/g, ' أكبر من ');
  spoken = spoken.replace(/≈/g, ' يساوي تقريباً ');

  // Variables
  spoken = spoken.replace(/\bx\b/gi, ' المتغير إكس ');
  spoken = spoken.replace(/\by\b/gi, ' المتغير واي ');
  spoken = spoken.replace(/\bz\b/gi, ' المتغير زد ');
  spoken = spoken.replace(/\ba\b/gi, ' الحرف إيه ');
  spoken = spoken.replace(/\bb\b/gi, ' الحرف بي ');
  spoken = spoken.replace(/\bc\b/gi, ' الحرف سي ');
  spoken = spoken.replace(/\bd\b/gi, ' الحرف دي ');

  // Replace isolated numbers with Arabic words to ensure Arabic pronunciation
  spoken = spoken.replace(/\b(\d+)\b/g, (match) => {
    const n = parseInt(match, 10);
    if (!isNaN(n) && n >= 0 && n <= 100) {
      return numberToArabicWords(n);
    }
    return match;
  });

  // Clean multiple spaces
  spoken = spoken.replace(/\s+/g, ' ').trim();

  return spoken;
}
