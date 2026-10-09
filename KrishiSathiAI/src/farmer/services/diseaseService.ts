import { api } from "../../services/api";

export interface DiseasePrediction {
  disease: string;
  confidence: number;
}

export const detectPlantDisease = async (
  imageUri: string
): Promise<DiseasePrediction> => {
  const formData = new FormData();

  const filename =
    imageUri.split("/").pop()?.split("?")[0] || "leaf.jpg";

  const extension = filename.split(".").pop()?.toLowerCase();

  const mimeType =
    extension === "png"
      ? "image/png"
      : extension === "webp"
        ? "image/webp"
        : "image/jpeg";

  formData.append(
    "file",
    {
      uri: imageUri,
      name: filename,
      type: mimeType,
    } as any
  );

  const response = await api.post<DiseasePrediction>(
    "/disease/predict",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};