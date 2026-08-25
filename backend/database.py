import os

import mysql.connector
from mysql.connector import Error


INSERT_PREDICTION = """
    INSERT INTO prediction_history (prediction, confidence)
    VALUES (%s, %s)
"""


class PredictionDatabaseError(RuntimeError):
    pass


def save_prediction(prediction: str, confidence: float) -> None:
    connection = None
    cursor = None
    try:
        connection = mysql.connector.connect(
            host=os.getenv("MYSQL_HOST", "127.0.0.1"),
            port=int(os.getenv("MYSQL_PORT", "3306")),
            user=os.getenv("MYSQL_USER"),
            password=os.getenv("MYSQL_PASSWORD"),
            database=os.getenv("MYSQL_DATABASE"),
        )
        cursor = connection.cursor()
        cursor.execute(INSERT_PREDICTION, (prediction, confidence))
        connection.commit()
    except Error as error:
        raise PredictionDatabaseError("Could not save prediction history.") from error
    finally:
        if cursor is not None:
            cursor.close()
        if connection is not None and connection.is_connected():
            connection.close()
