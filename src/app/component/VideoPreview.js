"use client";
import { useState, useEffect } from "react";

export default function VideoPreview({ images, settings, musicFile, subtitle, onNext, onPrev }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const totalDuration = images.length * settings.duration;

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 0.1;
          if (newProgress >= totalDuration) {
            setIsPlaying(false);
            setCurrentImageIndex(0);
            return 0;
          }
          const newImageIndex = Math.floor(newProgress / settings.duration);
          setCurrentImageIndex(newImageIndex);
          return newProgress;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, settings.duration, totalDuration]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentImageIndex(0);
    setProgress(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTransitionClass = () => {
    switch (settings.transition) {
      case 'fade':
        return 'transition-opacity duration-500';
      case 'slide':
        return 'transition-transform duration-500';
      case 'zoom':
        return 'transition-transform duration-500';
      default:
        return '';
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        <i className="fas fa-play mr-2 text-green-500"></i>
        미리보기
      </h3>

      {/* 영상 미리보기 영역 */}
      <div className="mb-6">
        <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
          {images.length > 0 ? (
            <div className="relative w-full h-full">
              {images.map((image, index) => (
                <img
                  key={image.id}
                  src={image.preview}
                  alt={image.name}
                  className={`absolute inset-0 w-full h-full object-cover ${
                    index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                  } ${getTransitionClass()}`}
                  style={{
                    transform: settings.transition === 'slide' && index === currentImageIndex 
                      ? 'translateX(0)' 
                      : settings.transition === 'slide' 
                        ? 'translateX(100%)' 
                        : settings.transition === 'zoom' && index === currentImageIndex
                          ? 'scale(1)'
                          : settings.transition === 'zoom'
                            ? 'scale(1.1)'
                            : 'none'
                  }}
                />
              ))}
              
              {/* 자막 표시 */}
              {subtitle && (
                <div className={`absolute left-0 right-0 px-4 py-2 ${
                  settings.subtitlePosition === 'top' ? 'top-4' :
                  settings.subtitlePosition === 'center' ? 'top-1/2 transform -translate-y-1/2' :
                  'bottom-4'
                }`}>
                  <div className="text-center">
                    <span className="text-white text-lg font-medium bg-black bg-opacity-50 px-4 py-2 rounded">
                      {subtitle}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <i className="fas fa-image text-4xl mb-2"></i>
                <p>사진을 업로드하세요</p>
              </div>
            </div>
          )}
        </div>

        {/* 재생 컨트롤 */}
        <div className="mt-4 space-y-3">
          {/* 진행 바 */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-100"
              style={{ width: `${(progress / totalDuration) * 100}%` }}
            ></div>
          </div>

          {/* 컨트롤 버튼들 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handlePlayPause}
                className="bg-green-500 text-white p-3 rounded-full hover:bg-green-600 transition-colors duration-200"
              >
                <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
              </button>
              <button
                onClick={handleReset}
                className="bg-gray-500 text-white p-3 rounded-full hover:bg-gray-600 transition-colors duration-200"
              >
                <i className="fas fa-stop"></i>
              </button>
            </div>

            <div className="text-sm text-gray-600">
              {formatTime(progress)} / {formatTime(totalDuration)}
            </div>
          </div>
        </div>
      </div>

      {/* 영상 정보 요약 */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-700">
          영상 정보
        </h4>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <i className="fas fa-images text-green-500"></i>
              <span className="font-medium">사진 수</span>
            </div>
            <p className="text-lg font-bold text-gray-800 mt-1">
              {images.length}장
            </p>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <i className="fas fa-clock text-green-500"></i>
              <span className="font-medium">총 길이</span>
            </div>
            <p className="text-lg font-bold text-gray-800 mt-1">
              {formatTime(totalDuration)}
            </p>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <i className="fas fa-magic text-green-500"></i>
              <span className="font-medium">전환 효과</span>
            </div>
            <p className="text-lg font-bold text-gray-800 mt-1">
              {settings.transition === 'fade' ? '페이드' :
               settings.transition === 'slide' ? '슬라이드' :
               settings.transition === 'zoom' ? '줌' : '없음'}
            </p>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <i className="fas fa-music text-green-500"></i>
              <span className="font-medium">음악</span>
            </div>
            <p className="text-lg font-bold text-gray-800 mt-1">
              {musicFile ? '있음' : '없음'}
            </p>
          </div>
        </div>

        {/* 자막 정보 */}
        {subtitle && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <i className="fas fa-font text-green-500"></i>
              <span className="font-medium">자막</span>
            </div>
            <p className="text-sm text-gray-700 bg-white p-2 rounded border">
              {subtitle}
            </p>
          </div>
        )}
      </div>

      {/* 버튼들 */}
      <div className="mt-6 flex justify-between">
        <button
          onClick={onPrev}
          className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          이전
        </button>
        <button
          onClick={onNext}
          disabled={images.length === 0}
          className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
        >
          영상 생성
          <i className="fas fa-download ml-2"></i>
        </button>
      </div>
    </div>
  );
}
