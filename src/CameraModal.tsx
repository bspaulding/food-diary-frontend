import type { Component } from "solid-js";
import { createSignal, createEffect, onCleanup } from "solid-js";
import type { NutritionItemAttrs } from "./Api";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onImport: (nutritionData: Partial<NutritionItemAttrs>) => void;
  accessToken: string;
};

// Helper to get a numeric value from API response, supporting both camelCase and snake_case keys
const getNumericValue = (
  data: Record<string, unknown>,
  key: string
): number => {
  const value = data[key];
  return typeof value === "number" ? value : 0;
};

const CameraModal: Component<Props> = (props) => {
  let videoRef: HTMLVideoElement | undefined;
  let canvasRef: HTMLCanvasElement | undefined;
  let streamRef: MediaStream | null = null;
  const [capturedImage, setCapturedImage] = createSignal<Blob | null>(null);
  const [isUploading, setIsUploading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef = stream;
      if (videoRef) {
        videoRef.srcObject = stream;
      }
    } catch (err) {
      let errorMessage = "Unable to access camera.";
      if (err instanceof DOMException) {
        if (
          err.name === "NotAllowedError" ||
          err.name === "PermissionDeniedError"
        ) {
          errorMessage =
            "Camera permission was denied. Please allow camera access to scan nutrition labels.";
        } else if (
          err.name === "NotFoundError" ||
          err.name === "DevicesNotFoundError"
        ) {
          errorMessage =
            "No camera found. Please ensure your device has a camera.";
        } else if (
          err.name === "NotReadableError" ||
          err.name === "TrackStartError"
        ) {
          errorMessage =
            "Camera is in use by another application. Please close other apps using the camera.";
        }
      }
      setError(errorMessage);
      console.error("Error accessing camera:", err);
    }
  };

  const stopCamera = () => {
    if (streamRef) {
      streamRef.getTracks().forEach((track) => track.stop());
      streamRef = null;
    }
  };

  // Use createEffect to watch for isOpen changes
  createEffect(() => {
    if (props.isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
  });

  onCleanup(() => {
    stopCamera();
  });

  const captureAndUpload = async () => {
    if (!videoRef || !canvasRef) return;

    setIsUploading(true);
    setError(null);

    try {
      // Draw the current video frame to the canvas
      const context = canvasRef.getContext("2d");
      if (!context) {
        throw new Error("Could not get canvas context");
      }

      canvasRef.width = videoRef.videoWidth;
      canvasRef.height = videoRef.videoHeight;
      context.drawImage(videoRef, 0, 0);

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvasRef!.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to create image blob"));
            }
          },
          "image/jpeg",
          0.95
        );
      });

      setCapturedImage(blob);

      // Create form data and upload
      const formData = new FormData();
      formData.append("image", blob, "capture.jpg");

      async function retry(times: number, fn: () => Promise<any>) {
        let i = 0;
        let result;
        while (i < times) {
          try {
            result = await fn();
            return result;
          } catch (e) {
            result = e;
          }
          i++;
        }
        if (i >= times) {
          throw new Error(`Too many retries. Last result was ${result}.`);
        }

        return result;
      }

      const response = await retry(3, async () => {
        const response = await fetch("/labeller/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${props.accessToken}`,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }

        return response;
      });

      const { image: data } = await response.json();

      // Map the response to nutrition item attributes
      const nutritionData: Partial<NutritionItemAttrs> = {
        description:
          typeof data.description === "string" ? data.description : "",
        calories: getNumericValue(data, "calories"),
        totalFatGrams: getNumericValue(data, "total_fat_grams"),
        cholesterolMilligrams: getNumericValue(data, "cholesterol_mg"),
        sodiumMilligrams: getNumericValue(data, "sodium_mg"),
        totalCarbohydrateGrams: getNumericValue(data, "total_carbohydrates_g"),
        dietaryFiberGrams: getNumericValue(data, "dietary_fiber_g"),
        totalSugarsGrams: getNumericValue(data, "total_sugars_g"),
        addedSugarsGrams: getNumericValue(data, "added_sugars_g"),
        proteinGrams: getNumericValue(data, "protein_g"),
      };

      props.onImport(nutritionData);
      stopCamera();
      props.onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
      console.error("Error uploading image:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    stopCamera();
    props.onClose();
  };

  if (!props.isOpen) {
    return null;
  }

  return (
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div class="relative w-full h-full flex flex-col bg-black">
        {/* Header */}
        <div class="flex justify-between items-center p-4 bg-slate-800">
          <h2 class="text-white text-lg font-semibold">Scan Nutrition Label</h2>
          <button
            class="text-white text-2xl"
            onClick={handleClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Camera View */}
        <div class="flex-1 flex items-center justify-center overflow-hidden">
          {error() ? (
            <p class="text-red-500 text-center px-4">{error()}</p>
          ) : capturedImage() ? (
            <img src={window.URL.createObjectURL(capturedImage())} />
          ) : (
            <video
              ref={videoRef}
              autoplay
              playsinline
              class="max-w-full max-h-full object-contain"
            />
          )}
          <canvas ref={canvasRef} class="hidden" />
        </div>

        {/* Footer with Import Button */}
        <div class="p-4 bg-slate-800 flex justify-center">
          <button
            class="bg-indigo-600 text-white py-3 px-6 text-lg font-semibold rounded-lg flex items-center gap-2 disabled:opacity-50"
            onClick={captureAndUpload}
            disabled={isUploading() || !!error()}
          >
            {isUploading() ? (
              "Uploading..."
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  class="w-6 h-6"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10.5 3.75a6 6 0 0 0-5.98 6.496A5.25 5.25 0 0 0 6.75 20.25H18a4.5 4.5 0 0 0 2.206-8.423 3.75 3.75 0 0 0-4.133-4.303A6.001 6.001 0 0 0 10.5 3.75Zm2.03 5.47a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 1 0 1.06 1.06l1.72-1.72v4.94a.75.75 0 0 0 1.5 0v-4.94l1.72 1.72a.75.75 0 1 0 1.06-1.06l-3-3Z"
                    clip-rule="evenodd"
                  />
                </svg>
                Import Label
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CameraModal;
