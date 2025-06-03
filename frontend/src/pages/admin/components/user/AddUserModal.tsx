import { useState } from "react";
import { Modal } from "../../../../components/Modal";
import { Button } from "../../../../components/Buttons";
import { TextField } from "../../../../components/TextField";
import { useNLSContext } from "../../../../context/NLSContext";
import * as UserService from "../../../../services/UserService";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddUserModal({
  isOpen,
  onClose,
  onSuccess,
}: AddUserModalProps) {
  const { t } = useNLSContext();
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newFullName, setNewFullName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setNewUsername("");
    setNewEmail("");
    setNewFullName("");
    setNewPassword("");
    setIsAdmin(false);
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const addUser = async () => {
    if (!newUsername || !newEmail || !newFullName || !newPassword) {
      setError(t("fill_required_fields"));
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await UserService.createUser({
        username: newUsername,
        email: newEmail,
        full_name: newFullName,
        password: newPassword,
        is_admin: isAdmin,
      });

      resetForm();
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Fehler beim Erstellen des Benutzers:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t("unexpected_error"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t("add_new_user")}>
      <div className="space-y-4">
        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg">
            {error}
          </div>
        )}

        <TextField
          label={t("full_name")}
          placeholder="Max Mustermann"
          value={newFullName}
          onChange={setNewFullName}
        />

        <TextField
          label={t("email")}
          type="email"
          placeholder="max.mustermann@example.com"
          value={newEmail}
          onChange={setNewEmail}
        />

        <TextField
          label={t("username")}
          placeholder="maxmustermann"
          value={newUsername}
          onChange={setNewUsername}
        />

        <TextField
          label={t("password")}
          type="password"
          placeholder="••••••••••"
          value={newPassword}
          onChange={setNewPassword}
        />

        <div className="flex items-center">
          <input
            id="admin-checkbox"
            type="checkbox"
            checked={isAdmin}
            onChange={(e) => setIsAdmin(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="admin-checkbox"
            className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
          >
            {t("create_as_admin")}
          </label>
        </div>

        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-lg text-sm">
          <p>{t("user_email_notice")}</p>
        </div>

        <div className="flex justify-end space-x-3 mt-4">
          <Button variant="secondary" onClick={handleClose}>
            {t("cancel")}
          </Button>
          <Button
            onClick={addUser}
            disabled={
              !newUsername ||
              !newEmail ||
              !newFullName ||
              !newPassword ||
              isSubmitting
            }
          >
            {isSubmitting ? (
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
            ) : (
              t("create_user")
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
