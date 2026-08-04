import os
import pandas as pd
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout, Input
from tensorflow.keras.models import Model
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau
from sklearn.utils.class_weight import compute_class_weight

# ---------------------------------------------------------
# 1. Load Dataset
# ---------------------------------------------------------
csv_path = "../datasets/final_train.csv" if os.path.exists("../datasets/final_train.csv") else "datasets/final_train.csv"
if not os.path.exists(csv_path):
    csv_path = "final_train.csv"

df = pd.read_csv(csv_path)

print("Class Distribution in Dataset:")
print(df["label"].value_counts())

# Ensure string labels if using flow_from_dataframe or keep raw ints
df["label_str"] = df["label"].astype(str)

# ---------------------------------------------------------
# 2. Data Generators with Augmentation (for WhatsApp/Compression handling)
# ---------------------------------------------------------
train_datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=15,
    width_shift_range=0.1,
    height_shift_range=0.1,
    brightness_range=[0.8, 1.2],
    horizontal_flip=True,
    validation_split=0.2
)

train_generator = train_datagen.flow_from_dataframe(
    dataframe=df,
    x_col="file_name",
    y_col="label_str",
    target_size=(128, 128),
    batch_size=32,
    class_mode="categorical",
    subset="training",
    shuffle=True
)

val_generator = train_datagen.flow_from_dataframe(
    dataframe=df,
    x_col="file_name",
    y_col="label_str",
    target_size=(128, 128),
    batch_size=32,
    class_mode="categorical",
    subset="validation",
    shuffle=False
)

# ---------------------------------------------------------
# 3. Class Weights Calculation
# ---------------------------------------------------------
classes = np.unique(df["label"])
weights = compute_class_weight(class_weight="balanced", classes=classes, y=df["label"])
class_weight_dict = dict(zip(range(len(classes)), weights))
print("Computed Class Weights:", class_weight_dict)

# ---------------------------------------------------------
# 4. MobileNetV2 Transfer Learning Architecture
# ---------------------------------------------------------
base_model = MobileNetV2(
    input_shape=(128, 128, 3),
    include_top=False,
    weights="imagenet"
)
base_model.trainable = True

# Freeze initial layers, fine-tune top layers
for layer in base_model.layers[:-30]:
    layer.trainable = False

inputs = Input(shape=(128, 128, 3))
x = base_model(inputs, training=False)
x = GlobalAveragePooling2D()(x)
x = Dense(256, activation="relu")(x)
x = Dropout(0.4)(x)
outputs = Dense(3, activation="softmax")(x)

model = Model(inputs, outputs)

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=1e-4),
    loss="categorical_crossentropy",
    metrics=["accuracy"]
)

model.summary()

# ---------------------------------------------------------
# 5. Training Callbacks
# ---------------------------------------------------------
save_model_path = os.path.join(os.path.dirname(__file__), "image_detector_model.h5")

callbacks = [
    EarlyStopping(
        monitor="val_accuracy",
        patience=3,
        restore_best_weights=True
    ),
    ModelCheckpoint(
        save_model_path,
        monitor="val_accuracy",
        save_best_only=True,
        verbose=1
    ),
    ReduceLROnPlateau(
        monitor="val_loss",
        factor=0.5,
        patience=2,
        min_lr=1e-6,
        verbose=1
    )
]

# ---------------------------------------------------------
# 6. Train Model
# ---------------------------------------------------------
print("Starting Training with MobileNetV2 Transfer Learning...")
history = model.fit(
    train_generator,
    validation_data=val_generator,
    epochs=5,
    class_weight=class_weight_dict,
    callbacks=callbacks
)

# Final Save
model.save(save_model_path)
print("Updated High-Accuracy Model Saved Successfully at:", save_model_path)