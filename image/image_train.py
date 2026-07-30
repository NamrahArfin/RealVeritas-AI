import os
import pandas as pd
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint

# Load merged dataset
df = pd.read_csv("datasets/final_train.csv")

print(df["label"].value_counts())

train_datagen = ImageDataGenerator(
    rescale=1./255,
    validation_split=0.2
)

train_generator = train_datagen.flow_from_dataframe(
    dataframe=df,
    x_col="file_name",
    y_col="label",
    target_size=(128, 128),
    batch_size=32,
    class_mode="raw",
    subset="training",
    shuffle=True
)

val_generator = train_datagen.flow_from_dataframe(
    dataframe=df,
    x_col="file_name",
    y_col="label",
    target_size=(128, 128),
    batch_size=32,
    class_mode="raw",
    subset="validation",
    shuffle=False
)

# CNN Model
model = tf.keras.Sequential([
    tf.keras.layers.Input(shape=(128,128,3)),

    tf.keras.layers.Conv2D(32,(3,3),activation="relu"),
    tf.keras.layers.MaxPooling2D(2,2),

    tf.keras.layers.Conv2D(64,(3,3),activation="relu"),
    tf.keras.layers.MaxPooling2D(2,2),

    tf.keras.layers.Conv2D(128,(3,3),activation="relu"),
    tf.keras.layers.MaxPooling2D(2,2),

    tf.keras.layers.Flatten(),

    tf.keras.layers.Dense(256,activation="relu"),
    tf.keras.layers.Dropout(0.5),

    tf.keras.layers.Dense(3,activation="softmax")
])

model.compile(
    optimizer="adam",
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)

model.summary()
print("Before Training Output Shape:", model.output_shape)

# Callbacks
early_stop = EarlyStopping(
    monitor="val_accuracy",
    patience=2,
    restore_best_weights=True
)

checkpoint = ModelCheckpoint(
    "image_detector_model.h5",
    monitor="val_accuracy",
    save_best_only=True,
    verbose=1
)

# Train
history = model.fit(
    train_generator,
    validation_data=val_generator,
    epochs=1,
    callbacks=[early_stop, checkpoint]
)

# Final Save
model.save("image_detector_model.h5")
print("After Save Output Shape:", model.output_shape)

print("Saved at:", os.path.abspath("image_detector_model.h5"))
print("Model Output Shape:", model.output_shape)
print("3-Class Model Saved Successfully!")