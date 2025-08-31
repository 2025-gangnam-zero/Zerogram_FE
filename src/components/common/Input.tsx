import React from "react";
import styled from "styled-components";

interface InputProps {
  label?: string;
  type?: "text" | "email" | "password" | "number" | "tel";
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
}

const InputContainer = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label<{ required?: boolean }>`
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;

  ${({ required }) =>
    required &&
    `
    &::after {
      content: ' *';
      color: #e74c3c;
    }
  `}
`;

const StyledInput = styled.input<{ $hasError?: boolean }>`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid ${({ $hasError }) => ($hasError ? "#e74c3c" : "#e1e8ed")};
  border-radius: 8px;
  font-size: 16px;
  font-family: inherit;
  background-color: #ffffff;
  color: #2c3e50;
  transition: all 0.3s ease;

  &::placeholder {
    color: #95a5a6;
  }

  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
  }

  &:disabled {
    background-color: #f8f9fa;
    color: #95a5a6;
    cursor: not-allowed;
  }

  ${({ $hasError }) =>
    $hasError &&
    `
    &:focus {
      border-color: #e74c3c;
      box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
    }
  `}
`;

const ErrorMessage = styled.span`
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: #e74c3c;
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
}) => {
  return (
    <InputContainer>
      {label && <Label required={required}>{label}</Label>}
      <StyledInput
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        $hasError={!!error}
        required={required}
      />
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </InputContainer>
  );
};

export default Input;
