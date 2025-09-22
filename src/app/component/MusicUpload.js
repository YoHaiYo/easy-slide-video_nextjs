"use client";
import { useState, useRef, useEffect } from "react";

export default function MusicUpload({
  musicFiles,
  setMusicFiles,
  onNext,
  onPrev,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const audioRefs = useRef({});
  const [totalDuration, setTotalDuration] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // 총 음악 길이 계산
  useEffect(() => {
    const total = musicFiles.reduce((sum, music) => sum + (music.customDuration || music.duration), 0);
    setTotalDuration(total);
    
    // 30분(1800초) 초과 시 경고 표시
    if (total > 1800) {
      setShowWarning(true);
      setShowModal(true);
    } else {
      setShowWarning(false);
    }
  }, [musicFiles]);

  const handleFileSelect = (files) => {
    const audioFiles = Array.from(files).filter((file) =>
      file.type.startsWith("audio/")
    );

    const newMusicFiles = audioFiles.map((file, index) => {
      const audio = new Audio();
      const id = Date.now() + index;
      
      return new Promise((resolve) => {
        audio.onloadedmetadata = () => {
          resolve({
            id,
            file,
            name: file.name,
            preview: URL.createObjectURL(file),
            duration: audio.duration,
            customDuration: audio.duration,
            order: musicFiles.length + index + 1,
          });
        };
        audio.onerror = () => {
          resolve(null);
        };
        audio.src = URL.createObjectURL(file);
      });
    });

    Promise.all(newMusicFiles).then((resolvedFiles) => {
      const validFiles = resolvedFiles.filter(file => file !== null);
      const updatedFiles = [...musicFiles, ...validFiles];
      
      // 30분 제한 적용
      let finalFiles = updatedFiles;
      let currentTotal = updatedFiles.reduce((sum, music) => sum + (music.customDuration || music.duration), 0);
      
      while (currentTotal > 1800 && finalFiles.length > 0) {
        // 마지막 파일 제거
        const removedFile = finalFiles.pop();
        if (removedFile) {
          URL.revokeObjectURL(removedFile.preview);
        }
        currentTotal = finalFiles.reduce((sum, music) => sum + (music.customDuration || music.duration), 0);
      }
      
      setMusicFiles(finalFiles);
    });
  };

  const handleDurationChange = (id, newDuration) => {
    const updatedFiles = musicFiles.map(music => 
      music.id === id 
        ? { ...music, customDuration: newDuration }
        : music
    );
    setMusicFiles(updatedFiles);
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
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    handleFileSelect(files);
  };

  const removeMusic = (id) => {
    const musicToRemove = musicFiles.find((music) => music.id === id);
    if (musicToRemove) {
      URL.revokeObjectURL(musicToRemove.preview);
    }
    setMusicFiles(musicFiles.filter((music) => music.id !== id));
  };

  const moveMusic = (id, direction) => {
    const currentIndex = musicFiles.findIndex((music) => music.id === id);
    if (currentIndex === -1) return;

    const newMusicFiles = [...musicFiles];
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex >= 0 && targetIndex < newMusicFiles.length) {
      [newMusicFiles[currentIndex], newMusicFiles[targetIndex]] = [
        newMusicFiles[targetIndex],
        newMusicFiles[currentIndex],
      ];
      setMusicFiles(newMusicFiles);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div>
      {/* 30분 초과 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <i className="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
              <h3 className="text-lg font-semibold text-gray-800">
                음악 길이 제한
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              음악의 총 길이가 30분을 초과했습니다. 
              <br />
              <span className="font-semibold text-red-600">
                최대 30분까지만 업로드 가능합니다.
              </span>
            </p>
            <div className="bg-red-50 p-3 rounded-lg mb-4">
              <p className="text-sm text-red-700">
                현재 총 길이: <span className="font-bold">{formatDuration(totalDuration)}</span>
                <br />
                제한 길이: <span className="font-bold">30:00</span>
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

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
          Drag and drop music files here or click to upload
        </p>
        <p className="text-sm text-gray-500">Supports MP3, WAV, M4A files</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="audio/*"
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>

      {/* 총 음악 길이 표시 */}
      {musicFiles.length > 0 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              <i className="fas fa-clock mr-1"></i>
              Total Music Duration
            </span>
            <span className={`text-lg font-bold ${
              totalDuration > 1800 ? "text-red-600" : "text-green-600"
            }`}>
              {formatDuration(totalDuration)}
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {musicFiles.length} music files • {Math.floor(totalDuration / 60)}m {Math.floor(totalDuration % 60)}s
          </div>
        </div>
      )}

      {/* 30분 초과 경고 */}
      {showWarning && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <i className="fas fa-exclamation-triangle text-red-500 mt-1"></i>
            <div>
              <p className="text-sm text-red-800 font-medium">
                Music duration exceeds 30 minutes
              </p>
              <p className="text-xs text-red-600 mt-1">
                The last music file has been automatically removed to keep the total duration under 30 minutes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 업로드된 음악 파일 목록 */}
      {musicFiles.length > 0 && (
        <div className="mt-6">
          <h4 className="text-md font-medium text-gray-700 mb-3">
            Uploaded Music ({musicFiles.length})
          </h4>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {musicFiles.map((music, index) => (
              <div
                key={music.id}
                className="flex items-center p-3 bg-gray-50 rounded-lg border"
              >
                <i className="fas fa-file-audio text-2xl text-green-500 mr-3"></i>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {music.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    Order: {index + 1} | Size: {(music.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  
                  {/* 음악 길이 조절 */}
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="range"
                        min="10"
                        max={Math.floor(music.duration)}
                        step="1"
                        value={music.customDuration || music.duration}
                        onChange={(e) => handleDurationChange(music.id, parseFloat(e.target.value))}
                        className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <span className="text-xs text-green-600 min-w-[3rem] text-center">
                        {Math.floor(music.customDuration || music.duration)}s
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>10s</span>
                      <span>Original: {Math.floor(music.duration)}s</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-1 ml-2">
                  <button
                    onClick={() => moveMusic(music.id, "up")}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-green-500 disabled:opacity-30"
                  >
                    <i className="fas fa-chevron-up"></i>
                  </button>
                  <button
                    onClick={() => moveMusic(music.id, "down")}
                    disabled={index === musicFiles.length - 1}
                    className="p-1 text-gray-400 hover:text-green-500 disabled:opacity-30"
                  >
                    <i className="fas fa-chevron-down"></i>
                  </button>
                  <button
                    onClick={() => removeMusic(music.id)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            ))}
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
                You can create a slideshow with images only if you don't add music.
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

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: #10b981;
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: #10b981;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}