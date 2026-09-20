import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterBarProps {
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: {
    label?: string;
    value: string;
    options: FilterOption[];
    onChange: (value: string) => void;
  }[];
}

export function FilterBar({
  search,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters,
}: FilterBarProps) {
  return (
    <div className="filter-bar">
      {onSearchChange && (
        <div className="filter-search">
          <Search size={18} />
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      )}
      <div className="filter-selects">
        {filters?.map((filter, idx) => (
          <Select
            key={idx}
            label={filter.label}
            value={filter.value}
            options={filter.options}
            onChange={(e) => filter.onChange(e.target.value)}
          />
        ))}
      </div>
    </div>
  );
}
