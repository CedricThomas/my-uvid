const { RTCPeerConnection, RTCSessionDescription } = window;

export class Connection {

    constructor(socket, streamHandler, room, peerId) {
        this.peerConnection = new RTCPeerConnection();
        this.socket = socket;
        this.peerId = peerId;
        this.room = room;
        peerConnection.ontrack = function({ streams: [stream] }) {
            streamHandler(this, stream);
        }
    }

    getPeerId() {
        return this.peerId;
    }

    registerWaitAnswer() {
        this.socket.on("join-answer-" + this.peerId, async data => {
            await peerConnection.setRemoteDescription(
                new RTCSessionDescription(data.answer)
            );
        });
    }

    async sendOffer() {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(new RTCSessionDescription(offer));

        this.socket.emit("send-offer", {
            room: this.room,
            offer,
            to: this.peerId
        });
    }

}
