// frontend/src/pages/admin/components/user/DeleteUserModal.tsx
import { FiAlertCircle } from "react-icons/fi";
import { Modal } from "../../../../components/Modal";
import { Button } from "../../../../components/Buttons";
import { useNLSContext } from "../../../../context/NLSContext";
import { User } from "../../../../services/UserService";

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  selectedUser: User;
  currentUserId: number;
}

export function DeleteUserModal({
  isOpen,
  onClose,
  onDelete,
  selectedUser,
  currentUserId,
}: DeleteUserModalProps) {
  const { t } = useNLSContext();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t("delete_user")}>
      <div className="text-center">
        <FiAlertCircle className="mx-auto mb-4 text-yellow-500" size={48} />
        <h3 className="text-lg font-semibold mb-2">{t("are_you_sure")}</h3>
        <p className="mb-4">{t("delete_user_confirmation")}</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button
            variant="secondary"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            {t("cancel")}
          </Button>
          <Button
            variant="danger"
            onClick={onDelete}
            className="w-full sm:w-auto"
            disabled={selectedUser?.id === currentUserId}
          >
            {t("delete_user")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
