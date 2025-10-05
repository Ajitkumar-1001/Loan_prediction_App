from fastapi import WebSocket
from fastapi import HTTPException 
import os 
import sys 
from pathlib import Path 
sys.path.append(str(Path().resolve().parent))
from dotenv import load_dotenv 
import yaml 
from config.config import logger 

yaml_path = Path(__file__).resolve().parent.parent / "config" / "config.yaml"

logger.info(f"yaml file {yaml_path} found and loaded successfully")
if yaml_path.exists():
    try: 
        with open(yaml_path,'r') as f:
            Conf = yaml.safe_load(f)
    except Exception as e: 
        logger.error(f"yaml file {yaml_path} not found , please check the path and load it again")
        raise ValueError(str(e))

logger.info(f"loading the yaml file and accessing the temperature for the llm")
model_temperature = Conf.get("llm",{}).get("temperature")
logger.info(f"Temperature value accessed and stored in model_temperature!")

env_path = Path(__file__).resolve().parent.parent /".env"

groq_model = Conf.get("llm",{}).get("model")
groq_key = os.getenv("GROQ_API_KEY")




    
