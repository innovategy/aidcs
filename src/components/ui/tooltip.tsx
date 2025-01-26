// src/components/ui/tooltip.tsx
'use client';

import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

// Type definitions
type TooltipProviderProps = React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Provider>;
type TooltipProps = React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Root>;
type TooltipTriggerProps = React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger>;

interface TooltipContentProps
    extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> {
    className?: string;
    sideOffset?: number;
}

// Provider Component
const TooltipProvider: React.FC<TooltipProviderProps> = ({
                                                             children,
                                                             ...props
                                                         }) => {
    return <TooltipPrimitive.Provider {...props}>{children}</TooltipPrimitive.Provider>;
};
TooltipProvider.displayName = TooltipPrimitive.Provider.displayName;

// Root Component
const Tooltip: React.FC<TooltipProps> = ({
                                             children,
                                             ...props
                                         }) => {
    return <TooltipPrimitive.Root {...props}>{children}</TooltipPrimitive.Root>;
};
Tooltip.displayName = TooltipPrimitive.Root.displayName;

// Trigger Component
const TooltipTrigger: React.FC<TooltipTriggerProps> = React.forwardRef<
    React.ElementRef<typeof TooltipPrimitive.Trigger>,
    TooltipTriggerProps
>(({ children, ...props }, ref) => {
    return (
        <TooltipPrimitive.Trigger ref={ref} {...props}>
            {children}
        </TooltipPrimitive.Trigger>
    );
});
TooltipTrigger.displayName = TooltipPrimitive.Trigger.displayName;

// Content Component
const TooltipContent = React.forwardRef<
    React.ElementRef<typeof TooltipPrimitive.Content>,
    TooltipContentProps
>(({ className = '', sideOffset = 4, children, ...props }, ref) => {
    return (
        <TooltipPrimitive.Content
            ref={ref}
            sideOffset={sideOffset}
            className={`
        z-50 
        overflow-hidden 
        rounded-md 
        border 
        bg-white 
        px-3 
        py-1.5 
        text-sm 
        text-popover-foreground 
        shadow-md 
        animate-in 
        fade-in-0 
        zoom-in-95 
        data-[state=closed]:animate-out 
        data-[state=closed]:fade-out-0 
        data-[state=closed]:zoom-out-95 
        data-[side=bottom]:slide-in-from-top-2 
        data-[side=left]:slide-in-from-right-2 
        data-[side=right]:slide-in-from-left-2 
        data-[side=top]:slide-in-from-bottom-2 
        ${className}
      `}
            {...props}
        >
            {children}
        </TooltipPrimitive.Content>
    );
});
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

// Export all components
export {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
    TooltipProvider,
    // Export types for consumers
    type TooltipProps,
    type TooltipTriggerProps,
    type TooltipContentProps,
    type TooltipProviderProps,
};
