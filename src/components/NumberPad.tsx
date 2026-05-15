import React from 'react';
import { Delete, Check, Minus } from 'lucide-react';

interface NumberPadProps {
  value: string;
  onChange: (value: string) => void;
  allowDecimal?: boolean;
  allowNegative?: boolean;
  label?: string;
}

export function NumberPad({ value, onChange, allowDecimal = true, allowNegative = false, label }: NumberPadProps) {
  const handleKey = (key: string) => {
    if (key === 'backspace') {
      onChange(value.slice(0, -1));
    } else if (key === '±') {
      if (value.startsWith('-')) {
        onChange(value.slice(1));
      } else if (value.length > 0) {
        onChange('-' + value);
      } else {
        onChange('-');
      }
    } else if (key === '.') {
      if (!value.includes('.')) {
        onChange(value === '' ? '0.' : value + '.');
      }
    } else {
      // Digit 0-9
      onChange(value + key);
    }
  };

  const buttonBase = "flex items-center justify-center rounded-xl text-lg font-semibold transition-all active:scale-95 select-none";
  const digitBtn = `${buttonBase} bg-slate-100 text-slate-900 active:bg-slate-200 h-14`;
  const actionBtn = `${buttonBase} bg-slate-200 text-slate-700 active:bg-slate-300 h-14`;

  return (
    <div className="w-full">
      {/* Current value display */}
      <div className="mb-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
        {label && <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">{label}</div>}
        <div className="text-2xl font-mono font-bold text-slate-900 min-h-[2rem]">
          {value || <span className="text-slate-300">0</span>}
        </div>
      </div>

      {/* Keypad grid */}
      <div className="grid grid-cols-3 gap-2">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(digit => (
          <button
            key={digit}
            type="button"
            onClick={() => handleKey(digit)}
            className={digitBtn}
          >
            {digit}
          </button>
        ))}

        {/* Bottom row */}
        {allowNegative ? (
          <button type="button" onClick={() => handleKey('±')} className={actionBtn}>
            ±
          </button>
        ) : allowDecimal ? (
          <button type="button" onClick={() => handleKey('.')} className={actionBtn}>
            .
          </button>
        ) : (
          <div></div>
        )}

        <button type="button" onClick={() => handleKey('0')} className={digitBtn}>
          0
        </button>

        <button
          type="button"
          onClick={() => handleKey('backspace')}
          className={actionBtn}
        >
          <Delete className="w-5 h-5" />
        </button>
      </div>

      {/* Decimal point for when negative is shown */}
      {allowNegative && allowDecimal && (
        <div className="grid grid-cols-3 gap-2 mt-2">
          <button type="button" onClick={() => handleKey('.')} className={actionBtn}>
            .
          </button>
          <div></div>
          <div></div>
        </div>
      )}
    </div>
  );
}
