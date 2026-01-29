import { useState, useEffect } from 'react';

interface ImageViewerProps {
  images: { url: string; filename: string }[];
  initialIndex: number;
  onClose: () => void;
}

function ImageViewer({ images, initialIndex, onClose }: ImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);

  const currentImage = images[currentIndex];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
          break;
        case 'ArrowRight':
          if (currentIndex < images.length - 1) setCurrentIndex(currentIndex + 1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, images.length, onClose]);

  const goToPrevious = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const goToNext = () => {
    if (currentIndex < images.length - 1) setCurrentIndex(currentIndex + 1);
  };

  return (
    <div className="image-viewer-overlay" onClick={onClose}>
      <div className="image-viewer-content" onClick={(e) => e.stopPropagation()}>
        <button className="viewer-close-btn" onClick={onClose}>
          ×
        </button>

        <div className="viewer-main">
          {currentIndex > 0 && (
            <button className="viewer-nav prev" onClick={goToPrevious}>
              ‹
            </button>
          )}

          <div
            className={`viewer-image-container ${isZoomed ? 'zoomed' : ''}`}
            onClick={() => setIsZoomed(!isZoomed)}
          >
            <img src={currentImage.url} alt={currentImage.filename} />
          </div>

          {currentIndex < images.length - 1 && (
            <button className="viewer-nav next" onClick={goToNext}>
              ›
            </button>
          )}
        </div>

        <div className="viewer-info">
          <span className="viewer-filename">{currentImage.filename}</span>
          <span className="viewer-counter">
            {currentIndex + 1} of {images.length}
          </span>
        </div>

        {images.length > 1 && (
          <div className="viewer-thumbnails">
            {images.map((image, index) => (
              <button
                key={index}
                className={`thumbnail ${index === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(index)}
              >
                <img src={image.url} alt={image.filename} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ImageViewer;
