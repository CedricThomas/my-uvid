import { Server as SocketIOServer } from "socket.io";
import { RoomManager } from "./room-manager";


export class SocketsHandler {

    private roomManager: RoomManager;

    constructor(private io: SocketIOServer) {
        this.roomManager = new RoomManager();
    }


    public generateRoomUUID() {
        return this.roomManager.getValidRoomUUID();
    }

    public registerHandlers() {
        this.io.on("connection", socket => {

            const room = socket.request._query.room;
            const username = socket.request._query.name;

            socket.on("can-join", (data: any) => {
                socket.emit("can-join-answer", {
                    able: this.roomManager.canJoinRoom(room),
                    peers: this.roomManager.getCLientsInRoom(room),
                });
            });

            // offer sending
            socket.on("send-offer", (data: any) => {
                if (this.roomManager.canJoinRoom(data.room)) {
                    socket.to(data.to).emit("join-offer", {
                        name: username,
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

            // share ice candidate
            socket.on("send-icecandidate", (data: any) => {
                socket.to(data.to).emit("update-icecandidate", {
                    from: socket.id,
                    to: data.to,
                    candidate: data.candidate
                });
            });

            // change sound status
            socket.on("audio-status", (data: any) => {
                socket.to(data.to).emit("audio-status", {
                    from: socket.id,
                    to: data.to,
                    status: data.status
                });
            });

            // join room
            socket.on("room", () => {
                this.roomManager.addToRoom(socket, username);
            });

            // handle user disconnection
            socket.on("disconnect", () => {
                if (this.roomManager.removeFromRoom(socket)) {
                    this.roomManager.getCLientsInRoom(room).forEach(peer => {
                        socket.to(peer.id).emit("leaved-room", {
                            from: socket.id,
                        });
                    });
                }
            });
        });
    }

}