import { Link } from "react-router-dom";
import { Card } from "../../components/Card";
import { useNLSContext } from "../../context/NLSContext";

export function TermsPage() {
  const { currentLanguage } = useNLSContext();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="p-8">
          {currentLanguage === "de" ? <DeTerms /> : <EnTerms />}
        </Card>
      </div>
    </div>
  );
}

function DeTerms() {
  return (
    <>
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
        Nutzungsbedingungen
      </h1>

      <div className="space-y-6 text-gray-700 dark:text-gray-300">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Geltungsbereich</h2>
          <p>
            Diese Nutzungsbedingungen gelten für die Nutzung der
            Passwort-Manager-Anwendung Authron. Mit der Registrierung und
            Nutzung der Anwendung akzeptieren Sie diese Bedingungen.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">
            2. Leistungsbeschreibung
          </h2>
          <p>
            Authron ist ein Passwort-Manager-Service, der folgende Leistungen
            bietet:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>
              Sichere Speicherung von Passwörtern mit AES-256 Verschlüsselung
            </li>
            <li>Passwort-Generator für sichere Passwörter</li>
            <li>Zwei-Faktor-Authentifizierung (2FA)</li>
            <li>Kategorisierung und Organisation von Passwörtern</li>
            <li>Import/Export-Funktionen</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Benutzerkonto</h2>
          <p>
            Für die Nutzung von Authron ist ein Benutzerkonto erforderlich. Sie
            sind verpflichtet:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>
              Korrekte und vollständige Angaben bei der Registrierung zu machen
            </li>
            <li>
              Ihr Passwort geheim zu halten und nicht an Dritte weiterzugeben
            </li>
            <li>
              Uns unverzüglich zu informieren, wenn Sie einen unbefugten Zugriff
              vermuten
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">
            4. Sicherheit und Datenschutz
          </h2>
          <p>
            Ihre Daten werden mit modernsten Verschlüsselungsverfahren
            geschützt:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Ende-zu-Ende-Verschlüsselung mit AES-256</li>
            <li>Passwort-Hashing mit Argon2</li>
            <li>Sichere Übertragung via HTTPS</li>
          </ul>
          <p className="mt-2">
            Weitere Informationen finden Sie in unserer{" "}
            <Link
              to="/privacy"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              Datenschutzerklärung
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">
            5. Haftungsbeschränkung
          </h2>
          <p>Wir haften nicht für:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Datenverlust durch höhere Gewalt</li>
            <li>Schäden durch unsachgemäße Nutzung</li>
            <li>Verlust des Master-Passworts</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Nutzungsrechte</h2>
          <p>
            Diese Software ist unter der MIT-Lizenz veröffentlicht. Sie dürfen:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Die Software kostenlos nutzen, kopieren und modifizieren</li>
            <li>Die Software kommerziell verwenden</li>
            <li>Die Software weiterverbreiten</li>
          </ul>
          <p className="mt-2 font-medium">
            Copyright © 2025 Niklas (GitHub: NiklasTech)
          </p>
          <p className="mt-2">
            Die einzige Bedingung ist, dass dieser Copyright-Hinweis in allen
            Kopien oder wesentlichen Teilen der Software enthalten bleiben muss.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Kündigung</h2>
          <p>
            Sie können Ihr Konto jederzeit in den Einstellungen löschen. Dabei
            werden alle Ihre Daten unwiderruflich gelöscht.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">8. Änderungen</h2>
          <p>
            Wir behalten uns vor, diese Nutzungsbedingungen anzupassen. Über
            wesentliche Änderungen werden Sie informiert.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">9. Schlussbestimmungen</h2>
          <p>
            Es gilt deutsches Recht. Sollten einzelne Bestimmungen unwirksam
            sein, bleiben die übrigen Bestimmungen davon unberührt.
          </p>
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

function EnTerms() {
  return (
    <>
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
        Terms of Service
      </h1>

      <div className="space-y-6 text-gray-700 dark:text-gray-300">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Scope</h2>
          <p>
            These terms of service apply to the use of the Authron password
            manager application. By registering and using the application, you
            accept these terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Service Description</h2>
          <p>
            Authron is a password manager service that offers the following
            features:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Secure password storage with AES-256 encryption</li>
            <li>Password generator for secure passwords</li>
            <li>Two-factor authentication (2FA)</li>
            <li>Password categorization and organization</li>
            <li>Import/Export functions</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. User Account</h2>
          <p>
            A user account is required to use Authron. You are obligated to:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>
              Provide correct and complete information during registration
            </li>
            <li>
              Keep your password secret and not share it with third parties
            </li>
            <li>Notify us immediately if you suspect unauthorized access</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">
            4. Security and Privacy
          </h2>
          <p>
            Your data is protected with state-of-the-art encryption methods:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>End-to-end encryption with AES-256</li>
            <li>Password hashing with Argon2</li>
            <li>Secure transmission via HTTPS</li>
          </ul>
          <p className="mt-2">
            For more information, see our{" "}
            <Link
              to="/privacy"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">
            5. Limitation of Liability
          </h2>
          <p>We are not liable for:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Data loss due to force majeure</li>
            <li>Damage due to improper use</li>
            <li>Loss of master password</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Usage Rights</h2>
          <p>This software is released under the MIT License. You may:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Use, copy and modify the software free of charge</li>
            <li>Use the software commercially</li>
            <li>Distribute the software</li>
          </ul>
          <p className="mt-2 font-medium">
            Copyright © 2025 Niklas (GitHub: NiklasTech)
          </p>
          <p className="mt-2">
            The only requirement is that this copyright notice must be included
            in all copies or substantial portions of the software.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Open Source License</h2>
          <p>
            Authron is Open Source software released under the MIT License. You
            can find the full license text on our
            <a
              href="https://github.com/niklastech/authron"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 ml-1"
            >
              GitHub Repository
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Termination</h2>
          <p>
            You can delete your account at any time in the settings. This will
            permanently delete all your data.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">8. Changes</h2>
          <p>
            We reserve the right to update these terms of service. You will be
            notified of significant changes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">9. Final Provisions</h2>
          <p>
            German law applies. If individual provisions are invalid, the
            remaining provisions remain unaffected.
          </p>
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
