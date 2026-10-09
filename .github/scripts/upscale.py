"""Amplía fotos con Real-ESRGAN (x4plus) en CPU, por teselas, y guarda PNG.

Uso: python upscale.py <salida> <entrada1> [<entrada2> ...]
"""
import sys, pathlib, numpy as np, torch
from PIL import Image
from spandrel import ModelLoader

out = pathlib.Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=True)
model = ModelLoader().load_from_file("RealESRGAN_x4plus.pth").eval()
scale, TILE, PAD = model.scale, 256, 16
torch.set_num_threads(4)

for src in sys.argv[2:]:
    img = np.asarray(Image.open(src).convert("RGB"), dtype=np.float32) / 255.0
    h, w, _ = img.shape
    res = np.zeros((h * scale, w * scale, 3), dtype=np.float32)
    for y in range(0, h, TILE):
        for x in range(0, w, TILE):
            y0, x0 = max(y - PAD, 0), max(x - PAD, 0)
            y1, x1 = min(y + TILE + PAD, h), min(x + TILE + PAD, w)
            t = torch.from_numpy(img[y0:y1, x0:x1]).permute(2, 0, 1)[None]
            with torch.no_grad():
                o = model(t)[0].permute(1, 2, 0).clamp(0, 1).numpy()
            oy, ox = (y - y0) * scale, (x - x0) * scale
            th, tw = min(TILE, h - y) * scale, min(TILE, w - x) * scale
            res[y * scale:y * scale + th, x * scale:x * scale + tw] = o[oy:oy + th, ox:ox + tw]
    name = pathlib.Path(src).stem + ".png"
    Image.fromarray((res * 255).round().astype(np.uint8)).save(out / name)
    print(src, f"{w}x{h} -> {w*scale}x{h*scale}", flush=True)
