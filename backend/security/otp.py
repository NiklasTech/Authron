import pyotp
import qrcode
import base64
import io
from typing import Dict, Optional


def generate_totp_secret() -> str:
    return pyotp.random_base32()


def generate_totp_uri(secret: str, account_name: str, issuer_name: str = "Authron") -> str:
    totp = pyotp.TOTP(secret)
    return totp.provisioning_uri(account_name, issuer_name=issuer_name)


def get_qr_code_image(uri: str) -> str:
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(uri)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")

    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    return f"data:image/png;base64,{base64.b64encode(buffer.getvalue()).decode('utf-8')}"


def verify_totp(secret: str, token: str) -> bool:
    if not secret or not token:
        return False

    totp = pyotp.TOTP(secret)
    return totp.verify(token)


def setup_2fa(user_email: str) -> Dict[str, str]:
    """Richtet 2FA für einen Benutzer ein."""
    secret = generate_totp_secret()
    uri = generate_totp_uri(secret, user_email)
    qr_code = get_qr_code_image(uri)

    return {
        "secret": secret,
        "uri": uri,
        "qr_code": qr_code
    }
