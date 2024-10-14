"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const DecodeJWT_1 = __importDefault(require("../util/DecodeJWT"));
const ExtraTask_controller_1 = require("../ExtraTask/ExtraTask.controller");
const ExtraTaskRoute = (0, express_1.Router)();
ExtraTaskRoute.post("/ton-transection", DecodeJWT_1.default, ExtraTask_controller_1.TonTransection);
ExtraTaskRoute.post("/invites", DecodeJWT_1.default, ExtraTask_controller_1.InviteTask);
ExtraTaskRoute.get("/extra-list", DecodeJWT_1.default, ExtraTask_controller_1.ExtraTaskCompleteList);
ExtraTaskRoute.get("/daily-checking-status", DecodeJWT_1.default, ExtraTask_controller_1.HasClaimedToday);
ExtraTaskRoute.post("/daily-checking", DecodeJWT_1.default, ExtraTask_controller_1.DailyChecking);
exports.default = ExtraTaskRoute;
