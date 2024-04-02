videoSelector = {
  "www.twitch.tv": ".video-ref video",
  "live.bilibili.com": "#live-player video",
};

function getVideoElement() {
  var hostname = window.location.hostname;
  // console.debug('Live Stream Caption: Current hostname is', hostname);
  return document.querySelector(videoSelector[hostname]);
}

window.getVideoElement = getVideoElement;
