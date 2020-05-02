const { RTCPeerConnection, RTCSessionDescription } = window;

export class Connection {

    constructor(socket, inputStream, outputStreamHandler, room, peerId) {
        this.peerConnection = new RTCPeerConnection();
        this.socket = socket;
        this.peerId = peerId;
        this.room = room;
        inputStream.getTracks().forEach(track => this.peerConnection.addTrack(track, inputStream));
        this.peerConnection.ontrack = ({ streams: [stream] }) => {
            console.log("ON TRACK");
            outputStreamHandler(this, stream);
        }
    }

    getPeerId() {
        return this.peerId;
    }

    registerWaitAnswer() {
        this.socket.on("join-answer-" + this.peerId, async data => {
            console.log("answer received", data.answer);
            await this.peerConnection.setRemoteDescription(
                new RTCSessionDescription(data.answer)
            );
        });
    }

    async sendOffer() {
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(new RTCSessionDescription(offer));

        console.log("offer sent", offer);
        this.socket.emit("send-offer", {
            room: this.room,
            offer,
            to: this.peerId
        });
    }

    async sendAnswerToOffer(offer) {
        await this.peerConnection.setRemoteDescription(
            new RTCSessionDescription(offer)
          );

        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(new RTCSessionDescription(answer));

        console.log(answer, offer);
        console.log("answer sent");
        this.socket.emit("send-answer", {
          answer,
          to: this.peerId,
        });
    }

}
