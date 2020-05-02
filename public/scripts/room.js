import { getParameterByName } from './tools.js';
import { Connection } from './connection.js';

let userStream = null;
const room = getParameterByName('id');
const socket = io.connect("localhost:5000", {query: `room=${room}`});
const connections = [];

function addLocalStream(connection, stream) {
  console.log("add stream", stream);
  const video = document.getElementById('remote-video');
  video.srcObject = stream;
  video.autoplay = true;
}

function handleNewConnection() {
  console.log("waiting offer");
    socket.on("join-offer", async data => {
        console.log("join offer received", data);
        const conn = new Connection(socket, userStream, addLocalStream, room, data.from)
        conn.sendAnswerToOffer(data.offer);
        connections.push(conn);
    });
}

function joinRoom() {
  console.log("room joined");
  handleNewConnection();
  socket.emit("room");
}

function askPeersToJoin(peers) {
  console.log("join room process :", peers);
  if (peers.length === 0) {
    joinRoom();
    return;
  }
  for (const peer of peers) {
    const conn = new Connection(socket, userStream, (conn, stream) => {
      addLocalStream(conn, stream);
      connections.push(conn);
      console.log("add stream");
      if (connections.length === peers.length) {
        joinRoom()
      }
    },
    room, peer);
    conn.registerWaitAnswer();
    conn.sendOffer();
    connections.push(conn);
  }
}

socket.on("can-join-answer", (data) => {
  if (data.able) {
    askPeersToJoin(data.peers);
  } else {
    console.log("Can't join the chat");
  }
});
navigator.getUserMedia(
  { video: true, audio: true },
  async stream => {
    const localVideo = document.getElementById("local-video");
    if (localVideo) {
      localVideo.srcObject = stream;
    }

    userStream = stream;
    socket.emit("can-join");
  },
  error => {
    console.warn(error.message);
  }
);