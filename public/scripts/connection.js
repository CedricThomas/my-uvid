const { RTCPeerConnection, RTCSessionDescription } = window;

const configuration = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]};

export class Connection {

    constructor(socket, inputStream, outputStreamHandler, room, peerId) {
        this.peerConnection = new RTCPeerConnection(configuration);
        this.socket = socket;
        this.peerId = peerId;
        this.room = room;
        this.peerConnection.ontrack = ({ streams: [stream] }) => {
            outputStreamHandler(this, stream);
        }
        inputStream.getTracks().forEach(track => this.peerConnection.addTrack(track, inputStream));

        this.socket.on("update-icecandidate", async data => {
            await this.peerConnection.addIceCandidate(data.candidate);
        });
    }

    getPeerId() {
        return this.peerId;
    }

    async sendOffer() {
        this.socket.on("join-answer-" + this.peerId, async data => {
            await this.peerConnection.setRemoteDescription(
                new RTCSessionDescription(data.answer)
            );
        });
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);

        this.socket.emit("send-offer", {
            room: this.room,
            offer,
            to: this.peerId
        });
        this.peerConnection.addEventListener('icecandidate', event => {
            if (event.candidate) {
                this.socket.emit("send-icecandidate", {
                    candidate: event.candidate,
                    to: this.peerId
                });
            }
        });
    }

    async sendAnswerToOffer(offer) {
        await this.peerConnection.setRemoteDescription(
            new RTCSessionDescription(offer)
          );

        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);

        this.socket.emit("send-answer", {
          answer,
          to: this.peerId,
        });
    }

    close() {
        this.peerConnection.close()
    }

}
