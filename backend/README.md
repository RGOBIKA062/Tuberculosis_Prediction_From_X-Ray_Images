# Tuberculosis Detection Backend

This folder contains the Flask backend for the existing React frontend.

## Current status

The setup is ready, but model inference is intentionally not implemented yet. The backend must receive:

- `models/Best_CoAtNet_Model.pth`
- Notebook 07 model-loading code
- Notebook 07 validation/test transform and data configuration
- The trained class order, such as `Normal, Tuberculosis`

The preprocessing and checkpoint format will not be guessed.

## Setup

From `backend/`:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
py -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Set the MySQL values in `.env`, then create the history table:

```powershell
mysql -u your_mysql_user -p < schema.sql
```

Place the supplied model at:

```text
backend/models/Best_CoAtNet_Model.pth
```

## Run

```powershell
py app.py
```

Health check: `GET http://127.0.0.1:5000/api/health`

Prediction endpoint: `POST http://127.0.0.1:5000/api/predict`

The prediction endpoint currently returns HTTP 503 until the real CoAtNet-0 inference implementation is added.

## Security and data scope

The planned history table stores only prediction, confidence, and creation time. It does not store patient details or X-ray files. Never commit `.env` or model checkpoints.
