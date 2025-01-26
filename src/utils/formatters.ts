// /src/utils/formatters.ts
// Utility functions for data formatting

export const formatters = {
    phone: (value: string): string => {
        const digits = value.replace(/\D/g, '');
        if (digits.length === 10) {
            return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
        }
        return value;
    },

    date: (value: string): string => {
        try {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
                return date.toLocaleDateString('en-US', {
                    month: '2-digit',
                    day: '2-digit',
                    year: 'numeric',
                });
            }
        } catch (e) {
            // Fall back to original value if parsing fails
        }
        return value;
    },

    currency: (value: number): string => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    },

    number: (value: number): string => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(value);
    },

    name: (value: string): string => {
        return value
            .trim()
            .replace(/\s+/g, ' ')
            .replace(/[^a-zA-Z\s'-]/g, '')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    },

    zipCode: (value: string): string => {
        const digits = value.replace(/\D/g, '');
        if (digits.length === 9) {
            return `${digits.slice(0, 5)}-${digits.slice(5)}`;
        }
        return digits.slice(0, 5);
    },

    email: (value: string): string => {
        return value.trim().toLowerCase();
    },
};
