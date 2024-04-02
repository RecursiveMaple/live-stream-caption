# Live Stream Caption

Live Stream Caption (LSC) is project focus on adding close-caption to live stream webpage. Currently supports Twitch and Bilibili. Backend based on Whisper ASR on your local machine. Frontend deployed on the TamperMonkey script system.

## Credits

<!-- credits -->
pass

## Installation

This section help you setup LSC both in your OS and browser.

### OS setup (Linux-like)

1. clone this repository.

   ```bash
   git clone https://github.com/ufal/whisper_streaming.git
   cd live-stream-caption
   ```

2. create python environment (optional).

   E.g., here I create an environment with virtualenv.

   ```bash
   python -m venv venv
   source venv/Scripts/activate
   ```

3. install python library requirement.

   ```bash
   python install -r requirement.txt
   ```

### Browser setup

1. [Install TamperMonkey](https://www.tampermonkey.net/) in your brower.
2. [Add LSC script](https://greasyfork.org/zh-CN/scripts/458578-b%E7%9B%B4%E6%92%AD%E5%BF%AB%E6%8D%B7%E5%BC%B9%E5%B9%95) from Greasy Fork.

## Usage

### Backend: your computer

1. Activate your python environment.

    ```bash
    source venv/Scripts/activate
    ```

2. Run main.py.

    ```bash
    python main.py
    ```

### Frontend: your browser

1. Navigate to the streamer's website.
2. Open LSC setting.

    ![setting-entry](http://url/to/img.png)
3. Choose your settings.

    Note that the sector ASR setting is saved per streamer, while other settings are global among all streamers and streaming platforms.

    ![setting-page](http://url/to/img.png)

    > [!IMPORTANT]
    > 1. Due to safety issue on self-signed certificate, you need to visit your backend url manully for the first time you set an ip and port. E.g., open <https://localhost:8765> and accept unsafe connction in the popup warning page.
    > 2. The first time you switch to a new model (like from none to large-v3), it takes time to download it.
4. Start LSC.

    Press 'reload' if the server status is 'CLOSED'. Press 'get quality' if no chioce shows up in the drop-down box. Then choose a quality (usually you want the lowest quality). Last, press 'start'. You can stop LSC by 'stop' button.

    ![setting-actions](http://url/to/img.png)
