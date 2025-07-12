import os 
from pathlib import Path 
import yaml 
from dotenv import load_dotenv


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

if __name__ == "__main__":
    print("DAGSHUB TOKEN:", DAGSHUB_TOKEN[:4] + "......" if DAGSHUB_TOKEN else "Not Found")
    print("Repo Owner:", Repo_CONFIG.get("dagshub", {}).get("repo_owner"))
