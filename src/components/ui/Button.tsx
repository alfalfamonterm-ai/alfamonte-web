import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'outline' | 'ghost';
    fullWidth?: boolean;
}

export function Button({
    children,
    variant = 'primary',
    fullWidth = false,
    className = '',
    ...props
}: ButtonProps) {
    const baseStyles = "inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-[#2D4A3E] text-white hover:bg-[#3E6052] hover:shadow-lg hover:-translate-y-0.5",
        outline: "border-2 border-[#2D4A3E] text-[#2D4A3E] hover:bg-[#2D4A3E] hover:text-white",
        ghost: "text-[#2D4A3E] hover:bg-[#2D4A3E]/10"
    };

    const width = fullWidth ? "w-full" : "";

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${width} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
