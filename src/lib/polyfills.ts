import { camelCase as lodashCamelCase, snakeCase as lodashSnakeCase } from 'lodash';

// camelcase polyfill
export const camelCase = (input: string | string[], options?: any) => {
    if (Array.isArray(input)) {
        return input.map(x => lodashCamelCase(x));
    }
    return lodashCamelCase(input);
};

// decamelize polyfill
export default function decamelize(text: string, separator: string = '_'): string {
    if (separator === '_') {
        return lodashSnakeCase(text);
    }
    // If custom separator, use snakeCase then replace underscores
    return lodashSnakeCase(text).replace(/_/g, separator);
}
