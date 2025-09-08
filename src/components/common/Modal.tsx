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
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <ModalOverlay $isOpen={isOpen} onClick={handleOverlayClick}>
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
