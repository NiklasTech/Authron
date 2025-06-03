import { useState, useEffect } from "react";
import { FiCheck, FiX } from "react-icons/fi";
import { Card } from "./Card";
import { Button } from "./Buttons";
import * as PasswordSharingService from "../services/PasswordSharingService";
import { useNLSContext } from "../context/NLSContext";

interface PendingSharesProps {
  onPasswordAccepted?: () => void;
}

export function PendingShares({ onPasswordAccepted }: PendingSharesProps) {
  const { t } = useNLSContext();
  const [pendingShares, setPendingShares] = useState<
    PasswordSharingService.PendingShare[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [acceptSuccess, setAcceptSuccess] = useState(false);
  useEffect(() => {
    loadPendingShares();
  }, []);

  const loadPendingShares = async () => {
    try {
      const shares = await PasswordSharingService.getPendingShares();
      setPendingShares(shares);
    } catch (error) {
      console.error("Fehler beim Laden der ausstehenden Freigaben:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (inviteToken: string) => {
    try {
      await PasswordSharingService.acceptShare(inviteToken);
      await loadPendingShares();

      setAcceptSuccess(true);
      setTimeout(() => setAcceptSuccess(false), 3000);

      if (onPasswordAccepted) {
        onPasswordAccepted();
      }
    } catch (error) {
      console.error("Fehler beim Akzeptieren:", error);
    }
  };

  const handleReject = async (inviteToken: string) => {
    try {
      await PasswordSharingService.rejectShare(inviteToken);
      await loadPendingShares();
    } catch (error) {
      console.error("Fehler beim Ablehnen:", error);
    }
  };

  if (isLoading) return null;
  if (pendingShares.length === 0) return null;

  return (
    <Card className="mb-4">
      {acceptSuccess && (
        <div className="mb-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-3 rounded-lg">
          {t("share_accepted_success")}
        </div>
      )}
      <h3 className="font-semibold mb-3">{t("pending_shares")}</h3>
      <div className="space-y-2">
        {pendingShares.map((share) => (
          <div
            key={share.id}
            className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-700 rounded"
          >
            <div>
              <p className="font-medium">{share.password_title}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("shared_by", { email: share.sender_email })}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => handleAccept(share.invite_token)}
                variant="primary"
                className="px-3 py-1"
              >
                <FiCheck size={16} />
              </Button>
              <Button
                onClick={() => handleReject(share.invite_token)}
                variant="danger"
                className="px-3 py-1"
              >
                <FiX size={16} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
