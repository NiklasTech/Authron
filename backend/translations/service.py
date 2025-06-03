import os
import sys
from typing import Dict, Optional
from backend.translations.xml_parser import XMLTranslationParser

class TranslationService:

    if getattr(sys, 'frozen', False):
        XML_FILE_PATH = os.path.join(sys._MEIPASS, "translations", "translations.xml")
    else:
        XML_FILE_PATH = os.path.join(os.path.dirname(__file__), "translations.xml")

    _parser = None

    @classmethod
    def _get_parser(cls) -> XMLTranslationParser:
        """Get or create the XML parser instance."""
        if cls._parser is None:
            cls._parser = XMLTranslationParser(cls.XML_FILE_PATH)
        return cls._parser

    @classmethod
    def get_languages(cls) -> Dict[str, str]:
        """Return all available languages."""
        return cls._get_parser().get_available_languages()

    @classmethod
    def get_translations(cls, language_code: str) -> Dict[str, str]:
        """Get all translations for a specific language."""
        try:
            return cls._get_parser().get_translations(language_code)
        except Exception as e:
            print(f"Error getting translations for {language_code}: {e}")
            return cls._get_parser().get_translations("en")

    @classmethod
    def translate(cls, key: str, language_code: str, params: Optional[Dict] = None) -> str:
        """Translate a specific key to the given language."""
        try:
            return cls._get_parser().translate(key, language_code, params)
        except Exception as e:
            print(f"Error translating {key} to {language_code}: {e}")
            return key
