from fastapi import FastAPI, UploadFile, File
from PIL import Image

import torch
from torchvision import models, transforms
import torch.nn as nn

import io


# --------------------------------
# 1. Create FastAPI application
# --------------------------------

app = FastAPI()


# --------------------------------
# 2. Classes
# --------------------------------

classes = [
    "Early_Blight",
    "Healthy",
    "Late_Blight"
]


# --------------------------------
# 3. Load ResNet18
# --------------------------------

model = models.resnet18(weights=None)

model.fc = nn.Linear(
    model.fc.in_features,
    3
)


# --------------------------------
# 4. Load trained model
# --------------------------------

model.load_state_dict(
    torch.load(
        "model/plant_disease_model.pth",
        map_location=torch.device("cpu")
    )
)

model.eval()


# --------------------------------
# 5. Image preprocessing
# --------------------------------

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor()
])


# --------------------------------
# 6. Prediction API
# --------------------------------

@app.post("/predict")
async def predict(file: UploadFile = File(...)):

    # Read image sent in HTTP request
    contents = await file.read()

    # Convert bytes to PIL Image
    image = Image.open(
        io.BytesIO(contents)
    ).convert("RGB")

    # Transform image
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

    # Get highest probability
    confidence, prediction = torch.max(
        probabilities,
        dim=1
    )

    predicted_class = classes[
        prediction.item()
    ]

    confidence_value = confidence.item() * 100

    # Return JSON
    return {
        "disease": predicted_class,
        "confidence": round(confidence_value, 2)
    }