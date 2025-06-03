import { Modal } from "../../../../components/Modal";
import { Button } from "../../../../components/Buttons";
import { Toggle } from "../../../../components/Switch";
import { useNLSContext } from "../../../../context/NLSContext";
import { User } from "../../../../services/UserService";

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUser: User;
  currentUserId: number;
  onToggleUserActive: (userId: number) => Promise<void>;
  onToggleUserAdmin: (userId: number) => Promise<void>;
  onDelete: () => void;
}

export function EditUserModal({
  isOpen,
  onClose,
  selectedUser,
  currentUserId,
  onToggleUserActive,
  onToggleUserAdmin,
  onDelete,
}: EditUserModalProps) {
  const { t } = useNLSContext();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${t("edit_user")}: ${selectedUser?.username}`}
    >
      <div
        className="space-y-4 w-full"
        style={{ minWidth: "500px", maxWidth: "650px" }}
      >
        <div>
          <h3 className="text-lg font-medium mb-2">{t("user_information")}</h3>
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="overflow-hidden">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  {t("username")}
                </p>
                <p className="font-medium break-all">{selectedUser.username}</p>
              </div>
              <div className="overflow-hidden">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  {t("email")}
                </p>
                <p className="font-medium break-all">{selectedUser.email}</p>
              </div>
              <div className="overflow-hidden">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  {t("full_name")}
                </p>
                <p className="font-medium break-all">
                  {selectedUser.full_name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  {t("user_registered")}
                </p>
                <p className="font-medium">
                  {new Date(selectedUser.created_at).toLocaleDateString(
                    "de-DE"
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">{t("user_status")}</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium">{t("status_active")}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("can_login")}
                </p>
              </div>
              <Toggle
                checked={selectedUser.is_active}
                onChange={() => onToggleUserActive(selectedUser.id)}
              />
            </div>

            <div className="flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium">{t("role_admin")}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("admin_access")}
                </p>
              </div>
              <Toggle
                checked={selectedUser.is_admin}
                onChange={() => onToggleUserAdmin(selectedUser.id)}
                disabled={selectedUser.id === currentUserId}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="secondary" onClick={onClose}>
            {t("close")}
          </Button>
          <Button
            variant="danger"
            onClick={onDelete}
            disabled={selectedUser.id === currentUserId}
          >
            {t("delete_user")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
