from fastapi import FastAPI, UploadFile, File
from PIL import Image

import torch
from torchvision import models, transforms
import torch.nn as nn

import io


# --------------------------------
# FastAPI
# --------------------------------

app = FastAPI()


# --------------------------------
# Classes
# --------------------------------

classes = [
    "Early_Blight",
    "Healthy",
    "Late_Blight"
]


# --------------------------------
# Load ResNet18
# --------------------------------

model = models.resnet18(weights=None)

model.fc = nn.Linear(
    model.fc.in_features,
    3
)


# --------------------------------
# Load trained model
# --------------------------------

model.load_state_dict(
    torch.load(
        "model/plant_disease_model.pth",
        map_location=torch.device("cpu")
    )
)

model.eval()


# --------------------------------
# Image preprocessing
# --------------------------------

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor()
])


# --------------------------------
# Prediction API
# --------------------------------

@app.post("/predict")
async def predict(file: UploadFile = File(...)):

    # Read image from request
    contents = await file.read()

    # Convert uploaded image to PIL Image
    image = Image.open(
        io.BytesIO(contents)
    ).convert("RGB")

    # Convert image to tensor
    image = transform(image)

    # Add batch dimension
    image = image.unsqueeze(0)

    # Prediction
    with torch.no_grad():
        output = model(image)

    # Convert output to probabilities
    probabilities = torch.softmax(
        output,
        dim=1
    )

    # Get predicted class
    prediction = torch.argmax(
        output,
        dim=1
    )

    # Get confidence
    confidence = probabilities[0][
        prediction.item()
    ].item() * 100

    # Get class name
    predicted_class = classes[
        prediction.item()
    ]

    # Return response
    return {
        "disease": predicted_class,
        "confidence": round(confidence, 2)
    }