import os
import pandas as pd

# -------------------------
# Existing Dataset
# -------------------------

base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
old_df = pd.read_csv(os.path.join(base_dir, "dataset", "train.csv"))

records = []

for _, row in old_df.iterrows():

    records.append({
        "file_name": os.path.join(base_dir, "dataset", row["file_name"]),
        "label": int(row["label"])
    })

# -------------------------
# FaceForensics Dataset
# -------------------------

base = r"C:\Users\HP\Downloads\archive (1)\FF++C32-Frames"

mapping = {
    "Original": 0,
    "Deepfakes": 2,
    "Face2Face": 2,
    "FaceShifter": 2,
    "FaceSwap": 2,
    "NeuralTextures": 2
}

for folder, label in mapping.items():

    folder_path = os.path.join(base, folder)

    for file in os.listdir(folder_path):

        if file.lower().endswith((".jpg", ".jpeg", ".png")):

            records.append({
                "file_name": os.path.join(folder_path, file),
                "label": label
            })

# -------------------------
# Save Final CSV
# -------------------------

df = pd.DataFrame(records)

print(df["label"].value_counts())

df.to_csv(os.path.join(base_dir, "dataset", "final_train.csv"), index=False)

print("Done")