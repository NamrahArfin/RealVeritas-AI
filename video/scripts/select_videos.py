import os
import random
import shutil

# ============================================================
# SOURCE PATHS
# ============================================================

REALAI_AI = r"C:\Users\HP\Downloads\archive (3)\ai"
REALAI_REAL = r"C:\Users\HP\Downloads\archive (3)\real"

FF_ROOT = r"C:\Users\HP\Downloads\archive (2)\FaceForensics++_C23"

VIF_FAKE = r"C:\Users\HP\Downloads\ViF-CoT-4K\source_videos\source_videos\kinetics\fake"
VIF_REAL = r"C:\Users\HP\Downloads\ViF-CoT-4K\source_videos\source_videos\kinetics\real"


# ============================================================
# OUTPUT PATH
# ============================================================

base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUTPUT_ROOT = os.path.join(base_dir, "video_dataset")

AUTHENTIC_OUT = os.path.join(OUTPUT_ROOT, "Authentic")
GENERATED_OUT = os.path.join(OUTPUT_ROOT, "AI_Generated")
MANIPULATED_OUT = os.path.join(OUTPUT_ROOT, "AI_Manipulated")


VIDEO_EXTENSIONS = (".mp4", ".avi", ".mov", ".mkv", ".webm")

TARGET_PER_CLASS = 1229


# ============================================================
# FUNCTIONS
# ============================================================

def get_videos(folder):
    videos = []

    if not os.path.exists(folder):
        print("NOT FOUND:", folder)
        return videos

    for root, dirs, files in os.walk(folder):
        for file in files:
            if file.lower().endswith(VIDEO_EXTENSIONS):
                videos.append(os.path.join(root, file))

    return videos


def select_random(videos, count):
    random.seed(42)

    if len(videos) <= count:
        return videos

    return random.sample(videos, count)


def copy_videos(videos, output_folder, prefix):
    os.makedirs(output_folder, exist_ok=True)

    for i, source in enumerate(videos, start=1):
        extension = os.path.splitext(source)[1]

        destination = os.path.join(
            output_folder,
            f"{prefix}_{i:04d}{extension}"
        )

        shutil.copy2(source, destination)


# ============================================================
# AUTHENTIC
# ============================================================

print("\nCollecting Authentic videos...")

authentic_videos = (
    get_videos(REALAI_REAL)
    + get_videos(VIF_REAL)
)

print("Authentic available:", len(authentic_videos))

authentic_selected = select_random(
    authentic_videos,
    TARGET_PER_CLASS
)

print("Authentic selected:", len(authentic_selected))


# ============================================================
# AI GENERATED
# ============================================================

print("\nCollecting AI Generated videos...")

generated_videos = (
    get_videos(REALAI_AI)
    + get_videos(VIF_FAKE)
)

print("AI Generated available:", len(generated_videos))

generated_selected = select_random(
    generated_videos,
    TARGET_PER_CLASS
)

print("AI Generated selected:", len(generated_selected))


# ============================================================
# AI MANIPULATED
# ============================================================

print("\nCollecting AI Manipulated videos...")

manipulated_folders = [
    "Deepfakes",
    "Face2Face",
    "FaceShifter",
    "FaceSwap",
    "NeuralTextures",
    "DeepFakeDetection"
]

manipulated_videos = []

for folder in manipulated_folders:
    path = os.path.join(FF_ROOT, folder)

    folder_videos = get_videos(path)

    print(folder, ":", len(folder_videos))

    manipulated_videos.extend(folder_videos)


print("AI Manipulated available:", len(manipulated_videos))

manipulated_selected = select_random(
    manipulated_videos,
    TARGET_PER_CLASS
)

print("AI Manipulated selected:", len(manipulated_selected))


# ============================================================
# COPY SELECTED VIDEOS
# ============================================================

print("\nCopying selected videos...")

copy_videos(
    authentic_selected,
    AUTHENTIC_OUT,
    "authentic"
)

copy_videos(
    generated_selected,
    GENERATED_OUT,
    "generated"
)

copy_videos(
    manipulated_selected,
    MANIPULATED_OUT,
    "manipulated"
)


# ============================================================
# FINAL RESULT
# ============================================================

print("\n================================")
print("VIDEO DATASET PREPARATION DONE")
print("================================")

print("Authentic      :", len(authentic_selected))
print("AI Generated   :", len(generated_selected))
print("AI Manipulated :", len(manipulated_selected))

print("\nDataset created at:")
print(OUTPUT_ROOT)
