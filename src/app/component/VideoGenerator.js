"use client";
import { useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

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
  const [ffmpeg, setFFmpeg] = useState(null);
  const [isFFmpegLoaded, setIsFFmpegLoaded] = useState(false);

  const handleGenerateVideo = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Canvas 생성
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // 영상 해상도 설정 (16:9 비율)
      const videoWidth = 1280;
      const videoHeight = 720;
      canvas.width = videoWidth;
      canvas.height = videoHeight;

      // 오디오 컨텍스트 생성 (음악용)
      let audioContext = null;
      let audioBuffer = null;
      let audioSource = null;

      if (musicFile) {
        try {
          audioContext = new (window.AudioContext ||
            window.webkitAudioContext)();
          const arrayBuffer = await musicFile.file.arrayBuffer();
          audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        } catch (audioError) {
          console.warn("Audio processing failed:", audioError);
        }
      }

      // MediaRecorder 설정 (오디오 포함)
      const canvasStream = canvas.captureStream(30); // 30fps

      // 오디오 트랙 추가
      if (audioContext && audioBuffer) {
        const audioDestination = audioContext.createMediaStreamDestination();
        audioSource = audioContext.createBufferSource();
        audioSource.buffer = audioBuffer;
        audioSource.connect(audioDestination);

        // 오디오와 비디오 스트림 결합
        const combinedStream = new MediaStream([
          ...canvasStream.getVideoTracks(),
          ...audioDestination.stream.getAudioTracks(),
        ]);

        var stream = combinedStream;
      } else {
        var stream = canvasStream;
      }

      // 브라우저 호환성을 위한 MIME 타입 선택
      let mimeType = "video/webm;codecs=vp9,opus";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "video/webm;codecs=vp8,opus";
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = "video/webm";
        }
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType,
        videoBitsPerSecond: 2500000, // 2.5Mbps
        audioBitsPerSecond: 128000, // 128kbps
      });

      const chunks = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const webmBlob = new Blob(chunks, { type: "video/webm" });

        // WebM을 MP4로 변환
        try {
          const mp4Blob = await convertWebMToMP4(webmBlob);
          const url = URL.createObjectURL(mp4Blob);
          setGeneratedVideoUrl(url);
        } catch (conversionError) {
          console.warn("MP4 conversion failed, using WebM:", conversionError);
          const url = URL.createObjectURL(webmBlob);
          setGeneratedVideoUrl(url);
        }

        setGenerationProgress(100);
      };

      // 영상 녹화 시작
      mediaRecorder.start();

      // 이미지 로드 및 렌더링
      const totalDuration = images.length * settings.duration;
      const frameRate = 30;
      const totalFrames = totalDuration * frameRate;
      let currentFrame = 0;
      let currentImageIndex = 0;
      let imageStartFrame = 0;

      // 이미지 프리로드
      const loadedImages = await Promise.all(
        images.map((img) => {
          return new Promise((resolve) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.src = img.preview;
          });
        })
      );

      // 음악 재생 시작
      if (audioSource) {
        audioSource.start(0);
      }

      const renderFrame = () => {
        // 배경을 검은색으로 클리어
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, videoWidth, videoHeight);

        if (loadedImages.length > 0) {
          const currentImage = loadedImages[currentImageIndex];
          const imageDuration = settings.duration * frameRate;

          // 이미지 크기 계산 (비율 유지)
          const imageAspect = currentImage.width / currentImage.height;
          const canvasAspect = videoWidth / videoHeight;

          let drawWidth, drawHeight, drawX, drawY;

          if (imageAspect > canvasAspect) {
            // 이미지가 더 넓음
            drawHeight = videoHeight;
            drawWidth = drawHeight * imageAspect;
            drawX = (videoWidth - drawWidth) / 2;
            drawY = 0;
          } else {
            // 이미지가 더 높음
            drawWidth = videoWidth;
            drawHeight = drawWidth / imageAspect;
            drawX = 0;
            drawY = (videoHeight - drawHeight) / 2;
          }

          // 전환 효과 적용
          const frameInImage = currentFrame - imageStartFrame;
          const transitionFrames = Math.min(15, imageDuration * 0.1); // 0.5초 전환

          if (settings.transition === "fade") {
            const opacity =
              frameInImage < transitionFrames
                ? frameInImage / transitionFrames
                : 1;
            ctx.globalAlpha = opacity;
          } else if (settings.transition === "slide") {
            const slideOffset =
              frameInImage < transitionFrames
                ? videoWidth * (1 - frameInImage / transitionFrames)
                : 0;
            drawX += slideOffset;
          } else if (settings.transition === "zoom") {
            const zoomScale =
              frameInImage < transitionFrames
                ? 1 + 0.1 * (1 - frameInImage / transitionFrames)
                : 1;
            const centerX = drawX + drawWidth / 2;
            const centerY = drawY + drawHeight / 2;
            drawX = centerX - (drawWidth * zoomScale) / 2;
            drawY = centerY - (drawHeight * zoomScale) / 2;
            drawWidth *= zoomScale;
            drawHeight *= zoomScale;
          }

          // 이미지 그리기
          ctx.drawImage(currentImage, drawX, drawY, drawWidth, drawHeight);
          ctx.globalAlpha = 1;

          // 자막 그리기
          if (subtitle) {
            ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            ctx.fillRect(0, videoHeight - 80, videoWidth, 80);

            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 32px Arial";
            ctx.textAlign = "center";
            ctx.fillText(subtitle, videoWidth / 2, videoHeight - 30);
          }

          // 다음 이미지로 전환 체크
          if (frameInImage >= imageDuration) {
            currentImageIndex = (currentImageIndex + 1) % loadedImages.length;
            imageStartFrame = currentFrame;
          }
        }

        currentFrame++;

        // 진행률 업데이트
        const progress = Math.min((currentFrame / totalFrames) * 100, 100);
        setGenerationProgress(progress);

        if (currentFrame < totalFrames) {
          requestAnimationFrame(renderFrame);
        } else {
          // 영상 녹화 종료
          setTimeout(() => {
            mediaRecorder.stop();
            if (audioSource) {
              audioSource.stop();
            }
          }, 1000); // 1초 추가 대기
        }
      };

      // 렌더링 시작
      renderFrame();
    } catch (error) {
      console.error("Video generation error:", error);
      alert("Video generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // FFmpeg 초기화
  const initializeFFmpeg = async () => {
    if (isFFmpegLoaded) return ffmpeg;

    const ffmpegInstance = new FFmpeg();

    try {
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
      await ffmpegInstance.load({
        coreURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.js`,
          "text/javascript"
        ),
        wasmURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.wasm`,
          "application/wasm"
        ),
      });

      setFFmpeg(ffmpegInstance);
      setIsFFmpegLoaded(true);
      return ffmpegInstance;
    } catch (error) {
      console.error("FFmpeg initialization failed:", error);
      throw error;
    }
  };

  // WebM을 MP4로 변환하는 함수
  const convertWebMToMP4 = async (webmBlob) => {
    try {
      const ffmpegInstance = await initializeFFmpeg();

      // WebM 파일을 FFmpeg에 쓰기
      await ffmpegInstance.writeFile("input.webm", await fetchFile(webmBlob));

      // MP4로 변환
      await ffmpegInstance.exec([
        "-i",
        "input.webm",
        "-c:v",
        "libx264",
        "-c:a",
        "aac",
        "-preset",
        "fast",
        "-crf",
        "23",
        "output.mp4",
      ]);

      // 변환된 MP4 파일 읽기
      const data = await ffmpegInstance.readFile("output.mp4");

      // 파일 정리
      await ffmpegInstance.deleteFile("input.webm");
      await ffmpegInstance.deleteFile("output.mp4");

      return new Blob([data.buffer], { type: "video/mp4" });
    } catch (error) {
      console.error("MP4 conversion failed:", error);
      // 변환 실패 시 원본 WebM 반환
      return webmBlob;
    }
  };

  const handleDownload = () => {
    if (generatedVideoUrl) {
      const link = document.createElement("a");
      link.href = generatedVideoUrl;
      link.download = "slide-video.mp4"; // MP4 형식으로 다운로드
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
              {!isFFmpegLoaded && (
                <p className="text-xs text-blue-600 mt-1">
                  <i className="fas fa-info-circle mr-1"></i>
                  First generation may take longer due to FFmpeg loading
                </p>
              )}
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

          {/* 영상 미리보기 */}
          <div className="bg-gray-900 rounded-lg p-4">
            <h4 className="text-white text-lg font-medium mb-3">Preview</h4>
            <video
              src={generatedVideoUrl}
              controls
              className="w-full rounded-lg"
              style={{ maxHeight: "400px" }}
            >
              Your browser does not support the video tag.
            </video>
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
                  • MP4 format is widely supported by all devices and platforms
                </li>
                <li>• Audio and video are synchronized during generation</li>
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
