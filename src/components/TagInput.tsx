import { useState, KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
}

export function TagInput({ tags, onChange, placeholder = "Add tag...", suggestions = [] }: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = suggestions.filter(
    s => s.toLowerCase().includes(inputValue.toLowerCase()) && !tags.includes(s)
  );

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onChange([...tags, trimmedTag]);
    }
    setInputValue("");
    setShowSuggestions(false);
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const tagColors = [
    "bg-primary/20 text-primary border-primary/50",
    "bg-chart-1/20 text-chart-1 border-chart-1/50",
    "bg-chart-2/20 text-chart-2 border-chart-2/50",
    "bg-chart-3/20 text-chart-3 border-chart-3/50",
    "bg-chart-4/20 text-chart-4 border-chart-4/50",
    "bg-chart-5/20 text-chart-5 border-chart-5/50",
  ];

  const getTagColor = (tag: string) => {
    const index = tag.charCodeAt(0) % tagColors.length;
    return tagColors[index];
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5 p-2 min-h-[42px] border border-input rounded-md bg-background focus-within:ring-2 focus-within:ring-ring">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="outline"
            className={`${getTagColor(tag)} text-xs py-0.5 px-2 gap-1`}
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:bg-background/20 rounded-full p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[100px] border-0 p-0 h-6 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>
      
      {/* Suggestions dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="border border-border rounded-md bg-popover shadow-md">
          {filteredSuggestions.slice(0, 5).map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              className="w-full text-left px-3 py-2 text-sm hover:bg-secondary/50 transition-colors first:rounded-t-md last:rounded-b-md"
              onClick={() => addTag(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
