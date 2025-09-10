import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styled from "styled-components";
import { UI_CONSTANTS } from "../../../constants";
import { searchFoodByNameApi } from "../../../api/food";
import { FoodSearchResultItem } from "../../../types/diet";

// Types for parent-facing selected value
export interface SelectedFood {
  name: string;
  calories: number;
  carbohydrates: number;
  protein: number;
  fat: number;
  sugar: number;
  sodium: number;
  cholesterol: number;
  saturatedFat: number;
  transFat: number;
  servingSize?: string;
  servingUnit?: string;
  groupName?: string;
  makerName?: string;
}

interface SearchableSelectContextValue {
  query: string;
  setQuery: (q: string) => void;
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  isLoading: boolean;
  results: FoodSearchResultItem[];
  onSelectInternal: (food: FoodSearchResultItem) => void;
}

const SearchableSelectContext =
  createContext<SearchableSelectContextValue | null>(null);

const useSearchableSelectContext = () => {
  const ctx = useContext(SearchableSelectContext);
  if (!ctx)
    throw new Error(
      "SearchableSelect subcomponent must be used within SearchableSelect"
    );
  return ctx;
};

// Styles
const Container = styled.div`
  position: relative;
  width: 100%;
`;

const InputBox = styled.input`
  width: 100%;
  padding: ${UI_CONSTANTS.SPACING.MD};
  border: 1px solid ${UI_CONSTANTS.COLORS.BORDER};
  border-radius: ${UI_CONSTANTS.BORDER_RADIUS.MD};
  font-size: 16px;
  outline: none;
  transition: border-color ${UI_CONSTANTS.TRANSITIONS.FAST};

  &:focus {
    border-color: ${UI_CONSTANTS.COLORS.PRIMARY};
    box-shadow: 0 0 0 3px rgba(27, 219, 49, 0.15);
  }
`;

const Dropdown = styled.ul<{ $isOpen: boolean }>`
  position: absolute;
  left: 0;
  right: 0;
  top: calc(100% + 6px);
  background: #fff;
  border: 1px solid ${UI_CONSTANTS.COLORS.BORDER};
  border-radius: ${UI_CONSTANTS.BORDER_RADIUS.MD};
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 300px;
  overflow-y: auto;
  box-shadow: ${UI_CONSTANTS.SHADOWS.MD};
  display: ${({ $isOpen }) => ($isOpen ? "block" : "none")};
  z-index: 20;
`;

const ItemRow = styled.li`
  padding: ${UI_CONSTANTS.SPACING.MD};
  cursor: pointer;
  transition: background ${UI_CONSTANTS.TRANSITIONS.FAST};
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${UI_CONSTANTS.SPACING.MD};

  &:hover {
    background: ${UI_CONSTANTS.COLORS.LIGHT};
  }
`;

const ItemName = styled.span`
  color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
  font-weight: 600;
`;

const ItemMeta = styled.span`
  color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY};
  font-size: 12px;
`;

// Debounce helper
const useDebouncedValue = (value: string, delayMs: number) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
};

// Root component
interface SearchableSelectProps {
  onSelect: (food: SelectedFood) => void;
  placeholder?: string;
  defaultOpen?: boolean;
  autoCloseOnSelect?: boolean;
}

const SearchableSelectRoot: React.FC<
  React.PropsWithChildren<SearchableSelectProps>
> = ({
  onSelect,
  placeholder,
  defaultOpen = false,
  autoCloseOnSelect = true,
  children,
}) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<FoodSearchResultItem[]>([]);
  const debouncedQuery = useDebouncedValue(query, 350);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fetch when debounced query changes
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!debouncedQuery || debouncedQuery.trim().length === 0) {
        setResults([]);
        return;
      }
      setIsLoading(true);
      try {
        const data = await searchFoodByNameApi(debouncedQuery.trim());
        if (!cancelled) {
          setResults(data);
          setIsOpen(true);
        }
      } catch (err) {
        if (!cancelled) {
          setResults([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const onSelectInternal = useCallback(
    (food: FoodSearchResultItem) => {
      const formatted: SelectedFood = {
        name: food.foodName,
        calories: food.calories,
        carbohydrates: food.carbohydrates || 0,
        protein: food.protein || 0,
        fat: food.fat || 0,
        sugar: food.sugar || 0,
        sodium: food.sodium || 0,
        cholesterol: food.cholesterol || 0,
        saturatedFat: food.saturatedFat || 0,
        transFat: food.transFat || 0,
        servingSize: food.servingSize,
        servingUnit: food.servingUnit,
        groupName: food.groupName,
        makerName: food.makerName,
      };
      onSelect(formatted);
      if (autoCloseOnSelect) setIsOpen(false);
    },
    [onSelect, autoCloseOnSelect]
  );

  const ctxValue = useMemo(
    () => ({
      query,
      setQuery,
      isOpen,
      setIsOpen,
      isLoading,
      results,
      onSelectInternal,
    }),
    [query, isOpen, isLoading, results, onSelectInternal]
  );

  return (
    <SearchableSelectContext.Provider value={ctxValue}>
      <Container ref={containerRef}>
        {children ?? (
          <>
            <SearchableSelect.Input placeholder={placeholder} />
            <SearchableSelect.ResultList />
          </>
        )}
      </Container>
    </SearchableSelectContext.Provider>
  );
};

// Input subcomponent
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input: React.FC<InputProps> = ({ ...rest }) => {
  const { query, setQuery, setIsOpen } = useSearchableSelectContext();
  return (
    <InputBox
      value={query}
      onChange={(e) => {
        setQuery(e.target.value);
        setIsOpen(true);
      }}
      {...rest}
    />
  );
};

// ResultList subcomponent
const EmptyState = styled.div`
  padding: ${UI_CONSTANTS.SPACING.MD};
  color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY};
`;

const LoadingState = styled.div`
  padding: ${UI_CONSTANTS.SPACING.MD};
  color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY};
`;

const ResultList: React.FC = () => {
  const { isOpen, isLoading, results } = useSearchableSelectContext();

  return (
    <Dropdown $isOpen={isOpen}>
      {isLoading && <LoadingState>검색 중...</LoadingState>}
      {!isLoading && results.length === 0 && (
        <EmptyState>검색 결과가 없습니다.</EmptyState>
      )}
      {!isLoading &&
        results.map((item) => (
          <SearchableSelect.ResultItem
            key={`${item.foodId}-${item.foodName}`}
            item={item}
          />
        ))}
    </Dropdown>
  );
};

// ResultItem subcomponent
interface ResultItemProps {
  item: FoodSearchResultItem;
}

const ResultItem: React.FC<ResultItemProps> = ({ item }) => {
  const { onSelectInternal } = useSearchableSelectContext();
  return (
    <ItemRow onClick={() => onSelectInternal(item)}>
      <ItemName>{item.foodName}</ItemName>
      <ItemMeta>{Math.round(item.calories)} kcal</ItemMeta>
    </ItemRow>
  );
};

export const SearchableSelect = Object.assign(SearchableSelectRoot, {
  Input,
  ResultList,
  ResultItem,
});

export default SearchableSelect;
