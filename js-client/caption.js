var captionCss = `
#live-stream-caption {
  margin: 0;
  padding: 0;
  border: 0;
  max-width: 75%;
  font-size: 100%;
  font: inherit;
  vertical-align: baseline;
  position: absolute;
  cursor: move;
  z-index: 100;
}
`;

function hexToRGBA(hex, alpha) {
  let r = parseInt(hex.slice(1, 3), 16),
    g = parseInt(hex.slice(3, 5), 16),
    b = parseInt(hex.slice(5, 7), 16);

  if (alpha) {
    return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
  } else {
    return "rgb(" + r + ", " + g + ", " + b + ")";
  }
}

class Caption {
  constructor(font, fontSize, fontColor, fontAlpha, backgroundColor, backgroundAlpha) {
    this.font = font;
    this.fontSize = fontSize;
    this.fontColor = fontColor;
    this.fontAlpha = fontAlpha;
    this.backgroundColor = backgroundColor;
    this.backgroundAlpha = backgroundAlpha;
    this.defaultText = "The quick brown fox jumps over the lazy dog";
    this.centerPoint = { x: 0, y: 0 };
    this.timeoutId = null;

    // add css
    let style = document.createElement("style");
    style.innerHTML = captionCss;
    document.head.appendChild(style);

    this.element = document.createElement("div");
    this.element.id = "live-stream-caption";
    this.element.style.fontFamily = this.font;
    this.element.style.fontSize = this.fontSize + "px";
    this.element.style.color = hexToRGBA(this.fontColor, this.fontAlpha);
    this.element.style.backgroundColor = hexToRGBA(this.backgroundColor, this.backgroundAlpha);
    this.element.innerText = this.defaultText;

    this._dragElement(this.element);
  }

  _dragElement(elem) {
    let caption = this;
    let pos1 = 0,
      pos2 = 0,
      pos3 = 0,
      pos4 = 0;
    elem.onmousedown = dragMouseDown;

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

      let newLeft = elem.offsetLeft - pos1;
      let newTop = elem.offsetTop - pos2;

      let parentRect = elem.parentElement.getBoundingClientRect();
      let elementRect = elem.getBoundingClientRect();
      if (newLeft >= 0 && newLeft <= parentRect.width - elementRect.width) {
        elem.style.left = newLeft + "px";
        caption.centerPoint.x = newLeft + elem.offsetWidth / 2;
      }
      if (newTop >= 0 && newTop <= parentRect.height - elementRect.height) {
        elem.style.top = newTop + "px";
        caption.centerPoint.y = newTop + elem.offsetHeight;
      }
    }

    function closeDragElement() {
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }

  updateStyle(captionSettings) {
    this.font = captionSettings.font;
    this.fontSize = captionSettings.font_size;
    this.fontColor = captionSettings.font_color;
    this.fontAlpha = captionSettings.font_alpha;
    this.backgroundColor = captionSettings.background_color;
    this.backgroundAlpha = captionSettings.background_alpha;

    this.element.style.fontFamily = this.font;
    this.element.style.fontSize = this.fontSize + "px";
    this.element.style.color = hexToRGBA(this.fontColor, this.fontAlpha);
    this.element.style.backgroundColor = hexToRGBA(this.backgroundColor, this.backgroundAlpha);
  }

  updatePosition() {
    this.element.style.left = this.centerPoint.x - this.element.offsetWidth / 2 + "px";
    this.element.style.top = this.centerPoint.y - this.element.offsetHeight + "px";
  }

  pushText(text) {
    this.element.innerText = text;
    this.element.style.display = "block";
    this.updatePosition();
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    //! timeout设置为参数
    this.timeoutId = setTimeout(() => {
      this.element.style.display = "none";
    }, 5000);
  }
}

function addCaption(videoElem, captionSettings) {
  let caption = new Caption(
    captionSettings.font,
    captionSettings.font_size,
    captionSettings.font_color,
    captionSettings.font_alpha,
    captionSettings.background_color,
    captionSettings.background_alpha
  );
  videoElem.parentNode.insertBefore(caption.element, videoElem.nextSibling);
  caption.centerPoint = { x: videoElem.offsetWidth / 2, y: videoElem.offsetHeight - 10 };
  caption.updatePosition();
  caption.element.style.display = "none";
  console.debug("Caption added");

  return caption;
}
