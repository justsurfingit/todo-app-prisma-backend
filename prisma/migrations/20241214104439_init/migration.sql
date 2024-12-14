-- CreateTable
CREATE TABLE "NeoUser" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "incompleteTodos" INTEGER NOT NULL,

    CONSTRAINT "NeoUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Todo" (
    "todoid" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Todo_pkey" PRIMARY KEY ("todoid")
);

-- CreateIndex
CREATE UNIQUE INDEX "NeoUser_email_key" ON "NeoUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Todo_userId_key" ON "Todo"("userId");

-- AddForeignKey
ALTER TABLE "Todo" ADD CONSTRAINT "Todo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "NeoUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
