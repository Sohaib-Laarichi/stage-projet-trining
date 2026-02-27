
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('Vitest setup', () => {
    it('runs a basic arithmetic test', () => {
        expect(1 + 1).toBe(2);
    });

    it('renders a React element and finds it in the DOM', () => {
        render(<p>Hello Vitest</p>);
        expect(screen.getByText('Hello Vitest')).toBeInTheDocument();
    });
});
