import React, { useState } from 'react';
import { 
  SimulatorType 
} from '../types';
import { 
  RotateCcw, 
  HelpCircle, 
  Sliders, 
  Car, 
  Scale, 
  PieChart, 
  Maximize2, 
  Sparkles 
} from 'lucide-react';
import { MathFormula, Fraction } from './MathFormula';

interface MathSimulatorProps {
  type: SimulatorType;
}

export const MathSimulator: React.FC<MathSimulatorProps> = ({ type }) => {
  // Common state helpers
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-7">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200 font-bold">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              المختبر الرياضي التفاعلي
            </h3>
            <p className="text-xs text-slate-500">
              حرّك القيم والخيارات ولاحظ التغيرات الرياضية الفورية
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <Sparkles className="w-3.5 h-3.5" />
          <span>محاكاة حية</span>
        </div>
      </div>

      {type === 'fractions_operation' && <FractionsSimulator />}
      {type === 'powers_explorer' && <PowersSimulator />}
      {type === 'algebra_balance' && <AlgebraBalanceSimulator />}
      {type === 'polynomial_expansion' && <PolynomialExpansionSimulator />}
      {type === 'speed_distance_time' && <SpeedDistanceSimulator />}
      {type === 'statistics_histogram' && <StatisticsSimulator />}
    </div>
  );
};

