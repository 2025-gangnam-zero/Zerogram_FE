import React from "react";
import styled from "styled-components";
import { Location } from "../../types/meet";
import { UI_CONSTANTS } from "../../constants";

interface LocationFilterProps {
  selectedLocation: Location | "all";
  onLocationChange: (location: Location | "all") => void;
}

const FilterContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e1e5e9;
`;

const FilterTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
  margin: 0 0 16px 0;
`;

const FilterOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const FilterOption = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background-color ${UI_CONSTANTS.TRANSITIONS.NORMAL};

  &:hover {
    background-color: #f8f9fa;
  }
`;

const RadioInput = styled.input`
  margin: 0;
  accent-color: ${UI_CONSTANTS.COLORS.PRIMARY};
`;

const OptionLabel = styled.span`
  font-size: 0.9rem;
  color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
  font-weight: 500;
`;

const OptionIcon = styled.span`
  font-size: 1.1rem;
`;

const LocationFilter: React.FC<LocationFilterProps> = ({
  selectedLocation,
  onLocationChange,
}) => {
  const locationOptions = [
    { value: "all", label: "전체 지역", icon: "📍" },
    { value: "강남구", label: "강남구", icon: "🏢" },
    { value: "서초구", label: "서초구", icon: "🌳" },
  ] as const;

  return (
    <FilterContainer>
      <FilterTitle>지역</FilterTitle>
      <FilterOptions>
        {locationOptions.map((option) => (
          <FilterOption key={option.value}>
            <RadioInput
              type="radio"
              name="location"
              value={option.value}
              checked={selectedLocation === option.value}
              onChange={() =>
                onLocationChange(option.value as Location | "all")
              }
            />
            <OptionIcon>{option.icon}</OptionIcon>
            <OptionLabel>{option.label}</OptionLabel>
          </FilterOption>
        ))}
      </FilterOptions>
    </FilterContainer>
  );
};

export default LocationFilter;
