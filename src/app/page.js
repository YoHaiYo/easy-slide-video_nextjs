"use client";
import { useState } from "react";
import ImageUpload from "./component/ImageUpload";
import ImageSettings from "./component/ImageSettings";
import MusicUpload from "./component/MusicUpload";
import SubtitleInput from "./component/SubtitleInput";
import VideoPreview from "./component/VideoPreview";
import VideoGenerator from "./component/VideoGenerator";

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [images, setImages] = useState([]);
  const [imageSettings, setImageSettings] = useState({
    duration: 3,
    transition: "fade",
  });
  const [musicFile, setMusicFile] = useState(null);
  const [subtitle, setSubtitle] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const steps = [
    { id: 1, title: "사진 업로드", icon: "fas fa-images" },
    { id: 2, title: "순서/간격 설정", icon: "fas fa-cog" },
    { id: 3, title: "음악 추가", icon: "fas fa-music" },
    { id: 4, title: "자막 입력", icon: "fas fa-font" },
    { id: 5, title: "미리보기", icon: "fas fa-play" },
    { id: 6, title: "영상 생성", icon: "fas fa-download" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-green-600 mb-2">
              <i className="fas fa-video mr-3"></i>
              Easy Slide Video
            </h1>
            <p className="text-gray-600">
              사진과 음악으로 간단하게 영상 만들기
            </p>
          </div>
        </div>
      </div>

      {/* 진행 단계 표시 */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-center">
            <div className="flex space-x-4">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`flex items-center px-4 py-2 rounded-full transition-all duration-300 ${
                    currentStep >= step.id
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  <i className={`${step.icon} mr-2`}></i>
                  <span className="text-sm font-medium">{step.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 왼쪽: 설정 패널 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
              {currentStep === 1 && (
                <ImageUpload
                  images={images}
                  setImages={setImages}
                  onNext={() => setCurrentStep(2)}
                />
              )}

              {currentStep === 2 && (
                <ImageSettings
                  settings={imageSettings}
                  setSettings={setImageSettings}
                  images={images}
                  onNext={() => setCurrentStep(3)}
                  onPrev={() => setCurrentStep(1)}
                />
              )}

              {currentStep === 3 && (
                <MusicUpload
                  musicFile={musicFile}
                  setMusicFile={setMusicFile}
                  onNext={() => setCurrentStep(4)}
                  onPrev={() => setCurrentStep(2)}
                />
              )}

              {currentStep === 4 && (
                <SubtitleInput
                  subtitle={subtitle}
                  setSubtitle={setSubtitle}
                  onNext={() => setCurrentStep(5)}
                  onPrev={() => setCurrentStep(3)}
                />
              )}

              {currentStep === 5 && (
                <VideoPreview
                  images={images}
                  settings={imageSettings}
                  musicFile={musicFile}
                  subtitle={subtitle}
                  onNext={() => setCurrentStep(6)}
                  onPrev={() => setCurrentStep(4)}
                />
              )}

              {currentStep === 6 && (
                <VideoGenerator
                  images={images}
                  settings={imageSettings}
                  musicFile={musicFile}
                  subtitle={subtitle}
                  isGenerating={isGenerating}
                  setIsGenerating={setIsGenerating}
                  onPrev={() => setCurrentStep(5)}
                />
              )}
            </div>
          </div>

          {/* 오른쪽: 미리보기 영역 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                <i className="fas fa-eye mr-2 text-green-500"></i>
                미리보기
              </h3>

              {/* 미리보기 컨텐츠는 각 컴포넌트에서 처리 */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <i className="fas fa-image text-6xl text-gray-400 mb-4"></i>
                <p className="text-gray-500">미리보기가 여기에 표시됩니다</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
