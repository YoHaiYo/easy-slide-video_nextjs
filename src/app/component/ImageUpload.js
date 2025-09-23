"use client";
import { useState, useRef } from "react";
import Image from "next/image";

export default function ImageUpload({ images, setImages, onNext }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (files) => {
    const imageFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );

    const newImages = imageFiles.map((file, index) => ({
      id: Date.now() + index,
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      order: images.length + index + 1,
    }));

    setImages([...images, ...newImages]);
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

  const removeImage = (id) => {
    const imageToRemove = images.find((img) => img.id === id);
    if (imageToRemove) {
      URL.revokeObjectURL(imageToRemove.preview);
    }
    setImages(images.filter((img) => img.id !== id));
  };

  const moveImage = (id, direction) => {
    const currentIndex = images.findIndex((img) => img.id === id);
    if (currentIndex === -1) return;

    const newImages = [...images];
    const targetIndex =
      direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex >= 0 && targetIndex < newImages.length) {
      [newImages[currentIndex], newImages[targetIndex]] = [
        newImages[targetIndex],
        newImages[currentIndex],
      ];
      setImages(newImages);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        <i className="fas fa-images mr-2 text-green-500"></i>
        Upload Images
      </h3>

      {/* 드래그 앤 드롭 영역 */}
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
        <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-4"></i>
        <p className="text-gray-800 mb-2">
          Drag and drop images here or click to upload
        </p>
        <p className="text-sm text-gray-700">Supports JPG, PNG, GIF files</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>

      {/* 업로드된 이미지 목록 */}
      {images.length > 0 && (
        <div className="mt-6">
          <h4 className="text-md font-medium text-gray-700 mb-3">
            Uploaded Images ({images.length})
          </h4>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {images.map((image, index) => (
              <div
                key={image.id}
                className="flex items-center p-3 bg-gray-50 rounded-lg border"
              >
                <Image
                  src={image.preview}
                  alt={image.name}
                  width={48}
                  height={48}
                  className="object-cover rounded"
                />
                <div className="flex-1 ml-3">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {image.name}
                  </p>
                  <p className="text-xs text-gray-500">Order: {index + 1}</p>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => moveImage(image.id, "up")}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-green-500 disabled:opacity-30"
                  >
                    <i className="fas fa-chevron-up"></i>
                  </button>
                  <button
                    onClick={() => moveImage(image.id, "down")}
                    disabled={index === images.length - 1}
                    className="p-1 text-gray-400 hover:text-green-500 disabled:opacity-30"
                  >
                    <i className="fas fa-chevron-down"></i>
                  </button>
                  <button
                    onClick={() => removeImage(image.id)}
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

      {/* 다음 단계 버튼 */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={onNext}
          disabled={images.length === 0}
          className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
        >
          Next Step
          <i className="fas fa-arrow-right ml-2"></i>
        </button>
      </div>
    </div>
  );
}
