import { db } from '../../database'

export async function getTodos() {
    return await db.selectFrom('todo').selectAll().orderBy('created_at').execute()
}

export async function createTodo(todo: { task: string }) {
    const { id } = await db
        .insertInto('todo')
        .values({ task: todo.task, completed: false })
        .returning('id')
        .executeTakeFirstOrThrow()

    return id
}

export async function updateTodo(todo: { id: string; task?: string; completed?: boolean }) {
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

export async function deleteTodo(id: string) {
    const todo = await db
        .deleteFrom('todo')
        .where('id', '=', id)
        .returning('id')
        .executeTakeFirstOrThrow()

    return todo.id
}
