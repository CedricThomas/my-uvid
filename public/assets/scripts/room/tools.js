
export function getRoomName() {
    const url = window.location.pathname;
    return url.substring(url.lastIndexOf('/') + 1);
}

export function copyValueToClipboard(value) {
    const dummy = document.createElement('input');

    document.body.appendChild(dummy);
    dummy.value = value;
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);
}

export function createVideoDivFromStream(connection, stream) {
    const container = document.getElementById('container');

    const videoContainer = document.createElement('div');
    videoContainer.id = `${connection.getPeerId()}-container`
    videoContainer.innerHTML =
    `
        <video id="${connection.getPeerId()}">
    `

    container.appendChild(videoContainer);
    const video = document.getElementById(connection.getPeerId());
    video.srcObject = stream;
    console.log("created");
}