import { useState, useMemo, useEffect, useCallback } from "react";
import {
  FiClipboard,
  FiKey,
  FiMenu,
  FiPlus,
  FiSearch,
  FiAlertTriangle,
  FiLoader,
} from "react-icons/fi";
import { Card } from "../components/Card";
import { Button } from "../components/Buttons";
import { TextField } from "../components/TextField";
import { Modal } from "../components/Modal";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { FloatingAddButton } from "../components/FloatingButton";
import { PasswordEntry } from "../types/PasswordEntry";
import { PasswordListItem } from "../components/PasswordListItem";
import { PasswordDetail } from "../components/PasswordDetail";
import { PasswordGeneratorModal } from "../components/PasswordGeneratorModal";
import { CustomCheckbox } from "../components/CustomCheckbox";
import * as PasswordService from "../services/PasswordServices";
import {
  calculatePasswordStrength,
  getStrengthLabel,
} from "../services/PasswordServices";
import { GroupFilter } from "../components/GroupFilter";
import { useNLSContext } from "../context/NLSContext";
import { PendingShares } from "../components/PendingShares";
export function DashboardPage() {
  const [entries, setEntries] = useState<PasswordEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<PasswordEntry | null>(
    null
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isMobile = useMediaQuery("(max-width: 768px)");

  const [newLabel, setNewLabel] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newFavorite, setNewFavorite] = useState(false);
  const [isPasswordGeneratorOpen, setIsPasswordGeneratorOpen] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const { t } = useNLSContext();

  const loadPasswords = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await PasswordService.getAllPasswords();
      setEntries(data);
      if (data.length > 0 && !selectedEntry) {
        setSelectedEntry(data[0]);
      }
    } catch (err) {
      console.error("Fehler beim Laden der Passwörter:", err);
      setError(t("error_loading"));
    } finally {
      setIsLoading(false);
    }
  }, [selectedEntry, t]);

  useEffect(() => {
    loadPasswords();
  }, [loadPasswords]);

  const loadDecryptedPassword = useCallback(async (entry: PasswordEntry) => {
    if (!entry.password && entry.id) {
      setLoadingPassword(true);
      try {
        const decryptedPassword = await PasswordService.getDecryptedPassword(
          entry.id
        );
        setEntries((prev) =>
          prev.map((e) =>
            e.id === entry.id ? { ...e, password: decryptedPassword } : e
          )
        );
        setSelectedEntry((prev) =>
          prev ? { ...prev, password: decryptedPassword } : prev
        );
      } catch (err) {
        console.error("Fehler beim Entschlüsseln des Passworts:", err);
      } finally {
        setLoadingPassword(false);
      }
    }
  }, []);

  useEffect(() => {
    if (selectedEntry && !selectedEntry.password) {
      loadDecryptedPassword(selectedEntry);
    }
  }, [selectedEntry, loadDecryptedPassword]);

  const availableGroups = useMemo(() => {
    const groups = new Set<string>();
    entries.forEach((entry) => {
      if (entry.category) {
        groups.add(entry.category);
      }
    });
    return Array.from(groups).sort();
  }, [entries]);

  const handleAddOrEdit = async () => {
    try {
      if (isEditing && selectedEntry) {
        const updatedEntry: Partial<PasswordEntry> = {
          label: newLabel,
          username: newUsername,
          password: newPassword,
          url: newUrl || undefined,
          category: newCategory || "Allgemein",
          favorite: newFavorite,
        };

        const response = await PasswordService.updatePassword(
          selectedEntry.id,
          updatedEntry
        );

        setEntries((prev) =>
          prev.map((entry) =>
            entry.id === selectedEntry.id
              ? { ...response, password: newPassword }
              : entry
          )
        );
        setSelectedEntry({ ...response, password: newPassword });
      } else {
        const newEntry: Omit<PasswordEntry, "id" | "lastUpdated"> = {
          label: newLabel,
          username: newUsername,
          password: newPassword,
          url: newUrl || undefined,
          category: newCategory || "Allgemein",
          favorite: newFavorite,
        };

        const response = await PasswordService.createPassword(newEntry);

        const createdEntry = { ...response, password: newPassword };
        setEntries((prev) => [...prev, createdEntry]);
        setSelectedEntry(createdEntry);
      }

      setIsAddModalOpen(false);
      resetForm();

      if (isMobile) {
        setIsMobileSidebarOpen(false);
      }
    } catch (err) {
      console.error("Fehler beim Speichern des Passworts:", err);
      alert(
        "Das Passwort konnte nicht gespeichert werden. Bitte versuche es später erneut."
      );
    }
  };

  const handleOpenEditModal = () => {
    if (selectedEntry) {
      setNewLabel(selectedEntry.label);
      setNewUsername(selectedEntry.username);
      setNewPassword(selectedEntry.password || "");
      setNewUrl(selectedEntry.url || "");
      setNewCategory(selectedEntry.category || "");
      setNewFavorite(selectedEntry.favorite || false);
      setIsEditing(true);
      setIsAddModalOpen(true);
    }
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsEditing(false);
    setIsAddModalOpen(true);
  };

  const resetForm = () => {
    setNewLabel("");
    setNewUsername("");
    setNewPassword("");
    setNewUrl("");
    setNewCategory("");
    setNewFavorite(false);
  };

  const handleDeleteEntry = async () => {
    if (selectedEntry) {
      try {
        await PasswordService.deletePassword(selectedEntry.id);

        const filteredEntries = entries.filter(
          (entry) => entry.id !== selectedEntry.id
        );
        setEntries(filteredEntries);
        setSelectedEntry(
          filteredEntries.length > 0 ? filteredEntries[0] : null
        );
        setIsDeleteModalOpen(false);

        if (isMobile) {
          setIsMobileSidebarOpen(true);
        }
      } catch (err) {
        console.error("Fehler beim Löschen des Passworts:", err);
        alert(
          "Das Passwort konnte nicht gelöscht werden. Bitte versuche es später erneut."
        );
      }
    }
  };

  const copyToClipboard = async (
    entry: PasswordEntry,
    field: "username" | "password"
  ) => {
    try {
      if (field === "password" && !entry.password && entry.id) {
        entry.password = await PasswordService.getDecryptedPassword(entry.id);
        setEntries((prev) =>
          prev.map((e) =>
            e.id === entry.id ? { ...e, password: entry.password } : e
          )
        );
        if (selectedEntry && selectedEntry.id === entry.id) {
          setSelectedEntry({ ...selectedEntry, password: entry.password });
        }
      }

      await navigator.clipboard.writeText(entry[field] ? entry[field] : "");
      console.log(`${field} kopiert!`);

      if (entry.id) {
        await PasswordService.markAsUsed(entry.id);
      }

      const updatedEntries = entries.map((e) => {
        if (e.id === entry.id) {
          return {
            ...e,
            lastUsed: "Gerade eben",
          };
        }
        return e;
      });

      setEntries(updatedEntries);

      if (selectedEntry && selectedEntry.id === entry.id) {
        setSelectedEntry({
          ...selectedEntry,
          lastUsed: "Gerade eben",
        });
      }
    } catch (err) {
      console.error("Fehler beim Kopieren:", err);
    }
  };

  const handleSelectPassword = (password: string) => {
    setNewPassword(password);
  };

  const handleBackToList = () => {
    setIsMobileSidebarOpen(true);
  };

  const handleToggleFavorite = async (entryId: number) => {
    try {
      const entryToUpdate = entries.find((e) => e.id === entryId);
      if (!entryToUpdate) return;

      const newFavoriteState = !entryToUpdate.favorite;

      await PasswordService.toggleFavorite(entryId, newFavoriteState);

      const updatedEntries = entries.map((entry) => {
        if (entry.id === entryId) {
          return {
            ...entry,
            favorite: newFavoriteState,
          };
        }
        return entry;
      });

      setEntries(updatedEntries);

      if (selectedEntry && selectedEntry.id === entryId) {
        setSelectedEntry({
          ...selectedEntry,
          favorite: newFavoriteState,
        });
      }
    } catch (err) {
      console.error("Fehler beim Ändern des Favoritenstatus:", err);
    }
  };

  const handleUpdateEntry = (updatedEntry: PasswordEntry) => {
    setEntries(
      entries.map((entry) =>
        entry.id === updatedEntry.id ? { ...entry, ...updatedEntry } : entry
      )
    );

    setSelectedEntry((prev) =>
      prev && prev.id === updatedEntry.id ? { ...prev, ...updatedEntry } : prev
    );
  };

  const toggleShowOnlyFavorites = () => {
    setShowOnlyFavorites(!showOnlyFavorites);
    if (!showOnlyFavorites) {
      setSelectedGroup(null);
    }
  };

  const handleSelectGroup = (group: string | null) => {
    setSelectedGroup(group);
    if (group !== null) {
      setShowOnlyFavorites(false);
    }
  };

  const filteredEntries = entries.filter(
    (entry) =>
      (!showOnlyFavorites || entry.favorite) &&
      (selectedGroup === null || entry.category === selectedGroup) &&
      (entry.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (entry.category &&
          entry.category.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  if (isLoading && entries.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <FiLoader
            className="animate-spin mx-auto mb-4 text-blue-500"
            size={40}
          />
          <p className="text-gray-600 dark:text-gray-300">
            {t("passwords_loading")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <PendingShares onPasswordAccepted={loadPasswords} />
      {isMobile && (
        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="fixed top-3 right-20 z-30 bg-blue-500 text-white p-2 rounded-full shadow-lg"
          aria-label={t(isMobileSidebarOpen ? "hide_entries" : "show_entries")}
        >
          <FiMenu size={18} />
        </button>
      )}

      <div className="flex flex-1 overflow-hidden">
        <div
          className={`${isMobile ? "fixed inset-0 z-20 top-16" : "relative"}
                      ${isMobile && !isMobileSidebarOpen ? "hidden" : "block"}
                      ${isMobile ? "w-full" : "w-80"}
                      bg-gray-100 dark:bg-gray-800 p-4 flex flex-col h-full
                      ${
                        !isMobile &&
                        "border-r border-gray-200 dark:border-gray-700"
                      }`}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold dark:text-gray-100 flex-shrink-0">
              {t("your_passwords")}
            </h2>
          </div>

          <div className="relative mb-4 flex-shrink-0">
            <input
              type="text"
              placeholder={t("search")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            />
            <FiSearch
              className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500"
              size={18}
            />
          </div>

          <GroupFilter
            groups={availableGroups}
            selectedGroup={selectedGroup}
            onSelectGroup={handleSelectGroup}
            showOnlyFavorites={showOnlyFavorites}
            onToggleFavorites={toggleShowOnlyFavorites}
          />

          <div className="flex-1 overflow-y-auto mb-2 pr-1">
            {error && (
              <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg mb-4">
                {error}
                <button
                  onClick={loadPasswords}
                  className="ml-2 text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {t("try_again")}
                </button>
              </div>
            )}

            {filteredEntries.length > 0 ? (
              filteredEntries.map((entry) => (
                <PasswordListItem
                  key={entry.id}
                  entry={entry}
                  isSelected={selectedEntry?.id === entry.id}
                  onSelect={() => {
                    setSelectedEntry(entry);
                    if (isMobile) {
                      setIsMobileSidebarOpen(false);
                    }
                  }}
                  onCopy={(field) => copyToClipboard(entry, field)}
                />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <FiClipboard className="mx-auto mb-2" size={24} />
                <p>{t("no_passwords")}</p>
                {(showOnlyFavorites || selectedGroup || searchTerm) && (
                  <p className="mt-2 text-sm">
                    <button
                      onClick={() => {
                        setShowOnlyFavorites(false);
                        setSelectedGroup(null);
                        setSearchTerm("");
                      }}
                      className="text-blue-500 hover:underline"
                    >
                      {t("all_passwords")}
                    </button>
                  </p>
                )}
                {!error && entries.length === 0 && (
                  <div className="mt-4">
                    <Button
                      variant="primary"
                      onClick={handleOpenAddModal}
                      className="flex items-center mx-auto"
                    >
                      <FiPlus className="mr-2" size={18} />
                      {t("create_first_password")}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <main
          className={`flex-1 p-4 sm:p-6 overflow-auto h-full ${
            isMobile && isMobileSidebarOpen ? "hidden" : "block"
          }`}
        >
          {selectedEntry ? (
            <PasswordDetail
              entry={selectedEntry}
              onEdit={handleOpenEditModal}
              onDelete={() => setIsDeleteModalOpen(true)}
              onBack={isMobile ? handleBackToList : undefined}
              onToggleFavorite={handleToggleFavorite}
              onUpdateEntry={handleUpdateEntry}
              loading={loadingPassword}
            />
          ) : (
            <Card className="w-full h-full flex items-center justify-center py-16">
              <div className="text-center p-4 sm:p-8">
                <FiClipboard className="mx-auto mb-4" size={48} />
                <h3 className="text-xl font-medium mb-2">
                  {t("no_selection")}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  {t("select_entry")}
                </p>
                <Button
                  variant="primary"
                  onClick={handleOpenAddModal}
                  className="flex items-center mx-auto"
                >
                  <FiPlus className="mr-2" size={18} />
                  {t("new_entry")}
                </Button>
              </div>
            </Card>
          )}
        </main>
      </div>

      <FloatingAddButton onClick={handleOpenAddModal} />

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={isEditing ? t("edit_entry") : t("add_new_entry")}
      >
        <div className="space-y-4">
          <TextField
            label={t("label")}
            placeholder="z.B. Netflix"
            value={newLabel}
            onChange={setNewLabel}
            type="text"
          />
          <TextField
            label={t("username_email")}
            placeholder="z.B. user@netflix.com"
            value={newUsername}
            onChange={setNewUsername}
            type="text"
          />

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium">
                {t("password")}
              </label>
              <button
                onClick={() => setIsPasswordGeneratorOpen(true)}
                className="text-blue-500 dark:text-blue-400 text-xs flex items-center hover:underline"
              >
                <FiKey className="mr-1" size={12} />
                {t("generate_password")}
              </button>
            </div>
            <TextField
              placeholder="••••••••"
              type="password"
              value={newPassword}
              onChange={setNewPassword}
            />
          </div>

          <TextField
            label={t("website")}
            placeholder="z.B. https://www.netflix.com/login"
            value={newUrl}
            onChange={setNewUrl}
            type="text"
          />

          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1">
              {t("category")}
            </label>
            <div className="flex flex-col space-y-2">
              <input
                list="categories"
                className="w-full pl-4 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="z.B. Unterhaltung"
              />
              <datalist id="categories">
                {availableGroups.map((group) => (
                  <option key={group} value={group} />
                ))}
              </datalist>
              {availableGroups.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {availableGroups.map((group) => (
                    <button
                      key={group}
                      type="button"
                      onClick={() => setNewCategory(group)}
                      className={`text-xs px-2 py-1 rounded-full ${
                        newCategory === group
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {group}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <CustomCheckbox
            id="favorite-checkbox"
            checked={newFavorite}
            onChange={setNewFavorite}
            label={t("mark_favorite")}
          />

          {newPassword && (
            <div className="mt-2">
              <div className="flex justify-between mb-1">
                <span className="text-sm">{t("password_strength")}</span>
                <span className="text-sm font-medium">
                  {(() => {
                    const strength = calculatePasswordStrength(newPassword);
                    const label = getStrengthLabel(strength, t);
                    return (
                      <span className={`text-${label.color}`}>
                        {t(label.text.toLowerCase())}
                      </span>
                    );
                  })()}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${(() => {
                    const strength = calculatePasswordStrength(newPassword);
                    const label = getStrengthLabel(strength, t);
                    return `bg-${label.color}`;
                  })()}`}
                  style={{
                    width: `${Math.min(
                      100,
                      calculatePasswordStrength(newPassword)
                    )}%`,
                  }}
                ></div>
              </div>

              <div className="mt-2 text-xs">
                {(() => {
                  const strength = calculatePasswordStrength(newPassword);
                  if (strength < 40) {
                    return (
                      <ul className="text-red-500 dark:text-red-400 space-y-1">
                        <li>• {t("weak_password_hint")}</li>
                        <li>• {t("add_chars_hint")}</li>
                        <li>• {t("add_numbers_symbols")}</li>
                      </ul>
                    );
                  } else if (strength < 60) {
                    return (
                      <ul className="text-yellow-500 dark:text-yellow-400 space-y-1">
                        <li>• {t("medium_strength_hint")}</li>
                        <li>• {t("make_longer")}</li>
                        <li>• {t("use_more_chars")}</li>
                      </ul>
                    );
                  } else if (strength >= 80) {
                    return (
                      <ul className="text-green-500 dark:text-green-400 space-y-1">
                        <li>• {t("strong_password")}</li>
                        <li>• {t("good_mix")}</li>
                        <li>• {t("sufficient_length")}</li>
                      </ul>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-end mt-6 gap-2">
          <Button
            variant="secondary"
            onClick={() => setIsAddModalOpen(false)}
            className="w-full sm:w-auto"
          >
            {t("cancel")}
          </Button>
          <Button
            variant="primary"
            onClick={handleAddOrEdit}
            disabled={!newLabel || !newUsername || !newPassword}
            className="w-full sm:w-auto"
          >
            {isEditing ? t("update") : t("save")}
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={t("delete_password")}
      >
        <div className="text-center">
          <FiAlertTriangle className="mx-auto mb-4 text-yellow-500" size={48} />
          <h3 className="text-lg font-semibold mb-2">{t("are_you_sure")}</h3>
          <p className="mb-6">
            {t("delete_confirm_message", { label: selectedEntry?.label || "" })}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
              className="w-full sm:w-auto"
            >
              {t("cancel")}
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteEntry}
              className="w-full sm:w-auto"
            >
              {t("delete")}
            </Button>
          </div>
        </div>
      </Modal>

      <PasswordGeneratorModal
        isOpen={isPasswordGeneratorOpen}
        onClose={() => setIsPasswordGeneratorOpen(false)}
        onSelectPassword={handleSelectPassword}
      />
    </div>
  );
}
