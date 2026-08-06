from typing import Dict, Any, List

class MitreMapper:
    def __init__(self):
        # Mock database of MITRE ATT&CK mappings based on behaviors
        self.mappings = {
            "hidden_iframe": {
                "id": "T1189",
                "name": "Drive-by Compromise",
                "tactic": "Initial Access"
            },
            "obfuscated_js": {
                "id": "T1027",
                "name": "Obfuscated Files or Information",
                "tactic": "Defense Evasion"
            },
            "high_entropy": {
                "id": "T1027.002",
                "name": "Software Packing",
                "tactic": "Defense Evasion"
            },
            "suspicious_api": {
                "id": "T1106",
                "name": "Native API",
                "tactic": "Execution"
            }
        }

    def map_behaviors(self, behaviors: List[str]) -> List[Dict[str, str]]:
        """
        Maps a list of observed behaviors to MITRE ATT&CK techniques.
        """
        mapped_techniques = []
        for behavior in behaviors:
            if behavior in self.mappings:
                mapped_techniques.append(self.mappings[behavior])
                
        return mapped_techniques
