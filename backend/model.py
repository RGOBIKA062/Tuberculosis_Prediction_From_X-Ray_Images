from pathlib import Path

import timm
import torch


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
