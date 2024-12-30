import glob
import os
import imghdr

from fastapi import UploadFile

ALLOWED_FORMATS = {"jpeg", "jpg", "png"}

async def save_image(folder: str, file: UploadFile, item_id: str) -> None:
    contents = await file.read()
    image_type = imghdr.what(None, h=contents)

    if not image_type or image_type.lower() not in ALLOWED_FORMATS:
        raise ValueError("Unsupported filetype")

    delete_image(folder, item_id)

    os.makedirs(folder, exist_ok=True)

    extension = os.path.splitext(file.filename)[1]
    destination = os.path.join('.', folder, f"{item_id}{extension}")

    with open(destination, "wb") as out:
        out.write(contents)


def delete_image(folder: str, item_id: str) -> None:
    pattern = os.path.join('.', folder, f"{item_id}.*")
    for file_path in glob.glob(pattern):
        if os.path.exists(file_path):
            os.remove(file_path)


def get_image_path(folder: str, item_id: str) -> str:
    pattern = os.path.join('.', folder, f"{item_id}.*")
    for file_path in glob.glob(pattern):
        if os.path.exists(file_path):
            return file_path