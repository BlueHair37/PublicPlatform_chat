from agents.openai_service import get_openai_service
import json

class PerceptionAgent:
    def __init__(self):
        self.service = get_openai_service()
        self.system_prompt = """
        You are the 'Perception Agent' for the Busan Civil Complaint Platform.
        Your role is to analyze the user's input (text and optional image) and extract key information.
        
        Output must be a valid JSON object with the following fields:
        - intent: "report_complaint", "status_check", "general_inquiry"
        - category: One of ["Traffic", "Road", "Environment", "Safety", "Other"]
        - location: Extracted location name (gu/dong), or null if not found.
        - urgency: "High", "Medium", "Low" based on the severity.
        - summary: A one-sentence summary of the issue.
        
        Example Input: "There is a massive pothole in Haeundae-gu Udong, cars are getting damaged."
        Example Output:
        {
            "intent": "report_complaint",
            "category": "Road",
            "location": "Haeundae-gu Udong",
            "urgency": "High",
            "summary": "Massive pothole causing vehicle damage in Udong."
        }
        """

    async def process(self, user_input: str, image_url: str = None):
        messages = [
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": user_input}
        ]
        
        # If image exists, we'd ideally use GPT-4 Vision, but for simplicity in this agent flow
        # we focus on text processing or assume image analysis text is appended.
        # Logic: If image_url is provided, Vision extraction would happen first.
        
        try:
            response_message = await self.service.get_chat_response(messages)
            content = response_message.content
            # Clean possible markdown code blocks
            if "```json" in content:
                content = content.replace("```json", "").replace("```", "")
            
            return json.loads(content)
        except Exception as e:
            print(f"Perception Logic Error: {e}")
            return {
                "intent": "general_inquiry",
                "category": "Other",
                "location": None,
                "urgency": "Low",
                "summary": "Could not parse request."
            }
