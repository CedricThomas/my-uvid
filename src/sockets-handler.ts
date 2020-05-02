import { Server as SocketIOServer } from "socket.io";


export class SocketsHandler {


    private MAX_CLIENTS_BY_ROOM = 5;

    constructor(private io: SocketIOServer) {
    }

    private getCLientsInRoom(room) {
        if (this.io.sockets.adapter.rooms[room]) {
           const clients = this.io.sockets.adapter.rooms[room].sockets.keys;
            return clients;
        } else {
            return [];
        }
    }

    public canJoinRoom(roomName: string): boolean {
        return Object.keys(this.getCLientsInRoom(roomName)).length < this.MAX_CLIENTS_BY_ROOM;
    }

    public registerHandlers() {
        this.io.on("connection", socket => {

            const roomName = socket.request._query.room;
            let joined = false;

            socket.on("can-join", (data: any) => {
                socket.to(socket.id).emit("can-join-answer", {
                    able: this.canJoinRoom(roomName),
                    peers: this.getCLientsInRoom(roomName),
                });
            });

            // offer sending
            socket.on("send-offer", (data: any) => {
                if (this.canJoinRoom(data.room)) {
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

            // handle user disconnection
            socket.on("disconnect", () => {
                if (joined) {
                    socket.to(roomName).emit("leaved-room", {
                        from: socket.id,
                    });
                }
            });
        });
    }

}
// can-join

// can-join-answer
// leaved-room