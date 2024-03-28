videoSelector = {
    'www.twitch.tv': '.video-ref video',
    'live.bilibili.com': '#live-player video'
};

export function getVideoElement() {
    var hostname = window.location.hostname;
    // console.log('Live Stream Caption: Current hostname is', hostname);
    return document.querySelector(videoSelector[hostname]);
}