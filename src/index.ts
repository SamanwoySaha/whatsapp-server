import express from 'express';
import { Request, Response, NextFunction } from "express";
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import Messages from './dbMessages';
require('dotenv').config();
import Pusher from 'pusher';
const port = process.env.PORT || 5000;

const pusher = new Pusher({
    appId: "1115107",
    key: `${process.env.PUSHER_KEY}`,
    secret: `${process.env.PUSHER_SECRET}`,
    cluster: "eu",
    useTLS: true
});

const app = express();

app.use(cors());
app.use(bodyParser.json());

const url = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.dpnco.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`;

mongoose.connect(url, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.once("open", () => {
    console.log("DB connected");

    const msgCollection = db.collection("messagecontents");
    const changeStream = msgCollection.watch();

    changeStream.on("change", (change) => {
        console.log(change);

        if (change.operationType === 'insert') {
            const messageDetails = change.fullDocument;
            pusher.trigger('messages', 'inserted', 
                { 
                    name: messageDetails.name,
                    message: messageDetails.message,
                    timestamp: messageDetails.timestamp,
                    received: messageDetails.received,
                }
            );
        } else {
            console.log('Error trigger pusher');
        }
    })
});
interface Message {
    message: string, 
    name: string, 
    timestamp: string,
    received: boolean
}

app.get("/", (req: Request, res: Response) => {
    res.status(200).send("hello world");
});

app.get('/messages/sync', (req: Request, res: Response) => {
    Messages.find((err, data) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(200).send(data);
        }
    })
})

app.post('/messages/new', (req: Request, res: Response) => {
    const dbMessage = req.body;
    
    Messages.create(dbMessage, (err: Error, data: Message) => {
        if (err) {
            res.status(500).send(err);
        } else {            
            res.status(201).send(`new message created: \n ${data}`);
        }
    })
})

app.listen(port, () => {
    console.log('listening on port');
});