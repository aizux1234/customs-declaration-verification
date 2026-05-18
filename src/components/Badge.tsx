type BadgeTone = 'green' | 'red' | 'amber' | 'gray' | 'navy' | 'blue' | 'teal';

type BadgeProps = {
  text: string;
  tone: BadgeTone;
};

const toneClasses: Record<BadgeTone, string> = {
  green: 'bg-success-soft text-success-text',
  red: 'bg-danger-soft text-danger-text',
  amber: 'bg-warning-soft text-warning-text',
  gray: 'bg-navy-100 text-navy-500',
  navy: 'bg-navy-100 text-navy-700',
  blue: 'bg-info-soft text-info-text',
  teal: 'bg-teal/10 text-teal',
};

export function Badge({ text, tone }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${toneClasses[tone]}`}
    >
      {text}
    </span>
  );
}
