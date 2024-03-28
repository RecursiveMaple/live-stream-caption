import ffmpeg
import numpy as np
import streamlink

from libs.whisper_streaming.whisper_online import OnlineASRProcessor, asr_factory


def query_live_quality(url):
    streams = streamlink.streams(url)
    quality = list(streams.keys())
    return quality


def add_asr(args, shared_dict):
    ## load ASR
    asr = asr_factory(args)
    online = OnlineASRProcessor(
        asr,
        buffer_trimming=(args.buffer_trimming, args.buffer_trimming_sec),
        initial_prompt=args.initial_prompt,
    )

    ## load audio
    streams = streamlink.streams(args.live_url)
    stream_url = streams[args.live_quality].url
    wave_process = (
        ffmpeg.input(stream_url)
        .output("pipe:", format="s16le", acodec="pcm_s16le", ac=1, ar="16k")
        .global_args("-loglevel", "error")
        .run_async(pipe_stdout=True)
    )
    out = wave_process.stdout
    chunk_size = int(16000 * 2 * 1 * args.min_chunk_size)

    ## read audio stream
    while shared_dict["status"] == "running":
        chunk = out.read(chunk_size)
        if not chunk:
            print("Stream end")
            break

        a = np.frombuffer(chunk, dtype=np.int16).astype(np.float16) / 32768.0
        online.insert_audio_chunk(a)
        o = online.process_iter()

        # deal with output o: (start, end, text)
        # print(o)
        if o[0] is not None:
            shared_dict["out"].append(o)

    ## clean up
    wave_process.terminate()
    o = online.finish()
    shared_dict["status"] = "stopped"
