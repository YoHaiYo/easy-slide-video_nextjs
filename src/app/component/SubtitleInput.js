"use client";
import { useState } from "react";

export default function SubtitleInput({ subtitle, setSubtitle, onNext, onPrev }) {
  const [subtitleSettings, setSubtitleSettings] = useState({
    position: 'bottom',
    fontSize: 'medium',
    color: 'white',
    backgroundColor: 'black'
  });

  const handleSubtitleChange = (e) => {
    setSubtitle(e.target.value);
  };

  const handleSettingsChange = (setting, value) => {
    setSubtitleSettings({
      ...subtitleSettings,
      [setting]: value
    });
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        <i className="fas fa-font mr-2 text-green-500"></i>
        자막 입력
      </h3>

      {/* 자막 텍스트 입력 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          자막 텍스트
        </label>
        <textarea
          value={subtitle}
          onChange={handleSubtitleChange}
          placeholder="영상에 표시할 자막을 입력하세요..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
          rows={4}
        />
        <div className="text-xs text-gray-500 mt-1">
          {subtitle.length}자 입력됨
        </div>
      </div>

      {/* 자막 설정 옵션들 */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-700">
          자막 설정
        </h4>

        {/* 자막 위치 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <i className="fas fa-arrows-alt mr-1"></i>
            위치
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'top', label: '상단', icon: 'fas fa-arrow-up' },
              { value: 'center', label: '중앙', icon: 'fas fa-minus' },
              { value: 'bottom', label: '하단', icon: 'fas fa-arrow-down' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleSettingsChange('position', option.value)}
                className={`p-3 rounded-lg border text-sm font-medium transition-colors duration-200 ${
                  subtitleSettings.position === option.value
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 hover:border-green-400'
                }`}
              >
                <i className={`${option.icon} mr-1`}></i>
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* 글자 크기 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <i className="fas fa-text-height mr-1"></i>
            글자 크기
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'small', label: '작게' },
              { value: 'medium', label: '보통' },
              { value: 'large', label: '크게' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleSettingsChange('fontSize', option.value)}
                className={`p-3 rounded-lg border text-sm font-medium transition-colors duration-200 ${
                  subtitleSettings.fontSize === option.value
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 hover:border-green-400'
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
            글자 색상
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { value: 'white', label: '흰색', color: 'bg-white border-gray-300' },
              { value: 'black', label: '검은색', color: 'bg-black' },
              { value: 'yellow', label: '노란색', color: 'bg-yellow-400' },
              { value: 'green', label: '초록색', color: 'bg-green-500' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleSettingsChange('color', option.value)}
                className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors duration-200 ${
                  subtitleSettings.color === option.value
                    ? 'border-green-500 ring-2 ring-green-200'
                    : 'border-gray-300 hover:border-green-400'
                }`}
              >
                <div className={`w-4 h-4 rounded-full mx-auto mb-1 ${option.color}`}></div>
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* 배경 색상 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <i className="fas fa-square mr-1"></i>
            배경 색상
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { value: 'transparent', label: '투명', color: 'bg-transparent border-2 border-dashed border-gray-300' },
              { value: 'black', label: '검은색', color: 'bg-black' },
              { value: 'white', label: '흰색', color: 'bg-white border-gray-300' },
              { value: 'green', label: '초록색', color: 'bg-green-500' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleSettingsChange('backgroundColor', option.value)}
                className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors duration-200 ${
                  subtitleSettings.backgroundColor === option.value
                    ? 'border-green-500 ring-2 ring-green-200'
                    : 'border-gray-300 hover:border-green-400'
                }`}
              >
                <div className={`w-4 h-4 rounded-full mx-auto mb-1 ${option.color}`}></div>
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 자막 미리보기 */}
      {subtitle && (
        <div className="mt-6">
          <h4 className="text-md font-medium text-gray-700 mb-3">
            자막 미리보기
          </h4>
          <div className="relative bg-gray-900 rounded-lg p-8 min-h-[120px] flex items-center justify-center">
            <div
              className={`text-center ${
                subtitleSettings.position === 'top' ? 'self-start mt-4' :
                subtitleSettings.position === 'center' ? 'self-center' :
                'self-end mb-4'
              }`}
            >
              <span
                className={`inline-block px-4 py-2 rounded ${
                  subtitleSettings.fontSize === 'small' ? 'text-sm' :
                  subtitleSettings.fontSize === 'medium' ? 'text-base' :
                  'text-lg'
                } ${
                  subtitleSettings.color === 'white' ? 'text-white' :
                  subtitleSettings.color === 'black' ? 'text-black' :
                  subtitleSettings.color === 'yellow' ? 'text-yellow-400' :
                  'text-green-400'
                } ${
                  subtitleSettings.backgroundColor === 'transparent' ? '' :
                  subtitleSettings.backgroundColor === 'black' ? 'bg-black' :
                  subtitleSettings.backgroundColor === 'white' ? 'bg-white text-black' :
                  'bg-green-500'
                }`}
              >
                {subtitle}
              </span>
            </div>
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
                자막 없이 진행하기
              </p>
              <p className="text-xs text-blue-600 mt-1">
                자막을 입력하지 않으면 사진과 음악만으로 슬라이드쇼가 생성됩니다.
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
          이전
        </button>
        <button
          onClick={onNext}
          className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200"
        >
          다음 단계
          <i className="fas fa-arrow-right ml-2"></i>
        </button>
      </div>
    </div>
  );
}
