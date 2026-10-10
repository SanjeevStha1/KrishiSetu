import React from 'react';

export type AccentColor = 'green' | 'gold' | 'brown' | 'blue' | 'default';

interface SimpleCardProps {
  children: React.ReactNode;
  className?: string;
  accentColor?: AccentColor;
  maxWidth?: 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'full';
  id?: string;
}

export const SimpleCard: React.FC<SimpleCardProps> = ({
  children,
  className = '',
  maxWidth = '2xl',
  id,
}) => {
  const maxWidthClass = {
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    full: 'max-w-full',
  }[maxWidth];

  return (
    <div
      id={id}
      className={`w-full ${maxWidthClass} mx-auto bg-[#FFFFFF] rounded-3xl sm:rounded-[28px] p-6 sm:p-7 border border-[#E2EEF2] shadow-[0_4px_20px_-4px_rgba(15,23,42,0.04)] transition-all text-[#0F172A] ${className}`}
    >
      {children}
    </div>
  );
};

interface SimpleCardHeaderProps {
  title: string;
  subtitle?: string;
  badge?: {
    label: string;
    icon?: React.ReactNode;
  };
  accentColor?: AccentColor;
  className?: string;
}

export const SimpleCardHeader: React.FC<SimpleCardHeaderProps> = ({
  title,
  subtitle,
  badge,
  className = '',
}) => {
  return (
    <div className={`space-y-2 mb-6 text-center sm:text-left ${className}`}>
      {badge && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-tight mb-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF5F8] text-[#0284C7] border border-[#D0E9F0]">
            {badge.icon}
            <span>{badge.label}</span>
          </span>
        </div>
      )}
      <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight leading-tight">
        {title}
      </h1>
      {subtitle && (
        <p className="text-sm sm:text-base text-[#64748B] leading-relaxed max-w-2xl">
          {subtitle}
        </p>
      )}
    </div>
  );
};

interface SimpleCardFieldProps {
  label: string;
  hint?: string;
  examplePlaceholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  stepper?: boolean;
  stepperStep?: number;
  onStepperChange?: (delta: number) => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
  id?: string;
}

export const SimpleCardField: React.FC<SimpleCardFieldProps> = ({
  label,
  hint,
  examplePlaceholder,
  value,
  onChange,
  type = 'text',
  unit,
  min,
  max,
  step,
  stepper = false,
  stepperStep = 1,
  onStepperChange,
  icon,
  disabled = false,
  children,
  className = '',
  id,
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="text-xs sm:text-sm font-bold text-[#0F172A] tracking-tight flex items-center gap-1.5"
        >
          {icon}
          <span>{label}</span>
        </label>
        {hint && (
          <span className="text-xs text-[#64748B] font-medium">{hint}</span>
        )}
      </div>

      {children ? (
        children
      ) : (
        <div className="flex items-center gap-2">
          {stepper && onStepperChange && (
            <button
              type="button"
              disabled={disabled}
              onClick={() => onStepperChange(-stepperStep)}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#F8FAFC] hover:bg-[#EDF4F7] active:scale-95 text-[#0F172A] font-bold text-lg flex items-center justify-center transition cursor-pointer disabled:opacity-50 shrink-0 select-none border border-[#E2EEF2]"
              aria-label={`Decrease ${label}`}
            >
              −
            </button>
          )}

          <div className="relative flex-1">
            <input
              id={id}
              type={type}
              value={value}
              onChange={onChange}
              placeholder={examplePlaceholder}
              min={min}
              max={max}
              step={step}
              disabled={disabled}
              className="w-full bg-[#F8FAFC] border border-[#E2EEF2] hover:border-[#CBD5E1] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 rounded-2xl px-4 py-3 sm:py-3.5 text-base sm:text-lg font-bold text-[#0F172A] placeholder:text-[#94A3B8] outline-none transition disabled:bg-[#EDF4F7] disabled:text-[#94A3B8] font-mono tabular-nums shadow-2xs"
            />
            {unit && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs sm:text-sm font-bold text-[#64748B] bg-[#FFFFFF] px-2.5 py-0.5 rounded-lg border border-[#E2EEF2] pointer-events-none select-none shadow-2xs">
                {unit}
              </span>
            )}
          </div>

          {stepper && onStepperChange && (
            <button
              type="button"
              disabled={disabled}
              onClick={() => onStepperChange(stepperStep)}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#F8FAFC] hover:bg-[#EDF4F7] active:scale-95 text-[#0F172A] font-bold text-lg flex items-center justify-center transition cursor-pointer disabled:opacity-50 shrink-0 select-none border border-[#E2EEF2]"
              aria-label={`Increase ${label}`}
            >
              +
            </button>
          )}
        </div>
      )}
    </div>
  );
};

