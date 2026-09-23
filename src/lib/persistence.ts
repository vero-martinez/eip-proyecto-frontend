// src/lib/persistence.ts

const PREFIX = 'eip:mock:v1:';

export interface LocalStore<T> {
    get: () => T;
    set: (val: T) => void;
    reset: () => void;
}

/**
 * Crea un store en localStorage con hidratación lazy y datos iniciales (seed).
 * Ningún otro archivo del proyecto debe llamar directamente a localStorage.
 */
export function createLocalStore<T>(key: string, seed: () => T): LocalStore<T> {
    const fullKey = `${PREFIX}${key}`;

    const get = (): T => {
        if (typeof window === 'undefined') return seed();
        try {
            const item = localStorage.getItem(fullKey);
            if (item === null) {
                const initialData = seed();
                localStorage.setItem(fullKey, JSON.stringify(initialData));
                return initialData;
            }
            return JSON.parse(item) as T;
        } catch (error) {
            console.error(`Error leyendo de localStorage [${fullKey}]:`, error);
            return seed();
        }
    };

    const set = (val: T): void => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.setItem(fullKey, JSON.stringify(val));
        } catch (error) {
            console.error(`Error guardando en localStorage [${fullKey}]:`, error);
        }
    };

    const reset = (): void => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.removeItem(fullKey);
        } catch (error) {
            console.error(`Error reseteando localStorage [${fullKey}]:`, error);
        }
    };

    return { get, set, reset };
}