import React from "react";
import styled from "styled-components";
import { UI_CONSTANTS } from "../../constants";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: ${({ $isOpen }) => ($isOpen ? "flex" : "none")};
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background-color: white;
  border-radius: ${UI_CONSTANTS.BORDER_RADIUS.LG};
  max-width: 600px;
  width: 90%;
  max-height: 90%;
  overflow-y: auto;
  box-shadow: ${UI_CONSTANTS.SHADOWS.LG};
`;

const ModalHeader = styled.div`
  padding: ${UI_CONSTANTS.SPACING.LG};
  border-bottom: 1px solid ${UI_CONSTANTS.COLORS.BORDER};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY};
  padding: 0;

  &:hover {
    color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
  }
`;

const ModalContent = styled.div`
  padding: ${UI_CONSTANTS.SPACING.LG};
`;

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  const [dragStart, setDragStart] = React.useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const handleOverlayClick = (e: React.MouseEvent) => {
    // 드래그 중이면 모달을 닫지 않음
    if (isDragging) {
      return;
    }

    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragStart({ x: e.clientX, y: e.clientY });
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragStart) return;

    const deltaX = Math.abs(e.clientX - dragStart.x);
    const deltaY = Math.abs(e.clientY - dragStart.y);

    // 드래그 거리가 5px 이상이면 드래그로 간주
    if (deltaX > 5 || deltaY > 5) {
      setIsDragging(true);
    }
  };

  const handleMouseUp = () => {
    setDragStart(null);
    // 드래그 상태를 잠시 유지한 후 리셋 (클릭 이벤트가 발생할 수 있으므로)
    setTimeout(() => setIsDragging(false), 100);
  };

  return (
    <ModalOverlay
      $isOpen={isOpen}
      onClick={handleOverlayClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <ModalContainer>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>
        <ModalContent>{children}</ModalContent>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default Modal;
