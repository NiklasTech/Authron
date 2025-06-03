from fastapi import APIRouter, Path
from typing import Dict, Optional

from backend.translations.service import TranslationService

router = APIRouter(prefix="/translations", tags=["translations"])

@router.get("/languages", response_model=Dict[str, str])
async def get_languages():
    """Get all available languages."""
    return TranslationService.get_languages()

@router.get("/{language_code}", response_model=Dict[str, str])
async def get_translations(language_code: str = Path(..., description="Language code (e.g., 'de', 'en')")):
    """Get all translations for a specific language."""
    return TranslationService.get_translations(language_code)

@router.get("/{language_code}/{key}")
async def translate(
    language_code: str = Path(..., description="Language code (e.g., 'de', 'en')"),
    key: str = Path(..., description="Translation key"),
    params: Optional[str] = None
):

    param_dict = None
    if params:
        import json
        try:
            param_dict = json.loads(params)
        except:
            pass

    return {
        "translation": TranslationService.translate(key, language_code, param_dict)
    }
