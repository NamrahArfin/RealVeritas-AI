import os
import hashlib

def get_hash(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        while chunk := f.read(8192):
            h.update(chunk)
    return h.hexdigest()

test_media_dir = r"N:\RealVeritas AI\test_media"
drive_dir = r"N:\RealVeritas AI\test_media_drive"

# Get hashes of files in test_media
test_media_hashes = {}
for f in os.listdir(test_media_dir):
    if f.endswith('.mp4'):
        p = os.path.join(test_media_dir, f)
        test_media_hashes[get_hash(p)] = f

# Check what category they belong to in drive_dir
for root, dirs, files in os.walk(drive_dir):
    for f in files:
        if f.endswith('.mp4'):
            p = os.path.join(root, f)
            h = get_hash(p)
            category = os.path.basename(root)
            if h in test_media_hashes:
                local_name = test_media_hashes[h]
                print(f"Local file: {local_name} --> Actual Category in Drive: {category} (Original Name: {f})")
