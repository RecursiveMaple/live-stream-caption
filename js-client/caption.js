function hexToRGBA(hex, alpha) {
  var r = parseInt(hex.slice(1, 3), 16),
    g = parseInt(hex.slice(3, 5), 16),
    b = parseInt(hex.slice(5, 7), 16);

  if (alpha) {
    return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
  } else {
    return "rgb(" + r + ", " + g + ", " + b + ")";
  }
}

class Caption {
  constructor(text, font, fontSize, fontColor, fontAlpha, backgroundColor, backgroundAlpha) {
    this.text = text;
    this.font = font;
    this.fontSize = fontSize;
    this.fontColor = fontColor;
    this.fontAlpha = fontAlpha;
    this.backgroundColor = backgroundColor;
    this.backgroundAlpha = backgroundAlpha;

    this.element = document.createElement("div");
    this.element.id = "live-stream-caption";
    this.element.style.position = "absolute";
    this.element.style.cursor = "move";
    this.element.style.fontFamily = this.font;
    this.element.style.fontSize = this.fontSize;
    this.element.style.color = hexToRGBA(this.fontColor, this.fontAlpha);
    this.element.style.backgroundColor = hexToRGBA(this.backgroundColor, this.backgroundAlpha);
    this.element.style.padding = "5px";
    this.element.style.borderRadius = "5px";
    this.element.style.zIndex = "100";
    this.element.innerText = this.text;

    this._dragElement(this.element);
  }

  _dragElement(elmnt) {
    var pos1 = 0,
      pos2 = 0,
      pos3 = 0,
      pos4 = 0;
    elmnt.onmousedown = dragMouseDown;

    function dragMouseDown(event) {
      event.preventDefault();
      pos3 = event.clientX;
      pos4 = event.clientY;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
    }

    function elementDrag(event) {
      event.preventDefault();
      pos1 = pos3 - event.clientX;
      pos2 = pos4 - event.clientY;
      pos3 = event.clientX;
      pos4 = event.clientY;

      var newTop = elmnt.offsetTop - pos2;
      var newLeft = elmnt.offsetLeft - pos1;

      var parentRect = elmnt.parentElement.getBoundingClientRect();
      var elementRect = elmnt.getBoundingClientRect();
      if (newTop >= 0 && newTop <= parentRect.height - elementRect.height) {
        elmnt.style.top = newTop + "px";
      }
      if (newLeft >= 0 && newLeft <= parentRect.width - elementRect.width) {
        elmnt.style.left = newLeft + "px";
      }
    }

    function closeDragElement() {
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }

  attachToVideo(videoElement) {
    videoElement.parentNode.insertBefore(this.element, videoElement.nextSibling);
    this.element.style.top = videoElement.offsetHeight - this.element.offsetHeight + "px";
    this.element.style.left = videoElement.offsetWidth / 2 - this.element.offsetWidth / 2 + "px";
  }
}

window.Caption = Caption;
