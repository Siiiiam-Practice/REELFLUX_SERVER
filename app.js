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
exports.bot = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const GlobalErrorHandler_1 = __importDefault(require("./util/GlobalErrorHandler"));
const http_status_codes_1 = require("http-status-codes");
const NoRoutes_1 = __importDefault(require("./util/NoRoutes"));
const Main_routes_1 = __importDefault(require("./routes/Main.routes"));
const filters_1 = require("telegraf/filters");
const telegraf_1 = require("telegraf");
require("dotenv/config");
const app = (0, express_1.default)();
exports.bot = new telegraf_1.Telegraf(process.env.BOT_TOKEN);
exports.bot === null || exports.bot === void 0 ? void 0 : exports.bot.on((0, filters_1.message)("text"), (ctx) => ctx.replyWithPhoto('https://i.ibb.co.com/nbPbnMv/image.png', {
    caption: `Welcome to Agecoin!

1⃣ Farm Agecoin Points every 8 hours!
2⃣ Invite friends to boost your Agecoins!
3⃣ Complete quests to earn even more!

Start farming today and stay tuned for exciting surprises! 🚀`,
    reply_markup: {
        inline_keyboard: [
            [{ text: "Open App", url: process.env.TMA_LINK }]
        ]
    }
}));
app.use((0, cors_1.default)({
    origin: "*",
    credentials: true,
}));
app.use(express_1.default.json());
app.get('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.send('hello world');
    }
    catch (error) {
        next({
            status: http_status_codes_1.StatusCodes.BAD_REQUEST,
            error
        });
    }
}));
app.use("/api/v1", Main_routes_1.default);
app.get('/proxy-image', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const imageUrl = req.query.url;
    try {
        const response = yield fetch(imageUrl);
        if (!response.ok) {
            return res.status(500).send('Failed to fetch image');
        }
        const arrayBuffer = yield response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        res.set('Content-Type', 'image/jpeg'); // Adjust this based on the image type, e.g., 'image/png'
        res.send(buffer);
    }
    catch (err) {
        res.status(500).send('Failed to fetch image');
    }
}));
app.post("/api/bot", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield exports.bot.handleUpdate(req.body, res);
    }
    catch (err) {
        console.error("Error handling update:", err);
        res.status(500).send("Error processing update");
    }
}));
app.get("/manifest", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send({
        "url": "https://Reel.Flux",
        "name": "REEL FLEX",
        "iconUrl": "https://i.ibb.co.com/ssfJBcr/logo-3.png"
    });
}));
app.use(NoRoutes_1.default);
app.use(GlobalErrorHandler_1.default);
exports.default = app;
