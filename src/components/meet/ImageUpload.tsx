import React, { useState, useRef, useCallback } from "react";
import styled from "styled-components";
import { UI_CONSTANTS } from "../../constants";

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  onNewImagesChange: (files: File[]) => void;
  onExistingImagesChange: (urls: string[]) => void;
  onPreviewImagesChange?: (previewUrls: string[]) => void; // 미리보기용 blob URL들
  maxImages?: number;
  disabled?: boolean;
}

const ImageUploadContainer = styled.div`
  width: 100%;
`;

const UploadArea = styled.div<{ $isDragOver: boolean; $disabled: boolean }>`
  border: 2px dashed
    ${(props) => (props.$isDragOver ? UI_CONSTANTS.COLORS.PRIMARY : "#e1e5e9")};
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  background: ${(props) =>
    props.$isDragOver ? "rgba(52, 152, 219, 0.05)" : "#f8f9fa"};
  cursor: ${(props) => (props.$disabled ? "not-allowed" : "pointer")};
  transition: all ${UI_CONSTANTS.TRANSITIONS.NORMAL};
  opacity: ${(props) => (props.$disabled ? 0.6 : 1)};

  &:hover {
    border-color: ${(props) =>
      props.$disabled ? "#e1e5e9" : UI_CONSTANTS.COLORS.PRIMARY};
    background: ${(props) =>
      props.$disabled ? "#f8f9fa" : "rgba(52, 152, 219, 0.05)"};
  }
`;

const UploadIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 16px;
  color: ${UI_CONSTANTS.COLORS.PRIMARY};
`;

const UploadText = styled.p`
  margin: 0 0 8px 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
`;

const UploadSubtext = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY};
`;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  margin-top: 20px;
`;

const ImageItem = styled.div<{ $isDragging: boolean }>`
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  cursor: move;
  opacity: ${(props) => (props.$isDragging ? 0.5 : 1)};
  transition: all ${UI_CONSTANTS.TRANSITIONS.NORMAL};
  border: 2px solid transparent;

  &:hover {
    border-color: ${UI_CONSTANTS.COLORS.PRIMARY};
  }
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  transition: all ${UI_CONSTANTS.TRANSITIONS.NORMAL};

  &:hover {
    background: rgba(220, 53, 69, 0.9);
    transform: scale(1.1);
  }
`;

const DragOverlay = styled.div<{ $isVisible: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(52, 152, 219, 0.1);
  border: 2px dashed ${UI_CONSTANTS.COLORS.PRIMARY};
  border-radius: 8px;
  display: ${(props) => (props.$isVisible ? "flex" : "none")};
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: ${UI_CONSTANTS.COLORS.PRIMARY};
  z-index: 10;
`;

const HiddenInput = styled.input`
  display: none;
`;

