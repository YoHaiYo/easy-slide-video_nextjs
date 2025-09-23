"use client";
import { useState } from "react";
import Image from "next/image";

export default function SubtitleInput({
  subtitle,
  setSubtitle,
  images,
  imageSubtitles,
  setImageSubtitles,
  onNext,
  onPrev,
}) {
  const [subtitleSettings, setSubtitleSettings] = useState({
    fontSize: "medium",
    color: "white",
    backgroundColor: "black",
  });

  const handleImageSubtitleChange = (imageIndex, value) => {
    setImageSubtitles({
      ...imageSubtitles,
      [imageIndex]: value,
    });
  };

  const handleSettingsChange = (setting, value) => {
    setSubtitleSettings({
      ...subtitleSettings,
      [setting]: value,
    });
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        <i className="fas fa-font mr-2 text-green-500"></i>
        Add Subtitles
      </h3>

      {/* 이미지별 자막 입력 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-4">
          <i className="fas fa-images mr-1"></i>
          Subtitles for Each Image
        </label>

        <div className="space-y-4">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-200 relative">
                  <Image
                    src={image.preview}
                    alt={image.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">
                    Image {index + 1}
                  </h4>
                  <p className="text-sm text-gray-500">{image.name}</p>
                </div>
              </div>

              <textarea
                value={imageSubtitles[index] || ""}
                onChange={(e) =>
                  handleImageSubtitleChange(index, e.target.value)
                }
                placeholder={`Enter subtitle for image ${index + 1}...`}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                rows={2}
              />
              <div className="text-xs text-gray-500 mt-1">
                {(imageSubtitles[index] || "").length} characters
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 자막 설정 옵션들 */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-700">Subtitle Settings</h4>

        {/* 글자 크기 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <i className="fas fa-text-height mr-1"></i>
            Font Size
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: "small", label: "Small" },
              { value: "medium", label: "Medium" },
              { value: "large", label: "Large" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleSettingsChange("fontSize", option.value)}
                className={`p-3 rounded-lg border text-sm font-medium transition-colors duration-200 ${
                  subtitleSettings.fontSize === option.value
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-300 hover:border-green-400"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* 글자 색상 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <i className="fas fa-palette mr-1"></i>
            Text Color
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              {
                value: "white",
                label: "White",
                color: "bg-white border-gray-300",
              },
              { value: "black", label: "Black", color: "bg-black" },
              { value: "yellow", label: "Yellow", color: "bg-yellow-400" },
              { value: "green", label: "Green", color: "bg-green-500" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleSettingsChange("color", option.value)}
                className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors duration-200 ${
                  subtitleSettings.color === option.value
                    ? "border-green-500 ring-2 ring-green-200"
                    : "border-gray-300 hover:border-green-400"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full mx-auto mb-1 ${option.color}`}
                ></div>
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* 배경 색상 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <i className="fas fa-square mr-1"></i>
            Background Color
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              {
                value: "transparent",
                label: "Transparent",
                color: "bg-transparent border-2 border-dashed border-gray-300",
              },
              { value: "black", label: "Black", color: "bg-black" },
              {
                value: "white",
                label: "White",
                color: "bg-white border-gray-300",
              },
              { value: "green", label: "Green", color: "bg-green-500" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() =>
                  handleSettingsChange("backgroundColor", option.value)
                }
                className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors duration-200 ${
                  subtitleSettings.backgroundColor === option.value
                    ? "border-green-500 ring-2 ring-green-200"
                    : "border-gray-300 hover:border-green-400"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full mx-auto mb-1 ${option.color}`}
                ></div>
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 자막 미리보기 */}
      {Object.values(imageSubtitles).some((sub) => sub.trim()) && (
        <div className="mt-6">
          <h4 className="text-md font-medium text-gray-700 mb-3">
            Subtitle Preview
          </h4>
          <div className="space-y-3">
            {images.map((image, index) => {
              const subtitleText = imageSubtitles[index];
              if (!subtitleText || !subtitleText.trim()) return null;

              return (
                <div
                  key={image.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 relative">
                      <Image
                        src={image.preview}
                        alt={image.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-600">
                      Image {index + 1}
                    </span>
                  </div>
                  <div className="relative bg-gray-900 rounded-lg p-4 min-h-[60px] flex items-center justify-center">
                    <span
                      className={`inline-block px-3 py-1 rounded text-center ${
                        subtitleSettings.fontSize === "small"
                          ? "text-sm"
                          : subtitleSettings.fontSize === "medium"
                          ? "text-base"
                          : "text-lg"
                      } ${
                        subtitleSettings.color === "white"
                          ? "text-white"
                          : subtitleSettings.color === "black"
                          ? "text-black"
                          : subtitleSettings.color === "yellow"
                          ? "text-yellow-400"
                          : "text-green-400"
                      } ${
                        subtitleSettings.backgroundColor === "transparent"
                          ? ""
                          : subtitleSettings.backgroundColor === "black"
                          ? "bg-black"
                          : subtitleSettings.backgroundColor === "white"
                          ? "bg-white text-black"
                          : "bg-green-500"
                      }`}
                    >
                      {subtitleText}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 자막 없이 진행 옵션 */}
      <div className="mt-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <i className="fas fa-info-circle text-blue-500 mt-1"></i>
            <div>
              <p className="text-sm text-blue-800 font-medium">
                Continue without subtitles
              </p>
              <p className="text-xs text-blue-600 mt-1">
                You can create a slideshow with images and music only if you
                don&apos;t add subtitles.
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
