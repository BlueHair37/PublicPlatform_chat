from openai import AsyncOpenAI
import os
import json
import logging

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class OpenAIService:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.mock_mode = False
        
        if not self.api_key:
            logger.warning("OPENAI_API_KEY not found. Switching to MOCK MODE.")
            self.mock_mode = True
        else:
            self.client = AsyncOpenAI(api_key=self.api_key)
            self.model = "gpt-4o"

    async def get_chat_response(self, messages, tools=None, tool_choice=None, response_format=None):
        if self.mock_mode:
            logger.info("Mock Mode: Returning dummy response")
            # Return a Mock Object that mimics OpenAI response structure
            class MockMessage:
                content = "这是模拟模式的自动回复 (Mock Mode Auto-Response)"
                tool_calls = None
            
            # Simple content based heuristic for better demo experience
            last_msg = messages[-1]['content']
            if "perception" in str(messages[0]['content']).lower(): 
                 class MockMessage:
                    content = """
                    {
                        "intent": "report_complaint",
                        "category": "Road",
                        "location": "Busan City Hall",
                        "urgency": "Medium",
                        "summary": "This is a mock analysis of the complaint."
                    }
                    """
            elif "planner" in str(messages[0]['content']).lower():
                 class MockMessage:
                    content = """
                    {
                        "department": "Mock Maintenance Team",
                        "steps": ["Step 1: Inspect", "Step 2: Resolve"],
                        "estimated_time": "48 Hours"
                    }
                    """
            elif "insight" in str(messages[0]['content']).lower():
                 class MockMessage:
                    content = "<strong>[Mock Insight]</strong> No API Key detected. Displaying placeholder data."

            return MockMessage()

        try:
            params = {
                "model": self.model,
                "messages": messages,
                "temperature": 0.7,
            }
            if tools:
                params["tools"] = tools
                if tool_choice:
                    params["tool_choice"] = tool_choice
            
            if response_format:
                 params["response_format"] = response_format
            
            response = await self.client.chat.completions.create(**params)
            return response.choices[0].message
        except Exception as e:
            logger.error(f"Error calling OpenAI API: {e}")
            raise e

    async def analyze_image(self, text: str, image_url: str):
        try:
            response = await self.client.chat.completions.create(
                model="gpt-4-vision-preview",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": text},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": image_url,
                                },
                            },
                        ],
                    }
                ],
                max_tokens=300,
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"Error analyzing image: {e}")
            raise e

# Singleton Instance
openai_service = None
def get_openai_service():
    global openai_service
    if openai_service is None:
        openai_service = OpenAIService()
    return openai_service
