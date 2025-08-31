import React from "react";
import styled from "styled-components";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "small" | "medium" | "large";
  fullWidth?: boolean;
  type?: "button" | "submit" | "reset";
}

const getButtonStyles = (variant: string, size: string) => {
  const baseStyles = `
    border: none;
    border-radius: 8px;
    font-family: inherit;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
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
      background-color: #3498db;
      color: white;
      
      &:hover:not(:disabled) {
        background-color: #2980b9;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
      }
      
      &:active:not(:disabled) {
        transform: translateY(0);
      }
    `,
    secondary: `
      background-color: #95a5a6;
      color: white;
      
      &:hover:not(:disabled) {
        background-color: #7f8c8d;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(149, 165, 166, 0.3);
      }
      
      &:active:not(:disabled) {
        transform: translateY(0);
      }
    `,
    outline: `
      background-color: transparent;
      color: #3498db;
      border: 2px solid #3498db;
      
      &:hover:not(:disabled) {
        background-color: #3498db;
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
      }
      
      &:active:not(:disabled) {
        transform: translateY(0);
      }
    `,
    danger: `
      background-color: #e74c3c;
      color: white;
      
      &:hover:not(:disabled) {
        background-color: #c0392b;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
      }
      
      &:active:not(:disabled) {
        transform: translateY(0);
      }
    `,
  };

  const sizeStyles = {
    small: `
      padding: 8px 16px;
      font-size: 14px;
    `,
    medium: `
      padding: 12px 24px;
      font-size: 16px;
    `,
    large: `
      padding: 16px 32px;
      font-size: 18px;
    `,
  };

  return `
    ${baseStyles}
    ${variantStyles[variant as keyof typeof variantStyles]}
    ${sizeStyles[size as keyof typeof sizeStyles]}
  `;
};

const StyledButton = styled.button<ButtonProps>`
  ${({ variant = "primary", size = "medium", fullWidth }) => `
    ${getButtonStyles(variant, size)}
    ${fullWidth ? "width: 100%;" : ""}
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
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      type={type}
    >
      {children}
    </StyledButton>
  );
};

export default Button;
