from agents.openai_service import get_openai_service
import json
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class CivilComplaintAgent:
    def __init__(self):
        self.service = get_openai_service()
        self.system_prompt = """
        너는 부산광역시 공공시설물 민원을 접수하는 AI 행정 에이전트야. 이름은 '부기'라고 해. 
        친절하고 전문적인 태도를 유지하되, 부산 시민들의 방언(사투리)을 정확히 이해하고 필요시 표준어로 변환해서 요약해야 돼. 
        모든 대화는 민원 접수에 필요한 필수 정보(위치, 사진, 유형, 상세 내용)를 누락 없이 수집하는 것을 목표로 진행해줘.
        
        사용자와의 대화 흐름이 끊기지 않도록 이전 대화 이력을 고려해. 
        만약 사용자가 사진만 올리고 설명을 안 하면, '사진 속 보도블록 파손 부위를 확인했습니다. 구체적으로 언제 발견하셨나요?'라고 되묻도록 해.
        
        민원 접수가 완료되는 시점에만 save_complaint_to_db 도구를 호출해. 그 전에는 계속 정보를 수집해.
        """
        
        # Tools Definition
        self.tools = [
            {
                "type": "function",
                "function": {
                    "name": "get_location_info",
                    "description": "사용자의 GPS 좌표나 주소 문자열을 받아 부산시 GIS API와 연계해 정확한 행정동 정보를 반환하는 함수.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "query": {"type": "string", "description": "주소 또는 GPS 좌표"}
                        },
                        "required": ["query"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "search_admin_manual",
                    "description": "부산시 행정 조례나 민원 처리 매뉴얼에서 답변을 찾아오는 함수.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "keywords": {"type": "string", "description": "검색할 키워드"}
                        },
                        "required": ["keywords"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "save_complaint_to_db",
                    "description": "최종 수집된 민원 데이터를 저장하는 함수. 필수 정보가 모두 수집되었을 때만 호출.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "complaint_type": {"type": "string", "description": "가로등, 도로파손, 쓰레기 등"},
                            "severity_level": {"type": "integer", "description": "1에서 5 사이의 정수 (AI가 위험도 판단)"},
                            "summary_standard": {"type": "string", "description": "방언을 제거한 표준어 요약본"},
                            "is_urgent": {"type": "boolean", "description": "긴급 조치 필요 여부"},
                            "location": {"type": "string", "description": "민원 발생 위치"},
                            "original_text": {"type": "string", "description": "사용자 원문"}
                        },
                        "required": ["complaint_type", "severity_level", "summary_standard", "is_urgent", "location"]
                    }
                }
            }
        ]

    # Tool Implementations (Mock/Stub for now)
    def get_location_info(self, query):
        # In real app: Call Kakao Map API or Nominatim
        return f"부산광역시 행정동 정보 ({query})"

    def search_admin_manual(self, keywords):
        # In real app: RAG lookup from ChromaDB
        return "관련 규정에 따르면 도로 파손 신고 시 24시간 내 현장 확인이 원칙입니다."

    def save_complaint_to_db(self, args):
        # We will handle the actual DB insert in main.py or here via model interaction
        # For agent flow, we return a success message
        return json.dumps({"status": "success", "message": "민원이 정상적으로 시스템에 등록되었습니다."})

    async def chat(self, user_message: str, history: list = []):
        # Build messages history
        messages = [{"role": "system", "content": self.system_prompt}]
        messages.extend(history)
        messages.append({"role": "user", "content": user_message})

        try:
            response_msg = await self.service.get_chat_response(messages, tools=self.tools)
            
            # Handle Function Calling
            if response_msg.tool_calls:
                # Append assistant's function call request to history
                messages.append(response_msg)
                
                tool_result_content = ""

                for tool_call in response_msg.tool_calls:
                    function_name = tool_call.function.name
                    arguments = json.loads(tool_call.function.arguments)
                    
                    tool_output = None
                    
                    if function_name == "get_location_info":
                        tool_output = self.get_location_info(arguments.get("query"))
                    elif function_name == "search_admin_manual":
                        tool_output = self.search_admin_manual(arguments.get("keywords"))
                    elif function_name == "save_complaint_to_db":
                        tool_output = self.save_complaint_to_db(arguments)
                        # We might set a structured_data return here if we want to pass it up
                    
                    # Append tool execution result
                    messages.append({
                        "tool_call_id": tool_call.id,
                        "role": "tool",
                        "name": function_name,
                        "content": str(tool_output)
                    })
                
                # Get final response after tool execution
                final_response = await self.service.get_chat_response(messages)
                
                # Update history with the full interaction
                history.append({"role": "user", "content": user_message})
                history.append(final_response) # Simplified, should serialize
                
                return final_response.content, messages
            
            return response_msg.content, messages

        except Exception as e:
            logger.error(f"Agent Chat Error: {e}")
            return "죄송합니데이, 시스템에 잠시 문제가 생긴 것 같네예. 잠시 뒤에 다시 말해주이소.", history
