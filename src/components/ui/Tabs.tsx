import { cn } from "@/utils/helpers";

export interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
}

export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div className="tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={cn("tab", activeTab === tab.id && "tab-active")}
          onClick={() => onChange(tab.id)}
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
