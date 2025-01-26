// /src/utils/validators.ts
// Common validation utility functions

import { ValidationFieldType } from '@/types/validation/ValidationTypes';

export const validators = {
    text: (value: string, options: { minLength?: number; maxLength?: number; pattern?: RegExp } = {}) => {
        const { minLength = 0, maxLength = Infinity, pattern } = options;

        if (value.length < minLength) {
            return `Must be at least ${minLength} characters`;
        }

        if (value.length > maxLength) {
            return `Must be no more than ${maxLength} characters`;
        }

        if (pattern && !pattern.test(value)) {
            return 'Invalid format';
        }

        return null;
    },

    email: (value: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            return 'Invalid email address';
        }
        return null;
    },

    phone: (value: string) => {
        const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
        if (!phoneRegex.test(value)) {
            return 'Phone must be in (XXX) XXX-XXXX format';
        }
        return null;
    },

    date: (value: string) => {
        const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/;
        if (!dateRegex.test(value)) {
            return 'Date must be in MM/DD/YYYY format';
        }

        const date = new Date(value);
        if (isNaN(date.getTime())) {
            return 'Invalid date';
        }

        return null;
    },

    number: (value: number, options: { min?: number; max?: number } = {}) => {
        const { min = -Infinity, max = Infinity } = options;

        if (isNaN(value)) {
            return 'Must be a number';
        }

        if (value < min) {
            return `Must be at least ${min}`;
        }

        if (value > max) {
            return `Must be no more than ${max}`;
        }

        return null;
    },

    currency: (value: number) => {
        if (isNaN(value) || value < 0) {
            return 'Must be a positive number';
        }

        if (value > 1000000) {
            return 'Value exceeds maximum allowed';
        }

        return null;
    },

    zipCode: (value: string) => {
        const zipRegex = /^\d{5}(-\d{4})?$/;
        if (!zipRegex.test(value)) {
            return 'ZIP code must be 5 digits or ZIP+4 format';
        }
        return null;
    },
};

export function getFieldValidator(type: ValidationFieldType) {
    switch (type) {
        case 'text':
            return validators.text;
        case 'email':
            return validators.email;
        case 'phone':
            return validators.phone;
        case 'date':
            return validators.date;
        case 'number':
            return validators.number;
        case 'currency':
            return validators.currency;
        default:
            return () => null;
    }
}
