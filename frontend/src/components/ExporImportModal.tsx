import { useState, useRef } from "react";
import { FiDownload, FiUpload, FiAlertCircle, FiCheck } from "react-icons/fi";
import { Modal } from "./Modal";
import { Button } from "./Buttons";
import { useNLSContext } from "../context/NLSContext";
import * as ExportImportService from "../services/ExportImportService";

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess?: () => void;
}

export function ExportImportModal({
  isOpen,
  onClose,
  onImportSuccess,
}: ExportImportModalProps) {
  const { t } = useNLSContext();
  const [activeTab, setActiveTab] = useState<"export" | "import">("export");
  const [exportFormat, setExportFormat] = useState<"json" | "csv">("json");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await ExportImportService.exportPasswords(exportFormat);
      setSuccess(t("export_success"));
    } catch {
      setError(t("export_error"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setError(t("no_file_selected"));
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await ExportImportService.importPasswords(selectedFile);
      setSuccess(
        t("import_success", {
          imported: result.imported,
          skipped: result.skipped,
        })
      );
      if (onImportSuccess) {
        setTimeout(() => {
          onImportSuccess();
          onClose();
        }, 2000);
      }
    } catch {
      setError(t("import_error"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.name.endsWith(".json") || file.name.endsWith(".csv")) {
        setSelectedFile(file);
        setError(null);
      } else {
        setError(t("invalid_file_format"));
        setSelectedFile(null);
      }
    }
  };

  const reset = () => {
    setError(null);
    setSuccess(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("export_import_passwords")}
    >
      <div className="mb-4">
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
          <button
            onClick={() => {
              setActiveTab("export");
              reset();
            }}
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              activeTab === "export"
                ? "bg-white dark:bg-gray-800 shadow text-blue-600 dark:text-blue-400"
                : "text-gray-600 dark:text-gray-400"
            }`}
          >
            <FiDownload className="inline mr-2" size={16} />
            {t("export")}
          </button>
          <button
            onClick={() => {
              setActiveTab("import");
              reset();
            }}
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              activeTab === "import"
                ? "bg-white dark:bg-gray-800 shadow text-blue-600 dark:text-blue-400"
                : "text-gray-600 dark:text-gray-400"
            }`}
          >
            <FiUpload className="inline mr-2" size={16} />
            {t("import")}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg flex items-center">
          <FiAlertCircle className="mr-2 flex-shrink-0" size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-3 rounded-lg flex items-center">
          <FiCheck className="mr-2 flex-shrink-0" size={18} />
          <span>{success}</span>
        </div>
      )}

      <div className="mb-6">
        {activeTab === "export" ? (
          <div>
            <h3 className="text-lg font-medium mb-4">
              {t("export_passwords")}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t("export_description")}
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                {t("export_format")}
              </label>
              <select
                value={exportFormat}
                onChange={(e) =>
                  setExportFormat(e.target.value as "json" | "csv")
                }
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
              </select>
            </div>

            <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-300 p-3 rounded-lg text-sm">
              <FiAlertCircle className="inline mr-2" size={16} />
              {t("export_warning")}
            </div>
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-medium mb-4">
              {t("import_passwords")}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t("import_description")}
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                {t("select_file")}
              </label>
              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.csv"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  <FiUpload className="mr-2" size={16} />
                  {t("select_file")}
                </label>
                {selectedFile && (
                  <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">
                    {selectedFile.name}
                  </span>
                )}
              </div>
              {selectedFile && (
                <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                  {t("file_selected", { filename: selectedFile.name })}
                </p>
              )}
              {!selectedFile && (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {t("no_file_selected")}
                </p>
              )}
            </div>

            <div className="bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-300 p-3 rounded-lg text-sm">
              <FiAlertCircle className="inline mr-2" size={16} />
              {t("import_info")}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <Button variant="secondary" onClick={onClose}>
          {t("cancel")}
        </Button>
        <Button
          onClick={activeTab === "export" ? handleExport : handleImport}
          disabled={isLoading || (activeTab === "import" && !selectedFile)}
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {t("loading")}
            </span>
          ) : activeTab === "export" ? (
            <>
              <FiDownload className="mr-2" size={16} />
              {t("export")}
            </>
          ) : (
            <>
              <FiUpload className="mr-2" size={16} />
              {t("import")}
            </>
          )}
        </Button>
      </div>
    </Modal>
  );
}
