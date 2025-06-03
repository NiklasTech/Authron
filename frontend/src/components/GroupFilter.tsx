import { FiChevronRight, FiFolder, FiStar } from "react-icons/fi";
import { useNLSContext } from "../context/NLSContext";

interface GroupFilterProps {
  groups: string[];
  selectedGroup: string | null;
  onSelectGroup: (group: string | null) => void;
  showOnlyFavorites: boolean;
  onToggleFavorites: () => void;
}

export function GroupFilter({
  groups,
  selectedGroup,
  onSelectGroup,
  showOnlyFavorites,
  onToggleFavorites,
}: GroupFilterProps) {
  const { t } = useNLSContext();

  return (
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2 flex items-center">
        <FiFolder className="mr-2" size={16} />
        {t("groups")}
      </h3>
      <div className="space-y-1">
        <button
          onClick={() => onSelectGroup(null)}
          className={`w-full text-left px-3 py-2 rounded-lg flex items-center text-sm ${
            selectedGroup === null && !showOnlyFavorites
              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          {t("all_passwords")}
          <FiChevronRight
            className="ml-auto"
            size={16}
            style={{
              opacity: selectedGroup === null && !showOnlyFavorites ? 1 : 0,
            }}
          />
        </button>

        <button
          onClick={onToggleFavorites}
          className={`w-full text-left px-3 py-2 rounded-lg flex items-center text-sm ${
            showOnlyFavorites
              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          <FiStar
            className="mr-2"
            size={16}
            style={{ fill: showOnlyFavorites ? "currentColor" : "none" }}
          />
          {t("favorites")}
          <FiChevronRight
            className="ml-auto"
            size={16}
            style={{ opacity: showOnlyFavorites ? 1 : 0 }}
          />
        </button>

        {groups.map((group) => (
          <button
            key={group}
            onClick={() => onSelectGroup(group)}
            className={`w-full text-left px-3 py-2 rounded-lg flex items-center text-sm ${
              selectedGroup === group && !showOnlyFavorites
                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {group}
            <FiChevronRight
              className="ml-auto"
              size={16}
              style={{
                opacity: selectedGroup === group && !showOnlyFavorites ? 1 : 0,
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
