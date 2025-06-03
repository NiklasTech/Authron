import { useNLSContext } from "../../context/NLSContext";

export function LegalLayout({ children }: { children: React.ReactNode }) {
  const { currentLanguage, changeLanguage } = useNLSContext();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="fixed top-4 right-4 z-10">
        <select
          value={currentLanguage}
          onChange={(e) => changeLanguage(e.target.value)}
          className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="de">Deutsch</option>
          <option value="en">English</option>
        </select>
      </div>
      {children}
    </div>
  );
}
