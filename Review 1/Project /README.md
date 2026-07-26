Project Overview:

This project presents an AI-based system for the automatic detection of Tuberculosis (TB) from chest X-ray images. The proposed system combines image preprocessing, lung segmentation, deep learning classification, explainable AI, and automated report generation to assist in TB diagnosis.

Objective:

Detect Tuberculosis from chest X-ray images.
Improve image quality using preprocessing techniques.
Focus the model on lung regions through segmentation.
Classify images using the Enhanced CoAtNet model.
Provide visual explanation using Grad-CAM.
Generate an automated diagnostic report.

Dataset: 

The project uses two publicly available datasets:
Shenzhen Chest X-ray Dataset
Montgomery Chest X-ray Dataset

Dataset Statistics:

Total Images : 800
Normal Images : 406
Tuberculosis Images : 394

Project Workflow:

Dataset Collection
        ↓
Exploratory Data Analysis (EDA)
        ↓
Image Preprocessing (Resize + CLAHE)
        ↓
Lung Segmentation (TorchXRayVision PSPNet)
        ↓
Data Augmentation
        ↓
Enhanced CoAtNet Model
        ↓
Model Training
        ↓
Model Evaluation
        ↓
Grad-CAM Visualization
        ↓
Automated Diagnostic Report

Technologies Used:

Python
PyTorch
TorchXRayVision
TIMM Library
OpenCV
NumPy
Pandas
Matplotlib
Scikit-learn

Image Preprocessing:

Image Resize (224 × 224)
CLAHE (Contrast Limited Adaptive Histogram Equalization)

Lung Segmentation:

A pretrained TorchXRayVision PSPNet model is used to segment the lung region, removing unnecessary background before classification.

Data Augmentation:

The following augmentation techniques were applied to improve model generalization:
Rotation
Horizontal Flip
Zoom
Brightness Adjustment

Deep Learning Model:

The project uses Enhanced CoAtNet, a hybrid architecture that combines:
Convolutional Neural Networks (CNN)
Transformer Networks
CNN extracts local image features, while the Transformer captures global relationships across the chest X-ray.

Model Performance:
Metric	        Value
Validation Accuracy	85.83%
Test Accuracy	77.50%
Precision	83.33%
Recall	67.80%
F1-Score	74.77%
AUC Score	0.8852

Explainable AI:

Grad-CAM is used to visualize the image regions that contribute to the model's prediction, improving model interpretability.

Automated Diagnostic Report:

The system generates a diagnostic report containing:

Predicted Class
Confidence Score
Clinical Interpretation
Disclaimer

Conclusion:

The proposed system successfully integrates image preprocessing, lung segmentation, Enhanced CoAtNet classification, Grad-CAM visualization, and automated diagnostic report generation to assist in the early detection of Tuberculosis from chest X-ray images.

Future Work:
Improve lesion localization using advanced explainability techniques.
Train on larger and more diverse datasets.
Develop a web-based clinical decision support system.
Validate the model using real-world clinical data.