const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onImagesChange,
  onNewImagesChange,
  onExistingImagesChange,
  onPreviewImagesChange,
  maxImages = 10,
  disabled = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = useCallback(
    (files: File[]) => {
      if (images.length + files.length > maxImages) {
        alert(`최대 ${maxImages}개의 이미지만 업로드할 수 있습니다.`);
        return;
      }

      // 새 파일들을 File 배열로 저장
      onNewImagesChange(files);

      // 미리보기를 위해 파일들을 URL로 변환
      const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
      const updatedPreviewImages = [...previewImages, ...newPreviewUrls];
      setPreviewImages(updatedPreviewImages);

      // 실제 이미지 URL은 그대로 유지 (blob URL은 포함하지 않음)
      onImagesChange(images);

      // 미리보기 URL들을 부모 컴포넌트에 전달
      if (onPreviewImagesChange) {
        onPreviewImagesChange(updatedPreviewImages);
      }
    },
    [
      images,
      maxImages,
      onImagesChange,
      onNewImagesChange,
      onPreviewImagesChange,
      previewImages,
    ]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith("image/")
      );

      if (files.length > 0) {
        handleFileSelect(files);
      }
    },
    [disabled, handleFileSelect]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        handleFileSelect(files);
      }
      // 파일 입력 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [handleFileSelect]
  );

  const handleRemoveImage = useCallback(
    (index: number) => {
      const removedImage = images[index];
      const newImages = images.filter((_, i) => i !== index);
      onImagesChange(newImages);

      // 삭제된 이미지가 기존 이미지(blob:가 아닌 URL)인 경우 onExistingImagesChange 호출
      if (removedImage && !removedImage.startsWith("blob:")) {
        // 단일 이미지만 전달 (중복 방지)
        onExistingImagesChange([removedImage]);
      }
    },
    [images, onImagesChange, onExistingImagesChange]
  );

  const handleRemovePreviewImage = useCallback(
    (index: number) => {
      const removedImage = previewImages[index];
      const newPreviewImages = previewImages.filter((_, i) => i !== index);
      setPreviewImages(newPreviewImages);

      // 미리보기 URL 정리
      if (removedImage && removedImage.startsWith("blob:")) {
        URL.revokeObjectURL(removedImage);
      }

      // 미리보기 URL들을 부모 컴포넌트에 전달
      if (onPreviewImagesChange) {
        onPreviewImagesChange(newPreviewImages);
      }
    },
    [previewImages, onPreviewImagesChange]
  );

  const handleDragStart = useCallback(
    (e: React.DragEvent, index: number) => {
      if (disabled) return;
      setDraggedIndex(index);
      e.dataTransfer.effectAllowed = "move";
    },
    [disabled]
  );

  const handleDragOverItem = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      if (disabled) return;
      setDragOverIndex(index);
    },
    [disabled]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  const handleDropItem = useCallback(
    (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();
      if (disabled || draggedIndex === null) return;

      const newImages = [...images];
      const draggedItem = newImages[draggedIndex];
      newImages.splice(draggedIndex, 1);
      newImages.splice(dropIndex, 0, draggedItem);

      onImagesChange(newImages);
      setDraggedIndex(null);
      setDragOverIndex(null);
    },
    [disabled, draggedIndex, images, onImagesChange]
  );

  const handleUploadClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  return (
    <ImageUploadContainer>
      <UploadArea
        $isDragOver={isDragOver}
        $disabled={disabled}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleUploadClick}
      >
        <UploadIcon>📷</UploadIcon>
        <UploadText>
          {isDragOver
            ? "이미지를 여기에 놓으세요"
            : "이미지를 드래그하거나 클릭하여 업로드"}
        </UploadText>
        <UploadSubtext>
          JPG, PNG, GIF 파일만 지원됩니다 (최대 {maxImages}개)
        </UploadSubtext>
      </UploadArea>

      <HiddenInput
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileInputChange}
        disabled={disabled}
      />

      {(images.length > 0 || previewImages.length > 0) && (
        <ImageGrid>
          {/* 실제 이미지들 */}
          {images.map((image, index) => (
            <ImageItem
              key={`actual-${image}-${index}`}
              $isDragging={draggedIndex === index}
              draggable={!disabled}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOverItem(e, index)}
              onDragEnd={handleDragEnd}
              onDrop={(e) => handleDropItem(e, index)}
            >
              <Image src={image} alt={`Upload ${index + 1}`} />
              <RemoveButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage(index);
                }}
                disabled={disabled}
              >
                ×
              </RemoveButton>
              <DragOverlay $isVisible={dragOverIndex === index}>
                여기에 놓기
              </DragOverlay>
            </ImageItem>
          ))}
          {/* 미리보기 이미지들 */}
          {previewImages.map((image, index) => (
            <ImageItem
              key={`preview-${image}-${index}`}
              $isDragging={draggedIndex === images.length + index}
              draggable={!disabled}
              onDragStart={(e) => handleDragStart(e, images.length + index)}
              onDragOver={(e) => handleDragOverItem(e, images.length + index)}
              onDragEnd={handleDragEnd}
              onDrop={(e) => handleDropItem(e, images.length + index)}
            >
              <Image src={image} alt={`Preview ${index + 1}`} />
              <RemoveButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemovePreviewImage(index);
                }}
                disabled={disabled}
              >
                ×
              </RemoveButton>
              <DragOverlay $isVisible={dragOverIndex === images.length + index}>
                여기에 놓기
              </DragOverlay>
            </ImageItem>
          ))}
        </ImageGrid>
      )}
    </ImageUploadContainer>
  );
};

export default ImageUpload;
