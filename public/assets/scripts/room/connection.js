const { RTCPeerConnection, RTCSessionDescription } = window;

const configuration = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]};

export class Connection {

    constructor(socket, inputStream, room, peer, outputStreamHandler) {
        this.peerConnection = new RTCPeerConnection(configuration);
        this.socket = socket;
        this.peer = peer;
        this.room = room;
        this.remoteAudio = true;
        this.audioListener = null;
        this.peerConnection.ontrack = ({ streams: [stream] }) => {
            outputStreamHandler(this, stream);
        }
        inputStream.getTracks().forEach(track => this.peerConnection.addTrack(track, inputStream));

        this.socket.on("audio-status", async data => {
            this.remoteAudio = data.status;
            if (this.audioListener)
                this.audioListener(this.remoteAudio);
          });

        this.peerConnection.addEventListener('icecandidate', event => {
            if (event.candidate) {
                this.socket.emit("send-icecandidate", {
                    candidate: event.candidate,
                    to: this.peer.id
                });
            }
        });

        this.socket.on("update-icecandidate", async data => {
            if (this.peerConnection.iceConnectionState !== "closed")
                await this.peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
         });
    }

    getPeerId() {
        return this.peer.id;
    }

    getName() {
        return this.peer.name;
    }

    setAudioListener(listener) {
        this.audioListener = listener;
    }

    getAudioState() {
        return this.remoteAudio;
    }

    changeSoundState(status) {
        this.socket.emit("audio-status", {
            status,
            to: this.peer.id
          });
    }

    async sendOffer() {
        this.socket.on("join-answer-" + this.peer.id, async data => {
            await this.peerConnection.setRemoteDescription(
                new RTCSessionDescription(data.answer)
            );
            this.bound = true;
        });
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);

        this.socket.emit("send-offer", {
            room: this.room,
            offer,
            to: this.peer.id
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
          to: this.peer.id,
        });
    }

    close() {
        this.peerConnection.close()
    }

}
