import cv2
import os

# Input and output folders
INPUT_ROOT = r"C:\Users\HP\Desktop\RealVeritas-AI\video_dataset"
OUTPUT_ROOT = r"C:\Users\HP\Desktop\RealVeritas-AI\video_frames"

# Extract 10 frames from each video
FRAMES_PER_VIDEO = 10

VIDEO_EXTENSIONS = (".mp4", ".avi", ".mov", ".mkv", ".webm")


def extract_frames(video_path, output_folder):
    cap = cv2.VideoCapture(video_path)

    if not cap.isOpened():
        print("Could not open:", video_path)
        return 0

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    if total_frames <= 0:
        cap.release()
        return 0

    os.makedirs(output_folder, exist_ok=True)

    saved = 0

    # Pick frames evenly throughout the video
    frame_positions = [
        int(i * (total_frames - 1) / (FRAMES_PER_VIDEO - 1))
        for i in range(FRAMES_PER_VIDEO)
    ]

    for position in frame_positions:
        cap.set(cv2.CAP_PROP_POS_FRAMES, position)

        success, frame = cap.read()

        if success:
            frame_path = os.path.join(
                output_folder,
                f"frame_{saved:02d}.jpg"
            )

            cv2.imwrite(frame_path, frame)
            saved += 1

    cap.release()

    return saved


def process_dataset():
    total_videos = 0
    total_frames = 0

    for class_name in [
        "Authentic",
        "AI_Generated",
        "AI_Manipulated"
    ]:

        input_folder = os.path.join(INPUT_ROOT, class_name)
        output_class_folder = os.path.join(
            OUTPUT_ROOT,
            class_name
        )

        print(f"\n===== {class_name} =====")

        for root, dirs, files in os.walk(input_folder):

            for file in files:

                if not file.lower().endswith(VIDEO_EXTENSIONS):
                    continue

                video_path = os.path.join(root, file)

                video_name = os.path.splitext(file)[0]

                video_output_folder = os.path.join(
                    output_class_folder,
                    video_name
                )

                saved = extract_frames(
                    video_path,
                    video_output_folder
                )

                total_videos += 1
                total_frames += saved

        print("Videos processed:", total_videos)
        print("Frames saved so far:", total_frames)

    print("\n================================")
    print("FRAME EXTRACTION COMPLETE")
    print("================================")
    print("Total videos:", total_videos)
    print("Total frames:", total_frames)
    print("Frames saved at:", OUTPUT_ROOT)


if __name__ == "__main__":
    process_dataset()
