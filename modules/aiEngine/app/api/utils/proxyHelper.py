
from app.shared.configuration.config import openai_settings

def get_base_url_and_key(request_body):
    if hasattr(request_body, 'dict'):
        data = request_body.dict()
    else:
        data = request_body
    base_url = data.get('proxy_url') or openai_settings.api_url
    api_key = data.get('apiKey') or openai_settings.api_key
    return base_url, api_key