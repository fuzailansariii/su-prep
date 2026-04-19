// Allowed file types for upload
export const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
];
// File size in bytes
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

// File size in megabytes
export const MAX_FILE_SIZE_IN_MB = MAX_FILE_SIZE / (1024 * 1024);

// Error messages
export const FILE_UPLOAD_MESSAGE = {
  SIZE_ERROR: "File exceeds maximum size limit",
  SIZE_ERROR_PDF: "PDF file must be less than 30MB",
  SIZE_ERROR_IMAGE: "Image file must be less than 10MB",
  TYPE_ERROR: "Invalid file type",
  TYPE_ERROR_PDF: "Only PDF files are allowed",
  TYPE_ERROR_IMAGE: "Only JPG, PNG images are allowed",
  UPLOAD_ERROR: "Failed to upload file",
  FETCH_ERROR: "Failed to fetch files",
} as const;

export interface ValidateResult {
  valid: boolean;
  error?: string;
  previewUrl?: string;
}

export const validateFile = (
  file: File,
  maxSize: number = MAX_FILE_SIZE,
): ValidateResult => {
  if (!file) {
    return { valid: false, error: "No file provided" };
  }

  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return { valid: false, error: FILE_UPLOAD_MESSAGE.TYPE_ERROR_IMAGE };
  }

  if (file.size > maxSize) {
    return { valid: false, error: FILE_UPLOAD_MESSAGE.SIZE_ERROR_IMAGE };
  }

  return {
    valid: true,
    previewUrl: URL.createObjectURL(file),
  };
};