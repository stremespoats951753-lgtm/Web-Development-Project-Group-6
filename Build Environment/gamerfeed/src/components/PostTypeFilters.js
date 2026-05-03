"use client";
// simple filter row for the 4 feed buttons
const FILTERS = [
  { label: "Display all", value: "" },
  { label: "Update", value: "update" },
  { label: "Achievement", value: "achievement" },
  { label: "Discussion", value: "discussion" },
];

export default function PostTypeFilters({ activeType, onChange }) {
  return (
    <div className="feed-filters" aria-label="Post filters">
      {FILTERS.map((item) => {
        const isOn = activeType === item.value;
        return (
          <button
            key={item.value || "all"}
            type="button"
            className={"feed-filter-btn" + (isOn ? " on" : "")}
            onClick={() => onChange(item.value)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
