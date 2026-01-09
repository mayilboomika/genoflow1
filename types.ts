export enum Gender {
    Male = 'male',
    Female = 'female',
    Unknown = 'unknown',
}

export enum Status {
    Unaffected = 'unaffected',
    Affected = 'affected',
    Carrier = 'carrier',
    Unknown = 'unknown',
}

export enum InheritanceMode {
    AR = 'AR', // Autosomal Recessive
    AD = 'AD', // Autosomal Dominant
    XL = 'XL', // X-Linked
    YL = 'YL', // Y-Linked
}

export interface Individual {
    id: string;
    name: string;
    // FIX: Use the Gender enum directly. The union with string literals is redundant.
    gender: Gender;
    // FIX: Use the Status enum directly. The union with string literals is redundant and was causing type errors.
    status: Status;
    isDeceased: boolean;
    isProband: boolean;
    x: number;
    y: number;
    parents: string[]; // Array of parent IDs
    partners: string[]; // Array of partner IDs
}

export interface ValidationIssue {
    id: string; // The ID of the individual with the issue
    type: 'error' | 'warning';
    message: string;
}
