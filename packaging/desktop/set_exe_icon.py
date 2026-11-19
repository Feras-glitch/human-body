#!/usr/bin/env python3
"""يستبدل أيقونة electron.exe بأيقونة التطبيق دون Wine أو rcedit.

الطريقة: الكتابة في مكان خانات RT_ICON الموجودة نفسها (لا يتغير حجم أي قسم):
16/32/48 بصيغة DIB ذات 32 بت، و256 بصيغة PNG مضغوطة لتسع الخانة الرابعة.
الاستعمال: python3 set_exe_icon.py <electron.exe> <icon-1024.png> <pefile_dir>
"""
import io, struct, sys
from PIL import Image

exe, png_path, pefile_dir = sys.argv[1:4]
sys.path.insert(0, pefile_dir)
import pefile  # noqa: E402

src = Image.open(png_path).convert('RGBA')


def dib(size):
    im = src.resize((size, size), Image.LANCZOS)
    hdr = struct.pack('<IiiHHIIiiII', 40, size, size * 2, 1, 32, 0, 0, 0, 0, 0, 0)
    px = bytearray()
    for y in range(size - 1, -1, -1):
        for x in range(size):
            r, g, b, a = im.getpixel((x, y))
            px += bytes((b, g, r, a))
    row = ((size + 31) // 32) * 4
    mask = bytes(row * size)
    return hdr + bytes(px) + mask


def png(size, limit):
    for colors in (256, 192, 128, 96, 64):
        im = src.resize((size, size), Image.LANCZOS)
        q = im.quantize(colors=colors, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE)
        buf = io.BytesIO(); q.save(buf, 'PNG', optimize=True)
        if buf.tell() <= limit:
            return buf.getvalue()
    raise SystemExit('PNG 256 لا يسع الخانة')


pe = pefile.PE(exe, fast_load=True)
pe.parse_data_directories(directories=[pefile.DIRECTORY_ENTRY['IMAGE_DIRECTORY_ENTRY_RESOURCE']])
icons, group = {}, None
for t in pe.DIRECTORY_ENTRY_RESOURCE.entries:
    if t.id == pefile.RESOURCE_TYPE['RT_ICON']:
        for e in t.directory.entries:
            icons[e.id] = e.directory.entries[0].data.struct
    elif t.id == pefile.RESOURCE_TYPE['RT_GROUP_ICON']:
        group = t.directory.entries[0].directory.entries[0].data.struct

ids = sorted(icons)
if len(ids) < 4 or group is None:
    raise SystemExit(f'بنية أيقونة غير متوقعة: {ids}')
plan = [(ids[0], 16, 'dib'), (ids[1], 32, 'dib'), (ids[2], 48, 'dib'), (ids[3], 256, 'png')]
entries = []
for rid, size, kind in plan:
    slot = icons[rid]
    data = dib(size) if kind == 'dib' else png(size, slot.Size)
    if len(data) > slot.Size:
        raise SystemExit(f'الأيقونة {size} أكبر من خانتها')
    off = pe.get_offset_from_rva(slot.OffsetToData)
    pe.set_bytes_at_offset(off, data + bytes(slot.Size - len(data)))
    slot.Size = len(data)
    w = 0 if size == 256 else size
    entries.append(struct.pack('<BBBBHHIH', w, w, 0, 0, 1, 32, len(data), rid))
# أي خانات زائدة تبقى كما هي لكنها لا تُذكر في المجموعة
grp = struct.pack('<HHH', 0, 1, len(entries)) + b''.join(entries)
if len(grp) > group.Size:
    raise SystemExit('مجموعة الأيقونات لا تسع')
goff = pe.get_offset_from_rva(group.OffsetToData)
pe.set_bytes_at_offset(goff, grp + bytes(group.Size - len(grp)))
group.Size = len(grp)
pe.write(exe)
print('icon set:', ', '.join(f'{s}px' for _, s, _ in plan))
