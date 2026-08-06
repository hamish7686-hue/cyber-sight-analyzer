import re
import socket
import ssl
import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse
import dns.resolver
import logging

logger = logging.getLogger(__name__)

class URLScanner:
    def __init__(self, url: str):
        self.url = url
        self.parsed_url = urlparse(url)
        self.domain = self.parsed_url.netloc
        self.metadata = {}
        
    def is_valid_url(self) -> bool:
        regex = re.compile(
            r'^(?:http|ftp)s?://' # http:// or https://
            r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+(?:[A-Z]{2,6}\.?|[A-Z0-9-]{2,}\.?)|' #domain...
            r'localhost|' #localhost...
            r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})' # ...or ip
            r'(?::\d+)?' # optional port
            r'(?:/?|[/?]\S+)$', re.IGNORECASE)
        return re.match(regex, self.url) is not None

    def dns_lookup(self):
        try:
            answers = dns.resolver.resolve(self.domain, 'A')
            ips = [rdata.address for rdata in answers]
            self.metadata['dns_a_records'] = ips
            
            mx_answers = dns.resolver.resolve(self.domain, 'MX')
            self.metadata['has_mx_records'] = len(mx_answers) > 0
        except Exception as e:
            logger.warning(f"DNS lookup failed for {self.domain}: {e}")
            self.metadata['dns_a_records'] = []
            self.metadata['has_mx_records'] = False

    def ssl_inspection(self):
        if self.parsed_url.scheme != 'https':
            self.metadata['ssl'] = {'valid': False, 'reason': 'Not HTTPS'}
            return
            
        try:
            ctx = ssl.create_default_context()
            with ctx.wrap_socket(socket.socket(), server_hostname=self.domain) as s:
                s.settimeout(5.0)
                s.connect((self.domain, 443))
                cert = s.getpeercert()
                self.metadata['ssl'] = {
                    'valid': True,
                    'issuer': dict(x[0] for x in cert['issuer']),
                    'subject': dict(x[0] for x in cert['subject'])
                }
        except Exception as e:
             self.metadata['ssl'] = {'valid': False, 'reason': str(e)}

    def fetch_and_parse(self):
        try:
            response = requests.get(self.url, timeout=10, allow_redirects=True)
            self.metadata['redirects'] = [r.url for r in response.history]
            self.metadata['final_url'] = response.url
            self.metadata['status_code'] = response.status_code
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Suspicious JS/iframes
            scripts = soup.find_all('script')
            iframes = soup.find_all('iframe')
            
            self.metadata['html_analysis'] = {
                'num_scripts': len(scripts),
                'num_iframes': len(iframes),
                'hidden_iframes': sum(1 for i in iframes if 'hidden' in str(i) or 'display:none' in str(i).replace(' ','')),
                'external_scripts': sum(1 for s in scripts if s.get('src'))
            }
        except Exception as e:
            logger.error(f"Failed to fetch {self.url}: {e}")
            self.metadata['fetch_error'] = str(e)

    def scan(self) -> dict:
        if not self.is_valid_url():
            return {"error": "Invalid URL"}
            
        self.dns_lookup()
        self.ssl_inspection()
        self.fetch_and_parse()
        
        return self.metadata
