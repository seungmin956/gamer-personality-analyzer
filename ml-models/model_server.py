
from transformers import pipeline, AutoTokenizer, AutoModel
import json

# 여러 모델 성능 비교
models_to_test = [
    "klue/roberta-base",
    "beomi/KcELECTRA-base", 
    "sentence-transformers/xlm-r-base"
]
