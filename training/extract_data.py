# extracts data and stores locally in data/

import os
import shutil
import zipfile
from pathlib import Path
from dotenv import load_dotenv

# Load .env BEFORE importing Kaggle API
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(env_path)

# Set Kaggle credentials in environment BEFORE importing KaggleApi
os.environ['KAGGLE_USERNAME'] = os.getenv('KAGGLE_USERNAME', '')
os.environ['KAGGLE_KEY'] = os.getenv('KAGGLE_KEY', '')

# Now import Kaggle API (it reads env vars on import)
from kaggle.api.kaggle_api_extended import KaggleApi

path = os.getenv('DATA_PATH', '../data')

kaggle = KaggleApi()
kaggle.authenticate()

# https://www.kaggle.com/datasets/yashvrdnjain/hotdognothotdog
dataset = 'yashvrdnjain/hotdognothotdog'
kaggle.dataset_download_files(dataset, path=path, unzip=False)

zip_path = os.path.join(path, 'hotdognothotdog.zip')
with zipfile.ZipFile(zip_path, 'r') as zip_ref:
    zip_ref.extractall(path)

os.remove(zip_path)

# Move contents from extracted folder to data root
extracted_folder = os.path.join(path, 'Hotdog-NotHotdog')
if os.path.exists(extracted_folder):
    for item in os.listdir(extracted_folder):
        src = os.path.join(extracted_folder, item)
        dest = os.path.join(path, item)

        if os.path.exists(dest):
            shutil.rmtree(dest)
        shutil.move(src, dest)

    shutil.rmtree(extracted_folder)

print("Dataset extracted successfully!")
print(f"Location: {os.path.abspath(path)}")

# Print statistics
for split in ['train', 'test']:
    split_path = os.path.join(path, split)
    if os.path.exists(split_path):
        for category in os.listdir(split_path):
            cat_path = os.path.join(split_path, category)
            if os.path.isdir(cat_path):
                count = len(os.listdir(cat_path))
                print(f"  {split}/{category}: {count} images")
