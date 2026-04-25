import { FileCategory } from "./file";

export const EXTENSION_MAP: Record<string, FileCategory> = {
  // Images
  jpg: "image",
  jpeg: "image",
  png: "image",
  gif: "image",
  bmp: "image",
  svg: "image",

  // Vidéos
  mp4: "video",
  avi: "video",
  mkv: "video",
  webm: "video",

  // Audios
  mp3: "audio",
  wav: "audio",
  ogg: "audio",

  // Documents
  pdf: "document",
  docx: "document",
  xlsx: "document",
  pptx: "document",
  txt: "document",
  md: "document",

  // Code
  js: "code",
  ts: "code",
  tsx: "code",
  html: "code",
  css: "code",
  json: "code",
};
