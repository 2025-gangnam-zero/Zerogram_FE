import React from "react";
import styled from "styled-components";
import { ButtonVariant, ButtonSize } from "../../types";
import { UI_CONSTANTS } from "../../constants";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  type?: "button" | "submit" | "reset";
}

interface StyledButtonProps {
  $variant?: ButtonVariant;
  $size?: ButtonSize;
  $fullWidth?: boolean;
}

const getButtonStyles = (variant: ButtonVariant, size: ButtonSize) => {
  const baseStyles = `
    border: none;
    border-radius: ${UI_CONSTANTS.BORDER_RADIUS.MD};
    font-family: inherit;
    font-weight: 600;
    cursor: pointer;
    transition: all ${UI_CONSTANTS.TRANSITIONS.NORMAL};
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
    }
  `;

  const variantStyles = {
    primary: `
      background-color: ${UI_CONSTANTS.COLORS.PRIMARY};
      color: white;
      
      &:hover:not(:disabled) {
        background-color: ${UI_CONSTANTS.COLORS.PRIMARY_HOVER};
        transform: translateY(-2px);
        box-shadow: ${UI_CONSTANTS.SHADOWS.XL};
      }
      
      &:active:not(:disabled) {
        transform: translateY(0);
      }
    `,
    secondary: `
      background-color: ${UI_CONSTANTS.COLORS.SECONDARY};
      color: white;
      
      &:hover:not(:disabled) {
        background-color: ${UI_CONSTANTS.COLORS.SECONDARY_HOVER};
        transform: translateY(-2px);
        box-shadow: ${UI_CONSTANTS.SHADOWS.XL};
      }
      
      &:active:not(:disabled) {
        transform: translateY(0);
      }
    `,
    outline: `
      background-color: transparent;
      color: ${UI_CONSTANTS.COLORS.PRIMARY};
      border: 2px solid ${UI_CONSTANTS.COLORS.PRIMARY};
      
      &:hover:not(:disabled) {
        background-color: ${UI_CONSTANTS.COLORS.PRIMARY};
        color: white;
        transform: translateY(-2px);
        box-shadow: ${UI_CONSTANTS.SHADOWS.XL};
      }
      
      &:active:not(:disabled) {
        transform: translateY(0);
      }
    `,
    danger: `
      background-color: ${UI_CONSTANTS.COLORS.DANGER};
      color: white;
      
      &:hover:not(:disabled) {
        background-color: ${UI_CONSTANTS.COLORS.DANGER_HOVER};
        transform: translateY(-2px);
        box-shadow: ${UI_CONSTANTS.SHADOWS.XL};
      }
      
      &:active:not(:disabled) {
        transform: translateY(0);
      }
    `,
  };

  const sizeStyles = {
    small: `
      padding: ${UI_CONSTANTS.SPACING.SM} ${UI_CONSTANTS.SPACING.MD};
      font-size: 14px;
    `,
    medium: `
      padding: 12px 24px;
      font-size: 16px;
    `,
    large: `
      padding: ${UI_CONSTANTS.SPACING.MD} ${UI_CONSTANTS.SPACING.XL};
      font-size: 18px;
    `,
  };

  return `
    ${baseStyles}
    ${variantStyles[variant]}
    ${sizeStyles[size]}
  `;
};

const StyledButton = styled.button<StyledButtonProps>`
  ${({ $variant = "primary", $size = "medium", $fullWidth }) => `
    ${getButtonStyles($variant, $size)}
    ${$fullWidth ? "width: 100%;" : ""}
  `}
`;

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  size = "medium",
  fullWidth = false,
  type = "button",
}) => {
  return (
    <StyledButton
      onClick={onClick}
      disabled={disabled}
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      type={type}
    >
      {children}
    </StyledButton>
  );
};

export default Button;
