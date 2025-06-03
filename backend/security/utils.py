from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
import os
import base64
from cryptography.fernet import Fernet, InvalidToken

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

SECRET_KEY = os.environ.get("SECRET_KEY", "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

ENCRYPTION_KEY = os.environ.get("ENCRYPTION_KEY", "APM1JDVgT8WDGOiCsYoGRpJ-BVxegMO0Mj6wZwxlG7g=")

def get_fernet_key(key_str):
    try:
        if isinstance(key_str, str):
            decoded = base64.urlsafe_b64decode(key_str)
            if len(decoded) != 32:
                return Fernet.generate_key()
            return base64.urlsafe_b64encode(decoded)
        else:
            return Fernet.generate_key()
    except Exception as e:
        print(f"Fehler bei der Schlüsselverarbeitung: {str(e)}")
        return Fernet.generate_key()

fernet_key = get_fernet_key(ENCRYPTION_KEY)
fernet = Fernet(fernet_key)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def encrypt_password(password):
    """Encrypt a password using Fernet symmetric encryption."""
    if not password:
        return ""

    try:
        if not isinstance(password, str):
            password = str(password)

        return fernet.encrypt(password.encode()).decode()
    except Exception as e:
        print(f"Verschlüsselungsfehler: {str(e)}")
        try:
            default_key = Fernet(Fernet.generate_key())
            return default_key.encrypt(password.encode()).decode()
        except Exception:
            return ""


def decrypt_password(encrypted_password):
    """Decrypt a password using Fernet symmetric encryption."""
    if not encrypted_password:
        return ""

    try:
        return fernet.decrypt(encrypted_password.encode()).decode()
    except InvalidToken:
        return "[Passwort kann nicht entschlüsselt werden: Schlüssel ungültig]"
    except Exception as e:
        return "[Passwort kann nicht entschlüsselt werden]"
