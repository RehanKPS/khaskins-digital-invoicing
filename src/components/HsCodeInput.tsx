import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const HS_CODE_REGEX = /^\d{4}\.\d{4}$/;

interface HsCodeInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  className?: string;
}

const formatHsCode = (digits: string): string => {
  const clean = digits.replace(/\D/g, '').slice(0, 8);
  if (clean.length <= 4) return clean;
  return clean.slice(0, 4) + '.' + clean.slice(4);
};

const getDigits = (formatted: string): string => formatted.replace(/\D/g, '');

const HsCodeInput = ({ value, onChange, error, className }: HsCodeInputProps) => {
  const digits = getDigits(value);
  const isValid = HS_CODE_REGEX.test(value);
  const showGreen = isValid;
  const showRed = !isValid && digits.length > 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 8);
    onChange(formatHsCode(raw));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'];
    if (allowed.includes(e.key)) return;
    if (e.ctrlKey || e.metaKey) return;
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <div>
      <Input
        type="text"
        inputMode="numeric"
        placeholder="41120000"
        maxLength={9}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className={cn(
          'w-28',
          showGreen && 'border-[#16a34a] focus-visible:ring-[#16a34a]',
          (showRed || error) && 'border-[#dc2626] focus-visible:ring-[#dc2626]',
          className
        )}
      />
      {error && <p className="text-xs text-[#dc2626] mt-1">{error}</p>}
    </div>
  );
};

export { HsCodeInput, HS_CODE_REGEX };
