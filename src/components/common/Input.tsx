import React from "react";
import styled from "styled-components";
import { InputType } from "../../types";
import { UI_CONSTANTS } from "../../constants";

interface InputProps {
  label?: string;
  type?: InputType;
  placeholder?: string;
  value?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  accept?: string;
}

const InputContainer = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label<{ required?: boolean }>`
  display: block;
  margin-bottom: ${UI_CONSTANTS.SPACING.SM};
  font-size: 14px;
  font-weight: 600;
  color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};

  ${({ required }) =>
    required &&
    `
    &::after {
      content: ' *';
      color: ${UI_CONSTANTS.COLORS.DANGER};
    }
  `}
`;

const StyledInput = styled.input<{ $hasError?: boolean }>`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid
    ${({ $hasError }) =>
      $hasError ? UI_CONSTANTS.COLORS.DANGER : UI_CONSTANTS.COLORS.BORDER};
  border-radius: ${UI_CONSTANTS.BORDER_RADIUS.MD};
  font-size: 16px;
  font-family: inherit;
  background-color: ${UI_CONSTANTS.COLORS.BACKGROUND};
  color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
  transition: all ${UI_CONSTANTS.TRANSITIONS.NORMAL};

  &::placeholder {
    color: ${UI_CONSTANTS.COLORS.MUTED};
  }

  &:focus {
    outline: none;
    border-color: ${UI_CONSTANTS.COLORS.PRIMARY};
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
  }

  &:disabled {
    background-color: #f8f9fa;
    color: ${UI_CONSTANTS.COLORS.MUTED};
    cursor: not-allowed;
  }

  ${({ $hasError }) =>
    $hasError &&
    `
    &:focus {
      border-color: ${UI_CONSTANTS.COLORS.DANGER};
      box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
    }
  `}
`;

const ErrorMessage = styled.span`
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: ${UI_CONSTANTS.COLORS.DANGER};
  font-weight: 500;
`;

const Input: React.FC<InputProps> = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  accept,
}) => {
  return (
    <InputContainer>
      {label && <Label required={required}>{label}</Label>}
      <StyledInput
        type={type}
        placeholder={placeholder}
        {...(type === "file" ? {} : { value })}
        onChange={onChange}
        $hasError={!!error}
        disabled={disabled}
        required={required}
        accept={accept}
      />
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </InputContainer>
  );
};

export default Input;
