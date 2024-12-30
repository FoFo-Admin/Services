from typing import Annotated

from fastapi import Path, APIRouter

router = APIRouter(prefix="/businesses", tags=["business"])


@router.get("/")
def get_public_businesses(name: str = "Baba"):
    return [
        "Panya",
        "Bouling",
        name
    ]

@router.get("/{business_id}/")
#def get_business_by_id(business_id: int):
def get_business_by_id(business_id: Annotated[int, Path(ge=1, lt=1_000_000)]):
    return {
        "id": business_id,
        "name": "Panya"
    }