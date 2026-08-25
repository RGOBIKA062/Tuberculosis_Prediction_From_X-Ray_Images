CREATE DATABASE IF NOT EXISTS tuberculosis_detection;

USE tuberculosis_detection;

CREATE TABLE IF NOT EXISTS prediction_history (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    prediction VARCHAR(32) NOT NULL,
    confidence DECIMAL(5, 2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);
