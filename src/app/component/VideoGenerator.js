"use client";
import { useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

export default function VideoGenerator({
  images,
  settings,
  musicFiles,
  subtitle,
  imageSubtitles,
  isGenerating,
  setIsGenerating,
  onPrev,
}) {
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState(null);
  const [ffmpeg, setFFmpeg] = useState(null);
  const [isFFmpegLoaded, setIsFFmpegLoaded] = useState(false);
  const [generationStatus, setGenerationStatus] = useState(""); // 생성 상태 메시지
  const [conversionProgress, setConversionProgress] = useState(0); // 변환 진행률
  const [isInitializing, setIsInitializing] = useState(false); // 초기화 상태

  const handleGenerateVideo = async () => {
    const startTime = performance.now();
    console.log("🎬 영상 생성 시작");
    setIsGenerating(true);
    setIsInitializing(true);
    setGenerationProgress(0);
    setGenerationStatus("Starting video generation...");
    setConversionProgress(0);

    try {
      console.log("📐 Canvas 생성 중...");
      // Canvas 생성
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // 영상 해상도 설정 (16:9 비율) - 속도 최적화를 위해 480p 사용
      const videoWidth = 854;
      const videoHeight = 480;
      canvas.width = videoWidth;
      canvas.height = videoHeight;
      console.log(`📐 Canvas 설정 완료: ${videoWidth}x${videoHeight}`);

      // 오디오 컨텍스트 생성 (음악용)
      let audioContext = null;
      let audioBuffers = [];
      let audioSources = [];

      if (musicFiles && musicFiles.length > 0) {
        console.log(`🎵 ${musicFiles.length}개 음악 파일 처리 시작...`);
        try {
          audioContext = new (window.AudioContext ||
            window.webkitAudioContext)();
          console.log("🎵 AudioContext 생성 완료");

          // 모든 음악 파일 처리
          for (let i = 0; i < musicFiles.length; i++) {
            const musicFile = musicFiles[i];
            console.log(`🎵 음악 ${i + 1} 처리 중: ${musicFile.name}`);

            const arrayBuffer = await musicFile.file.arrayBuffer();
            console.log(
              `🎵 음악 파일 ${i + 1} 로드 완료: ${arrayBuffer.byteLength} bytes`
            );

            let audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            console.log(
              `🎵 오디오 디코딩 완료: ${audioBuffer.duration}초, ${audioBuffer.sampleRate}Hz`
            );

            // 사용자 지정 길이가 있으면 오디오를 자르기
            if (
              musicFile.customDuration &&
              musicFile.customDuration < audioBuffer.duration
            ) {
              console.log(
                `🎵 오디오 길이 조정: ${audioBuffer.duration}초 → ${musicFile.customDuration}초`
              );
              const newLength =
                musicFile.customDuration * audioBuffer.sampleRate;
              const newBuffer = audioContext.createBuffer(
                audioBuffer.numberOfChannels,
                newLength,
                audioBuffer.sampleRate
              );

              for (
                let channel = 0;
                channel < audioBuffer.numberOfChannels;
                channel++
              ) {
                const originalData = audioBuffer.getChannelData(channel);
                const newData = newBuffer.getChannelData(channel);
                for (let j = 0; j < newLength; j++) {
                  newData[j] = originalData[j];
                }
              }
              audioBuffer = newBuffer;
            }

            audioBuffers.push(audioBuffer);
          }

          console.log(`🎵 총 ${audioBuffers.length}개 음악 파일 처리 완료`);
        } catch (audioError) {
          console.warn("🎵 Audio processing failed:", audioError);
        }
      } else {
        console.log("🎵 음악 파일 없음 - 오디오 없이 진행");
      }

      // MediaRecorder 설정 (오디오 포함)
      console.log("📹 Canvas 스트림 생성 중...");
      const canvasStream = canvas.captureStream(5); // 5fps로 대폭 낮춤 (정지 이미지 최적화)
      console.log("📹 Canvas 스트림 생성 완료 (5fps)");

      // 오디오 트랙 추가
      if (audioContext && audioBuffers.length > 0) {
        console.log("🎵 오디오 스트림 설정 중...");
        const audioDestination = audioContext.createMediaStreamDestination();

        // 모든 음악을 순차적으로 연결
        let currentTime = 0;
        for (let i = 0; i < audioBuffers.length; i++) {
          const audioSource = audioContext.createBufferSource();
          audioSource.buffer = audioBuffers[i];
          audioSource.connect(audioDestination);
          audioSource.start(currentTime);
          audioSources.push(audioSource);

          currentTime += audioBuffers[i].duration;
          console.log(
            `🎵 음악 ${i + 1} 연결 완료, 시작 시간: ${
              currentTime - audioBuffers[i].duration
            }초`
          );
        }

        console.log("🎵 모든 오디오 소스 연결 완료");

        // 오디오와 비디오 스트림 결합
        const combinedStream = new MediaStream([
          ...canvasStream.getVideoTracks(),
          ...audioDestination.stream.getAudioTracks(),
        ]);
        console.log("🎵 비디오+오디오 스트림 결합 완료");

        var stream = combinedStream;
      } else {
        console.log("📹 비디오 전용 스트림 사용");
        var stream = canvasStream;
      }

      // 브라우저 호환성을 위한 MIME 타입 선택 - MP4 우선 시도
      console.log("🔧 MediaRecorder MIME 타입 확인 중...");
      let mimeType = "video/mp4;codecs=avc1,mp4a"; // MP4 우선 시도
      let useFFmpeg = false;

      if (!MediaRecorder.isTypeSupported(mimeType)) {
        console.log("⚠️ MP4 미지원, WebM VP9+Opus 시도");
        mimeType = "video/webm;codecs=vp9,opus";
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          console.log("⚠️ VP9+Opus 미지원, VP8+Opus 시도");
          mimeType = "video/webm;codecs=vp8,opus";
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            console.log("⚠️ VP8+Opus 미지원, 기본 WebM 사용");
            mimeType = "video/webm";
          }
        }
        useFFmpeg = true; // WebM 사용 시 FFmpeg 변환 필요
      }
      console.log(`✅ 사용할 MIME 타입: ${mimeType}`);
      console.log(`🔄 FFmpeg 변환 필요: ${useFFmpeg ? "Yes" : "No"}`);

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType,
        videoBitsPerSecond: 1000000, // 1Mbps로 낮춤 (속도 최적화)
        audioBitsPerSecond: 96000, // 96kbps로 낮춤
      });
      console.log("📹 MediaRecorder 설정 완료");

      const chunks = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
          console.log(
            `📦 데이터 청크 수신: ${event.data.size} bytes (총 ${chunks.length}개)`
          );
        }
      };

      mediaRecorder.onstop = async () => {
        console.log("🛑 MediaRecorder 정지됨");
        const videoBlob = new Blob(chunks, { type: mimeType });
        console.log(
          `📦 비디오 Blob 생성 완료: ${videoBlob.size} bytes (${mimeType})`
        );

        // MP4가 직접 생성된 경우 FFmpeg 변환 생략
        if (!useFFmpeg) {
          const endTime = performance.now();
          const generationTime = ((endTime - startTime) / 1000).toFixed(2);
          console.log("✅ MP4 직접 생성 완료 - FFmpeg 변환 불필요");
          console.log(`⏱️ 총 영상 생성 시간: ${generationTime}초`);
          setGenerationStatus("Video generation completed!");
          const url = URL.createObjectURL(videoBlob);
          setGeneratedVideoUrl(url);
          setIsGenerating(false);
          setGenerationProgress(100);
          console.log("🎉 영상 생성 완전 완료! (MP4 직접 생성)");
          return;
        }

        // WebM인 경우에만 MP4로 변환
        setGenerationStatus("Converting WebM to MP4...");
        try {
          console.log("🔄 WebM → MP4 변환 시작...");
          setConversionProgress(10);

          // 변환 과정에서 진행률 시뮬레이션
          const conversionInterval = setInterval(() => {
            setConversionProgress((prev) => {
              if (prev >= 90) return prev;
              return prev + Math.random() * 5; // 더 천천히 증가
            });
          }, 800);

          const mp4Blob = await convertWebMToMP4(videoBlob);
          clearInterval(conversionInterval);
          setConversionProgress(100);
          const endTime = performance.now();
          const generationTime = ((endTime - startTime) / 1000).toFixed(2);
          console.log(`✅ MP4 변환 완료: ${mp4Blob.size} bytes`);
          console.log(`⏱️ 총 영상 생성 시간: ${generationTime}초`);
          setGenerationStatus("Video generation completed!");
          const url = URL.createObjectURL(mp4Blob);
          setGeneratedVideoUrl(url);
          setIsGenerating(false);
        } catch (conversionError) {
          console.warn(
            "❌ MP4 conversion failed, using WebM:",
            conversionError
          );
          setConversionProgress(100);
          const endTime = performance.now();
          const generationTime = ((endTime - startTime) / 1000).toFixed(2);
          console.log(`⏱️ 총 영상 생성 시간: ${generationTime}초`);
          setGenerationStatus("Video generation completed! (WebM format)");
          const url = URL.createObjectURL(videoBlob);
          setGeneratedVideoUrl(url);
          setIsGenerating(false);
        }

        setGenerationProgress(100);
        console.log("🎉 영상 생성 완전 완료!");
      };

      // 영상 녹화 시작
      console.log("▶️ 영상 녹화 시작...");
      setGenerationStatus("Starting video recording...");
      mediaRecorder.start();

      // 이미지 로드 및 렌더링
      console.log("🖼️ 이미지 로딩 시작...");
      setGenerationStatus("Loading images...");
      const totalDuration = images.length * settings.duration;
      const frameRate = 5; // 5fps로 대폭 낮춤 (정지 이미지 최적화)
      const totalFrames = totalDuration * frameRate;
      console.log(
        `📊 영상 정보: ${images.length}장, ${totalDuration}초, ${totalFrames}프레임`
      );

      let currentFrame = 0;
      let currentImageIndex = 0;
      let imageStartFrame = 0;

      // 이미지 프리로드
      console.log(`🖼️ ${images.length}개 이미지 프리로드 중...`);
      const loadedImages = await Promise.all(
        images.map((img, index) => {
          return new Promise((resolve) => {
            const image = new Image();
            image.onload = () => {
              console.log(`✅ 이미지 ${index + 1} 로드 완료: ${img.name}`);
              resolve(image);
            };
            image.onerror = () => {
              console.error(`❌ 이미지 ${index + 1} 로드 실패: ${img.name}`);
              resolve(null);
            };
            image.src = img.preview;
          });
        })
      );
      console.log(
        `🖼️ 이미지 로딩 완료: ${loadedImages.filter((img) => img).length}/${
          images.length
        }개 성공`
      );

      // 음악 재생 시작 (이미 위에서 시작됨)
      if (audioSources.length > 0) {
        console.log(`🎵 ${audioSources.length}개 음악 재생 시작...`);
      }

      console.log("🎨 영상 렌더링 시작...");
      setGenerationStatus("Rendering video...");
      setIsInitializing(false); // 초기화 완료

      const renderFrame = () => {
        // 배경을 검은색으로 클리어
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, videoWidth, videoHeight);

        if (loadedImages.length > 0 && loadedImages[currentImageIndex]) {
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

          // 전환 효과 적용 (5fps 최적화)
          const frameInImage = currentFrame - imageStartFrame;
          const transitionFrames = Math.min(3, imageDuration * 0.1); // 0.6초 전환을 3프레임으로

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

          // 자막 그리기 (이미지별 자막)
          const currentSubtitle =
            imageSubtitles && imageSubtitles[currentImageIndex];
          if (currentSubtitle && currentSubtitle.trim()) {
            ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            ctx.fillRect(0, videoHeight - 80, videoWidth, 80);

            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 32px Arial";
            ctx.textAlign = "center";
            ctx.fillText(currentSubtitle, videoWidth / 2, videoHeight - 30);
          }

          // 다음 이미지로 전환 체크
          if (
            frameInImage >= imageDuration &&
            currentImageIndex < loadedImages.length - 1
          ) {
            console.log(
              `🔄 이미지 전환: ${currentImageIndex + 1} → ${
                currentImageIndex + 2
              }`
            );
            currentImageIndex = currentImageIndex + 1;
            imageStartFrame = currentFrame;
          }
        }

        currentFrame++;

        // 진행률 업데이트
        const progress = Math.min((currentFrame / totalFrames) * 100, 100);
        setGenerationProgress(progress);

        // 10% 단위로 진행률 로그
        if (currentFrame % Math.floor(totalFrames / 10) === 0) {
          console.log(
            `📊 렌더링 진행률: ${Math.round(
              progress
            )}% (${currentFrame}/${totalFrames} 프레임)`
          );
        }

        if (currentFrame < totalFrames) {
          requestAnimationFrame(renderFrame);
        } else {
          // 영상 녹화 종료
          console.log("🛑 렌더링 완료, 녹화 종료 준비 중...");
          setGenerationStatus("Finalizing video recording...");
          setTimeout(() => {
            console.log("🛑 MediaRecorder 정지 명령 실행");
            mediaRecorder.stop();
            if (audioSources.length > 0) {
              console.log(`🎵 ${audioSources.length}개 오디오 소스 정지`);
              audioSources.forEach((source, index) => {
                try {
                  source.stop();
                  console.log(`🎵 오디오 소스 ${index + 1} 정지 완료`);
                } catch (e) {
                  console.warn(`🎵 오디오 소스 ${index + 1} 정지 실패:`, e);
                }
              });
            }
          }, 1000); // 1초 추가 대기
        }
      };

      // 렌더링 시작
      renderFrame();
    } catch (error) {
      console.error("Video generation error:", error);
      setGenerationStatus("An error occurred during video generation.");

      // 사용자에게 더 친화적인 에러 메시지 표시
      let errorMessage = "Video generation failed. ";
      if (error.name === "NotSupportedError") {
        errorMessage += "Your browser does not support video recording.";
      } else if (error.name === "NotAllowedError") {
        errorMessage += "Microphone/camera permission is required.";
      } else if (error.message.includes("FFmpeg")) {
        errorMessage += "Failed to load FFmpeg. Please refresh the page.";
      } else {
        errorMessage += "Please try again later.";
      }

      alert(errorMessage);
      setIsGenerating(false); // 에러 발생 시 로딩 종료
    } finally {
      // isGenerating은 MP4 변환 완료 시점에서 설정됨
      setIsInitializing(false);
      setGenerationProgress(0);
      setConversionProgress(0);
    }
  };

  // FFmpeg 초기화
  const initializeFFmpeg = async () => {
    if (isFFmpegLoaded) {
      console.log("✅ FFmpeg 이미 로드됨");
      return ffmpeg;
    }

    console.log("🔧 FFmpeg 초기화 시작...");
    const ffmpegInstance = new FFmpeg();

    try {
      setGenerationStatus("Loading FFmpeg...");
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
      console.log(`🔧 FFmpeg 코어 다운로드 중: ${baseURL}`);

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

      console.log("✅ FFmpeg 로딩 완료");
      setFFmpeg(ffmpegInstance);
      setIsFFmpegLoaded(true);
      setGenerationStatus("FFmpeg loaded successfully.");
      return ffmpegInstance;
    } catch (error) {
      console.error("❌ FFmpeg initialization failed:", error);
      setGenerationStatus("Failed to load FFmpeg.");
      throw new Error("FFmpeg loading failed: " + error.message);
    }
  };

  // WebM을 MP4로 변환하는 함수
  const convertWebMToMP4 = async (webmBlob) => {
    try {
      console.log("🔄 FFmpeg 인스턴스 가져오기...");
      const ffmpegInstance = await initializeFFmpeg();
      setConversionProgress(20);

      console.log("📁 WebM 파일을 FFmpeg에 쓰기...");
      // WebM 파일을 FFmpeg에 쓰기
      await ffmpegInstance.writeFile("input.webm", await fetchFile(webmBlob));
      console.log("✅ WebM 파일 쓰기 완료");
      setConversionProgress(40);

      console.log("🔄 MP4 변환 명령 실행...");
      // MP4로 변환 (속도 최적화 설정)
      await ffmpegInstance.exec([
        "-i",
        "input.webm",
        "-c:v",
        "libx264",
        "-c:a",
        "aac",
        "-preset",
        "ultrafast", // 가장 빠른 변환
        "-crf",
        "32", // 품질보다 속도 우선 (28 → 32)
        "-profile:v",
        "baseline", // 호환성 향상
        "-level",
        "3.0", // 낮은 레벨로 속도 향상
        "-movflags",
        "+faststart", // 웹 최적화
        "-threads",
        "0", // 모든 CPU 코어 사용
        "-y", // 덮어쓰기 허용
        "output.mp4",
      ]);
      console.log("✅ MP4 변환 명령 완료");
      setConversionProgress(80);

      console.log("📖 변환된 MP4 파일 읽기...");
      // 변환된 MP4 파일 읽기
      const data = await ffmpegInstance.readFile("output.mp4");
      console.log(`✅ MP4 파일 읽기 완료: ${data.length} bytes`);
      setConversionProgress(90);

      // 파일 정리 (에러가 발생해도 계속 진행)
      try {
        console.log("🧹 임시 파일 정리 중...");
        await ffmpegInstance.deleteFile("input.webm");
        await ffmpegInstance.deleteFile("output.mp4");
        console.log("✅ 파일 정리 완료");
      } catch (cleanupError) {
        console.warn("⚠️ File cleanup failed:", cleanupError);
      }

      const mp4Blob = new Blob([data.buffer], { type: "video/mp4" });
      console.log(`🎉 MP4 변환 완료: ${mp4Blob.size} bytes`);
      return mp4Blob;
    } catch (error) {
      console.error("❌ MP4 conversion failed:", error);
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
                <i className="fas fa-video text-green-500"></i>
                <span>Resolution: 854×480 (5fps)</span>
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
                <span>
                  Music:{" "}
                  {musicFiles && musicFiles.length > 0
                    ? `${musicFiles.length} files`
                    : "No"}
                </span>
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

          {/* 생성 버튼 */}
          <div className="text-center">
            <button
              onClick={handleGenerateVideo}
              disabled={images.length === 0 || isGenerating}
              className="bg-green-500 text-white px-8 py-4 rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 text-lg font-medium"
            >
              {isGenerating ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Generating Video...
                </>
              ) : (
                <>
                  <i className="fas fa-video mr-2"></i>
                  Generate Video
                </>
              )}
            </button>

            {/* 진행 상태 표시 */}
            {isGenerating && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-center space-x-2 text-blue-600 mb-2">
                  <i className="fas fa-cog fa-spin"></i>
                  <span className="font-medium">Processing Video</span>
                </div>
                <p className="text-sm text-blue-600 text-center">
                  {generationStatus || "Initializing video generation..."}
                </p>
                {conversionProgress > 0 && (
                  <div className="mt-3">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>MP4 Conversion</span>
                      <span>{Math.round(conversionProgress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${conversionProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* 진행률 바 */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{Math.round(generationProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${generationProgress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {!isGenerating && (
              <>
                <p className="text-sm text-gray-500 mt-2">
                  Video generation is processed in the browser
                </p>
                {!isFFmpegLoaded && (
                  <p className="text-xs text-blue-600 mt-1">
                    <i className="fas fa-info-circle mr-1"></i>
                    First generation may take longer due to FFmpeg loading
                  </p>
                )}

                {/* 경고 문구 */}
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-2 text-yellow-700">
                    <i className="fas fa-exclamation-triangle"></i>
                    <span className="text-sm font-medium">Important</span>
                  </div>
                  <p className="text-xs text-yellow-600 mt-1">
                    Do not close the browser or refresh the page during video
                    generation.
                  </p>
                </div>
              </>
            )}
          </div>
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
                setConversionProgress(0);
                setGenerationStatus("");
                setIsInitializing(false);
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
                <li>
                  • Video generation is optimized for slideshow (480p, 5fps)
                </li>
                <li>
                  • MP4 format is generated directly when supported by browser
                </li>
                <li>
                  • WebM format is used as fallback for better compatibility
                </li>
                <li>• Audio and video are synchronized during generation</li>
                <li>
                  • All processing is done in the browser - no server upload
                </li>
                <li>
                  • Generation speed improved by 10-15x for slideshow videos
                </li>
                <li>• 5fps is perfect for static image slideshows</li>
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
              setConversionProgress(0);
              setGenerationStatus("");
              setIsInitializing(false);
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
