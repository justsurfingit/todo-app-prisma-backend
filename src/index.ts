import { Prisma, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import express from "express";
const app = express();
import { z } from "zod";
const secret = process.env.JWT_SECRET_KEY || "somebadsecret";
import jwt from "jsonwebtoken";
import { takeCoverage } from "v8";
import { setEngine } from "crypto";
import { resolveSoa } from "dns";

async function queryAll() {
  const data = await prisma.neoUser.findMany({});
  return data;
}
// queryAll();
async function createUser(user: string, email: string) {
  const res = await prisma.neoUser.create({
    data: {
      username: user,
      email: email,
      incompleteTodos: 0,
    },
  });
  return res;
}

async function createTodo(userId: number, title: string, description: string) {
  const [todo, _] = await prisma.$transaction([
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
  return todo;
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

  const [updatedTodo] = await prisma.$transaction([
    prisma.todo.update({
      where: { todoid: todoId },
      data: {
        isCompleted: !todo.isCompleted, 
      },
    }),
    prisma.neoUser.update({ 
      where: { id: todo.userId }, 
      data: {
        incompleteTodos: { 
          increment: todo.isCompleted ? 1 : -1 
        },
      },
    }),
  ]);

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
  return li;
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
  return user;
}

async function deleteUser(userId: number) {
  try {
    const u = await prisma.neoUser.delete({
      where: {
        id: userId,
      },
    });
    return u;
  } catch (e) {
    return null;
  }
}
// middleware-->
async function authenticateUser(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, secret);

    req.user = decoded; // Store user information in req.user
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
}
// express logic keeping everything on the same file to keep things simple we should otherwise seperate them out
app.listen(3000, () => {
  console.log("Sever listening on port 3000\n");
});
// we can also use zod schema
const userSchema = z.object({
  username: z.string(),
  email: z.string().email(),
});
app.use(express.json());
// Create User API
app.post("/api/v1/create", async (req, res) => {
  const u = req.body;
  const re = userSchema.safeParse(u);
  if (re.success == true) {
    try {
      const neouser = await createUser(u.username, u.email);

      res.status(200).json({
        success: true,
        data: neouser,
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err,
      });
    }
  } else
    res.status(400).json({
      success: false,
      message: re.error,
    });
});
app.get("/api/v1/all", async (req, res) => {
  const alldata = await queryAll();
  // return alldata;
  res.status(200).json({
    success: true,
    data: alldata,
  });
});
// sigin command has to be made
app.post("/api/v1/enter", async (req, res) => {
  const u = req.body;

  const parse = userSchema.safeParse(u);
  if (parse.success == true) {
    // find the user with username
    try {
      const user = await prisma.neoUser.findFirst({
        where: {
          email: u.email,
        },
      });
      if (user?.username == u.username) {
        // okay user is legit
        // provide it the token
        const userToken = jwt.sign({ user: user }, secret, {
          expiresIn: "1 days",
        });
        const decodedToken = jwt.verify(userToken, secret);
        //so it's simple and easy data,secret key and expiration time
        res.status(200).send({
          success: true,
          data: {
            user: user,
            token: userToken,
          },
        });
      }
    } catch (e) {
      res.status(404).send({
        success: false,
        message: "Authetication error please try again",
      });
    }
  } else {
    res.status(420).json({
      success: false,
      message: "Invalid Credential provided. Please try again. ",
    });
  }
});
// now let's build fetch Todo

app.get("/api/v1/todos", authenticateUser, async (req, res) => {
  //okay now authRouter middle ware applied
  try {
    // means if control has reach here means everything is fine
    const userInfo = req?.user?.user;
    if (!userInfo) {
      res.status(400).json({
        success: false,
        message: "Validation failed!",
      });
    }
    const uid = parseInt(userInfo.id);

    const fetchTodoList = await todoQueryUser(uid);
    res.status(200).json({
      success: true,
      data: fetchTodoList,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err,
    });
  }
});
app.post("/api/v1/addTodo", authenticateUser, async (req, res) => {
  // perfect
  // todo info should be stored in req.body
  const todoInfo = req.body;
  const userInfo = req.user?.user;
  if (todoInfo.title == null || todoInfo.description == null) {
    res.status(404).json({
      success: false,
      message: "All required fields are not provided",
    });
  }
  try {
    const uid = parseInt(userInfo.id);
    const createdTodo = await createTodo(
      uid,
      todoInfo.title,
      todoInfo.description
    );
    res.status(200).json({
      success: true,
      data: createdTodo,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      messsage: "Database Error",
    });
  }
});
// toogle todo
app.post("/api/v1/toggleTodo", authenticateUser, async (req, res) => {
  const userInfo = req.user?.user;
  const todoId = parseInt(req.body.todoId);
  try {
    const toogle = await ToggleTodo(todoId);
    res.status(200).json({
      success: "true",
      data: toogle,
    });
  } catch (err) {
    res.status(500).json({
      success: "false",
      message: "Something went wrong",
    });
  }
});

app.get("/api/v1/userInfo", authenticateUser, async(req, res) => {
  const data=req.user?.user?.id;
  if(!data)
  {
    res.status(404).json({
      success:false,
      message:"BAD REQUEST, try again later",
    })
  }
try{
  const userDetail=await UserDetail(data);
   res.status(200).json({
      success:true,
      message:userDetail,
    })
}
catch (err) {
    res.status(500).json({
      success: "false",
      message: "Something went wrong",
    });
});
