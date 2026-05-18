type BadgeTone = 'green' | 'red' | 'amber' | 'gray' | 'navy' | 'blue' | 'teal';

type BadgeProps = {
  text: string;
  tone: BadgeTone;
};

const toneClasses: Record<BadgeTone, string> = {
  green: 'bg-green-100 text-green-800',
  red: 'bg-red-100 text-red-800',
  amber: 'bg-amber-100 text-amber-800',
  gray: 'bg-gray-100 text-gray-700',
  navy: 'bg-navy/10 text-navy',
  blue: 'bg-blue-100 text-blue-800',
  teal: 'bg-teal-100 text-teal-800',
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
