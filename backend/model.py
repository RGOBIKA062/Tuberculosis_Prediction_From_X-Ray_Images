from pathlib import Path

import timm
import torch
from PIL import Image


MODEL_NAME = "coatnet_0_rw_224"
CLASS_NAMES = ("Drug-Sensitive TB (DS-TB)", "Drug-Resistant TB (DR-TB)")
DEVICE = torch.device("cpu")
MODELS_DIR = Path(__file__).resolve().parent / "models"
CXR_MODEL_PATH = MODELS_DIR / "Notebook10C_Run2_Best_Validation_ROC_AUC.pth"
GENOMIC_MODEL_PATH = MODELS_DIR / "Notebook13_Cell7_Best_Validation_ROC_AUC.pth"
FUSION_MODEL_PATH = MODELS_DIR / "Notebook15_Cell4_Best_Multimodal_Validation_ROC_AUC.pth"

import torch.nn as nn

# --- Genomic Model ---
# Automatically reconstructed from Notebook13_Cell7_Best_Validation_ROC_AUC.pth state_dict
class GenomicTransformer(nn.Module):
    def __init__(self):
        super().__init__()
        self.token_embedding = nn.Embedding(78, 128)
        self.position_embedding = nn.Embedding(74, 128)
        
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=128,
            nhead=4,
            dim_feedforward=256,
            dropout=0.2,
            batch_first=True
        )
        self.encoder = nn.TransformerEncoder(encoder_layer, num_layers=2)
        
        self.classifier = nn.Sequential(
            nn.LayerNorm(128),
            nn.Linear(128, 2)
        )
    
    def forward_features(self, x):
        # x: (batch_size, seq_len=74)
        positions = torch.arange(0, x.size(1), device=x.device).unsqueeze(0)
        x = self.token_embedding(x) + self.position_embedding(positions)
        x = self.encoder(x)
        x = x.mean(dim=1)
        x = self.classifier[0](x) # LayerNorm
        return x

    def forward(self, x):
        features = self.forward_features(x)
        return self.classifier[1](features)

# --- Fusion Model ---
# Based on Notebook 15 specification
class MultimodalFusion(nn.Module):
    def __init__(self):
        super().__init__()
        self.cxr_projection = nn.Sequential(
            nn.Linear(768, 256),
            nn.ReLU()
        )
        self.genomic_projection = nn.Sequential(
            nn.Linear(128, 128),
            nn.ReLU()
        )
        self.fusion = nn.Sequential(
            nn.Linear(384, 128),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(128, 2)
        )

    def forward(self, cxr_emb, gen_emb):
        cxr_feat = self.cxr_projection(cxr_emb)
        gen_feat = self.genomic_projection(gen_emb)
        combined = torch.cat((cxr_feat, gen_feat), dim=1)
        out = self.fusion(combined)
        return out

def load_all_models():
    # 1. Load CXR Model
    cxr_model = timm.create_model(MODEL_NAME, pretrained=False, num_classes=2)
    if CXR_MODEL_PATH.is_file():
        try:
            ckpt = torch.load(CXR_MODEL_PATH, map_location=DEVICE, weights_only=True)
            state_dict = ckpt['model_state_dict'] if 'model_state_dict' in ckpt else ckpt
            cxr_model.load_state_dict(state_dict)
        except Exception as e:
            print(f"Warning: Could not load CXR state_dict completely: {e}")
    cxr_model.to(DEVICE)
    cxr_model.eval()

    # 2. Load Genomic Model
    genomic_model = GenomicTransformer()
    if GENOMIC_MODEL_PATH.is_file():
        try:
            ckpt = torch.load(GENOMIC_MODEL_PATH, map_location=DEVICE, weights_only=True)
            state_dict = ckpt['model_state_dict'] if 'model_state_dict' in ckpt else ckpt
            genomic_model.load_state_dict(state_dict)
        except Exception as e:
            print(f"Warning: Could not load Genomic state_dict: {e}")
    genomic_model.to(DEVICE)
    genomic_model.eval()

    # 3. Load Fusion Model
    fusion_model = MultimodalFusion()
    if FUSION_MODEL_PATH.is_file():
        try:
            ckpt = torch.load(FUSION_MODEL_PATH, map_location=DEVICE, weights_only=True)
            state_dict = ckpt['model_state_dict'] if 'model_state_dict' in ckpt else ckpt
            fusion_model.load_state_dict(state_dict)
        except Exception as e:
            print(f"Warning: Could not load Fusion state_dict: {e}")
    fusion_model.to(DEVICE)
    fusion_model.eval()

    return cxr_model, genomic_model, fusion_model

def create_inference_transform(model: torch.nn.Module):
    data_config = timm.data.resolve_model_data_config(model)
    return timm.data.create_transform(**data_config, is_training=False)

def preprocess_image(image: Image.Image, transform) -> torch.Tensor:
    image = image.convert("RGB")
    return transform(image).unsqueeze(0).to(DEVICE)

def preprocess_genomic(mutations_data) -> torch.Tensor:
    # Placeholder logic to parse genomic mutations into 74-token sequence
    # For now, return a dummy tensor of shape (1, 74) with valid token IDs (0-77)
    return torch.zeros((1, 74), dtype=torch.long).to(DEVICE)

