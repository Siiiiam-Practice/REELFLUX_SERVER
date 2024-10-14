"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateSetting = exports.GetSetting = exports.MatchSecretCode = exports.SettingModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const SettingSchema = new mongoose_1.Schema({
    SecretCode: Number,
    ReferComission: String,
    ReferReward: String,
    TonTranPoint: String,
    Mining_Time: String,
    Mining_Rewards: String
});
exports.SettingModel = (0, mongoose_1.model)("setting", SettingSchema);
const MatchSecretCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    try {
        session.startTransaction();
        const SecretCode = req.body.secret;
        const Matching = yield exports.SettingModel.findOne({ SecretCode }, {}, { session });
        if (!Matching) {
            const GetData = yield exports.SettingModel.find({}, {}, { session });
            if ((GetData === null || GetData === void 0 ? void 0 : GetData.length) === 0) {
                yield exports.SettingModel.create([{ SecretCode, ReferComission: "0", ReferReward: "0", TonTranPoint: "0", Mining_Rewards: "0", Mining_Time: "0" }], { session });
                yield session.commitTransaction();
                yield session.endSession();
                return res.status(200).send({
                    msg: 'New Secret is created!',
                    data: {
                        ping: true
                    },
                    statusCode: 200
                });
            }
            else {
                throw new Error("Secret Code is not matching...");
            }
        }
        else {
            yield session.commitTransaction();
            yield session.endSession();
            return res.status(200).send({
                msg: 'Secret is matched!',
                data: {
                    ping: true
                },
                statusCode: 200
            });
        }
    }
    catch (error) {
        yield session.abortTransaction();
        yield session.endSession();
        if (error instanceof Error) {
            return res.status(400).send({
                msg: error === null || error === void 0 ? void 0 : error.message,
                data: {
                    ping: false
                },
                statusCode: 400
            });
        }
        else {
            return res.send('something went wrong');
        }
    }
});
exports.MatchSecretCode = MatchSecretCode;
const GetSetting = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find the only document in the SettingModel collection
        const document = yield exports.SettingModel.findOne();
        if (!document) {
            return res.status(404).send({
                msg: 'No document found',
                statusCode: 404
            });
        }
        // Return the document as a response
        return res.status(200).send({
            msg: 'Document fetched successfully!',
            data: document,
            statusCode: 200
        });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(400).send({
                msg: error === null || error === void 0 ? void 0 : error.message,
                statusCode: 400
            });
        }
        else {
            return res.status(500).send('Something went wrong');
        }
    }
});
exports.GetSetting = GetSetting;
const UpdateSetting = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    const session = yield mongoose_1.default.startSession();
    try {
        session.startTransaction();
        const document = yield exports.SettingModel.findOne();
        const up = {
            SecretCode: ((_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.SecretCode) ? (_b = req === null || req === void 0 ? void 0 : req.body) === null || _b === void 0 ? void 0 : _b.SecretCode : document === null || document === void 0 ? void 0 : document.SecretCode,
            ReferComission: ((_c = req === null || req === void 0 ? void 0 : req.body) === null || _c === void 0 ? void 0 : _c.ReferComission) ? (_d = req === null || req === void 0 ? void 0 : req.body) === null || _d === void 0 ? void 0 : _d.ReferComission : document === null || document === void 0 ? void 0 : document.ReferComission,
            ReferReward: ((_e = req === null || req === void 0 ? void 0 : req.body) === null || _e === void 0 ? void 0 : _e.ReferReward) ? (_f = req === null || req === void 0 ? void 0 : req.body) === null || _f === void 0 ? void 0 : _f.ReferReward : document === null || document === void 0 ? void 0 : document.ReferReward,
        };
        const updatedDocument = yield exports.SettingModel.findOneAndUpdate({}, up, { new: true, session });
        if (!updatedDocument) {
            throw new Error("No document found to update.");
        }
        yield session.commitTransaction();
        yield session.endSession();
        return res.status(200).send({
            msg: 'Setting updated successfully!',
            data: updatedDocument,
            statusCode: 200
        });
    }
    catch (error) {
        yield session.abortTransaction();
        yield session.endSession();
        if (error instanceof Error) {
            return res.status(400).send({
                msg: error === null || error === void 0 ? void 0 : error.message,
                statusCode: 400
            });
        }
        else {
            return res.status(500).send('Something went wrong');
        }
    }
});
exports.UpdateSetting = UpdateSetting;
