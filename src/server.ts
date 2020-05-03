import express, { Application } from "express";
import socketIO, { Server as SocketIOServer } from "socket.io";
import { createServer, Server as HTTPServer } from "http";
import * as path from 'path';
import { SocketsHandler } from "./sockets-handler";

export class Server {
    private httpServer: HTTPServer;
    private app: Application;
    private io: SocketIOServer;
    private socketsHandler: SocketsHandler;

    private readonly DEFAULT_PORT = process.env.PORT || 5000;

    constructor() {
        this.initialize();
    }

    private initialize(): void {
        this.app = express();
        this.httpServer = createServer(this.app);
        this.io = socketIO(this.httpServer);
        this.socketsHandler = new SocketsHandler(this.io);

        this.configureApp();
        this.socketsHandler.registerHandlers();
    }


    private configureApp(): void {
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname + '/../public/index.html'));
        });
        this.app.get('/:id', (req, res) => {
            res.sendFile(path.join(__dirname + '/../public/room.html'));
        });
        this.app.use('/assets', express.static(path.join(__dirname, "../public/assets")));
    }

    public listen(callback: (port: string | number) => void): void {
        this.httpServer.listen(this.DEFAULT_PORT, () =>
            callback(this.DEFAULT_PORT)
        );
    }
}