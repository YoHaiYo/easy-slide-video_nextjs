"use client";
import { useState, useRef } from "react";

export default function MusicUpload({
  musicFile,
  setMusicFile,
  onNext,
  onPrev,
}) {
  const [customDuration, setCustomDuration] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const audioRef = useRef(null);

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith("audio/")) {
      const audio = new Audio();
      audio.onloadedmetadata = () => {
        setMusicFile({
          file,
          name: file.name,
          preview: URL.createObjectURL(file),
          duration: audio.duration,
          customDuration: audio.duration, // 기본값은 원본 길이
        });
        setCustomDuration(audio.duration);
      };
      audio.src = URL.createObjectURL(file);
    }
  };

  const handleDurationChange = (e) => {
    const newDuration = parseFloat(e.target.value);
    setCustomDuration(newDuration);
    if (musicFile) {
      setMusicFile({
        ...musicFile,
        customDuration: newDuration,
      });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const removeMusic = () => {
    if (musicFile) {
      URL.revokeObjectURL(musicFile.preview);
    }
    setMusicFile(null);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        <i className="fas fa-music mr-2 text-green-500"></i>
        Add Music
      </h3>

      {/* 음악 파일 업로드 영역 */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
          isDragging
            ? "border-green-500 bg-green-50"
            : "border-gray-300 hover:border-green-400"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <i className="fas fa-music text-4xl text-gray-400 mb-4"></i>
        <p className="text-gray-600 mb-2">
          Drag and drop music file here or click to upload
        </p>
        <p className="text-sm text-gray-500">Supports MP3, WAV, M4A files</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>

      {/* 업로드된 음악 파일 정보 */}
      {musicFile && (
        <div className="mt-6">
          <h4 className="text-md font-medium text-gray-700 mb-3">
            Selected Music
          </h4>
          <div className="bg-gray-50 rounded-lg p-4 border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <i className="fas fa-file-audio text-2xl text-green-500"></i>
                <div>
                  <p className="font-medium text-gray-800">{musicFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(musicFile.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={removeMusic}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>

            {/* 음악 길이 조절 */}
            <div className="mt-4 border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <i className="fas fa-clock mr-1"></i>
                Music Duration
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="10"
                  max={Math.floor(musicFile.duration)}
                  step="1"
                  value={customDuration || musicFile.duration}
                  onChange={handleDurationChange}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="text-center">
                  <span className="text-lg font-semibold text-green-600">
                    {Math.floor(customDuration || musicFile.duration)}s
                  </span>
                  <p className="text-xs text-gray-500">
                    Original: {Math.floor(musicFile.duration)}s
                  </p>
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>10s</span>
                <span>{Math.floor(musicFile.duration)}s</span>
              </div>
            </div>

            {/* 음악 재생 컨트롤 */}
            <div className="mt-4">
              <audio
                ref={audioRef}
                src={musicFile.preview}
                controls
                className="w-full"
                onLoadedMetadata={(e) => {
                  // 음악 길이 정보를 표시할 수 있음
                }}
              >
                Your browser does not support the audio element.
              </audio>
            </div>
          </div>
        </div>
      )}

      {/* 음악 없이 진행 옵션 */}
      <div className="mt-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <i className="fas fa-info-circle text-blue-500 mt-1"></i>
            <div>
              <p className="text-sm text-blue-800 font-medium">
                Continue without music
              </p>
              <p className="text-xs text-blue-600 mt-1">
                You can create a slideshow with images only if you don't add
                music.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 버튼들 */}
      <div className="mt-6 flex justify-between">
        <button
          onClick={onPrev}
          className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Previous
        </button>
        <button
          onClick={onNext}
          className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200"
        >
          Next Step
          <i className="fas fa-arrow-right ml-2"></i>
        </button>
      </div>
    </div>
  );
}
