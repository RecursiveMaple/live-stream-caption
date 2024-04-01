import argparse
import asyncio
import json
import time
from concurrent.futures import ProcessPoolExecutor
from multiprocessing import Manager

import websockets

from asr_server import add_asr, query_live_quality
from libs.whisper_streaming.whisper_online import add_shared_args


async def server_handler(websocket, path):
    with Manager() as manager:
        shared_dict = manager.dict()
        shared_dict["status"] = "stopped"
        shared_dict["out"] = manager.list()

        asyncio.create_task(send_message(websocket, path, shared_dict))
        async for message in websocket:
            asyncio.create_task(recv_message(websocket, path, shared_dict, message))
        ## deal with cleaning
        print("Cleaning up...")
        shared_dict["status"] = "stopping"
        timeout_counter = 0
        while timeout_counter < 10 and shared_dict["status"] == "stopping":
            await asyncio.sleep(1)
            timeout_counter += 1


async def send_message(websocket, path, shared_dict):
    while websocket.open:
        if shared_dict["out"]:
            out = shared_dict["out"].pop(0)
            print(out)
            # start,end,text = out
            response = {
                "ts": int(time.time()*1000),
                "cmd": "start",
                "data": out,
            }
            await websocket.send(json.dumps(response))
        else:
            await asyncio.sleep(0.5)


async def recv_message(websocket, path, shared_dict, message):
    message = json.loads(message)
    timestamp = message["ts"]
    command = message["cmd"]
    data = message["data"]

    if command == "quality":
        quality = query_live_quality(data)
        response = {
            "ts": int(time.time()*1000),
            "cmd": "quality",
            "data": quality,
        }
        await websocket.send(json.dumps(response))
    elif command == "start":
        if shared_dict["status"] != "stopped":
            return
        parser = argparse.ArgumentParser()
        parser.add_argument("--live_url", type=str, help="Live stream url.")
        parser.add_argument(
            "--live_quality", type=str, help="Stream quality from streamlink."
        )
        add_shared_args(parser)
        args = parser.parse_args(data)

        with ProcessPoolExecutor() as executor:
            shared_dict["status"] = "running"
            future = asyncio.get_event_loop().run_in_executor(
                executor, add_asr, args, shared_dict
            )
            await future
    elif command == "stop":
        if shared_dict["status"] != "running":
            return
        shared_dict["status"] = "stopping"


if __name__ == "__main__":
    start_server = websockets.serve(server_handler, "localhost", 8765)

    asyncio.get_event_loop().run_until_complete(start_server)
    asyncio.get_event_loop().run_forever()

    # test_main()
