from agents.openai_service import get_openai_service

class InsightAgent:
    def __init__(self):
        self.service = get_openai_service()
        self.system_prompt = """
        You are the 'Insight Agent' for the Busan Civil Complaint Dashboard.
        Your role is to generate a concise, professional daily briefing based on raw complaint statistics.
        
        Output format: Text (HTML safe, using <br> for new lines, <strong> for emphasis).
        The tone should be administrative and data-driven.
        Focus on trends, hotspots, and recommendations.
        """

    async def generate_briefing(self, stats: dict):
        stats_str = str(stats)
        messages = [
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": f"Generate a briefing for these stats: {stats_str}"}
        ]
        
        try:
            response_message = await self.service.get_chat_response(messages)
            return response_message.content
        except Exception as e:
            print(f"Insight Error: {e}")
            return "Unable to generate insight at this time."
