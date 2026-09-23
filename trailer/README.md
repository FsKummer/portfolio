# Felipe Kummer: Adventure Portfolio trailer

`portfolio-launch-trailer.mp4` is the launch export: 60 seconds, 1920×1080,
30 fps, H.264 video and AAC stereo audio, with burned-in cinematic English subtitles.
`source/narration.en.srt` contains the narration captions for editing. It stays
away from the finished video so players cannot automatically load a second
subtitle layer over the burned-in captions.

The footage was recorded again after the game's text layout, UI and animation
polish, from this repository running in Chromium at the game's
1280×720 resolution. The playthrough used normal keyboard controls to select a
traveler, explore, win all three guardian trials, collect the crystals, and beat
the final guide. The trailer includes editorial cuts and close-ups of that footage.
The title cards use the game's recorded starfield. No generated gameplay was used.
The fresh takes use the `polish-` filename prefix in `../test-results/trailer/`.
The five walking shots were subsequently rerecorded as `fluid-` takes using
continuous key holds. This preserves all six walking frames; the earlier recorder
released movement every 220 ms and repeatedly restarted the animation halfway
through its cycle. Walking telemetry and its runnable check are stored alongside
the raw takes (`python test-results/trailer/verify-walking.py`). Narration,
subtitles, soundtrack and the 60-second edit timing are unchanged.

Narration is a bright, anime-inspired synthetic female English voice, created
locally with [Kokoro](https://huggingface.co/hexgrad/Kokoro-82M) (`af_heart`, speed
0.95), with a gentle pitch lift (1.08) and cinematic pacing (tempo 0.94). Captions
are timed to this performance. Music and sound effects come from the repository's
existing `public/assets/audio` files. Typography uses
[Cinzel](https://github.com/google/fonts/tree/main/ofl/cinzel), with its license
included in `source/fonts/OFL.txt`.

The closing line uses the spoken alias “Koomer” (stressed “Koo,” /ˈkuːmɚ/), as
requested by Felipe. `source/narration.json` preserves this as `spoken_text`;
captions and title cards retain the correct spelling “Kummer.” The narration audio
and script are unchanged from the approved female-voice version.

The edit sources include the clean video edit, narration, soundtrack, caption
styling, script, and cut list. Full recorded takes remain in
`../test-results/trailer/`. Rebuild with `python trailer/source/render.py` from the
repository root; Python 3, FFmpeg (with libass), and ffprobe are required. The script
checks duration, video and audio formats, caption bounds, and full-file decoding.

The closing card uses a general play invitation because no public launch URL was
provided. To include one, create `source/launch-url.txt` containing the URL and
rerun the renderer.
