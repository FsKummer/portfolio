"""Render the 60-second trailer from recorded gameplay and the supplied voice stem.

Run from anywhere with Python 3 and ffmpeg/ffprobe installed.
Raw takes are in ../../test-results/trailer; no game code is changed.
"""
import concurrent.futures
import json
import subprocess
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = HERE.parent
ROOT = OUT.parent
RAW = ROOT / 'test-results/trailer'
CACHE = RAW / 'edit'
CACHE.mkdir(exist_ok=True)
EDIT = json.loads((HERE / 'edit.json').read_text())
LINES = json.loads((HERE / 'narration.json').read_text())
LENGTH = 60
GOLD = '&H007ECFE8&'


def run(args):
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', *map(str, args)], check=True)


def segment(item):
    index, clip = item
    duration = clip['duration']
    path = CACHE / f'{index:02d}.mp4'
    filters = ['setpts=PTS-STARTPTS', 'fps=30']
    if clip.get('kind') == 'title':
        filters += ['crop=782:440:249:0', 'scale=1920:1080:flags=neighbor',
                    'eq=brightness=-0.025:saturation=0.8', 'vignette=PI/5']
    else:
        if 'crop' in clip:
            filters.append('crop=' + ':'.join(map(str, clip['crop'])))
        filters += ['scale=1728:972:flags=neighbor',
                    'pad=1920:1080:96:24:color=0x030510',
                    'drawbox=x=95:y=23:w=1730:h=974:color=0xc7a86b@0.32:t=1']
    filters.append('setsar=1')
    if duration > 3:
        filters += [f'fade=t=in:st=0:d={0.65 if index in (0,len(EDIT)-1) else 0.10}',
                    f'fade=t=out:st={duration-(0.9 if index==len(EDIT)-1 else 0.10)}:d={0.9 if index==len(EDIT)-1 else 0.10}']
    run(['-ss', clip['in'], '-i', RAW / (clip['file'] + '.webm'), '-t', duration,
         '-vf', ','.join(filters), '-an', '-c:v', 'libx264', '-crf', '17',
         '-preset', 'fast', '-threads', '2', '-pix_fmt', 'yuv420p', '-r', '30', path])
    print(f'Rendered shot {index+1}/{len(EDIT)}', flush=True)
    return path


def ass_time(seconds):
    cs = round(seconds * 100)
    return f'{cs//360000}.{cs//6000%60:02d}.{cs//100%60:02d}.{cs%100:02d}'.replace('.', ':', 2)


events = []


def event(start, end, text, style='Subtitle', layer=1):
    events.append(f'Dialogue: {layer},{ass_time(start)},{ass_time(end)},{style},,0,0,0,,{text}')


def title(start, end, text, y, size, color=GOLD, spacing=4):
    event(start, end, rf'{{\an5\pos(960,{y})\fs{size}\fsp{spacing}\1c{color}\fad(450,500)\fscx104\fscy104\t(0,1500,\fscx100\fscy100)}}{text}', 'Title')


def ornament(start, end, y):
    event(start, end, rf'{{\an7\pos(615,{y})\p1\bord0\1c{GOLD}\alpha&H55&\fad(450,500)}}m 0 0 l 305 0 l 305 2 l 0 2 m 325 1 l 345 -10 l 365 1 l 345 12 m 385 0 l 690 0 l 690 2 l 385 2', 'Title', 0)


def captions():
    header = '''[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Subtitle,Cinzel,42,&H00E9F2F8,&H007ECFE8,&H00100603,&H99000000,1,0,0,0,100,100,1.2,0,1,1.5,0.5,5,100,100,22,1
Style: Title,Cinzel,90,&H007ECFE8,&H007ECFE8,&H00100603,&H99000000,1,0,0,0,100,100,5,0,1,0,0,5,80,80,30,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
'''
    highlights = ['CHOICE', 'YOU', "DEVELOPER'S STORY", 'WORLD', 'CRAFT', 'GUARDIANS',
                  'NEXT MOVE', 'THREE CRYSTALS', 'FINAL TRIAL', 'WORLD OF CODE', 'ADVENTURE']
    for line, phrase in zip(LINES, highlights):
        text = line['text'].upper().replace(phrase, rf'{{\1c{GOLD}}}{phrase}{{\1c&H00E9F2F8&}}')
        event(line['start'], line['end']+0.16, rf'{{\an5\pos(960,1038)\fad(80,140)\blur0.3}}{text}')
    title(0.6, 5.3, 'FELIPE KUMMER PRESENTS', 338, 27, spacing=7)
    title(0.85, 5.3, "A DEVELOPER'S STORY", 464, 76, '&H00E9F2F8&', 3)
    title(1.25, 5.3, 'YOUR ADVENTURE', 572, 106, spacing=5)
    ornament(1.3, 5.3, 681)
    title(1.65, 5.3, 'A PLAYABLE PORTFOLIO', 749, 28, '&H00E9F2F8&', 5)
    title(53.75, 59.7, 'FELIPE KUMMER', 448, 112, spacing=7)
    title(54.1, 59.7, 'ADVENTURE PORTFOLIO', 565, 39, '&H00E9F2F8&', 7)
    ornament(54.2, 59.7, 656)
    title(54.5, 59.7, 'PLAY THE ADVENTURE', 751, 40, spacing=4)
    url_path = HERE / 'launch-url.txt'
    closing = url_path.read_text().strip() if url_path.exists() else 'EXPLORE  /  BATTLE  /  DISCOVER'
    title(54.75, 59.7, closing, 830, 25, '&H00E9F2F8&', 2)
    (HERE / 'titles.ass').write_text(header + '\n'.join(events) + '\n')


