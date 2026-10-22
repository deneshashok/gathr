import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
const variants=cva('button',{variants:{variant:{default:'primary',outline:'outline',ghost:'ghost'}},defaultVariants:{variant:'default'}});
export function Button({className,variant,asChild=false,...props}) {const Comp=asChild?Slot:'button';return <Comp className={cn(variants({variant}),className)} {...props}/>;}
