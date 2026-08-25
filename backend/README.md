# Tuberculosis Detection Backend

This folder contains the Flask backend for the existing React frontend.

## Current status

The backend can load the supplied CoAtNet-0 checkpoint, predict from an uploaded image, and save successful predictions to MySQL. Frontend API wiring is a separate task.

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

Send the image as a `multipart/form-data` field named `image`. Successful responses contain `prediction` (`Normal` or `Tuberculosis`) and the model probability as `confidence`. The result is saved to `prediction_history` after inference succeeds.

## Security and data scope

The history table stores only prediction, confidence, and creation time. It does not store patient details or X-ray files. Never commit `.env` or model checkpoints.
