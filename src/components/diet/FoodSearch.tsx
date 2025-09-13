import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { useFoodSearch } from "../../hooks/useFoodSearch";
import { UI_CONSTANTS } from "../../constants";
import Input from "../common/Input";

// Props 타입 정의
interface FoodSearchProps {
  onFoodSelect: (food: {
    foodId: string;
    foodName: string;
    calories: number;
  }) => void;
  placeholder?: string;
  disabled?: boolean;
}

// 검색 결과 아이템 타입
interface SearchResultItem {
  foodId: string;
  foodName: string;
  calories: number;
}

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
`;

const SearchInput = styled(Input)`
  width: 100%;
  font-size: 1rem;
`;

const SearchResults = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: ${UI_CONSTANTS.COLORS.BACKGROUND};
  border: 1px solid ${UI_CONSTANTS.COLORS.BORDER};
  border-top: none;
  border-radius: 0 0 ${UI_CONSTANTS.BORDER_RADIUS.MD}
    ${UI_CONSTANTS.BORDER_RADIUS.MD};
  box-shadow: ${UI_CONSTANTS.SHADOWS.MD};
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
`;

const SearchResultItems = styled.div`
  padding: ${UI_CONSTANTS.SPACING.MD};
  cursor: pointer;
  border-bottom: 1px solid ${UI_CONSTANTS.COLORS.BORDER};
  transition: ${UI_CONSTANTS.TRANSITIONS.FAST};
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:hover {
    background-color: ${UI_CONSTANTS.COLORS.LIGHT};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const FoodName = styled.span`
  font-weight: 500;
  color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
  flex: 1;
`;

const FoodCalories = styled.span`
  font-size: 0.9rem;
  color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY};
  margin-left: ${UI_CONSTANTS.SPACING.SM};
`;

const NoResults = styled.div`
  padding: ${UI_CONSTANTS.SPACING.MD};
  text-align: center;
  color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY};
  font-style: italic;
`;

const LoadingIndicator = styled.div`
  padding: ${UI_CONSTANTS.SPACING.MD};
  text-align: center;
  color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY};
`;

const FoodSearch: React.FC<FoodSearchProps> = ({
  onFoodSelect,
  placeholder = "음식을 검색하세요...",
  disabled = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { search } = useFoodSearch();

  // 검색 결과 상태
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);

  // 검색어 변경 시 검색 실행
  useEffect(() => {
    if (searchTerm.trim()) {
      setIsLoading(true);
      const results = search(searchTerm);
      setSearchResults(results);
      setIsLoading(false);
      setIsOpen(true);
    } else {
      setSearchResults([]);
      setIsOpen(false);
    }
  }, [searchTerm, search]);

  // 외부 클릭 시 검색 결과 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 음식 선택 핸들러
  const handleFoodSelect = (food: SearchResultItem) => {
    onFoodSelect(food);
    setSearchTerm(food.foodName);
    setIsOpen(false);
  };

  // 입력 변경 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // 입력 포커스 핸들러
  const handleInputFocus = () => {
    if (searchResults.length > 0) {
      setIsOpen(true);
    }
  };

  // 키보드 이벤트 핸들러
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <SearchContainer ref={searchRef}>
      <SearchInput
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
      />

      {isOpen && (
        <SearchResults>
          {isLoading ? (
            <LoadingIndicator>검색 중...</LoadingIndicator>
          ) : searchResults.length > 0 ? (
            searchResults.map((food) => (
              <SearchResultItems
                key={food.foodId}
                onClick={() => handleFoodSelect(food)}
              >
                <FoodName>{food.foodName}</FoodName>
                <FoodCalories>{food.calories} kcal</FoodCalories>
              </SearchResultItems>
            ))
          ) : searchTerm.trim() ? (
            <NoResults>검색 결과가 없습니다.</NoResults>
          ) : null}
        </SearchResults>
      )}
    </SearchContainer>
  );
};

export default FoodSearch;
