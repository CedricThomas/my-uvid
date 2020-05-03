import { getRoomName } from './tools.js';
import { Connection } from './connection.js';

let userStream = null;
const room = getRoomName();
let socket = null;
const connections = [];

function addLocalStream(connection, stream) {
  // secure recall from ice candidate
  const container = document.getElementById('container');
  const elem = document.getElementById(connection.getPeerId());
  if (!elem) {
    const video = document.createElement('video');
    video.id = connection.getPeerId();
    video.srcObject = stream;
    video.autoplay = true;
    container.appendChild(video);
  } else {
    elem.srcObject = stream;
  }
}

function handleNewConnection() {
    socket.on("join-offer", async data => {
        const conn = new Connection(socket, userStream, addLocalStream, room, {id: data.from, name: data.name})
        conn.sendAnswerToOffer(data.offer);
        connections.push(conn);
    });
}

function joinRoom() {
  handleNewConnection();
  socket.emit("room");
}

function askPeersToJoin(peers) {
  if (peers.length === 0) {
    joinRoom();
    return;
  }
  for (const peer of peers) {
    const conn = new Connection(socket, userStream, (conn, stream) => {
      addLocalStream(conn,stream);
      if (connections.find(item => item.getPeerId() === conn.getPeerId()))
        return;
      connections.push(conn);
      if (connections.length === peers.length) {
        joinRoom();
      }
    }, room, peer);
    conn.sendOffer();
  }
}



function connectToRoomAs(name) {

  socket = io.connect(`${window.location.origin}`, {query: `room=${room}&name=${name}`});

  socket.on("can-join-answer", (data) => {
    if (data.able) {
      askPeersToJoin(data.peers);
    } else {
      console.log("Can't join the chat");
    }
  });
  socket.on("leaved-room", (data) => {
    const index = connections.findIndex(conn => conn.getPeerId() === data.from);
    if (index > -1) {
        const container = document.getElementById('container');
        const stream = document.getElementById(connections[index].getPeerId());
        container.removeChild(stream);
        connections[index].close();
        connections.splice(index, 1);
    }
  });

  socket.emit("can-join");
}

window.onload =  () => {
  navigator.getUserMedia(
    { video: true, audio: true },
    async stream => {
      const localVideo = document.getElementById("local-video");
      if (localVideo) {
        localVideo.srcObject = stream;
      }
  
      userStream = stream;
    },
    error => {
      console.warn(error.message);
    }
  );
  const form = document.getElementById('username-form');
  const username = document.getElementById('username');
  const submit = document.getElementById('submit');
  submit.addEventListener("click", () => {
    form.style.display = 'none';
    connectToRoomAs(username.value);
  });
}
