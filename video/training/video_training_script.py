import os
import random
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.preprocessing.image import img_to_array, load_img
from tensorflow.keras.utils import Sequence
from sklearn.model_selection import train_test_split

# =========================
# CONFIGURATION & SETTINGS
# =========================

base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATASET_PATH = os.path.join(base_dir, "video_frames")

IMG_SIZE = 128
FRAMES_PER_VIDEO = 10
BATCH_SIZE = 8
EPOCHS = 5

CLASS_NAMES = [
    "Authentic",
    "AI_Generated",
    "AI_Manipulated"
]

print("TensorFlow version:", tf.__version__)
print("Dataset path:", DATASET_PATH)
print("Classes:", CLASS_NAMES)


# =========================
# DATA GENERATOR CLASS
# =========================

class VideoFrameGenerator(Sequence):

    def __init__(
        self,
        video_folders,
        labels,
        batch_size=8,
        shuffle=True,
        **kwargs
    ):
        super().__init__(**kwargs)
        self.video_folders = video_folders
        self.labels = labels
        self.batch_size = batch_size
        self.shuffle = shuffle
        self.indices = np.arange(len(self.video_folders))
        self.on_epoch_end()

    def __len__(self):
        return int(np.ceil(len(self.video_folders) / self.batch_size))

    def __getitem__(self, index):
        batch_indices = self.indices[
            index * self.batch_size:
            (index + 1) * self.batch_size
        ]

        batch_videos = [
            self.video_folders[i]
            for i in batch_indices
        ]

        batch_labels = [
            self.labels[i]
            for i in batch_indices
        ]

        X = np.zeros(
            (
                len(batch_videos),
                FRAMES_PER_VIDEO,
                IMG_SIZE,
                IMG_SIZE,
                3
            ),
            dtype=np.float32
        )

        for i, video_folder in enumerate(batch_videos):
            frame_files = sorted([
                f for f in os.listdir(video_folder)
                if f.lower().endswith(".jpg")
            ])

            frame_indices = np.linspace(
                0,
                len(frame_files) - 1,
                FRAMES_PER_VIDEO,
                dtype=int
            )

            for j, frame_index in enumerate(frame_indices):
                frame_path = os.path.join(
                    video_folder,
                    frame_files[frame_index]
                )

                img = load_img(
                    frame_path,
                    target_size=(IMG_SIZE, IMG_SIZE)
                )
                img = img_to_array(img) / 255.0

                X[i, j] = img

        return X, np.array(batch_labels, dtype=np.int32)

    def on_epoch_end(self):
        if self.shuffle:
            np.random.shuffle(self.indices)


# =========================
# CNN + LSTM VIDEO MODEL
# =========================

cnn = models.Sequential([
    layers.Input(shape=(IMG_SIZE, IMG_SIZE, 3)),

    layers.Conv2D(32, (3, 3), activation="relu", padding="same"),
    layers.BatchNormalization(),
    layers.MaxPooling2D((2, 2)),

    layers.Conv2D(64, (3, 3), activation="relu", padding="same"),
    layers.BatchNormalization(),
    layers.MaxPooling2D((2, 2)),

    layers.Conv2D(128, (3, 3), activation="relu", padding="same"),
    layers.BatchNormalization(),
    layers.MaxPooling2D((2, 2)),

    layers.Conv2D(256, (3, 3), activation="relu", padding="same"),
    layers.BatchNormalization(),
    layers.GlobalAveragePooling2D(),

    layers.Dropout(0.3)
])

video_model = models.Sequential([
    layers.Input(
        shape=(
            FRAMES_PER_VIDEO,
            IMG_SIZE,
            IMG_SIZE,
            3
        )
    ),

    layers.TimeDistributed(cnn),

    layers.LSTM(128, return_sequences=True),
    layers.Dropout(0.3),

    layers.LSTM(64),

    layers.Dense(64, activation="relu"),
    layers.Dropout(0.3),

    layers.Dense(
        len(CLASS_NAMES),
        activation="softmax"
    )
])

video_model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.0001),
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)

video_model.summary()


# =========================
# COLLECT DATASET FOLDERS
# =========================

video_folders = []
labels = []

VIDEOS_PER_CLASS = 1229

for label, class_name in enumerate(CLASS_NAMES):
    class_path = os.path.join(
        DATASET_PATH,
        class_name
    )

    class_videos = []

    for video_name in os.listdir(class_path):
        video_path = os.path.join(
            class_path,
            video_name
        )

        if os.path.isdir(video_path):
            frame_files = [
                f for f in os.listdir(video_path)
                if f.lower().endswith(".jpg")
            ]

            if len(frame_files) >= FRAMES_PER_VIDEO:
                class_videos.append(video_path)

    print(
        class_name,
        "available:",
        len(class_videos)
    )

    random.seed(42)

    if len(class_videos) >= VIDEOS_PER_CLASS:
        selected_videos = random.sample(
            class_videos,
            VIDEOS_PER_CLASS
        )
    else:
        selected_videos = class_videos

    for video_path in selected_videos:
        video_folders.append(video_path)
        labels.append(label)

print("\nTotal balanced video sequences:", len(video_folders))
print("Total labels:", len(labels))

print("\nFinal class distribution:")
for i, name in enumerate(CLASS_NAMES):
    print(name, "=", labels.count(i))

print("\nClass mapping:")
for i, name in enumerate(CLASS_NAMES):
    print(i, "=", name)


# =========================
# TRAIN / VALIDATION SPLIT
# =========================

train_folders, val_folders, train_labels, val_labels = train_test_split(
    video_folders,
    labels,
    test_size=0.2,
    random_state=42,
    stratify=labels
)

print("\nTraining videos:", len(train_folders))
print("Validation videos:", len(val_folders))


# =========================
# CREATE TRAINING GENERATORS
# =========================

train_generator = VideoFrameGenerator(
    train_folders,
    train_labels,
    batch_size=BATCH_SIZE,
    shuffle=True
)

val_generator = VideoFrameGenerator(
    val_folders,
    val_labels,
    batch_size=BATCH_SIZE,
    shuffle=False
)

print("\nGenerators created successfully.")
print("Training batches:", len(train_generator))
print("Validation batches:", len(val_generator))


# =========================
# TRAIN THE VIDEO MODEL
# =========================

print("\nStarting video model training...")

callbacks = [
    tf.keras.callbacks.EarlyStopping(
        monitor="val_accuracy",
        patience=2,
        restore_best_weights=True
    ),

    tf.keras.callbacks.ReduceLROnPlateau(
        monitor="val_loss",
        factor=0.5,
        patience=1,
        min_lr=1e-6
    )
]

history = video_model.fit(
    train_generator,
    validation_data=val_generator,
    epochs=EPOCHS,
    callbacks=callbacks
)

print("\nTraining completed.")


# =========================
# SAVE TRAINED VIDEO MODEL
# =========================

MODEL_PATH = os.path.join(base_dir, "video", "models", "video_detector_model.keras")

# Ensure output directory exists
os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)

video_model.save(MODEL_PATH)

print("\nVideo model saved successfully!")
print("Model path:", MODEL_PATH)