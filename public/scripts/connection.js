const { RTCPeerConnection, RTCSessionDescription } = window;

const configuration = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]};

export class Connection {

    constructor(socket, inputStream, outputStreamHandler, room, peerId) {
        this.peerConnection = new RTCPeerConnection(configuration);
        this.socket = socket;
        this.peerId = peerId;
        this.room = room;
        this.stream = null;
        this.bound = false;
        this.candidate = null;
        this.peerConnection.ontrack = ({ streams: [stream] }) => {
            this.stream = stream;
            outputStreamHandler(this, stream);
        }
        inputStream.getTracks().forEach(track => this.peerConnection.addTrack(track, inputStream));
    }

    getPeerId() {
        return this.peerId;
    }

    trySendIceCandidate() {
        if (this.bound && this.candidate) {
            this.socket.emit("send-icecandidate", {
                candidate: event.candidate,
                to: this.peerId
            });
        }
    }

    async sendOffer() {
        this.socket.on("join-answer-" + this.peerId, async data => {
            await this.peerConnection.setRemoteDescription(
                new RTCSessionDescription(data.answer)
            );
            this.bound = true;
            this.trySendIceCandidate();
        });
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);

        this.peerConnection.addEventListener('icecandidate', event => {
            if (event.candidate) {
                this.candidate = event.candidate;
                this.trySendIceCandidate();
            }
        });
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
        await this.peerConnection.setLocalDescription(answer);

        this.socket.on("update-icecandidate", async data => {
            await this.peerConnection.addIceCandidate(data.candidate);
        });
        this.socket.emit("send-answer", {
          answer,
          to: this.peerId,
        });
    }

    close() {
        this.peerConnection.close()
    }

}
