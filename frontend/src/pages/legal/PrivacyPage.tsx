import { Link } from "react-router-dom";
import { Card } from "../../components/Card";
import { useNLSContext } from "../../context/NLSContext";

export function PrivacyPage() {
  const { currentLanguage } = useNLSContext();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="p-8">
          {currentLanguage === "de" ? <DePrivacy /> : <EnPrivacy />}
        </Card>
      </div>
    </div>
  );
}

function DePrivacy() {
  return (
    <>
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
        Datenschutzerklärung
      </h1>

      <div className="space-y-8 text-gray-700 dark:text-gray-300">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Verantwortlicher</h2>
          <p>Verantwortlich für die Datenverarbeitung ist:</p>
          <p className="mt-2">
            Authron Password Manager
            <br />
            Demo-Projekt
            <br />
            E-Mail: demo@authron.example
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">
            2. Datenerhebung und -verarbeitung
          </h2>
          <p>Bei der Nutzung von Authron werden folgende Daten erhoben:</p>

          <h3 className="font-medium mt-4 mb-2">2.1 Bei der Registrierung:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>E-Mail-Adresse</li>
            <li>Benutzername</li>
            <li>Vollständiger Name (optional)</li>
            <li>Master-Passwort (nur als Hash gespeichert)</li>
          </ul>

          <h3 className="font-medium mt-4 mb-2">2.2 Bei der Nutzung:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Gespeicherte Passwörter (verschlüsselt)</li>
            <li>Kategorien und Notizen</li>
            <li>Login-Zeitpunkte</li>
            <li>IP-Adressen (für Sicherheitszwecke)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Datensicherheit</h2>
          <p>Ihre Daten werden durch folgende Maßnahmen geschützt:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Ende-zu-Ende-Verschlüsselung mit AES-256</li>
            <li>Passwort-Hashing mit Argon2</li>
            <li>Verschlüsselte Verbindungen (HTTPS/TLS)</li>
            <li>Zwei-Faktor-Authentifizierung (optional)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Datenweitergabe</h2>
          <p>Ihre Daten werden nicht an Dritte weitergegeben.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Cookies</h2>
          <p>Wir verwenden folgende Cookies:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Session-Cookies für die Anmeldung</li>
            <li>Präferenz-Cookies für Einstellungen (Sprache, Dark Mode)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Ihre Rechte</h2>
          <p>Sie haben folgende Rechte bezüglich Ihrer Daten:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Auskunft über gespeicherte Daten</li>
            <li>Berichtigung falscher Daten</li>
            <li>Löschung Ihrer Daten</li>
            <li>Datenübertragbarkeit</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Datenlöschung</h2>
          <p>Ihre Daten werden gelöscht, wenn Sie Ihr Konto löschen.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">8. Kontakt</h2>
          <p>Bei Fragen zum Datenschutz:</p>
          <p className="mt-2">E-Mail: demo@authron.example</p>
        </section>

        <div className="mt-8 pt-6 border-t border-gray-300 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Stand: {new Date().toLocaleDateString("de-DE")}
          </p>
          <Link
            to="/dashboard"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 mt-4 inline-block"
          >
            ← Zurück zum Dashboard
          </Link>
        </div>
      </div>
    </>
  );
}

function EnPrivacy() {
  return (
    <>
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
        Privacy Policy
      </h1>

      <div className="space-y-6 text-gray-700 dark:text-gray-300">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Data Controller</h2>
          <p>Responsible for data processing:</p>
          <p className="mt-2">
            Authron Password Manager
            <br />
            Demo Project
            <br />
            Email: demo@authron.example
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">
            2. Data Collection and Processing
          </h2>
          <p>When using Authron, the following data is collected:</p>

          <h3 className="font-medium mt-4 mb-2">2.1 During Registration:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Email address</li>
            <li>Username</li>
            <li>Full name (optional)</li>
            <li>Master password (stored as hash only)</li>
          </ul>

          <h3 className="font-medium mt-4 mb-2">2.2 During Use:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Stored passwords (encrypted)</li>
            <li>Categories and notes</li>
            <li>Login times</li>
            <li>IP addresses (for security purposes)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Data Security</h2>
          <p>Your data is protected by the following measures:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>End-to-end encryption with AES-256</li>
            <li>Password hashing with Argon2</li>
            <li>Encrypted connections (HTTPS/TLS)</li>
            <li>Two-factor authentication (optional)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Data Sharing</h2>
          <p>Your data is not shared with third parties.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Cookies</h2>
          <p>We use the following cookies:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Session cookies for login</li>
            <li>Preference cookies for settings (language, dark mode)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Your Rights</h2>
          <p>You have the following rights regarding your data:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Access to stored data</li>
            <li>Correction of incorrect data</li>
            <li>Deletion of your data</li>
            <li>Data portability</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Data Deletion</h2>
          <p>Your data will be deleted when you delete your account.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">8. Contact</h2>
          <p>For privacy inquiries:</p>
          <p className="mt-2">Email: demo@authron.example</p>
        </section>

        <div className="mt-8 pt-6 border-t border-gray-300 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Last updated: {new Date().toLocaleDateString("en-US")}
          </p>
          <Link
            to="/dashboard"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 mt-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </>
  );
}
