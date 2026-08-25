import os
from io import BytesIO
from pathlib import Path

from dotenv import load_dotenv
import torch
from flask import Flask, jsonify, request
from flask_cors import CORS
from PIL import Image, UnidentifiedImageError

from model import CLASS_NAMES, create_inference_transform, load_model, preprocess_image


BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")


def create_app() -> Flask:
    app = Flask(__name__)
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    app.config["MODEL"] = load_model()
    app.config["INFERENCE_TRANSFORM"] = create_inference_transform(app.config["MODEL"])

    @app.get("/api/health")
    def health():
        return jsonify({"success": True, "status": "backend-ready", "model": "loaded"})

    @app.post("/api/predict")
    def predict():
        uploaded_file = request.files.get("image")
        if uploaded_file is None or not uploaded_file.filename:
            return jsonify({"success": False, "error": "No image uploaded."}), 400

        try:
            image = Image.open(BytesIO(uploaded_file.read()))
            image.load()
            input_tensor = preprocess_image(
                image,
                app.config["INFERENCE_TRANSFORM"],
            )
        except (UnidentifiedImageError, OSError):
            return jsonify({"success": False, "error": "Invalid or corrupted image."}), 400

        try:
            with torch.no_grad():
                probabilities = torch.softmax(app.config["MODEL"](input_tensor), dim=1)[0]
            class_index = int(torch.argmax(probabilities).item())
            confidence = float(probabilities[class_index].item() * 100)
            return jsonify(
                {
                    "success": True,
                    "prediction": CLASS_NAMES[class_index],
                    "confidence": round(confidence, 2),
                }
            )
        except (RuntimeError, ValueError, IndexError):
            return jsonify({"success": False, "error": "Prediction failed."}), 500

    return app


app = create_app()


if __name__ == "__main__":
    app.run(
        host=os.getenv("FLASK_HOST", "127.0.0.1"),
        port=int(os.getenv("FLASK_PORT", "5000")),
        debug=os.getenv("FLASK_DEBUG", "false").lower() == "true",
    )
