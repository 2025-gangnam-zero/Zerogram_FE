import React from "react";
import styled from "styled-components";
import { UI_CONSTANTS } from "../../constants";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  placeholder?: string;
}

const SearchContainer = styled.div`
  max-width: 600px;
  margin: 0 auto 30px auto;
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px 12px 48px;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  font-size: 1rem;
  transition: all ${UI_CONSTANTS.TRANSITIONS.NORMAL};
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &:focus {
    outline: none;
    border-color: ${UI_CONSTANTS.COLORS.PRIMARY};
    box-shadow: 0 4px 16px rgba(52, 152, 219, 0.2);
  }

  &::placeholder {
    color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY};
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.2rem;
  color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY};
  pointer-events: none;
`;

const ClearButton = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 1.2rem;
  color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY};
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all ${UI_CONSTANTS.TRANSITIONS.NORMAL};

  &:hover {
    background: #f8f9fa;
    color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
  }
`;

const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  placeholder = "게시글 제목, 내용, 작성자로 검색...",
}) => {
  const handleClear = () => {
    onSearchChange("");
  };

  return (
    <SearchContainer>
      <SearchIcon>🔍</SearchIcon>
      <SearchInput
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={placeholder}
      />
      {searchTerm && (
        <ClearButton onClick={handleClear} type="button">
          ✕
        </ClearButton>
      )}
    </SearchContainer>
  );
};

export default SearchBar;
