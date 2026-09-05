import os

# =========================
# DATASET PATHS
# =========================

REALAI_AI = r"C:\Users\HP\Downloads\archive (3)\ai"
REALAI_REAL = r"C:\Users\HP\Downloads\archive (3)\real"

FF_ROOT = r"C:\Users\HP\Downloads\archive (2)\FaceForensics++_C23"

VIF_FAKE = r"C:\Users\HP\Downloads\ViF-CoT-4K\source_videos\source_videos\kinetics\fake"
VIF_REAL = r"C:\Users\HP\Downloads\ViF-CoT-4K\source_videos\source_videos\kinetics\real"


VIDEO_EXTENSIONS = (".mp4", ".avi", ".mov", ".mkv", ".webm")


def count_videos(folder):
    count = 0

    if not os.path.exists(folder):
        return 0

    for root, dirs, files in os.walk(folder):
        for file in files:
            if file.lower().endswith(VIDEO_EXTENSIONS):
                count += 1

    return count


# =========================
# REALAI
# =========================

realai_generated = count_videos(REALAI_AI)
realai_authentic = count_videos(REALAI_REAL)


# =========================
# FACEFORENSICS++
# =========================

ff_authentic = count_videos(
    os.path.join(FF_ROOT, "original")
)

ff_manipulated_folders = [
    "Deepfakes",
    "Face2Face",
    "FaceShifter",
    "FaceSwap",
    "NeuralTextures",
    "DeepFakeDetection"
]

ff_manipulated = 0

print("\n===== FACEFORENSICS++ =====")

for folder in ff_manipulated_folders:
    path = os.path.join(FF_ROOT, folder)
    count = count_videos(path)

    print(f"{folder}: {count}")
    ff_manipulated += count


# =========================
# VIF-COT-4K
# =========================

vif_authentic = count_videos(VIF_REAL)
vif_generated = count_videos(VIF_FAKE)


# =========================
# FINAL TOTALS
# =========================

total_authentic = realai_authentic + ff_authentic + vif_authentic

total_generated = realai_generated + vif_generated

total_manipulated = ff_manipulated


print("\n================================")
print("FINAL VIDEO DATASET COUNTS")
print("================================")

print("Authentic       :", total_authentic)
print("AI Generated    :", total_generated)
print("AI Manipulated  :", total_manipulated)

print("================================")
