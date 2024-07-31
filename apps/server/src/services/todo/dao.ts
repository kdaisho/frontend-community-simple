import { db } from '../../../database'

export async function getTodos(userUuid: string) {
    return await db
        .selectFrom('todo')
        .select(['uuid', 'task', 'is_completed as isCompleted'])
        .where('user_uuid', '=', userUuid)
        .orderBy('created_at')
        .execute()
}

export async function createTodo(todo: { userUuid: string; task: string }) {
    const { uuid } = await db
        .insertInto('todo')
        .values({ task: todo.task, user_uuid: todo.userUuid, is_completed: false })
        .returning('uuid')
        .executeTakeFirstOrThrow()

    return uuid
}

export async function updateTodo(todo: { id: string; task?: string; completed?: boolean }) {
    const { uuid } = await db
        .updateTable('todo')
        .set({
            task: todo.task ?? undefined,
            is_completed: todo.completed ?? undefined,
        })
        .where('uuid', '=', todo.id)
        .returning('uuid')
        .executeTakeFirstOrThrow()

    return uuid
}

export async function deleteTodo(id: string) {
    const { uuid } = await db
        .deleteFrom('todo')
        .where('uuid', '=', id)
        .returning('uuid')
        .executeTakeFirstOrThrow()

    return uuid
}
