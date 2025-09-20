import React from "react";
import styled from "styled-components";
import { UI_CONSTANTS } from "../../constants";

interface CardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const CardContainer = styled.div<{ $clickable?: boolean }>`
  background: ${UI_CONSTANTS.COLORS.BACKGROUND};
  border: 1px solid ${UI_CONSTANTS.COLORS.BORDER};
  border-radius: ${UI_CONSTANTS.BORDER_RADIUS.MD};
  padding: ${UI_CONSTANTS.SPACING.MD};
  box-shadow: ${UI_CONSTANTS.SHADOWS.SM};
  transition: ${UI_CONSTANTS.TRANSITIONS.NORMAL};
  cursor: ${(props) => (props.$clickable ? "pointer" : "default")};

  &:hover {
    ${(props) =>
      props.$clickable &&
      `
      box-shadow: ${UI_CONSTANTS.SHADOWS.MD};
      transform: translateY(-2px);
    `}
  }
`;

const Card: React.FC<CardProps> = ({ children, onClick, className }) => {
  return (
    <CardContainer
      $clickable={!!onClick}
      onClick={onClick}
      className={className}
    >
      {children}
    </CardContainer>
  );
};

export default Card;
