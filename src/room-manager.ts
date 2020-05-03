import { v4 as uuidv4 } from 'uuid';

interface Room {
    id: string,
    participant: string[],
}

export class RoomManager {

    private MAX_CLIENTS_BY_ROOM = 5;
    private rooms: Room[] = [];

    public addToRoom(socket: any): Room {
        const roomId = socket.request._query.room;
        const socketId = socket.id;
        const result = this.rooms.find(room => room.id === roomId);
        if (!result) {
            const room = {
                id: roomId,
                participant: [socketId],
            }
            this.rooms.push(room);
            console.log("[ ADD ] creation de " + room.id);
            console.log("[ ADD ]", room);
            return room;
        } else {
            result.participant.push(socketId);
            console.log("[ ADD ]", result);
            return result;
        }
    }

    public removeFromRoom(socket: any) {
        let status = false;
        const roomId = socket.request._query.room;
        const socketId = socket.id;
        const result = this.rooms.find(room => room.id === roomId);
        if (result) {
            const index = result.participant.indexOf(socketId);
            if (index > -1) {
                result.participant.splice(index, 1);
            }
            status = true;
            console.log("[ REMOVE ]", result);
            if (result.participant.length === 0) {
                const roomIdx = this.rooms.findIndex(room => room.id === roomId);
                if (roomIdx > -1) {
                    this.rooms.splice(roomIdx, 1);
                }
                console.log("[ REMOVE ] " + result.id + " est vide et donc supprimé");
            }
        }
        return status;
    }

    public getValidRoomUUID() {
        while (true) {
            const uuid = uuidv4();
            if (this.rooms.findIndex(room => room.id === uuid) < 0)
                return uuid;
        }
    }

    public getCLientsInRoom(id) {
        const result = this.rooms.find(room => room.id === id);
        if (result) {
            return result.participant;
        } else {
            return [];
        }
    }

    public canJoinRoom(roomName: string): boolean {
        console.log(this.getCLientsInRoom(roomName).length, this.MAX_CLIENTS_BY_ROOM);
        return this.getCLientsInRoom(roomName).length < this.MAX_CLIENTS_BY_ROOM;
    }

}