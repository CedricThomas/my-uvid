import { Server as SocketIOServer } from "socket.io";
import { RoomManager } from "./room-manager";


export class SocketsHandler {

    private roomManager: RoomManager;

    constructor(private io: SocketIOServer) {
        this.roomManager = new RoomManager();
    }

    public registerHandlers() {
        this.io.on("connection", socket => {

            const roomName = socket.request._query.room;

            socket.on("can-join", (data: any) => {
                socket.emit("can-join-answer", {
                    able: this.roomManager.canJoinRoom(roomName),
                    peers: this.roomManager.getCLientsInRoom(roomName),
                });
            });

            // offer sending
            socket.on("send-offer", (data: any) => {
                if (this.roomManager.canJoinRoom(data.room)) {
                    socket.to(data.to).emit("join-offer", {
                        from: socket.id,
                        to: data.to,
                        offer: data.offer
                    });
                }
            });

            // send answer
            socket.on("send-answer", (data: any) => {
                socket.to(data.to).emit("join-answer-" + socket.id, {
                    from: socket.id,
                    to: data.to,
                    answer: data.answer
                });
            });

            socket.on("room", (data: any) => {
                this.roomManager.addToRoom(socket);
            });

            // handle user disconnection
            socket.on("disconnect", () => {
                if (this.roomManager.removeFromRoom(socket)) {
                    this.roomManager.getCLientsInRoom(roomName).forEach(peer => {
                        socket.to(peer).emit("leaved-room", {
                            from: socket.id,
                        });
                    });
                }
            });
        });
    }

}