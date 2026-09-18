import React from 'react';

export interface FractionProps {
  numerator: React.ReactNode;
  denominator: React.ReactNode;
  sign?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

/**
 * Standard Syrian & Arabic Curriculum Fraction Component
 * Explicitly displays:
 * - Numerator (البسط) on top
 * - Prominent horizontal fraction bar (خط الكسر العرضي الأفقي)
 * - Denominator (المقام) on bottom
 */
export const Fraction: React.FC<FractionProps> = ({
  numerator,
  denominator,
  sign,
  size = 'md',
  className = '',
}) => {
  const sizeStyles = {
    xs: {
      box: 'mx-1 my-0.5 text-xs',
      num: 'pb-0.5 px-1 border-b-2 border-slate-900',
      den: 'pt-0.5 px-1',
    },
    sm: {
      box: 'mx-1 my-0.5 text-xs sm:text-sm',
      num: 'pb-0.5 px-1 border-b-2 border-slate-900',
      den: 'pt-0.5 px-1',
    },
    md: {
      box: 'mx-1.5 my-1 text-sm sm:text-base',
      num: 'pb-1 px-1.5 border-b-2 border-slate-900',
      den: 'pt-1 px-1.5',
    },
    lg: {
      box: 'mx-2 my-1.5 text-lg sm:text-xl',
      num: 'pb-1.5 px-2 border-b-[2.5px] border-slate-900',
      den: 'pt-1.5 px-2',
    },
    xl: {
      box: 'mx-2.5 my-2 text-xl sm:text-2xl md:text-3xl',
      num: 'pb-2 px-2.5 border-b-[3px] border-slate-900',
      den: 'pt-2 px-2.5',
    },
  }[size];

  return (
    <span
      dir="ltr"
      className={`inline-flex items-center align-middle font-mono font-bold select-none text-slate-950 ${className}`}
    >
      {sign && (
        <span className="mr-1 text-slate-950 font-bold text-center">
          {sign}
        </span>
      )}
      <span className={`inline-flex flex-col items-center justify-center leading-none ${sizeStyles.box}`}>
        {/* البسط (Numerator) */}
        <span className={`w-full text-center text-slate-950 font-bold ${sizeStyles.num}`}>
          {numerator}
        </span>
        {/* المقام (Denominator) */}
        <span className={`w-full text-center text-slate-950 font-bold ${sizeStyles.den}`}>
          {denominator}
        </span>
      </span>
    </span>
  );
};

interface MathFormulaProps {
  formula: string;
  className?: string;
  large?: boolean;
}

/**
 * Intelligent Math Formula Renderer
 * Parses expressions and renders all fractions with vertical stacked layout (horizontal line),
 * exponents (superscript), roots, and equations.
 */
export const MathFormula: React.FC<MathFormulaProps> = ({
  formula,
  className = '',
  large = false,
}) => {
  const size = large ? 'lg' : 'md';

  // Helper to parse power expressions like 10^3 or x^2
  const renderPowerOrText = (token: string, key: number | string) => {
    const powerMatch = token.match(/^([a-zA-Z0-9\u0621-\u064A]+)\^(-?[a-zA-Z0-9\u0621-\u064A]+)$/);
    if (powerMatch) {
      return (
        <span key={key} className="inline-flex items-baseline font-mono">
          <span>{powerMatch[1]}</span>
          <sup className="text-[0.7em] font-bold text-amber-500 ml-0.5">{powerMatch[2]}</sup>
        </span>
      );
    }

    // Square root like √144 or √(16+9)
    const rootMatch = token.match(/^√\(([^)]+)\)$|^√(\d+)$/);
    if (rootMatch) {
      const inside = rootMatch[1] || rootMatch[2];
      return (
        <span key={key} className="inline-flex items-center font-mono">
          <span className="text-emerald-500 font-bold text-lg mr-0.5">√</span>
          <span className="border-t-2 border-current pt-0.5 px-0.5">{inside}</span>
        </span>
      );
    }

    return <span key={key}>{token}</span>;
  };

  // Helper to parse a single term that might be a fraction
  // Examples: "5/6", "(5×2)/(6×2)", "(-7)/8", "a/b", "(a·d + b·c)/(b·d)"
  const renderTerm = (term: string, idx: number) => {
    const trimmed = term.trim();
    if (!trimmed) return null;

    // Check if it's a fraction (has a slash not inside single brackets)
    // Matches: [sign] num / den
    const fractionPattern = /^([+-]?)\s*(?:\(([^()]+)\)|([a-zA-Z0-9\u0621-\u064A·*×+-\s]+))\s*\/\s*(?:\(([^()]+)\)|([a-zA-Z0-9\u0621-\u064A·*×+-\s]+))$/;
    const match = trimmed.match(fractionPattern);

    if (match) {
      const sign = match[1] || '';
      const numRaw = (match[2] || match[3] || '').trim();
      const denRaw = (match[4] || match[5] || '').trim();

      return (
        <Fraction
          key={idx}
          sign={sign}
          numerator={numRaw}
          denominator={denRaw}
          size={size}
        />
      );
    }

    // Check powers or plain text
    return renderPowerOrText(trimmed, idx);
  };

  // Split by top-level operators while preserving them: = , + , - , × , · , ÷ , ≤ , ≥ , < , >
  // Be careful not to break fractions like (a + b)/c
  // We can tokenize by spaces or operators
  const tokenizeExpression = (expr: string) => {
    // Regex splits by operators that are surrounded by spaces or outside parens
    const parts = expr.split(/\s+(=|≠|\+|×|\*|·|÷|≤|≥|<|>|-)\s+/);
    return parts;
  };

  const tokens = tokenizeExpression(formula);

  return (
    <span
      dir="ltr"
      className={`inline-flex flex-wrap items-center justify-center align-middle font-mono font-bold tracking-wide px-3 py-1.5 rounded-xl bg-white text-slate-950 border border-slate-300 shadow-xs ${
        large ? 'text-lg md:text-2xl py-2 px-4' : 'text-sm md:text-base'
      } ${className}`}
    >
      {tokens.map((token, i) => {
        const trimmed = token.trim();
        if (['=', '≠', '+', '×', '*', '·', '÷', '≤', '≥', '<', '>', '-'].includes(trimmed)) {
          return (
            <span
              key={i}
              className="mx-2 text-emerald-800 font-black self-center select-none text-base sm:text-lg"
            >
              {trimmed === '*' ? '×' : trimmed}
            </span>
          );
        }
        return renderTerm(token, i);
      })}
    </span>
  );
};

interface MathTextProps {
  text: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

/**
 * Text renderer that automatically detects inline fractions (e.g. "3/4" or "(5 / 6)")
 * and renders them with the standard Syrian vertical stacked layout (line between numerator and denominator).
 */
export const MathText: React.FC<MathTextProps> = ({ text, className = '', size = 'sm' }) => {
  if (!text) return null;

  // Regex to match fractions like "3/4", "(-5)/8", "(40 / 24)", "7/8", "a/b"
  // Avoid URLs or date formats
  const fractionRegex = /(?:\b|\()([+-]?\d+|[a-zA-Z])\s*\/\s*(\d+|[a-zA-Z])(?:\)|\b)/g;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = fractionRegex.exec(text)) !== null) {
    // Add text before fraction
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const num = match[1];
    const den = match[2];

    parts.push(
      <Fraction
        key={`frac-${match.index}`}
        numerator={num}
        denominator={den}
        size={size}
        className="text-slate-950"
      />
    );

    lastIndex = fractionRegex.lastIndex;
  }

  // Add trailing text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return <span className={className}>{parts}</span>;
};
