"use client";
import React, { useId, useRef, useState, DragEvent } from "react";
import { validateFile } from "@/utils/validate-file";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UploadCloud, X } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";

export default function UploadFile({
  onUploadComplete,
  onClear,
}: {
  onUploadComplete?: (url: string) => void;
  onClear?: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setError(null);
    setPreviewUrl(null);

    const result = validateFile(file);

    if (!result.valid) {
      setError(result.error || "An error occurred");
      setUploadedFile(null);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setUploadedFile(file);
    if (result.previewUrl) {
      setPreviewUrl(result.previewUrl);
    }

    // Automatically trigger upload
    await handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    setProgress(0);
    setError(null);
    try {
      const { data: authRes } = await axios.get("/api/upload-auth");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("publicKey", authRes.publicKey);
      formData.append("signature", authRes.signature);
      formData.append("expire", authRes.expire);
      formData.append("token", authRes.token);
      formData.append("fileName", file.name);
      formData.append("folder", "/mock-tests/thumbnail");
      formData.append("tags", "mock-test,thumbnail");

      const uploadRes = await axios.post(
        "https://upload.imagekit.io/api/v1/files/upload",
        formData,
        {
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total,
              );
              setProgress(percentCompleted);
            }
          },
        },
      );
      // Handle success here
      if (onUploadComplete) onUploadComplete(uploadRes.data.url);
      console.log("Uploaded:", uploadRes.data);
    } catch (err: any) {
      console.error("Upload error:", err);
      if (err.response?.status === 401) {
        setError("Unauthorized: You do not have permission to upload files.");
      } else {
        setError(
          err.response?.data?.message ||
            "Failed to upload image. Please try again.",
        );
      }
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const clearFile = () => {
    setUploadedFile(null);
    setPreviewUrl(null);
    setError(null);
    if (onClear) onClear();
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="w-full max-w-md">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-4",
          isDragOver
            ? "border-brand-primary bg-brand-primary/10 scale-[1.02]"
            : "border-slate-300 hover:border-brand-primary/50 bg-white",
          uploadedFile &&
            "border-solid border-slate-200 bg-slate-50 cursor-default",
        )}
        onClick={() => !uploadedFile && inputRef.current?.click()}
      >
        <Input
          type="file"
          ref={inputRef}
          id={inputId}
          onChange={handleFileChange}
          accept="image/jpeg,image/png,image/webp,image/jpg"
          className="hidden"
        />

        {previewUrl ? (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black/5 flex items-center justify-center">
            <img
              src={previewUrl}
              alt="Preview"
              className={cn(
                "w-full h-full object-cover transition-opacity",
                uploading && "opacity-50",
              )}
            />
            {uploading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm transition-all">
                <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                <p className="text-white font-medium mt-3 text-sm">
                  Uploading... {progress}%
                </p>
                <div className="w-2/3 max-w-[200px] h-1.5 bg-white/20 rounded-full mt-3 overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : (
              <Button
                variant="secondary"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  clearFile();
                }}
                className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-sm bg-white hover:bg-slate-100 text-slate-800 border border-slate-200"
                aria-label="Remove image"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="p-4 bg-slate-100 rounded-full text-slate-600 transition-colors">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-slate-700 font-heading font-bold">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-slate-500 mt-1.5 font-body">
                PNG, JPG or WEBP (max. 10MB)
              </p>
            </div>
          </>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-500 mt-3 text-center font-medium">
          {error}
        </p>
      )}
    </div>
  );
}
