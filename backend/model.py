from pathlib import Path

import timm
import torch
from PIL import Image


MODEL_NAME = "coatnet_0_rw_224"
CLASS_NAMES = ("Normal", "Tuberculosis")
DEVICE = torch.device("cpu")
MODEL_PATH = Path(__file__).resolve().parent / "models" / "Best_CoAtNet_Model.pth"


def load_model() -> torch.nn.Module:
    if not MODEL_PATH.is_file():
        raise FileNotFoundError(f"Model checkpoint not found: {MODEL_PATH}")

    model = timm.create_model(
        MODEL_NAME,
        pretrained=False,
        num_classes=len(CLASS_NAMES),
    )
    checkpoint = torch.load(MODEL_PATH, map_location=DEVICE, weights_only=True)
    model.load_state_dict(checkpoint)
    model.to(DEVICE)
    model.eval()
    return model


def create_inference_transform(model: torch.nn.Module):
    data_config = timm.data.resolve_model_data_config(model)
    return timm.data.create_transform(**data_config, is_training=False)


def preprocess_image(image: Image.Image, transform) -> torch.Tensor:
    image = image.convert("RGB")
    return transform(image).unsqueeze(0).to(DEVICE)
