"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const dbMessages_1 = __importDefault(require("./dbMessages"));
require('dotenv').config();
const pusher_1 = __importDefault(require("pusher"));
const port = process.env.PORT || 5000;
const pusher = new pusher_1.default({
    appId: "1115107",
    key: `${process.env.PUSHER_KEY}`,
    secret: `${process.env.PUSHER_SECRET}`,
    cluster: "eu",
    useTLS: true
});
const app = express_1.default();
app.use(cors_1.default());
app.use(body_parser_1.default.json());
const url = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.dpnco.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`;
mongoose_1.default.connect(url, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose_1.default.connection;
db.once("open", () => {
    const msgCollection = db.collection("messagecontents");
    const changeStream = msgCollection.watch();
    changeStream.on("change", (change) => {
        if (change.operationType === 'insert') {
            const messageDetails = change.fullDocument;
            pusher.trigger('messages', 'inserted', {
                name: messageDetails.name,
                message: messageDetails.message,
                timestamp: messageDetails.timestamp,
            });
        }
        else {
            console.log('Error trigger pusher');
        }
    });
});
app.get("/", (req, res) => {
    res.status(200).send("hello world");
});
app.get('/messages/sync', (req, res) => {
    dbMessages_1.default.find((err, data) => {
        if (err) {
            res.status(500).send(err);
        }
        else {
            res.status(200).send(data);
        }
    });
});
app.post('/messages/new', (req, res) => {
    const dbMessage = req.body;
    dbMessages_1.default.create(dbMessage, (err, data) => {
        if (err) {
            res.status(500).send(err);
        }
        else {
            res.status(201).send(`new message created: \n ${data}`);
        }
    });
});
app.listen(port);