def audio():
    sfx = ROOT / 'public/assets/audio/sfx'
    cues = [('battle_start.wav',5.5,.34), ('transition_door.wav',20.8,.25),
            ('battle_start.wav',27.4,.42), ('magic_cast.wav',27.55,.40),
            ('magic_impact.wav',28.05,.45), ('magic_cast.wav',31.75,.38),
            ('magic_impact.wav',32.31,.42), ('crystal_reward.wav',36.4,.42),
            ('crystal_reward.wav',38.0,.38), ('crystal_reward.wav',39.6,.42),
            ('battle_start.wav',41.2,.45), ('magic_cast.wav',42.0,.35),
            ('magic_impact.wav',42.65,.45), ('attack_hit.wav',51.45,.35),
            ('attack_hit.wav',51.9,.35), ('final_unlock.wav',53.5,.58)]
    args = ['-ss',16,'-i',ROOT/'public/assets/audio/music/final-boss-the-world-awaits.mp3',
            '-i',HERE/'narration.wav']
    filters = ['[0:a]atrim=duration=60,asetpts=PTS-STARTPTS,loudnorm=I=-20:TP=-3:LRA=9,aresample=48000,aformat=channel_layouts=stereo,afade=t=in:d=2.0,afade=t=out:st=57.5:d=2.5[music]',
               '[1:a]aformat=channel_layouts=stereo,asplit=2[voice][duck]',
               '[music][duck]sidechaincompress=threshold=0.025:ratio=4:attack=12:release=550[bed]']
    labels = ['[bed]','[voice]']
    for i,(file,start,gain) in enumerate(cues,2):
        args += ['-i',sfx/file]
        filters.append(f'[{i}:a]volume={gain},adelay={round(start*1000)}:all=1[fx{i}]')
        labels.append(f'[fx{i}]')
    filters.append(''.join(labels)+f'amix=inputs={len(labels)}:duration=longest:normalize=0,atrim=duration=60,loudnorm=I=-14:TP=-1:LRA=9,aresample=48000[out]')
    run([*args,'-filter_complex',';'.join(filters),'-map','[out]','-c:a','pcm_s24le',HERE/'soundtrack.wav'])


def verify():
    video = OUT/'portfolio-launch-trailer.mp4'
    info = json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(video)]))
    v = next(s for s in info['streams'] if s['codec_type']=='video')
    a = next(s for s in info['streams'] if s['codec_type']=='audio')
    assert (v['width'],v['height'],v['r_frame_rate']) == (1920,1080,'30/1')
    assert v['sample_aspect_ratio'] == '1:1'
    assert abs(float(info['format']['duration'])-LENGTH)<0.1
    assert a['codec_name']=='aac' and a['channels']==2 and v['codec_name']=='h264'
    assert not any(s['codec_type']=='subtitle' for s in info['streams']), 'Subtitles are already burned in'
    assert not list(OUT.glob(video.stem+'*.srt')), 'An adjacent SRT would duplicate the burned-in subtitles'
    assert all(0 <= x['start'] < x['end'] < LENGTH for x in LINES)
    run(['-i',video,'-f','null','-'])
    print('Verified: 60 seconds, 1920x1080, 30 fps, H.264/AAC, all frames decode, captions fit.')


if __name__ == '__main__':
    assert abs(sum(x['duration'] for x in EDIT)-LENGTH)<0.001
    assert all((RAW/(x['file']+'.webm')).exists() for x in EDIT), 'Missing recorded gameplay take'
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        segments = list(pool.map(segment, enumerate(EDIT)))
    manifest = CACHE/'concat.txt'
    manifest.write_text(''.join(f"file '{x}'\n" for x in segments))
    run(['-f','concat','-safe','0','-i',manifest,'-c','copy',HERE/'gameplay-edit.mp4'])
    captions()
    audio()
    run(['-i',HERE/'gameplay-edit.mp4','-i',HERE/'soundtrack.wav',
         '-vf',f"ass='{HERE/'titles.ass'}':fontsdir='{HERE/'fonts'}'",'-map','0:v','-map','1:a',
         '-c:v','libx264','-preset','medium','-crf','18','-threads','4',
         '-c:a','aac','-b:a','256k','-ar','48000','-pix_fmt','yuv420p',
         '-t','60','-movflags','+faststart','-metadata','title=Felipe Kummer - Adventure Portfolio | Launch Trailer',
         OUT/'portfolio-launch-trailer.mp4'])
    verify()
