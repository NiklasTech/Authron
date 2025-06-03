import os
import xml.etree.ElementTree as ET
from typing import Dict, List, Optional, Set

class XMLTranslationParser:
    """Parses translations from XML file."""

    def __init__(self, xml_file: str):
        """Initialize the parser with the XML file path."""
        self.xml_file = xml_file
        self.root = None
        self.cached_languages = None
        self.cached_translations = {}
        self._load_xml()

    def _load_xml(self) -> None:
        """Load the XML file into memory."""
        if not os.path.exists(self.xml_file):
            raise FileNotFoundError(f"Translation file not found: {self.xml_file}")

        try:
            tree = ET.parse(self.xml_file)
            self.root = tree.getroot()
        except ET.ParseError as e:
            raise ValueError(f"Error parsing XML file: {e}")

    def get_available_languages(self) -> Dict[str, str]:
        """Get all available languages from the XML file."""
        if self.cached_languages is not None:
            return self.cached_languages

        if not self.root:
            return {}

        languages = {}
        language_attrs = set()

        for text_elem in self.root.findall("text"):
            for attr in text_elem.attrib:
                if attr.startswith("lang") and len(attr) > 4:
                    language_attrs.add(attr)

        for attr in language_attrs:
            lang_code = attr[4:].lower()
            if lang_code == "en":
                lang_name = "English"
            elif lang_code == "de":
                lang_name = "Deutsch"
            else:
                lang_name = lang_code.upper()

            languages[lang_code] = lang_name

        self.cached_languages = languages
        return languages

    def get_translations(self, language_code: str) -> Dict[str, str]:
        """Get all translations for a specific language."""
        if language_code in self.cached_translations:
            return self.cached_translations[language_code]

        if not self.root:
            return {}

        lang_attr = f"lang{language_code.capitalize()}"

        translations = {}
        for text_elem in self.root.findall("text"):
            name = text_elem.get("name")
            translation = text_elem.get(lang_attr)

            if name and translation:
                translations[name] = translation

        self.cached_translations[language_code] = translations
        return translations

    def translate(self, key: str, language_code: str, params: Optional[Dict] = None) -> str:
        translations = self.get_translations(language_code)

        if key not in translations:
            return key

        text = translations[key]

        if params:
            for param_key, param_value in params.items():
                text = text.replace(f"{{{param_key}}}", str(param_value))

        return text
