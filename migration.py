import sqlite3

db_path = "password_manager.db"

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("PRAGMA table_info(passwords)")
columns = cursor.fetchall()
column_names = [column[1] for column in columns]

if "totp_secret" not in column_names:
    cursor.execute("ALTER TABLE passwords ADD COLUMN totp_secret TEXT")

if "totp_enabled" not in column_names:
    cursor.execute("ALTER TABLE passwords ADD COLUMN totp_enabled BOOLEAN DEFAULT 0")

conn.commit()
conn.close()

print("Migration abgeschlossen!")
