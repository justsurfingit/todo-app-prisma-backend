"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
function queryAll() {
    return __awaiter(this, void 0, void 0, function () {
        var data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prisma.neoUser.findMany({})];
                case 1:
                    data = _a.sent();
                    console.log(data);
                    return [2 /*return*/];
            }
        });
    });
}
queryAll();
function createUser(user, email) {
    return __awaiter(this, void 0, void 0, function () {
        var res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prisma.neoUser.create({
                        data: {
                            username: user,
                            email: email,
                            incompleteTodos: 0,
                        },
                    })];
                case 1:
                    res = _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function createTodo(userId, title, description) {
    return __awaiter(this, void 0, void 0, function () {
        var todo;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prisma.$transaction([
                        prisma.todo.create({
                            data: {
                                userId: userId,
                                title: title,
                                description: description,
                            },
                        }),
                        prisma.neoUser.update({
                            where: { id: userId },
                            data: {
                                incompleteTodos: { increment: 1 },
                            },
                        }),
                    ])];
                case 1:
                    todo = (_a.sent())[0];
                    console.log(todo);
                    return [2 /*return*/];
            }
        });
    });
}
function ToggleTodo(todoId) {
    return __awaiter(this, void 0, void 0, function () {
        var todo, updatedTodo;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prisma.$transaction([
                        prisma.todo.findFirst({
                            where: { todoid: todoId },
                            include: {
                                user: true,
                            },
                        }),
                    ])];
                case 1:
                    todo = (_a.sent())[0];
                    if (!todo) {
                        throw new Error("Todo with ID ".concat(todoId, " not found."));
                    }
                    return [4 /*yield*/, prisma.todo.update({
                            where: { todoid: todoId },
                            data: {
                                isCompleted: !todo.isCompleted,
                            },
                        })];
                case 2:
                    updatedTodo = _a.sent();
                    return [4 /*yield*/, prisma.neoUser.update({
                            where: { id: updatedTodo.userId },
                            data: {
                                incompleteTodos: {
                                    increment: todo.isCompleted ? -1 : 1, // Corrected here
                                },
                            },
                        })];
                case 3:
                    _a.sent();
                    return [2 /*return*/, updatedTodo];
            }
        });
    });
}
function todoQueryUser(id) {
    return __awaiter(this, void 0, void 0, function () {
        var li;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prisma.todo.findMany({
                        where: {
                            userId: id,
                        },
                        include: {
                            user: false,
                        },
                    })];
                case 1:
                    li = _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function UserDetail(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var user;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prisma.neoUser.findFirst({
                        where: {
                            id: userId,
                        },
                        include: {
                            todos: true,
                        },
                    })];
                case 1:
                    user = _a.sent();
                    console.log(user);
                    return [2 /*return*/];
            }
        });
    });
}
function deleteUser(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var u, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("here");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, prisma.neoUser.delete({
                            where: {
                                id: userId,
                            },
                        })];
                case 2:
                    u = _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _a.sent();
                    console.log("something went wrong");
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
