import os 
from pathlib import Path 
import yaml 
from dotenv import load_dotenv
import logging 
from logging.handlers import RotatingFileHandler



log_dir = Path(__file__).resolve().parent.parent / "app_logs"
log_dir.mkdir(exist_ok=True)
log_file = log_dir / "app.log"

file_handler  =  RotatingFileHandler(
    filename=log_file,
    maxBytes=5*1024*1024,  
    backupCount=3,
    encoding="utf-8"
)

formatter = logging.Formatter("%(asctime)s | %(levelname)s | %(name)s | %(message)s" , "%Y-%m-%d %H:%M:%S")
file_handler.setFormatter(formatter)

console_Handler = logging.StreamHandler() 
console_Handler.setFormatter(formatter)

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
logger.addHandler(file_handler)
logger.addHandler(console_Handler)


env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)


def load_yaml(file_name="config.yaml"):
    yaml_path = Path(__file__).resolve().parent / file_name
    if not yaml_path.exists():
        print(f"The yaml file was not found at: {yaml_path}")
        raise FileNotFoundError(f"{yaml_path} does not exist.")
    
    with open(yaml_path, 'r') as conf:
        return yaml.safe_load(conf)


Repo_CONFIG = load_yaml()
 

DAGSHUB_TOKEN = os.getenv("DAGSHUB_ACCESS_KEY")

use_mlflow = Repo_CONFIG.get("dagshub",{}).get("use_mlflow")
mlflow_url = Repo_CONFIG.get("dagshub",{}).get("mlflow_uri")

set_experiment = Repo_CONFIG.get("mlflow",{}).get("set_experiment")



if __name__ == "__main__":
    if DAGSHUB_TOKEN:
        masked_token = DAGSHUB_TOKEN[:4] + "******"
        logger.info(f"DAGSHUB Token: {masked_token}")
    else:
        logger.warning("DAGSHUB Token not found.")

    logger.info(f"Repo Owner: {Repo_CONFIG.get('dagshub', {}).get('repo_owner')}")
    logger.info(f"MLflow Tracking URI: {mlflow_url}")
    logger.info(f"Use MLflow: {use_mlflow}")
    logger.info(f"Experiment Name: {set_experiment}")