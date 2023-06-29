import { db } from '../database'

export async function getTodos() {
    return await db.selectFrom('todo').selectAll().orderBy('id').execute()
}

export async function createTodo(todo: { task: string }) {
    const { id } = await db
        .insertInto('todo')
        .values({ task: todo.task, completed: false })
        .returning('id')
        .executeTakeFirstOrThrow()

    return id
}

export async function updateTodo(todo: { id: number; task?: string; completed?: boolean }) {
    const { id } = await db
        .updateTable('todo')
        .set({
            task: todo.task ?? undefined,
            completed: todo.completed ?? undefined,
        })
        .where('id', '=', todo.id)
        .returning('id')
        .executeTakeFirstOrThrow()

    return id
}

export async function deleteTodo(_id: number) {
    const { id } = await db
        .deleteFrom('todo')
        .where('id', '=', _id)
        .returning('id')
        .executeTakeFirstOrThrow()

    return id
}