/* --- 1. Fractions Simulator --- */
const FractionsSimulator: React.FC = () => {
  const [num1, setNum1] = useState(3);
  const [den1, setDen1] = useState(4);
  const [num2, setNum2] = useState(2);
  const [den2, setDen2] = useState(3);
  const [op, setOp] = useState<'+' | '-' | '×' | '÷'>('+');

  // Compute common denominator for + and -
  const commonDen = den1 * den2;
  const convertedNum1 = num1 * den2;
  const convertedNum2 = num2 * den1;

  let resNum = 0;
  let resDen = 1;

  if (op === '+') {
    resNum = convertedNum1 + convertedNum2;
    resDen = commonDen;
  } else if (op === '-') {
    resNum = convertedNum1 - convertedNum2;
    resDen = commonDen;
  } else if (op === '×') {
    resNum = num1 * num2;
    resDen = den1 * den2;
  } else if (op === '÷') {
    resNum = num1 * den2;
    resDen = den1 * num2;
  }

  // Greatest common divisor for simplification
  const gcd = (a: number, b: number): number => {
    a = Math.abs(a);
    b = Math.abs(b);
    return b === 0 ? a : gcd(b, a % b);
  };

  const factor = gcd(resNum, resDen) || 1;
  const simpNum = resNum / factor;
  const simpDen = resDen / factor;

  return (
    <div className="space-y-6">
      {/* Interactive Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
        {/* Fraction 1 */}
        <div className="flex flex-col items-center p-3 bg-white rounded-lg border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold mb-2">الكسر الأول</span>
          <div className="flex flex-col items-center gap-1.5">
            <input
              type="number"
              value={num1}
              onChange={(e) => setNum1(Number(e.target.value) || 1)}
              className="w-16 text-center font-bold text-base border border-slate-300 rounded p-1"
            />
            <div className="w-16 h-0.5 bg-slate-800" />
            <input
              type="number"
              value={den1}
              onChange={(e) => setDen1(Math.max(1, Number(e.target.value) || 1))}
              className="w-16 text-center font-bold text-base border border-slate-300 rounded p-1"
            />
          </div>
        </div>

        {/* Operation Selector */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-slate-500 font-semibold">العملية</span>
          <div className="flex gap-1 bg-slate-200 p-1 rounded-lg">
            {(['+', '-', '×', '÷'] as const).map((operation) => (
              <button
                key={operation}
                onClick={() => setOp(operation)}
                className={`w-9 h-9 rounded-md font-bold text-base transition-all ${
                  op === operation
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                {operation}
              </button>
            ))}
          </div>
        </div>

        {/* Fraction 2 */}
        <div className="flex flex-col items-center p-3 bg-white rounded-lg border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold mb-2">الكسر الثاني</span>
          <div className="flex flex-col items-center gap-1.5">
            <input
              type="number"
              value={num2}
              onChange={(e) => setNum2(Number(e.target.value) || 1)}
              className="w-16 text-center font-bold text-base border border-slate-300 rounded p-1"
            />
            <div className="w-16 h-0.5 bg-slate-800" />
            <input
              type="number"
              value={den2}
              onChange={(e) => setDen2(Math.max(1, Number(e.target.value) || 1))}
              className="w-16 text-center font-bold text-base border border-slate-300 rounded p-1"
            />
          </div>
        </div>
      </div>

      {/* Visual Representation Bar */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          التمثيل البصري لأشرطة الكسور
        </h4>

        {/* Bar 1 */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div className="text-xs font-semibold text-slate-600 mb-1 flex justify-between">
            <span>الكسر {num1}/{den1}</span>
            <span className="text-emerald-700 font-mono">{(num1 / den1).toFixed(2)}</span>
          </div>
          <div className="w-full h-7 bg-slate-200 rounded-md overflow-hidden flex border border-slate-300">
            {Array.from({ length: den1 }).map((_, i) => (
              <div
                key={i}
                className={`h-full border-r border-slate-300 transition-colors ${
                  i < num1 ? 'bg-emerald-500' : 'bg-white'
                }`}
                style={{ width: `${100 / den1}%` }}
              />
            ))}
          </div>
        </div>

        {/* Bar 2 */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div className="text-xs font-semibold text-slate-600 mb-1 flex justify-between">
            <span>الكسر {num2}/{den2}</span>
            <span className="text-blue-700 font-mono">{(num2 / den2).toFixed(2)}</span>
          </div>
          <div className="w-full h-7 bg-slate-200 rounded-md overflow-hidden flex border border-slate-300">
            {Array.from({ length: den2 }).map((_, i) => (
              <div
                key={i}
                className={`h-full border-r border-slate-300 transition-colors ${
                  i < num2 ? 'bg-blue-500' : 'bg-white'
                }`}
                style={{ width: `${100 / den2}%` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Step-by-Step Calculation Result with Proper Horizontal Fraction Lines */}
      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3">
        <div className="text-xs font-bold text-emerald-800">
          خطوات الحل الحسابي الدقيقة (بسط فوق ومقام تحت مع خط الكسر الأفقي):
        </div>

        <div className="p-3 bg-white rounded-xl border border-emerald-100 flex flex-wrap items-center gap-3 text-base font-mono text-slate-900" dir="ltr">
          <Fraction numerator={num1} denominator={den1} size="md" />
          <span className="font-bold text-emerald-600">{op}</span>
          <Fraction numerator={num2} denominator={den2} size="md" />
          <span className="font-bold">=</span>

          {op === '+' && (
            <>
              <Fraction numerator={`${num1} × ${den2}`} denominator={`${den1} × ${den2}`} size="sm" />
              <span className="font-bold">+</span>
              <Fraction numerator={`${num2} × ${den1}`} denominator={`${den2} × ${den1}`} size="sm" />
              <span className="font-bold">=</span>
              <Fraction numerator={convertedNum1} denominator={commonDen} size="md" />
              <span className="font-bold">+</span>
              <Fraction numerator={convertedNum2} denominator={commonDen} size="md" />
              <span className="font-bold">=</span>
              <Fraction numerator={resNum} denominator={resDen} size="lg" className="text-emerald-700" />
              {factor > 1 && (
                <>
                  <span className="font-bold">=</span>
                  <Fraction numerator={simpNum} denominator={simpDen} size="lg" className="text-emerald-800" />
                </>
              )}
            </>
          )}

          {op === '-' && (
            <>
              <Fraction numerator={`${num1} × ${den2}`} denominator={`${den1} × ${den2}`} size="sm" />
              <span className="font-bold">-</span>
              <Fraction numerator={`${num2} × ${den1}`} denominator={`${den2} × ${den1}`} size="sm" />
              <span className="font-bold">=</span>
              <Fraction numerator={convertedNum1} denominator={commonDen} size="md" />
              <span className="font-bold">-</span>
              <Fraction numerator={convertedNum2} denominator={commonDen} size="md" />
              <span className="font-bold">=</span>
              <Fraction numerator={resNum} denominator={resDen} size="lg" className="text-emerald-700" />
              {factor > 1 && (
                <>
                  <span className="font-bold">=</span>
                  <Fraction numerator={simpNum} denominator={simpDen} size="lg" className="text-emerald-800" />
                </>
              )}
            </>
          )}

          {op === '×' && (
            <>
              <Fraction numerator={`${num1} × ${num2}`} denominator={`${den1} × ${den2}`} size="md" />
              <span className="font-bold">=</span>
              <Fraction numerator={resNum} denominator={resDen} size="lg" className="text-emerald-700" />
              {factor > 1 && (
                <>
                  <span className="font-bold">=</span>
                  <Fraction numerator={simpNum} denominator={simpDen} size="lg" className="text-emerald-800" />
                </>
              )}
            </>
          )}

          {op === '÷' && (
            <>
              <Fraction numerator={num1} denominator={den1} size="md" />
              <span className="font-bold">×</span>
              <Fraction numerator={den2} denominator={num2} size="md" />
              <span className="font-bold">=</span>
              <Fraction numerator={resNum} denominator={resDen} size="lg" className="text-emerald-700" />
              {factor > 1 && (
                <>
                  <span className="font-bold">=</span>
                  <Fraction numerator={simpNum} denominator={simpDen} size="lg" className="text-emerald-800" />
                </>
              )}
            </>
          )}
        </div>

        <div className="text-xs text-slate-600 font-medium">
          {op === '+' || op === '-' ? (
            <span>تم توحيد المقامات على المضاعف المشترك {commonDen} بضرب بسط ومقام كل كسر، ثم {op === '+' ? 'جمع' : 'طرح'} البسوط والحفاظ على المقام الموحد{factor > 1 ? ' واختزال الناتج لأبسط صورة' : ''}.</span>
          ) : op === '×' ? (
            <span>في ضرب الكسور: نضرب البسط في البسط، والمقام في المقام مباشرة{factor > 1 ? '، ثم نختصر الناتج' : ''}.</span>
          ) : (
            <span>في قسمة الكسور: نحول عملية القسمة إلى ضرب في مقلوب الكسر الثاني (البسط يصبح مقاماً والمقام بسطاً).</span>
          )}
        </div>
      </div>
    </div>
  );
};

/* --- 2. Powers Simulator --- */
const PowersSimulator: React.FC = () => {
  const [exponent, setExponent] = useState(3);
  const [baseNumber, setBaseNumber] = useState(2.5);

  const powerValue = Math.pow(10, exponent);
  const fullResult = baseNumber * powerValue;

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-2">
            الأس (قوة العدد 10): n = {exponent}
          </label>
          <input
            type="range"
            min="-5"
            max="5"
            step="1"
            value={exponent}
            onChange={(e) => setExponent(Number(e.target.value))}
            className="w-full accent-amber-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1" dir="ltr">
            <span>10⁻⁵</span>
            <span>10⁰ = 1</span>
            <span>10⁵</span>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-2">
            العدد a في الصيغة المعيارية (1 ≤ a &lt; 10): {baseNumber}
          </label>
          <input
            type="range"
            min="1.0"
            max="9.9"
            step="0.1"
            value={baseNumber}
            onChange={(e) => setBaseNumber(Number(e.target.value))}
            className="w-full accent-amber-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center">
          <span className="text-xs text-amber-800 font-bold block mb-1">الصيغة المعيارية (العلمية)</span>
          <div className="text-2xl font-mono font-bold text-amber-900" dir="ltr">
            {baseNumber} × 10<sup>{exponent}</sup>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-center">
          <span className="text-xs text-slate-600 font-bold block mb-1">الكتابة العشرية الكاملة</span>
          <div className="text-xl font-mono font-bold text-slate-900 truncate" dir="ltr">
            {fullResult.toLocaleString('en-US', { maximumFractionDigits: 7 })}
          </div>
        </div>
      </div>

      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 space-y-1">
        <div><strong>تأثير الأس:</strong></div>
        {exponent > 0 && <div>الأس موجب (+{exponent}): حركنا الفاصلة {exponent} مراتب إلى اليمين لتكبير العدد.</div>}
        {exponent < 0 && <div>الأس سالب ({exponent}): حركنا الفاصلة {Math.abs(exponent)} مراتب إلى اليسار لتصغير العدد.</div>}
        {exponent === 0 && <div>الأس صفر: 10⁰ = 1 ولا تتغير قيمة العدد.</div>}
      </div>
    </div>
  );
};

/* --- 3. Algebra Balance Simulator --- */
const AlgebraBalanceSimulator: React.FC = () => {
  // Simulates equation: 2x + 4 = 10 ⟹ x = 3
  const [xVal, setXVal] = useState(3);
  const [leftConstant, setLeftConstant] = useState(4);
  const [rightConstant, setRightConstant] = useState(10);
  const xCoefficient = 2;

  const leftWeight = xCoefficient * xVal + leftConstant;
  const rightWeight = rightConstant;

  const diff = leftWeight - rightWeight;
  const tiltDeg = Math.max(-15, Math.min(15, diff * 2));
  const isBalanced = diff === 0;

  return (
    <div className="space-y-6">
      <div className="text-center p-3 bg-slate-50 rounded-xl border border-slate-200">
        <span className="text-xs text-slate-500 font-semibold block mb-1">المعادلة الحالية</span>
        <div className="text-xl font-mono font-bold text-slate-900" dir="ltr">
          {xCoefficient}x + {leftConstant} = {rightConstant}
        </div>
      </div>

      {/* Balance Visual Canvas */}
      <div className="relative h-44 bg-slate-100 rounded-2xl border border-slate-200 flex flex-col items-center justify-center overflow-hidden p-4">
        {/* Support Pillar */}
        <div className="absolute bottom-4 w-6 h-24 bg-slate-400 rounded-t-md shadow-xs" />
        <div className="absolute bottom-4 w-20 h-4 bg-slate-500 rounded-md" />
        <div className="absolute top-14 w-4 h-4 rounded-full bg-slate-700 z-10" />

        {/* Tilting Beam */}
        <div 
          className="relative w-72 sm:w-96 h-3 bg-slate-700 rounded-full transition-transform duration-500 ease-out shadow-md"
          style={{ transform: `rotate(${tiltDeg}deg)` }}
        >
          {/* Left Pan */}
          <div className="absolute -left-2 top-3 flex flex-col items-center">
            <div className="w-0.5 h-14 bg-slate-400" />
            <div className="w-24 sm:w-28 py-2 px-1 bg-white rounded-lg border-2 border-emerald-500 shadow-md flex flex-wrap gap-1 justify-center items-center">
              <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                {xCoefficient}x ({xCoefficient * xVal})
              </span>
              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] font-bold">
                +{leftConstant}
              </span>
              <div className="w-full text-center text-[10px] text-slate-500 font-mono">
                المجموع: {leftWeight}
              </div>
            </div>
          </div>

          {/* Right Pan */}
          <div className="absolute -right-2 top-3 flex flex-col items-center">
            <div className="w-0.5 h-14 bg-slate-400" />
            <div className="w-24 sm:w-28 py-2 px-1 bg-white rounded-lg border-2 border-rose-500 shadow-md flex flex-wrap gap-1 justify-center items-center">
              <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[11px] font-bold">
                +{rightConstant}
              </span>
              <div className="w-full text-center text-[10px] text-slate-500 font-mono">
                المجموع: {rightWeight}
              </div>
            </div>
          </div>
        </div>

        {/* Balance Status Badge */}
        <div className="absolute top-3 right-3">
          {isBalanced ? (
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
              ✓ الميزان متوازن تماماً (المعادلة صحيحة عند x = {xVal})
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300">
              كفة {diff > 0 ? 'اليسار أثقل' : 'اليمين أثقل'} (جرّب تغيير x)
            </span>
          )}
        </div>
      </div>

      {/* Adjust value of x */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
        <label className="text-xs font-bold text-slate-700 block">
          اختبر قيمة المجهول x: x = {xVal}
        </label>
        <input
          type="range"
          min="0"
          max="8"
          step="1"
          value={xVal}
          onChange={(e) => setXVal(Number(e.target.value))}
          className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-xs text-slate-500">
          <span>0</span>
          <span className="font-bold text-emerald-700">القيمة الصحيحة للحل: x = {(rightConstant - leftConstant) / xCoefficient}</span>
          <span>8</span>
        </div>
      </div>
    </div>
  );
};

/* --- 4. Polynomial Expansion Simulator --- */
const PolynomialExpansionSimulator: React.FC = () => {
  const [a, setA] = useState(3);
  const [b, setB] = useState(4);
  const [c, setC] = useState(2);
  const [d, setD] = useState(5);

  const areaAC = a * c;
  const areaAD = a * d;
  const areaBC = b * c;
  const areaBD = b * d;
  const totalArea = areaAC + areaAD + areaBC + areaBD;

  return (
    <div className="space-y-6">
      <div className="text-center p-3 bg-slate-50 rounded-xl border border-slate-200">
        <span className="text-xs text-slate-500 font-semibold block mb-1">المتطابقة الهندسية</span>
        <div className="text-lg sm:text-xl font-mono font-bold text-slate-900" dir="ltr">
          ({a} + {b})({c} + {d}) = {a}·{c} + {a}·{d} + {b}·{c} + {b}·{d} = {totalArea}
        </div>
      </div>

      {/* Interactive Sliders */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-center">
          <label className="text-xs font-bold text-emerald-900 block mb-1">a = {a}</label>
          <input
            type="range"
            min="1"
            max="6"
            value={a}
            onChange={(e) => setA(Number(e.target.value))}
            className="w-full accent-emerald-600 cursor-pointer"
          />
        </div>
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-center">
          <label className="text-xs font-bold text-blue-900 block mb-1">b = {b}</label>
          <input
            type="range"
            min="1"
            max="6"
            value={b}
            onChange={(e) => setB(Number(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer"
          />
        </div>
        <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-center">
          <label className="text-xs font-bold text-amber-900 block mb-1">c = {c}</label>
          <input
            type="range"
            min="1"
            max="6"
            value={c}
            onChange={(e) => setC(Number(e.target.value))}
            className="w-full accent-amber-600 cursor-pointer"
          />
        </div>
        <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 text-center">
          <label className="text-xs font-bold text-purple-900 block mb-1">d = {d}</label>
          <input
            type="range"
            min="1"
            max="6"
            value={d}
            onChange={(e) => setD(Number(e.target.value))}
            className="w-full accent-purple-600 cursor-pointer"
          />
        </div>
      </div>

      {/* Visual Rectangle Grid */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center">
        <div className="text-xs text-slate-500 font-semibold mb-3">
          المستطيل مقسم إلى أربع مساحات ملونة (صفحة 54)
        </div>
        <div className="grid grid-cols-2 w-64 sm:w-80 h-52 sm:h-64 border-2 border-slate-700 rounded-lg overflow-hidden shadow-md">
          <div className="bg-emerald-200/80 border-r-2 border-b-2 border-slate-700 flex flex-col items-center justify-center p-2 text-center">
            <span className="text-xs font-bold text-emerald-950 font-mono">ac</span>
            <span className="text-xs text-emerald-800">{a} × {c} = {areaAC}</span>
          </div>
          <div className="bg-blue-200/80 border-b-2 border-slate-700 flex flex-col items-center justify-center p-2 text-center">
            <span className="text-xs font-bold text-blue-950 font-mono">ad</span>
            <span className="text-xs text-blue-800">{a} × {d} = {areaAD}</span>
          </div>
          <div className="bg-amber-200/80 border-r-2 border-slate-700 flex flex-col items-center justify-center p-2 text-center">
            <span className="text-xs font-bold text-amber-950 font-mono">bc</span>
            <span className="text-xs text-amber-800">{b} × {c} = {areaBC}</span>
          </div>
          <div className="bg-purple-200/80 flex flex-col items-center justify-center p-2 text-center">
            <span className="text-xs font-bold text-purple-950 font-mono">bd</span>
            <span className="text-xs text-purple-800">{b} × {d} = {areaBD}</span>
          </div>
        </div>
        <div className="mt-3 text-xs font-bold text-slate-800">
          المساحة الكلية = {areaAC} + {areaAD} + {areaBC} + {areaBD} = {totalArea} وحدة مربعة
        </div>
      </div>
    </div>
  );
};

/* --- 5. Speed Distance Simulator --- */
const SpeedDistanceSimulator: React.FC = () => {
  const [speed, setSpeed] = useState(90); // km/h
  const [hours, setHours] = useState(2); // hours
  const [minutes, setMinutes] = useState(30); // min

  const timeInHours = hours + minutes / 60;
  const distance = speed * timeInHours;
  const speedInMS = (speed / 3.6).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <label className="text-xs font-bold text-slate-700 block mb-2">
            السرعة الوسطى (v): {speed} km/h
          </label>
          <input
            type="range"
            min="20"
            max="160"
            step="5"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-full accent-teal-600 cursor-pointer"
          />
          <div className="text-[11px] text-teal-700 font-semibold mt-1">
            تعادل: {speedInMS} m/s
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <label className="text-xs font-bold text-slate-700 block mb-2">
            الساعات: {hours} h
          </label>
          <input
            type="range"
            min="0"
            max="6"
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="w-full accent-teal-600 cursor-pointer"
          />
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <label className="text-xs font-bold text-slate-700 block mb-2">
            الدقائق الإضافية: {minutes} min
          </label>
          <input
            type="range"
            min="0"
            max="50"
            step="10"
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value))}
            className="w-full accent-teal-600 cursor-pointer"
          />
          <div className="text-[11px] text-slate-500 mt-1">
            = {(minutes / 60).toFixed(2)} ساعة
          </div>
        </div>
      </div>

      {/* Moving Car Track Animation */}
      <div className="relative h-28 bg-slate-900 rounded-xl p-4 overflow-hidden border border-slate-800 flex flex-col justify-between">
        <div className="text-[11px] text-slate-400 flex justify-between font-mono">
          <span>نقطة الانطلاق A (0 km)</span>
          <span>الوجهة B ({distance.toFixed(1)} km)</span>
        </div>

        {/* Road line */}
        <div className="relative w-full h-1 bg-slate-700 my-auto">
          <div 
            className="absolute -top-3 w-8 h-8 rounded-full bg-teal-500 text-slate-950 flex items-center justify-center shadow-lg transition-all duration-300"
            style={{ left: `${Math.min(95, Math.max(5, (distance / 600) * 100))}%` }}
          >
            <Car className="w-5 h-5" />
          </div>
        </div>

        <div className="text-xs text-teal-400 font-bold flex justify-between">
          <span>الزمن الكلي: {timeInHours.toFixed(2)} ساعة</span>
          <span>المسافة المقطوعة: d = {distance.toFixed(1)} km</span>
        </div>
      </div>

      {/* Calculation Formula */}
      <div className="p-4 bg-teal-50 rounded-xl border border-teal-200 text-xs text-teal-900 space-y-1">
        <div><strong>قانون المسافة:</strong> d = v × t</div>
        <div className="font-mono" dir="ltr">d = {speed} km/h × {timeInHours.toFixed(2)} h = {distance.toFixed(1)} km</div>
      </div>
    </div>
  );
};

/* --- 6. Statistics Simulator --- */
const StatisticsSimulator: React.FC = () => {
  const [data, setData] = useState<number[]>([10, 12, 12, 14, 15, 15, 15, 18, 20]);
  const [newVal, setNewVal] = useState(14);

  const addValue = () => {
    if (newVal >= 0 && newVal <= 30) {
      setData(prev => [...prev, newVal].sort((a, b) => a - b));
    }
  };

  const removeValue = (index: number) => {
    setData(prev => prev.filter((_, i) => i !== index));
  };

  const count = data.length || 1;
  const sum = data.reduce((acc, curr) => acc + curr, 0);
  const mean = (sum / count).toFixed(2);

  // Frequency mapping
  const freqs: Record<number, number> = {};
  data.forEach(v => {
    freqs[v] = (freqs[v] || 0) + 1;
  });

  const uniqueVals = Object.keys(freqs).map(Number).sort((a, b) => a - b);
  const maxFreq = Math.max(...Object.values(freqs), 1);

  return (
    <div className="space-y-6">
      {/* Input data control */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
        <label className="text-xs font-bold text-slate-700">أضف درجة جديدة (0 - 30):</label>
        <input
          type="number"
          min="0"
          max="30"
          value={newVal}
          onChange={(e) => setNewVal(Number(e.target.value))}
          className="w-20 px-2 py-1 text-center font-bold border border-slate-300 rounded-lg text-sm bg-white"
        />
        <button
          onClick={addValue}
          className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-colors"
        >
          + إضافة للعينة
        </button>

        <div className="mr-auto text-xs text-slate-500 font-semibold">
          حجم العينة: <span className="font-bold text-slate-900">{data.length}</span> مفردة
        </div>
      </div>

      {/* Interactive Bar Chart */}
      <div className="p-4 bg-white rounded-xl border border-slate-200">
        <span className="text-xs font-bold text-slate-700 block mb-3">
          التمثيل بالأعمدة البيانية وتوزيع التكرارات (صفحة 114)
        </span>
        <div className="h-44 flex items-end justify-between gap-2 border-b-2 border-slate-300 pb-1 pt-6">
          {uniqueVals.map((val) => {
            const f = freqs[val];
            const heightPercent = (f / maxFreq) * 100;
            return (
              <div key={val} className="flex-1 flex flex-col items-center group">
                <span className="text-[10px] font-bold text-purple-700 mb-1">{f}</span>
                <div
                  className="w-full max-w-[28px] bg-purple-500 hover:bg-purple-600 rounded-t-md transition-all shadow-xs"
                  style={{ height: `${heightPercent}%`, minHeight: '12px' }}
                  title={`الدرجة: ${val} (تكرار: ${f})`}
                />
                <span className="text-[11px] font-semibold text-slate-700 mt-1">{val}</span>
              </div>
            );
          })}
        </div>
        <div className="text-center text-[11px] text-slate-400 mt-1 font-sans">
          المحور الأفقي: الدرجات • المحور الشاقولي: عدد مرات التكرار
        </div>
      </div>

      {/* Computed Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 text-center">
          <span className="text-xs text-purple-800 font-semibold block">المتوسط الحسابي x̄</span>
          <span className="text-xl font-bold text-purple-950 font-mono">{mean}</span>
        </div>
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
          <span className="text-xs text-slate-600 font-semibold block">مجموع الدرجات Σx</span>
          <span className="text-xl font-bold text-slate-900 font-mono">{sum}</span>
        </div>
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center col-span-2 sm:col-span-1">
          <span className="text-xs text-slate-600 font-semibold block">أكبر تكرار (المنوال)</span>
          <span className="text-xl font-bold text-slate-900 font-mono">{maxFreq} مرات</span>
        </div>
      </div>
    </div>
  );
};
