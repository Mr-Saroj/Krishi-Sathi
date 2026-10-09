package com.krishisathi.dto;

public class DiseasePredictionResponse {

    private String disease;
    private double confidence;

    public DiseasePredictionResponse() {
    }

    public String getDisease() {
        return disease;
    }

    public void setDisease(String disease) {
        this.disease = disease;
    }

    public double getConfidence() {
        return confidence;
    }

    public void setConfidence(double confidence) {
        this.confidence = confidence;
    }
}