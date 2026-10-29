# Usage: python make_qr.py https://yourcafe.github.io/menu/ cafe-name
import sys, qrcode

url = sys.argv[1]
name = sys.argv[2] if len(sys.argv) > 2 else "menu"
qrcode.make(url, box_size=12, border=2).save(f"{name}_qr.png")
print(f"Saved {name}_qr.png")
