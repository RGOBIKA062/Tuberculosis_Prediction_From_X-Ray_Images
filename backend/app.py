import os
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS


BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")


def create_app() -> Flask:
    app = Flask(__name__)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    @app.get("/api/health")
    def health():
        return jsonify({"success": True, "status": "backend-ready"})

    @app.post("/api/predict")
    def predict():
        return (
            jsonify(
                {
                    "success": False,
                    "error": "Model setup is pending. Place Best_CoAtNet_Model.pth in backend/models/ and provide Notebook 07 inference details.",
                }
            ),
            503,
        )

    return app


app = create_app()


if __name__ == "__main__":
    app.run(
        host=os.getenv("FLASK_HOST", "127.0.0.1"),
        port=int(os.getenv("FLASK_PORT", "5000")),
        debug=os.getenv("FLASK_DEBUG", "false").lower() == "true",
    )
