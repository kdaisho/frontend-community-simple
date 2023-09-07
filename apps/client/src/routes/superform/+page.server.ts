import { superValidate } from 'sveltekit-superforms/server'
import { schema } from './validators'

export const load = async () => {
    const form = await superValidate(schema)

    return { form }
}

export const actions = {
    save: async ({ request }: { request: any }) => {
        const fullSubmit = request.headers.get('full-submit') !== 'false'

        console.log('==> fullSubmit?', fullSubmit)

        let form: any

        if (fullSubmit) {
            form = await superValidate(request, schema, { errors: true })
        } else {
            const formData = await request.json()
            form = await superValidate(formData, schema, { errors: false })
        }

        console.log('POST', form)

        if (!form.valid && !fullSubmit) {
            console.log('==>', 'we allow this to happen')
        } else if (!form.valid && fullSubmit) {
            console.log('==>', 'we cannot allow this to happen')
        }

        return { form }
    },
}
