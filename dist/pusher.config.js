"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pusher_1 = __importDefault(require("pusher"));
const pusher = new pusher_1.default({
    appId: "1115107",
    key: "677a639ac12bb7cadbb3",
    secret: "4f0bb05e512d17c17590",
    cluster: "eu",
    useTLS: true
});
exports.default = pusher;
