import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-zinc-100 text-zinc-900 shadow hover:bg-zinc-200',
        secondary:
          'border-transparent bg-zinc-800 text-zinc-200 hover:bg-zinc-700',
        destructive:
          'border-rose-500/30 bg-rose-950/20 text-rose-400 hover:bg-rose-900/30',
        outline: 'border-zinc-800 text-zinc-300',
        success:
          'border-emerald-500/30 bg-emerald-950/20 text-emerald-400 hover:bg-emerald-900/30',
        warning:
          'border-amber-500/30 bg-amber-950/20 text-amber-400 hover:bg-amber-900/30',
        info:
          'border-cyan-500/30 bg-cyan-950/20 text-cyan-400 hover:bg-cyan-900/30',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
