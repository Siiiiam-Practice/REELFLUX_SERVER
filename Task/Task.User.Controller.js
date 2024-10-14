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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetIncompleteTasks = exports.GetIncompleteTasksa = exports.ClaimTaskRewards = void 0;
const http_status_codes_1 = require("http-status-codes");
const FormetResponseSend_1 = __importDefault(require("../util/FormetResponseSend"));
const FormetResponseErrorSend_1 = __importDefault(require("../util/FormetResponseErrorSend"));
const Task_model_1 = require("./Task.model");
const mongoose_1 = __importDefault(require("mongoose"));
const User_model_1 = __importDefault(require("../User/User.model"));
const Point_model_1 = __importDefault(require("../Point/Point.model"));
const Task_Complete_Model_1 = require("../Task_Complete/Task_Complete.Model");
const axios_1 = __importDefault(require("axios"));
const ClaimTaskRewards = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const session = yield mongoose_1.default.startSession();
    try {
        session.startTransaction();
        const { taskId, answer } = req === null || req === void 0 ? void 0 : req.body;
        const authUser = (_a = req.user) === null || _a === void 0 ? void 0 : _a.user;
        const isComplete = yield Task_Complete_Model_1.Task_Complete_Model.findOne({ userId: authUser === null || authUser === void 0 ? void 0 : authUser._id, taskId });
        if (!(isComplete === null || isComplete === void 0 ? void 0 : isComplete._id)) {
            if (taskId) {
                const task = yield Task_model_1.TaskModel.findById(taskId).session(session);
                const user = yield User_model_1.default.findById(authUser === null || authUser === void 0 ? void 0 : authUser._id).session(session);
                if (user === null || user === void 0 ? void 0 : user._id) {
                    const point = yield Point_model_1.default.findOne({ userId: user === null || user === void 0 ? void 0 : user._id }).session(session);
                    if ((task === null || task === void 0 ? void 0 : task.status) == "publish") {
                        if ((task === null || task === void 0 ? void 0 : task.category) === "read") {
                            if ((task === null || task === void 0 ? void 0 : task.answer) === answer) {
                                if (point) {
                                    point.point = Number(point === null || point === void 0 ? void 0 : point.point) + Number(task.point);
                                    yield point.save();
                                    yield Task_Complete_Model_1.Task_Complete_Model.create([{ taskId: taskId, userId: authUser === null || authUser === void 0 ? void 0 : authUser._id }], { session });
                                    yield session.commitTransaction();
                                    yield session.endSession();
                                    return res.status(http_status_codes_1.OK).send((0, FormetResponseSend_1.default)(http_status_codes_1.OK, "Reading is Completed!", []));
                                }
                                else {
                                    throw new Error("Point Table is missing!");
                                }
                            }
                            else {
                                throw new Error("Answer is invaild!");
                            }
                        }
                        else if ((task === null || task === void 0 ? void 0 : task.category) === "boost") {
                            if (point) {
                                if (task) {
                                    const fetch = yield axios_1.default.get(`https://api.telegram.org/botTOKEN/getChatMember?chat_id=-1001632871243&user_id=${user === null || user === void 0 ? void 0 : user.TgId}`);
                                    if (((_c = (_b = fetch === null || fetch === void 0 ? void 0 : fetch.data) === null || _b === void 0 ? void 0 : _b.result) === null || _c === void 0 ? void 0 : _c.status) === "member") {
                                        point.point = Number(point === null || point === void 0 ? void 0 : point.point) + Number(task.point);
                                        yield point.save();
                                        yield Task_Complete_Model_1.Task_Complete_Model.create([{ taskId: taskId, userId: authUser === null || authUser === void 0 ? void 0 : authUser._id }], { session });
                                        yield session.commitTransaction();
                                        yield session.endSession();
                                        return res.status(http_status_codes_1.OK).send((0, FormetResponseSend_1.default)(http_status_codes_1.OK, "Boost is Completed!", []));
                                    }
                                    else {
                                        throw new Error("Boost is not complete!");
                                    }
                                }
                                else {
                                    throw new Error("Task is missing!");
                                }
                            }
                            else {
                                throw new Error("Point Table is missing!");
                            }
                        }
                        else if ((task === null || task === void 0 ? void 0 : task.category) === "invite") {
                            if (point) {
                                if (task) {
                                    const findRefer = yield User_model_1.default.find({ referBy: user === null || user === void 0 ? void 0 : user.ReferCode }).session(session);
                                    if ((findRefer === null || findRefer === void 0 ? void 0 : findRefer.length) >= Number(task === null || task === void 0 ? void 0 : task.invite)) {
                                        point.point = Number(point === null || point === void 0 ? void 0 : point.point) + Number(task.point);
                                        yield point.save();
                                        yield Task_Complete_Model_1.Task_Complete_Model.create([{ taskId: taskId, userId: authUser === null || authUser === void 0 ? void 0 : authUser._id }], { session });
                                        yield session.commitTransaction();
                                        yield session.endSession();
                                        return res.status(http_status_codes_1.OK).send((0, FormetResponseSend_1.default)(http_status_codes_1.OK, "Refer Mission is Completed!", []));
                                    }
                                    else {
                                        throw new Error("Refer is less than mission!");
                                    }
                                }
                                else {
                                    throw new Error("Task is missing!");
                                }
                            }
                            else {
                                throw new Error("Point Table is missing!");
                            }
                        }
                        else if ((task === null || task === void 0 ? void 0 : task.category) === "earn") {
                            if (point) {
                                if (task) {
                                    // const findRefer = await UserModel.find({ referBy: user?.ReferCode }).session(session);
                                    if ((point === null || point === void 0 ? void 0 : point.point) >= Number(task === null || task === void 0 ? void 0 : task.earn)) {
                                        point.point = Number(point === null || point === void 0 ? void 0 : point.point) + Number(task.point);
                                        yield point.save();
                                        yield Task_Complete_Model_1.Task_Complete_Model.create([{ taskId: taskId, userId: authUser === null || authUser === void 0 ? void 0 : authUser._id }], { session });
                                        yield session.commitTransaction();
                                        yield session.endSession();
                                        return res.status(http_status_codes_1.OK).send((0, FormetResponseSend_1.default)(http_status_codes_1.OK, "Point Mission is Completed!", []));
                                    }
                                    else {
                                        throw new Error("Point is less than target!");
                                    }
                                }
                                else {
                                    throw new Error("Task is missing!");
                                }
                            }
                            else {
                                throw new Error("Point Table is missing!");
                            }
                        }
                        else {
                            if (point) {
                                if (task) {
                                    point.point = Number(point === null || point === void 0 ? void 0 : point.point) + Number(task.point);
                                    yield point.save();
                                    yield Task_Complete_Model_1.Task_Complete_Model.create([{ taskId: taskId, userId: authUser === null || authUser === void 0 ? void 0 : authUser._id }], { session });
                                    yield session.commitTransaction();
                                    yield session.endSession();
                                    return res.status(http_status_codes_1.OK).send((0, FormetResponseSend_1.default)(http_status_codes_1.OK, "Reading is Completed!", []));
                                }
                                else {
                                    throw new Error("Task is missing!");
                                }
                            }
                            else {
                                throw new Error("Point Table is missing!");
                            }
                        }
                    }
                    else {
                        throw new Error("Task is not live!");
                    }
                }
                else {
                    throw new Error("User is not vaild");
                }
            }
            else {
                throw new Error("TaskId is required!");
            }
        }
        else {
            throw new Error("The task is already completed!");
        }
    }
    catch (error) {
        yield session.abortTransaction();
        yield session.endSession();
        if (error instanceof Error) {
            return res.status(http_status_codes_1.BAD_REQUEST).send((0, FormetResponseErrorSend_1.default)(http_status_codes_1.BAD_REQUEST, error.message, []));
        }
    }
});
exports.ClaimTaskRewards = ClaimTaskRewards;
const GetIncompleteTasksa = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    try {
        const authUser = (_d = req.user) === null || _d === void 0 ? void 0 : _d.user;
        if (!authUser) {
            return res.status(400).send({ message: 'User not found' });
        }
        const completedTasks = yield Task_Complete_Model_1.Task_Complete_Model.find({ userId: authUser._id }, 'taskId');
        const completedTaskIds = completedTasks.map(task => task.taskId);
        const incompleteTasks = yield Task_model_1.TaskModel.find({
            _id: { $nin: completedTaskIds },
            status: 'publish'
        });
        return res.status(200).send((0, FormetResponseSend_1.default)(http_status_codes_1.OK, "Incomplete Task", incompleteTasks));
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).send({ message: error.message || 'An error occurred' });
        }
    }
});
exports.GetIncompleteTasksa = GetIncompleteTasksa;
const GetIncompleteTasks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
    const session = yield mongoose_1.default.startSession();
    try {
        session.startTransaction();
        const authUser = (_e = req.user) === null || _e === void 0 ? void 0 : _e.user;
        if (!authUser) {
            return res.status(400).send({ message: 'User not found' });
        }
        // get all completed task list
        const allCompletedTasks = yield Task_Complete_Model_1.Task_Complete_Model.find({
            userId: authUser === null || authUser === void 0 ? void 0 : authUser._id
        }).session(session);
        // get only completed task _id
        const allCompletedTaskIds = yield allCompletedTasks.map((item) => item === null || item === void 0 ? void 0 : item.taskId);
        // retirve all incomplete task list
        const incompleteTasks = yield Task_model_1.TaskModel.find({
            _id: { $nin: allCompletedTaskIds },
            status: "publish"
        }).session(session);
        // filter read category task those are incomplete
        const FilterIncompleteReadTasks = incompleteTasks.map((item) => (item === null || item === void 0 ? void 0 : item.category) === "read" ? item : null);
        // get only read category incomplete task
        const IncompleteReadTasks = FilterIncompleteReadTasks.filter(item => item !== null);
        // middle night
        const startOfDay = new Date();
        startOfDay.setHours(0, 1, 0, 0);
        const GetAllTaskDidByUserSinceMiddleNight = yield Task_Complete_Model_1.Task_Complete_Model.find({
            userId: authUser === null || authUser === void 0 ? void 0 : authUser._id,
            createdAt: { $gte: startOfDay }
        }).session(session);
        const ExtractCompletedTaskidSinceMiddleNight = GetAllTaskDidByUserSinceMiddleNight.map((item) => item === null || item === void 0 ? void 0 : item.taskId);
        // Count how much task did user that since middle night and category read
        const CountDidTask = yield Task_model_1.TaskModel.countDocuments({
            _id: {
                $in: ExtractCompletedTaskidSinceMiddleNight
            },
            category: "read",
        });
        // make sure Incomplete task is 2
        const TwoIncompletetask = IncompleteReadTasks.slice(0, CountDidTask === 2 ? 0 : CountDidTask === 1 ? 1 : 2);
        const otherTask = yield Task_model_1.TaskModel.find({
            _id: { $nin: allCompletedTaskIds },
            category: { $nin: ["read"] }
        }).session(session);
        yield session.commitTransaction();
        yield session.endSession();
        return res.status(200).send((0, FormetResponseSend_1.default)(http_status_codes_1.OK, "Incomplete Tasks", [...TwoIncompletetask, ...otherTask]));
    }
    catch (error) {
        yield session.abortTransaction();
        yield session.endSession();
        if (error instanceof Error) {
            return res.status(500).send({ message: error.message || 'An error occurred' });
        }
    }
});
exports.GetIncompleteTasks = GetIncompleteTasks;
