import { render, screen } from '@testing-library/svelte'
import Button from '$lib/components/Button.svelte'
import _WithSlot from '$lib/components/tests/_WithSlot.svelte'

it('should render Button without slot', () => {
    render(Button)

    expect(screen.getByText('slot is required')).toBeInTheDocument()
})

it('should render Button with slot', () => {
    render(_WithSlot, {
        props: {
            component: Button,
            slot: 'Send',
        },
    })

    expect(screen.getByText('Send')).toBeInTheDocument()
})
