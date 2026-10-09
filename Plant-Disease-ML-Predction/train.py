from torchvision.datasets import ImageFolder
from torchvision import models, transforms
import torch.nn as nn
import torch
from torch.utils.data import DataLoader


# -----------------------------
# 1. Image preprocessing
# -----------------------------

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor()
])


# -----------------------------
# 2. Load dataset
# -----------------------------

dataset = ImageFolder(
    "dataset",
    transform=transform
)

print("Classes:", dataset.classes)
print("Number of images:", len(dataset))


# -----------------------------
# 3. Use ALL images for training
# -----------------------------

train_dataset = dataset

print("Training images:", len(train_dataset))


# -----------------------------
# 4. Create DataLoader
# -----------------------------

train_loader = DataLoader(
    train_dataset,
    batch_size=2,
    shuffle=True
)


# -----------------------------
# 5. Load ResNet18
# -----------------------------

model = models.resnet18(weights="DEFAULT")


# Change final layer to 3 classes
model.fc = nn.Linear(
    model.fc.in_features,
    3
)

print("ResNet18 loaded!")


# -----------------------------
# 6. Loss function
# -----------------------------

criterion = nn.CrossEntropyLoss()


# -----------------------------
# 7. Optimizer
# -----------------------------

optimizer = torch.optim.Adam(
    model.parameters(),
    lr=0.001
)


# -----------------------------
# 8. Train model
# -----------------------------

epochs = 5

for epoch in range(epochs):

    model.train()

    total_loss = 0

    for images, labels in train_loader:

        # Prediction
        outputs = model(images)

        # Calculate error
        loss = criterion(outputs, labels)

        # Clear old gradients
        optimizer.zero_grad()

        # Backpropagation
        loss.backward()

        # Update model
        optimizer.step()

        total_loss += loss.item()

    print(
        f"Epoch {epoch + 1}/{epochs}, "
        f"Loss: {total_loss:.4f}"
    )


# -----------------------------
# 9. Save trained model
# -----------------------------

torch.save(
    model.state_dict(),
    "model/plant_disease_model.pth"
)

print("Model saved successfully!")