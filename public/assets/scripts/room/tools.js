
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