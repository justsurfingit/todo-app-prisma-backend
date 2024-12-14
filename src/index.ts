import { Prisma, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function queryAll() {
  const data = await prisma.neoUser.findMany({});
  console.log(data);
}

async function createUser(user: string, email: string) {
  const res = await prisma.neoUser.create({
    data: {
      username: user,
      email: email,
      incompleteTodos: 0,
    },
  });
}

async function createTodo(userId: number, title: string, description: string) {
  const [todo] = await prisma.$transaction([
    prisma.todo.create({
      data: {
        userId,
        title,
        description,
      },
    }),
    prisma.neoUser.update({
      where: { id: userId },
      data: {
        incompleteTodos: { increment: 1 },
      },
    }),
  ]);
  console.log(todo);
}

async function ToggleTodo(todoId: number) {
  const [todo] = await prisma.$transaction([
    prisma.todo.findFirst({
      where: { todoid: todoId },
      include: {
        user: true,
      },
    }),
  ]);

  if (!todo) {
    throw new Error(`Todo with ID ${todoId} not found.`);
  }

  const updatedTodo = await prisma.todo.update({
    where: { todoid: todoId },
    data: {
      isCompleted: !todo.isCompleted,
    },
  });

  await prisma.neoUser.update({
    where: { id: updatedTodo.userId },
    data: {
      incompleteTodos: {
        increment: todo.isCompleted ? -1 : 1, // Corrected here
      },
    },
  });

  return updatedTodo;
}

async function todoQueryUser(id: number) {
  const li = await prisma.todo.findMany({
    where: {
      userId: id,
    },
    include: {
      user: false,
    },
  });
}

async function UserDetail(userId: number) {
  const user = await prisma.neoUser.findFirst({
    where: {
      id: userId,
    },
    include: {
      todos: true,
    },
  });
  console.log(user);
}

async function deleteUser(userId: number) {
  console.log("here");
  try {
    const u = await prisma.neoUser.delete({
      where: {
        id: userId,
      },
    });
  } catch (e) {
    console.log("something went wrong");
  }
}
