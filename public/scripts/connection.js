const { RTCPeerConnection, RTCSessionDescription } = window;

export class Connection {

    constructor(socket, inputStream, outputStreamHandler, room, peerId) {
        this.bound = false;
        this.peerConnection = new RTCPeerConnection();
        this.socket = socket;
        this.peerId = peerId;
        this.room = room;
        this.peerConnection.ontrack = ({ streams: [stream] }) => {
            outputStreamHandler(this, stream);
        }
        inputStream.getTracks().forEach(track => this.peerConnection.addTrack(track, inputStream));
    }

    getPeerId() {
        return this.peerId;
    }

    async sendOffer() {
        this.socket.on("join-answer-" + this.peerId, async data => {
            await this.peerConnection.setRemoteDescription(
                new RTCSessionDescription(data.answer)
            );
            if (!this.bound) {
               this.sendOffer();
               this.bound = true;
            }
        });
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(new RTCSessionDescription(offer));

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

        this.socket.emit("send-answer", {
          answer,
          to: this.peerId,
        });
    }

    close() {
        this.peerConnection.close()
    }

}
