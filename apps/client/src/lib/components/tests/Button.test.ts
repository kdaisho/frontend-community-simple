import Button from '$lib/components/Button.svelte';
import { render, screen, within } from '@testing-library/svelte';
import type { SvelteComponent } from 'svelte';
import ButtonTest from './Button.test.svelte';

it('should render Button without slot', () => {
    render(Button as unknown as typeof SvelteComponent)

    expect(screen.getByText('slot is required')).toBeInTheDocument()
})

it('should render Button with slot', () => {
    render(ButtonTest)

    const button = screen.getByRole('button')
    const slot = within(button).getByTestId('child')

    expect(slot).toHaveTextContent('Hello')
})
