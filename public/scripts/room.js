import { getParameterByName } from './tools.js';

const room = getParameterByName('id');
const socket = io.connect("localhost:5000", {query: `room=${room}`});
const connections = [];

function addStream(connection, stream) {
  const container = document.getElementById('container');
  const video = document.createElement('video');
  video.id = connection.getPeerId();
  video.srcObject = stream;
  video.autoplay = true;
  container.appendChild(video);
}

function handleNewConnection() {
    socket.on("join-offer", async data => {
        connections.push(new Connection(socket, addStream, room, data.from));
    });
}

function joinRoom(peers) {
  if (peers.lenght === 0) {
    socket.join(room);
    return;
  }
  for (const peer of peers) {
    const conn = new Connection(socket, (conn, stream) => {
      addStream(conn, stream);
      connections.push(conn);
      if (connections.lenght === peers) {
        handleNewConnection();
        socket.join(room);
      }
    },
    room, peer.id);
    conn.registerWaitAnswer();
    conn.sendOffer();
    connections.push(conn);
  }
}

navigator.getUserMedia(
  { video: true, audio: true },
  async stream => {
    const localVideo = document.getElementById("local-video");
    if (localVideo) {
      localVideo.srcObject = stream;
    }

    socket.on("can-join-answer", (data) => {
      if (data.able) {
          joinRoom(peers);peers
      } else {
        console.log("Can't join the chat");
      }
    });
    socket.emit("can-join");
  },
  error => {
    console.warn(error.message);
  }
);