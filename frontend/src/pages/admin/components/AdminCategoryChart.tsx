import { Card } from "../../../components/Card";
import { useNLSContext } from "../../../context/NLSContext";
import { CategoryCount } from "../../../services/UserService";

interface AdminCategoryChartProps {
  topCategories: CategoryCount[];
  isLoading: boolean;
}

export function AdminCategoryChart({
  topCategories,
  isLoading,
}: AdminCategoryChartProps) {
  const { t } = useNLSContext();

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">
        {t("top_password_categories")}
      </h3>
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : topCategories.length > 0 ? (
          topCategories.map((cat, index) => (
            <div key={index} className="flex flex-col">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700 dark:text-gray-300">
                  {cat.category}
                </span>
                <span className="font-medium">{cat.count}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    index === 0
                      ? "bg-blue-500"
                      : index === 1
                      ? "bg-green-500"
                      : index === 2
                      ? "bg-purple-500"
                      : index === 3
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{
                    width: `${
                      (cat.count /
                        Math.max(...topCategories.map((c) => c.count))) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-gray-500 dark:text-gray-400 text-center py-8">
            {t("no_categories_found")}
          </div>
        )}
      </div>
    </Card>
  );
}
