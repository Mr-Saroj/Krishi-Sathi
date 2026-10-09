import { useState } from "react";
import {
  detectPlantDisease,
  DiseasePrediction,
} from "../services/diseaseService";

export const useDiseaseDetection = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] =
    useState<DiseasePrediction | null>(null);
  const [error, setError] = useState<string | null>(null);

  const detectDisease = async (imageUri: string) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const prediction = await detectPlantDisease(imageUri);

      setResult(prediction);

      return prediction;
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.message ||
        "Unable to detect the plant disease.";

      setError(message);

      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
  };

  return {
    loading,
    result,
    error,
    detectDisease,
    reset,
  };
};