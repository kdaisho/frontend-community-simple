import { superValidate } from 'sveltekit-superforms/server'
import { schema } from './validators'

export const load = async () => {
    const form = await superValidate(schema)

    return { form }
}

export const actions = {
    save: async ({ request }: { request: any }) => {
        const fullSubmit = request.headers.get('full-submit') !== 'false'

        let form: any

        if (fullSubmit) {
            form = await superValidate(request, schema)
        } else {
            const formData = await request.json()
            form = await superValidate(formData, schema)
        }

        if (!form.valid && !fullSubmit) {
            console.log('==>', 'we allow this to happen')
        } else if (!form.valid && fullSubmit) {
            console.log('==>', 'we cannot allow this to happen')
            throw new Error('Form is not valid')
        }

        return { form }
    },
}
