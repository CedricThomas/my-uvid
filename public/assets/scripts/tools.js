
export function getRoomName() {
    const url = window.location.pathname;
    return url.substring(url.lastIndexOf('/') + 1);
}
