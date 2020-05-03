
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

export function syncVideoDivFromStream(connection, stream) {
    const container = document.getElementById('container');

    const elem = document.getElementById(connection.getPeerId());
    if (!elem) {
        const videoContainer = document.createElement('div');
        videoContainer.id = `${connection.getPeerId()}-container`;
        videoContainer.className = "video-container";
        videoContainer.innerHTML =
        `
            <p>${connection.getName()}</p>
            <video autoplay id="${connection.getPeerId()}"></video>
            <i id="audio-${connection.getPeerId()}"></i>
        `
        container.appendChild(videoContainer);
    }

    const video = document.getElementById(connection.getPeerId());
    video.srcObject = stream;
}