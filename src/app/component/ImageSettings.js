"use client";
import React from "react";

export default function ImageSettings({
  settings,
  setSettings,
  images,
  musicFile,
  onNext,
  onPrev,
}) {
  // 음악 파일이 있고 자동 분배가 아직 안된 경우 자동으로 분배
  React.useEffect(() => {
    if (musicFile && settings.duration === 5) {
      const totalDuration = musicFile.customDuration || musicFile.duration;
      const durationPerImage = Math.floor(totalDuration / images.length);
      setSettings({
        ...settings,
        duration: Math.max(1, Math.min(30, durationPerImage)),
      });
    }
  }, [musicFile, images.length]);
  const handleDurationChange = (e) => {
    setSettings({
      ...settings,
      duration: parseInt(e.target.value),
    });
  };

  const handleDurationInputChange = (e) => {
    const value = parseInt(e.target.value);
    if (value >= 1 && value <= 30) {
      setSettings({
        ...settings,
        duration: value,
      });
    }
  };

  const handleTransitionChange = (e) => {
    setSettings({
      ...settings,
      transition: e.target.value,
    });
  };

  const handleAutoDuration = () => {
    if (musicFile) {
      const totalDuration = musicFile.customDuration || musicFile.duration;
      const durationPerImage = Math.floor(totalDuration / images.length);
      setSettings({
        ...settings,
        duration: Math.max(1, Math.min(30, durationPerImage)),
      });
    }
  };

  const getTotalDuration = () => {
    return images.length * settings.duration;
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        <i className="fas fa-cog mr-2 text-green-500"></i>
        Image Settings
      </h3>

      {/* 사진 순서 미리보기 */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-700 mb-3">
          Image Order ({images.length} images)
        </h4>
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200"
            >
              <img
                src={image.preview}
                alt={image.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-1 py-0.5 rounded">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 설정 옵션들 */}
      <div className="space-y-6">
        {/* 사진당 표시 시간 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <i className="fas fa-clock mr-1"></i>
            Display Duration per Image
          </label>

          {/* 슬라이더 */}
          <div className="flex items-center space-x-4 mb-3">
            <input
              type="range"
              min="1"
              max="30"
              value={settings.duration}
              onChange={handleDurationChange}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <span className="text-lg font-semibold text-green-600 min-w-[3rem] text-center">
              {settings.duration}s
            </span>
          </div>

          {/* 직접 입력 */}
          <div className="flex items-center space-x-2 mb-3">
            <label className="text-sm text-gray-600">Direct input:</label>
            <input
              type="number"
              min="1"
              max="30"
              value={settings.duration}
              onChange={handleDurationInputChange}
              className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
            />
            <span className="text-sm text-gray-600">seconds</span>
          </div>

          {/* 자동 분배 버튼 */}
          {musicFile && musicFile.duration && (
            <div className="mb-3">
              <button
                onClick={handleAutoDuration}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 text-sm"
              >
                <i className="fas fa-magic mr-1"></i>
                Auto-distribute by music length (
                {Math.floor(musicFile.customDuration || musicFile.duration)}s)
              </button>
            </div>
          )}

          <div className="flex justify-between text-xs text-gray-500">
            <span>1s</span>
            <span>30s</span>
          </div>
        </div>

        {/* 전환 효과 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <i className="fas fa-magic mr-1"></i>
            Transition Effect
          </label>
          <select
            value={settings.transition}
            onChange={handleTransitionChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="fade">Fade</option>
            <option value="none">None</option>
          </select>
        </div>

        {/* 총 영상 길이 */}
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              <i className="fas fa-video mr-1"></i>
              Total Video Length
            </span>
            <span className="text-lg font-bold text-green-600">
              {getTotalDuration()}s
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {images.length} images × {settings.duration}s
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
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #10b981;
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #10b981;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}
