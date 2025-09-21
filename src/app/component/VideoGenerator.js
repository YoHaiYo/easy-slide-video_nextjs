"use client";
import { useState } from "react";

export default function VideoGenerator({
  images,
  settings,
  musicFile,
  subtitle,
  isGenerating,
  setIsGenerating,
  onPrev,
}) {
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState(null);

  const handleGenerateVideo = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // 시뮬레이션된 진행률 업데이트
      const progressInterval = setInterval(() => {
        setGenerationProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + Math.random() * 10;
        });
      }, 200);

      // 실제 영상 생성 로직은 여기에 구현
      // 현재는 시뮬레이션만 진행
      await new Promise((resolve) => setTimeout(resolve, 3000));

      clearInterval(progressInterval);
      setGenerationProgress(100);

      // 생성된 영상 URL 설정 (실제로는 생성된 영상의 URL)
      setGeneratedVideoUrl("#"); // 실제 구현에서는 생성된 영상의 URL
    } catch (error) {
      console.error("영상 생성 중 오류 발생:", error);
      alert("영상 생성 중 오류가 발생했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (generatedVideoUrl) {
      // 실제 다운로드 로직
      const link = document.createElement("a");
      link.href = generatedVideoUrl;
      link.download = "slide-video.mp4";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getTotalDuration = () => {
    return images.length * settings.duration;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        <i className="fas fa-download mr-2 text-green-500"></i>
        Generate Video
      </h3>

      {/* 영상 생성 상태 */}
      {!generatedVideoUrl ? (
        <div className="space-y-6">
          {/* 생성할 영상 정보 요약 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-md font-medium text-gray-700 mb-3">
              Video Information
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <i className="fas fa-images text-green-500"></i>
                <span>Images: {images.length}</span>
              </div>
              <div className="flex items-center space-x-2">
                <i className="fas fa-clock text-green-500"></i>
                <span>Duration: {formatTime(getTotalDuration())}</span>
              </div>
              <div className="flex items-center space-x-2">
                <i className="fas fa-magic text-green-500"></i>
                <span>
                  Effect:{" "}
                  {settings.transition === "fade"
                    ? "Fade"
                    : settings.transition}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <i className="fas fa-music text-green-500"></i>
                <span>Music: {musicFile ? "Yes" : "No"}</span>
              </div>
            </div>
            {subtitle && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <i className="fas fa-font text-green-500"></i>
                  <span className="text-sm">Subtitles: {subtitle}</span>
                </div>
              </div>
            )}
          </div>

          {/* 생성 진행률 */}
          {isGenerating && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="inline-flex items-center space-x-2 text-green-600">
                  <i className="fas fa-cog fa-spin"></i>
                  <span className="font-medium">Generating video...</span>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${generationProgress}%` }}
                ></div>
              </div>

              <div className="text-center text-sm text-gray-600">
                {Math.round(generationProgress)}% complete
              </div>
            </div>
          )}

          {/* 생성 버튼 */}
          {!isGenerating && (
            <div className="text-center">
              <button
                onClick={handleGenerateVideo}
                disabled={images.length === 0}
                className="bg-green-500 text-white px-8 py-4 rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 text-lg font-medium"
              >
                <i className="fas fa-video mr-2"></i>
                Generate Video
              </button>
              <p className="text-sm text-gray-500 mt-2">
                Video generation is processed in the browser
              </p>
            </div>
          )}
        </div>
      ) : (
        /* 생성 완료 상태 */
        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 text-green-600 mb-4">
              <i className="fas fa-check-circle text-2xl"></i>
              <span className="text-lg font-medium">Video Generated!</span>
            </div>
            <p className="text-gray-600">
              Your video has been successfully generated.
            </p>
          </div>

          {/* 다운로드 버튼 */}
          <div className="text-center">
            <button
              onClick={handleDownload}
              className="bg-green-500 text-white px-8 py-4 rounded-lg hover:bg-green-600 transition-colors duration-200 text-lg font-medium"
            >
              <i className="fas fa-download mr-2"></i>
              Download Video
            </button>
          </div>

          {/* 새 영상 만들기 */}
          <div className="text-center">
            <button
              onClick={() => {
                setGeneratedVideoUrl(null);
                setGenerationProgress(0);
              }}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200"
            >
              <i className="fas fa-plus mr-2"></i>
              Create New Video
            </button>
          </div>
        </div>
      )}

      {/* 주의사항 */}
      <div className="mt-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <i className="fas fa-exclamation-triangle text-yellow-500 mt-1"></i>
            <div>
              <p className="text-sm text-yellow-800 font-medium">
                Important Notes
              </p>
              <ul className="text-xs text-yellow-700 mt-1 space-y-1">
                <li>• Video generation time depends on browser performance</li>
                <li>• Generated video will be downloaded in MP4 format</li>
                <li>
                  • Images and music files are processed only in the browser and
                  not sent to any server
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 버튼들 */}
      <div className="mt-6 flex justify-between">
        <button
          onClick={onPrev}
          disabled={isGenerating}
          className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Previous
        </button>

        {generatedVideoUrl && (
          <button
            onClick={() => {
              setGeneratedVideoUrl(null);
              setGenerationProgress(0);
            }}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            <i className="fas fa-redo mr-2"></i>
            Regenerate
          </button>
        )}
      </div>
    </div>
  );
}
