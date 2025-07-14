"use client";

import { useState, useRef } from "react";
import Tesseract from "tesseract.js";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const startCamera = async () => {
    // const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    // if (videoRef.current) {
    //   videoRef.current.srcObject = stream;
    // }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { exact: "environment" } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      // fallback to default camera if rear not available
      console.warn("Rear camera not available, using default camera.");
      const fallbackStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = fallbackStream;
      }
    }
  };

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png");
  };

  const scanImage = async () => {
    const imageDataUrl = captureFrame();
    if (!imageDataUrl) return;
    setLoading(true);
    try {
      const result = await Tesseract.recognize(imageDataUrl, "eng");
      setText(result.data.text);
    } catch (err) {
      console.error("OCR error:", err);
      setText("Failed to recognize text.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-4">GSPro Score Scanner</h1>
      <video
        ref={videoRef}
        autoPlay
        className="rounded border border-gray-300 w-full max-w-md"
      />
      <canvas ref={canvasRef} className="hidden" />
      <div className="flex gap-4 mt-4">
        <button
          onClick={startCamera}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Start Camera
        </button>
        <button
          onClick={scanImage}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Scan Image
        </button>
      </div>
      {loading && <p className="mt-4 text-gray-600">Scanning...</p>}
      {text && (
        <pre className="mt-4 bg-white p-4 rounded shadow w-full max-w-xl overflow-auto">
          {text}
        </pre>
      )}
    </div>
  );
}
