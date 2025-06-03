import { useState } from "react";
import { FiUserPlus } from "react-icons/fi";
import { Card } from "../../../components/Card";
import { Button } from "../../../components/Buttons";
import { useNLSContext } from "../../../context/NLSContext";
import { User as ServiceUser } from "../../../services/UserService";
import { User as AuthUser } from "../../../context/AuthContext";
import { AddUserModal } from "./user/AddUserModal";
import { EditUserModal } from "./user/EditUserModal";
import { DeleteUserModal } from "./user/DeleteUserModal";
import { UserTable } from "../../../components/UserTable";
import * as UserService from "../../../services/UserService";

interface AdminUserManagementProps {
  users: ServiceUser[];
  refreshData: () => Promise<void>;
  currentUser: AuthUser | null;
}

export function AdminUserManagement({
  users,
  refreshData,
  currentUser,
}: AdminUserManagementProps) {
  const { t } = useNLSContext();
  const [selectedUser, setSelectedUser] = useState<ServiceUser | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleEditUser = (userToEdit: ServiceUser) => {
    setSelectedUser(userToEdit);
    setIsUserModalOpen(true);
  };

  const handleDeleteUser = (userToDelete: ServiceUser) => {
    setSelectedUser(userToDelete);
    setIsDeleteUserModalOpen(true);
  };

  const toggleUserActive = async (userId: number) => {
    try {
      await UserService.toggleUserActive(userId);
      refreshData();
    } catch (err) {
      console.error("Fehler beim Ändern des Benutzer-Status:", err);
    }
  };

  const toggleUserAdmin = async (userId: number) => {
    try {
      await UserService.toggleUserAdmin(userId);
      refreshData();
    } catch (err) {
      console.error("Fehler beim Ändern des Admin-Status:", err);
    }
  };

  const deleteUser = async () => {
    if (!selectedUser) return;

    try {
      await UserService.deleteUser(selectedUser.id);
      setIsDeleteUserModalOpen(false);
      refreshData();
    } catch (err) {
      console.error("Fehler beim Löschen des Benutzers:", err);
    }
  };

  const filteredUsers = searchTerm
    ? users.filter(
        (user) =>
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.full_name &&
            user.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : users;

  return (
    <>
      <Card className="p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <FiUserPlus className="mr-2" size={18} />
            {t("user_management")}
          </h3>

          <Button
            onClick={() => setIsAddUserModalOpen(true)}
            className="flex items-center"
          >
            <FiUserPlus className="mr-2" size={16} />
            {t("add_user")}
          </Button>
        </div>

        <UserTable
          users={filteredUsers}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
          showFilters={true}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      </Card>
      {selectedUser && (
        <EditUserModal
          isOpen={isUserModalOpen}
          onClose={() => setIsUserModalOpen(false)}
          selectedUser={selectedUser}
          currentUserId={currentUser?.id || 0}
          onToggleUserActive={toggleUserActive}
          onToggleUserAdmin={toggleUserAdmin}
          onDelete={() => {
            setIsUserModalOpen(false);
            setIsDeleteUserModalOpen(true);
          }}
        />
      )}

      {selectedUser && (
        <DeleteUserModal
          isOpen={isDeleteUserModalOpen}
          onClose={() => setIsDeleteUserModalOpen(false)}
          onDelete={deleteUser}
          selectedUser={selectedUser}
          currentUserId={currentUser?.id || 0}
        />
      )}

      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onSuccess={refreshData}
      />
    </>
  );
}
