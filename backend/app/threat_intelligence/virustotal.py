import httpx
import base64
from typing import Optional, Dict, Any
from app.core.config import settings

class VirusTotalClient:
    def __init__(self):
        self.api_key = settings.VIRUSTOTAL_API_KEY
        self.base_url = "https://www.virustotal.com/api/v3"
        self.headers = {
            "x-apikey": self.api_key
        }

    async def get_url_report(self, url: str) -> Optional[Dict[str, Any]]:
        if not self.api_key:
            return {"error": "VirusTotal API key not configured"}
            
        # VT requires base64 encoded URL without padding
        url_id = base64.urlsafe_b64encode(url.encode()).decode().strip("=")
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.base_url}/urls/{url_id}",
                    headers=self.headers,
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    attributes = data.get("data", {}).get("attributes", {})
                    
                    return {
                        "malicious": attributes.get("last_analysis_stats", {}).get("malicious", 0),
                        "suspicious": attributes.get("last_analysis_stats", {}).get("suspicious", 0),
                        "harmless": attributes.get("last_analysis_stats", {}).get("harmless", 0),
                        "categories": attributes.get("categories", {}),
                        "reputation": attributes.get("reputation", 0)
                    }
                elif response.status_code == 404:
                    return {"status": "not_found", "message": "URL not found in VirusTotal database"}
                else:
                    return {"error": f"VirusTotal API returned status {response.status_code}"}
                    
            except Exception as e:
                return {"error": f"Failed to connect to VirusTotal: {str(e)}"}
