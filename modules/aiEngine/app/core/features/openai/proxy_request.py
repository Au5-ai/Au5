from pydantic import BaseModel

class ProxyRequest(BaseModel):
    proxy_url: str | None = None
    api_key: str | None = None


    def to_proxy_params(self) -> dict[str, str]:
        params = {}
        if self.proxy_url:
            params["proxy_url"] = self.proxy_url
        if self.api_key:
            params["api_key"] = self.api_key
        return params