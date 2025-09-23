"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ImageUpload from "./component/ImageUpload";
import ImageSettings from "./component/ImageSettings";
import MusicUpload from "./component/MusicUpload";
import SubtitleInput from "./component/SubtitleInput";
import VideoPreview from "./component/VideoPreview";
import VideoGenerator from "./component/VideoGenerator";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [images, setImages] = useState([]);
  const [imageSettings, setImageSettings] = useState({
    duration: 3,
    transition: "fade",
  });
  const [musicFiles, setMusicFiles] = useState([]);
  const [subtitle, setSubtitle] = useState("");
  const [imageSubtitles, setImageSubtitles] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);

  const steps = [
    { id: 1, title: "Images", icon: "fas fa-images" },
    { id: 2, title: "Music", icon: "fas fa-music" },
    { id: 3, title: "Settings", icon: "fas fa-cog" },
    { id: 4, title: "Subtitles", icon: "fas fa-font" },
    { id: 5, title: "Preview", icon: "fas fa-play" },
    { id: 6, title: "Generate", icon: "fas fa-download" },
  ];

  // URL 쿼리 파라미터에서 현재 단계 읽기
  useEffect(() => {
    const step = searchParams.get("step");
    if (step && parseInt(step) >= 1 && parseInt(step) <= 6) {
      setCurrentStep(parseInt(step));
    }
  }, [searchParams]);

  // 단계 변경 시 URL 업데이트
  const handleStepChange = (step) => {
    setCurrentStep(step);
    router.push(`?step=${step}`, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-green-600 mb-2">
              <i className="fas fa-video mr-3"></i>
              Easy PlayList Maker
            </h1>
            <p className="text-gray-600">
            Make videos the easiest with only images and music.
            </p>
          </div>
        </div>
      </div>

      {/* 진행 단계 표시 */}
      <div className="bg-white shadow-sm pt-2 md:pt-3">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-center">
            <div className="flex flex-wrap gap-5 md:gap-3 justify-center">
              {steps.map((step) => (
                <button
                  key={step.id}
                  onClick={() => handleStepChange(step.id)}
                  className={`relative flex items-center px-2 sm:px-4 py-2 rounded-full transition-all duration-300 text-xs sm:text-sm ${
                    currentStep >= step.id
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-500 hover:bg-gray-300"
                  }`}
                >
                  {/* STEP 뱃지 - 좌측 상단에 absolute로 세련되게 표시 */}
                  <span
                    className={`absolute -top-4 -left-2 sm:-top-4 sm:-left-2 bg-white border-2 ${
                      currentStep >= step.id
                        ? "border-green-500 text-green-600"
                        : "border-gray-300 text-gray-400"
                    } rounded-full px-2 py-0.5 text-[10px] sm:text-xs font-bold shadow-sm`}
                    style={{
                      minWidth: "2.2rem",
                      textAlign: "center",
                      letterSpacing: "0.02em",
                      zIndex: 2,
                    }}
                  >
                    STEP{step.id}
                  </span>
                  <i className={`${step.icon} mr-1 sm:mr-2`}></i>
                  <span className="font-medium">{step.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 상단 네비게이션 버튼 */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => handleStepChange(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Previous
            </button>

            <div className="text-sm text-gray-600">
              Step {currentStep} of {steps.length}
            </div>

            <button
              onClick={() => handleStepChange(Math.min(6, currentStep + 1))}
              disabled={currentStep === 6}
              className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Next
              <i className="fas fa-arrow-right ml-2"></i>
            </button>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {currentStep === 1 && (
            <ImageUpload
              images={images}
              setImages={setImages}
              onNext={() => handleStepChange(2)}
            />
          )}

          {currentStep === 2 && (
            <MusicUpload
              musicFiles={musicFiles}
              setMusicFiles={setMusicFiles}
              onNext={() => handleStepChange(3)}
              onPrev={() => handleStepChange(1)}
            />
          )}

          {currentStep === 3 && (
            <ImageSettings
              settings={imageSettings}
              setSettings={setImageSettings}
              images={images}
              musicFiles={musicFiles}
              onNext={() => handleStepChange(4)}
              onPrev={() => handleStepChange(2)}
            />
          )}

          {currentStep === 4 && (
            <SubtitleInput
              subtitle={subtitle}
              setSubtitle={setSubtitle}
              images={images}
              imageSubtitles={imageSubtitles}
              setImageSubtitles={setImageSubtitles}
              onNext={() => handleStepChange(5)}
              onPrev={() => handleStepChange(3)}
            />
          )}

          {currentStep === 5 && (
            <VideoPreview
              images={images}
              settings={imageSettings}
              musicFiles={musicFiles}
              subtitle={subtitle}
              onNext={() => handleStepChange(6)}
              onPrev={() => handleStepChange(4)}
            />
          )}

          {currentStep === 6 && (
            <VideoGenerator
              images={images}
              settings={imageSettings}
              musicFiles={musicFiles}
              subtitle={subtitle}
              imageSubtitles={imageSubtitles}
              isGenerating={isGenerating}
              setIsGenerating={setIsGenerating}
              onPrev={() => handleStepChange(5)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
