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
exports.MiningBoosting = exports.LeaderboardByPoints = exports.UpdateUserInformission = exports.AdminAllUserList = exports.MyInfo = exports.ReferList = exports.CreateUser = void 0;
const http_status_codes_1 = require("http-status-codes");
const User_model_1 = __importDefault(require("./User.model"));
const uuid_1 = require("uuid");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const FormetResponseSend_1 = __importDefault(require("../util/FormetResponseSend"));
const Point_model_1 = __importDefault(require("../Point/Point.model"));
const crypto_1 = __importDefault(require("crypto"));
const mongoose_1 = __importDefault(require("mongoose"));
const FormetResponseErrorSend_1 = __importDefault(require("../util/FormetResponseErrorSend"));
const Task_Complete_Model_1 = require("../Task_Complete/Task_Complete.Model");
const Setting_Controller_1 = require("../Setting/Setting.Controller");
const app_1 = require("../app");
const querystring = require("querystring");
// Define the function for verifying Telegram data
function verifyTelegramData(data) {
    const botToken = process.env.BOT_TOKEN;
    if (!botToken) {
        throw new Error("Missing TELEGRAM_BOT_TOKEN environment variable");
    }
    if (!data.hash) {
        throw new Error("Missing hash in Telegram login data");
    }
    const authDate = data.auth_date;
    if (!authDate) {
        throw new Error("Missing auth_date in Telegram login data");
    }
    const checkString = Object.keys(data)
        .filter((key) => key !== "hash")
        .sort()
        .map((key) => {
        if (key === "user") {
            return `${key}=${JSON.stringify(data[key])}`;
        }
        return `${key}=${data[key]}`;
    })
        .join("\n");
    const secretKey = crypto_1.default.createHmac("sha256", "WebAppData").update(botToken).digest();
    const calculatedHash = crypto_1.default.createHmac("sha256", secretKey).update(checkString).digest("hex");
    if (calculatedHash === data.hash) {
        return true;
    }
    else {
        console.log("Validation failed");
        return false;
    }
}
const CreateUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    const session = yield mongoose_1.default.startSession();
    try {
        session.startTransaction();
        const TgId = (_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.TgId;
        const user = yield User_model_1.default.findOne({ TgId: TgId }, {}, { session });
        const parsedData = querystring.parse((_b = req === null || req === void 0 ? void 0 : req.body) === null || _b === void 0 ? void 0 : _b.init);
        parsedData.user = JSON.parse(decodeURIComponent(parsedData.user));
        const isInitVaild = verifyTelegramData(parsedData);
        if (isInitVaild) {
            if (user === null) {
                const ReferCode = yield (0, uuid_1.v4)();
                const AObject = yield Object.assign({ ReferCode }, req.body);
                const body = req === null || req === void 0 ? void 0 : req.body;
                if ((body === null || body === void 0 ? void 0 : body.Username) === ((_c = parsedData === null || parsedData === void 0 ? void 0 : parsedData.user) === null || _c === void 0 ? void 0 : _c.username) && (body === null || body === void 0 ? void 0 : body.TgId) === ((_d = parsedData === null || parsedData === void 0 ? void 0 : parsedData.user) === null || _d === void 0 ? void 0 : _d.id)) {
                    const result = yield User_model_1.default.create([AObject], { session });
                    const findReferer = yield User_model_1.default.findOne({ ReferCode: (_e = req === null || req === void 0 ? void 0 : req.body) === null || _e === void 0 ? void 0 : _e.referBy }, {}, { session });
                    if (findReferer) {
                        const findRefererPointTable = yield Point_model_1.default.findOne({ userId: findReferer === null || findReferer === void 0 ? void 0 : findReferer._id }, {}, { session });
                        // await PointModel.findOneAndUpdate({ userId: findReferer?._id }, { point: (findRefererPointTable?.point as number) + 3333 }, { session });
                        if (findRefererPointTable) {
                            findRefererPointTable.point = (findRefererPointTable === null || findRefererPointTable === void 0 ? void 0 : findRefererPointTable.point) + 3333;
                            yield findRefererPointTable.save();
                        }
                        yield Point_model_1.default.create([{ userId: (_f = result[0]) === null || _f === void 0 ? void 0 : _f._id, point: 333 }], { session });
                    }
                    else {
                        yield Point_model_1.default.create([{ userId: (_g = result[0]) === null || _g === void 0 ? void 0 : _g._id, point: 0 }], { session });
                    }
                    yield session.commitTransaction();
                    yield session.endSession();
                    const token = yield jsonwebtoken_1.default.sign({ user: result[0] }, "this-is-secret", { expiresIn: '7d' });
                    return res.status(http_status_codes_1.CREATED).cookie("token", token).send((0, FormetResponseSend_1.default)(http_status_codes_1.CREATED, "Register Completed...", { user: result, token }));
                }
                else {
                    yield session.abortTransaction();
                    yield session.endSession();
                    return next({
                        status: http_status_codes_1.UNAUTHORIZED,
                        error: "User information is mismatched."
                    });
                }
            }
            else {
                const body = req === null || req === void 0 ? void 0 : req.body;
                const isUsernameMatch = (body === null || body === void 0 ? void 0 : body.Username) === ((_h = parsedData === null || parsedData === void 0 ? void 0 : parsedData.user) === null || _h === void 0 ? void 0 : _h.username);
                const isTgIdMatch = (body === null || body === void 0 ? void 0 : body.TgId) === ((_j = parsedData === null || parsedData === void 0 ? void 0 : parsedData.user) === null || _j === void 0 ? void 0 : _j.id);
                if (isUsernameMatch && isTgIdMatch) {
                    const token = yield jsonwebtoken_1.default.sign({ user }, "this-is-secret", { expiresIn: '7d' });
                    yield session.commitTransaction();
                    yield session.endSession();
                    return res.status(http_status_codes_1.OK).cookie("token", token).send((0, FormetResponseSend_1.default)(http_status_codes_1.CREATED, "Logged...", { user, token }));
                }
                else {
                    yield session.abortTransaction();
                    yield session.endSession();
                    return next({
                        status: http_status_codes_1.UNAUTHORIZED,
                        error: "User information is mismatched."
                    });
                }
            }
        }
        else {
            yield session.abortTransaction();
            yield session.endSession();
            return next({
                status: http_status_codes_1.UNAUTHORIZED,
                error: "User information is mismatched."
            });
        }
    }
    catch (error) {
        yield session.abortTransaction();
        yield session.endSession();
        return next({
            status: http_status_codes_1.BAD_REQUEST,
            error
        });
    }
});
exports.CreateUser = CreateUser;
const ReferList = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _k, _l;
    const session = yield mongoose_1.default.startSession();
    try {
        session.startTransaction();
        //find my profile 
        const findme = yield User_model_1.default.findById((_l = (_k = req === null || req === void 0 ? void 0 : req.user) === null || _k === void 0 ? void 0 : _k.user) === null || _l === void 0 ? void 0 : _l._id, {}, { session });
        const findReferedUser = yield User_model_1.default.find({ referBy: findme === null || findme === void 0 ? void 0 : findme.ReferCode }, {}, { session });
        yield session.commitTransaction();
        yield session.endSession();
        return res.status(http_status_codes_1.OK).send((0, FormetResponseSend_1.default)(http_status_codes_1.OK, 'Refer info retrive...', { me: findme, refer_list: findReferedUser }));
    }
    catch (error) {
        yield session.abortTransaction();
        yield session.endSession();
        return res.status(http_status_codes_1.OK).send((0, FormetResponseErrorSend_1.default)(http_status_codes_1.BAD_REQUEST, error.message, error));
    }
});
exports.ReferList = ReferList;
const MyInfo = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _m, _o;
    try {
        const uid = (_o = (_m = req === null || req === void 0 ? void 0 : req.user) === null || _m === void 0 ? void 0 : _m.user) === null || _o === void 0 ? void 0 : _o._id;
        const result = yield User_model_1.default.findById(uid);
        return res.status(http_status_codes_1.OK).send((0, FormetResponseSend_1.default)(http_status_codes_1.OK, 'My info retrive', result));
    }
    catch (error) {
        return next({
            status: http_status_codes_1.BAD_REQUEST,
            error
        });
    }
});
exports.MyInfo = MyInfo;
const AdminAllUserList = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield Point_model_1.default.find({}).populate("userId").sort("-point");
        const formattedResults = yield Promise.all(result.map((item) => __awaiter(void 0, void 0, void 0, function* () {
            var _p, _q;
            const task_solved = yield Task_Complete_Model_1.Task_Complete_Model.find({ userId: (_p = item === null || item === void 0 ? void 0 : item.userId) === null || _p === void 0 ? void 0 : _p._id });
            const refer_count = yield User_model_1.default.find({ referBy: (_q = item === null || item === void 0 ? void 0 : item.userId) === null || _q === void 0 ? void 0 : _q.referBy });
            return Object.assign(Object.assign({}, item.toObject()), { task_solved: task_solved.length, refer_count: refer_count.length });
        })));
        return res.status(http_status_codes_1.OK).send((0, FormetResponseSend_1.default)(http_status_codes_1.OK, 'All user list retrieved', formattedResults));
    }
    catch (error) {
        return next({
            status: http_status_codes_1.BAD_REQUEST,
            error
        });
    }
});
exports.AdminAllUserList = AdminAllUserList;
const UpdateUserInformission = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    try {
        const { pointId, ReferCode, point } = req === null || req === void 0 ? void 0 : req.body;
        const FindPointTable = yield Point_model_1.default.findById(pointId).session(session);
        if (FindPointTable) {
            FindPointTable.point = Number(point ? point : FindPointTable === null || FindPointTable === void 0 ? void 0 : FindPointTable.point);
            yield FindPointTable.save();
        }
        else {
            throw new Error("Point Table Not Found!");
        }
        const FindUser = yield User_model_1.default.findById(FindPointTable === null || FindPointTable === void 0 ? void 0 : FindPointTable.userId).session(session);
        if (FindUser) {
            FindUser.ReferCode = ReferCode ? ReferCode : FindUser === null || FindUser === void 0 ? void 0 : FindUser.ReferCode;
            yield FindUser.save();
        }
        else {
            throw new Error("User Not Found!");
        }
        return res.status(http_status_codes_1.OK).send((0, FormetResponseSend_1.default)(http_status_codes_1.OK, 'User Profile Updated', FindPointTable));
    }
    catch (error) {
        return next({
            status: http_status_codes_1.BAD_REQUEST,
            error
        });
    }
});
exports.UpdateUserInformission = UpdateUserInformission;
const LeaderboardByPoints = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _r;
    const authUser = (_r = req === null || req === void 0 ? void 0 : req.user) === null || _r === void 0 ? void 0 : _r.user;
    let User;
    let userRank;
    const user = yield User_model_1.default.findById(authUser === null || authUser === void 0 ? void 0 : authUser._id);
    if (user === null || user === void 0 ? void 0 : user._id) {
        User = yield Point_model_1.default
            .findOne({ userId: user === null || user === void 0 ? void 0 : user._id })
            .populate('userId')
            .select('-userId.isBlocked -userId.isDeleted -userId.createdAt -updatedAt');
        userRank = (yield Point_model_1.default.countDocuments({ point: { $gt: (User === null || User === void 0 ? void 0 : User.point) ? User === null || User === void 0 ? void 0 : User.point : 0 } })) + 1;
    }
    const Leader = yield Point_model_1.default
        .find({})
        .sort({ point: -1 })
        .limit(100)
        .populate('userId')
        .select('-userId.isBlocked -userId.isDeleted -userId.createdAt -updatedAt');
    const me = {
        userRank,
        User
    };
    res.send({
        msg: 'New Leaderboard list!',
        statusCode: 200,
        data: [
            me,
            ...Leader
        ]
    });
});
exports.LeaderboardByPoints = LeaderboardByPoints;
const MiningBoosting = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _s;
    const session = yield mongoose_1.default.startSession();
    try {
        yield session.startTransaction();
        const { user: authUser } = req === null || req === void 0 ? void 0 : req.user;
        const ton = (_s = req === null || req === void 0 ? void 0 : req.body) === null || _s === void 0 ? void 0 : _s.ton;
        const user = yield User_model_1.default.findById(authUser === null || authUser === void 0 ? void 0 : authUser._id).session(session);
        const setting = yield Setting_Controller_1.SettingModel.findOne({}).session(session);
        if (!(user === null || user === void 0 ? void 0 : user._id)) {
            throw new Error("User not found!");
        }
        const mining_r = ((Number(setting === null || setting === void 0 ? void 0 : setting.Mining_Rewards) / 100) * 5) * Number(ton);
        user.MiningRewards = String((user === null || user === void 0 ? void 0 : user.MiningRewards) ? Number(user === null || user === void 0 ? void 0 : user.MiningRewards) + Number(setting === null || setting === void 0 ? void 0 : setting.Mining_Rewards) + mining_r : Number(setting === null || setting === void 0 ? void 0 : setting.Mining_Rewards) + mining_r);
        yield user.save({ session: session });
        yield session.commitTransaction();
        yield session.endSession();
        yield app_1.bot.telegram.sendMessage(user === null || user === void 0 ? void 0 : user.TgId, `🚀 Thank you for purchasing a boost! Your boost has been successfully activated! Keep mining and continue to earn even more rewards. ⛏️✨\n\nThe more you mine, the more you’ll grow! 🌟 Keep up the great work! 💪`);
        return res.status(http_status_codes_1.OK).send((0, FormetResponseSend_1.default)(http_status_codes_1.OK, 'mining boosting is complete', []));
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(http_status_codes_1.BAD_REQUEST).send((0, FormetResponseErrorSend_1.default)(http_status_codes_1.BAD_REQUEST, error.message, error));
        }
    }
});
exports.MiningBoosting = MiningBoosting;
