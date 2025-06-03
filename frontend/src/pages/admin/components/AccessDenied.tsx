import { FiAlertCircle } from "react-icons/fi";
import { Card } from "../../../components/Card";
import { Button } from "../../../components/Buttons";
import { useNavigate } from "react-router-dom";
import { useNLSContext } from "../../../context/NLSContext";

export function AccessDenied() {
  const navigate = useNavigate();
  const { t } = useNLSContext();

  return (
    <div className="min-h-screen pt-20 bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="max-w-lg mx-auto">
        <div className="text-center p-6">
          <FiAlertCircle className="text-red-500 mx-auto mb-4" size={48} />
          <h2 className="text-xl font-bold mb-2">{t("access_denied")}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t("access_denied_message")}
          </p>
          <Button onClick={() => navigate("/dashboard")}>
            {t("back_to_dashboard")}
          </Button>
        </div>
      </Card>
    </div>
  );
}
