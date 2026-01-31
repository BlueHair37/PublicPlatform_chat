from agents.openai_service import get_openai_service
import json

class PlannerAgent:
    def __init__(self):
        self.service = get_openai_service()
        self.system_prompt = """
        You are the 'Planner Agent' for the Busan Civil Complaint Platform.
        Your role is to receive structured complaint data and create an execution plan.
        
        Input: JSON object with category, location, urgency, summary.
        Output: JSON object with:
        - department: The specific department in Busan City Hall or District Office (e.g., "Haeundae-gu Road Maintenance Team").
        - steps: A list of strings describing the workflow steps.
        - estimated_time: Estimated time for resolution (e.g., "24 hours").
        
        Rules:
        - High urgency items should be assigned to "Emergency Response Team".
        - Road issues go to "Road Maintenance".
        - Noise issues go to "Environment Safety".
        """

    async def create_plan(self, perception_data: dict):
        user_content = json.dumps(perception_data, ensure_ascii=False)
        messages = [
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": f"Create a plan for: {user_content}"}
        ]
        
        try:
            response_message = await self.service.get_chat_response(messages)
            content = response_message.content
            if "```json" in content:
                content = content.replace("```json", "").replace("```", "")
            return json.loads(content)
        except Exception as e:
            print(f"Planner Logic Error: {e}")
            return {
                "department": "General Affairs",
                "steps": ["Review Request", "Assign Manually"],
                "estimated_time": "Unknown"
            }