interface SimpleCardToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description: string;
  accentColor?: AccentColor;
  className?: string;
  id?: string;
}

export const SimpleCardToggle: React.FC<SimpleCardToggleProps> = ({
  checked,
  onChange,
  label,
  description,
  className = '',
  id = 'simple-card-toggle',
}) => {
  return (
    <label
      htmlFor={id}
      className={`block p-4 sm:p-5 rounded-2xl border transition cursor-pointer ${
        checked
          ? 'bg-[#EBF5F8]/40 border-[#0284C7]'
          : 'bg-[#FFFFFF] border-[#E2EEF2] hover:border-[#CBD5E1]'
      } ${className}`}
    >
      <div className="flex items-start gap-3">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="w-5 h-5 mt-0.5 rounded-md cursor-pointer accent-[#2563EB]"
        />
        <div className="space-y-0.5 flex-1">
          <span className="block text-sm sm:text-base font-bold text-[#0F172A]">
            {label}
          </span>
          <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </label>
  );
};

interface SimpleCardButtonProps {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  accentColor?: AccentColor;
  type?: 'button' | 'submit' | 'reset';
  icon?: React.ReactNode;
  variant?: 'primary' | 'accent' | 'secondary';
  className?: string;
}

export const SimpleCardButton: React.FC<SimpleCardButtonProps> = ({
  label,
  onClick,
  disabled = false,
  type = 'button',
  icon,
  variant = 'primary',
  className = '',
}) => {
  const variantClass = {
    primary: 'bg-[#0F172A] hover:bg-[#1E293B] text-[#FFFFFF] shadow-sm',
    accent: 'bg-gradient-to-r from-[#2563EB] to-[#10B981] hover:from-[#1D4ED8] hover:to-[#059669] text-[#FFFFFF] shadow-md shadow-blue-500/15',
    secondary: 'bg-[#FFFFFF] hover:bg-[#F8FAFC] text-[#0F172A] border border-[#E2EEF2]',
  }[variant];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-3.5 sm:py-4 px-6 rounded-full font-bold text-sm sm:text-base tracking-normal transition-all flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none ${variantClass} ${className}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

interface SimpleCardFormulaPanelProps {
  title?: string;
  formulaText: string;
  resultLabel?: string;
  resultValue?: string | React.ReactNode;
  resultNote?: string;
  breakdown?: Array<{
    label: string;
    value: string;
    highlight?: boolean;
    negative?: boolean;
  }>;
  accentColor?: AccentColor;
  className?: string;
}

export const SimpleCardFormulaPanel: React.FC<SimpleCardFormulaPanelProps> = ({
  title = 'Financial Calculation Breakdown',
  formulaText,
  resultLabel,
  resultValue,
  resultNote,
  breakdown,
  className = '',
}) => {
  return (
    <div
      className={`rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-[#E2EEF2] bg-[#F8FAFC] space-y-3.5 text-xs sm:text-sm text-[#0F172A] ${className}`}
    >
      {/* Title */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#2563EB]">
          {title}
        </span>
        <span className="text-[10px] sm:text-[11px] font-medium text-[#64748B]">
          Verified Formulas
        </span>
      </div>

      {/* Main Formula Representation */}
      <div className="p-3.5 bg-[#FFFFFF] rounded-2xl border border-[#E2EEF2] font-mono text-xs sm:text-sm font-bold text-[#0F172A] leading-relaxed overflow-x-auto shadow-2xs">
        <code>{formulaText}</code>
      </div>

      {/* Result Display if provided */}
      {(resultLabel || resultValue) && (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E2EEF2]">
          <div>
            <span className="text-xs sm:text-sm font-bold text-[#64748B] block">
              {resultLabel}
            </span>
            {resultNote && (
              <span className="text-[11px] text-[#64748B] block">{resultNote}</span>
            )}
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-[#0F172A] tabular-nums">
            {resultValue}
          </div>
        </div>
      )}

      {/* Itemized Step Breakdown */}
      {breakdown && breakdown.length > 0 && (
        <div className="space-y-1.5 pt-2 border-t border-[#E2EEF2] text-xs">
          {breakdown.map((item, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-between py-1.5 px-2.5 rounded-xl ${
                item.highlight ? 'bg-[#FFFFFF] font-bold shadow-2xs border border-[#E2EEF2]' : ''
              }`}
            >
              <span className={item.negative ? 'text-[#EF4444]' : 'text-[#64748B]'}>
                {item.label}
              </span>
              <span
                className={`font-mono font-bold ${
                  item.negative
                    ? 'text-[#EF4444]'
                    : item.highlight
                    ? 'text-[#10B981]'
                    : 'text-[#0F172A]'
                }`}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

