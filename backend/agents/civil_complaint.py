from agents.openai_service import get_openai_service
import json
import logging
import uuid
from models import MockComplaint
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
                            "summary": {"type": "string", "description": "민원 내용 요약 (표준어)"},
                            "original_text": {"type": "string", "description": "사용자 원문"},
                            "location": {"type": "string", "description": "민원 발생 위치"},
                            "category": {"type": "string", "description": "민원 카테고리 (교통, 환경, 안전 등)"},
                            
                            "urgency_score": {"type": "integer", "description": "조치 시급성 (1~10)"},
                            "safety_risk_score": {"type": "integer", "description": "시민 안전 위협도 (1~10)"},
                            "inconvenience_score": {"type": "integer", "description": "시민 불편도 (1~10)"},
                            "visual_impact_score": {"type": "integer", "description": "도시 미관 저해 조도 (1~10)"},
                            "sentiment_score": {"type": "integer", "description": "민원인의 감정 격앙 정도 (1~10)"},
                            
                            "estimated_cost": {"type": "string", "enum": ["Low", "Medium", "High"], "description": "예상 조치 비용"},
                            "required_personnel": {"type": "string", "description": "필요 인력 및 장비 추정"},
                            "legal_risk": {"type": "string", "enum": ["Low", "High"], "description": "법적 분쟁 가능성"},
                            "probability_of_escalation": {"type": "integer", "description": "방치 시 문제 확산 확률 (%)"},
                            "department_in_charge": {"type": "string", "description": "담당 부서 추천"}
                        },
                        "required": [
                            "summary", "original_text", "location", "category",
                            "urgency_score", "safety_risk_score", "inconvenience_score", 
                            "department_in_charge"
                        ]
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

    def save_complaint_to_db(self, args, db=None):
        if not db:
            return json.dumps({"status": "error", "message": "Database connection failed internally."})
        
        try:
            # Create ID
            c_id = str(uuid.uuid4())
            
            # Create/Map fields
            complaint = MockComplaint(
                id=c_id,
                status="접수완료",
                # Map specific fields from args
                summary=args.get("summary"),
                original_text=args.get("original_text"),
                location=args.get("location"),
                category=args.get("category"),
                
                urgency_score=args.get("urgency_score"),
                safety_risk_score=args.get("safety_risk_score"),
                inconvenience_score=args.get("inconvenience_score"),
                visual_impact_score=args.get("visual_impact_score"),
                sentiment_score=args.get("sentiment_score"),
                
                estimated_cost=args.get("estimated_cost"),
                required_personnel=args.get("required_personnel"),
                legal_risk=args.get("legal_risk"),
                probability_of_escalation=args.get("probability_of_escalation"),
                department_in_charge=args.get("department_in_charge")
            )
            
            db.add(complaint)
            db.commit()
            
            return json.dumps({"status": "success", "message": f"민원(ID: {c_id})이 정상적으로 시스템에 등록되었습니다. (위험도: {args.get('safety_risk_score')}/10)"})
        except Exception as e:
            logger.error(f"DB Save Error: {e}")
            return json.dumps({"status": "error", "message": str(e)})

    async def chat(self, user_message: str, history: list = [], db=None, image_data=None):
        # Build messages history
        messages = [{"role": "system", "content": self.system_prompt}]
        messages.extend(history)
        
        # Handle Image Input for Vision API
        if image_data:
            content_payload = [
                {"type": "text", "text": user_message or "이 사진의 문제를 분석해서 민원을 접수해줘."},
                {"type": "image_url", "image_url": {"url": image_data}}
            ]
            messages.append({"role": "user", "content": content_payload})
        else:
            messages.append({"role": "user", "content": user_message})

        try:
            response_msg = await self.service.get_chat_response(messages, tools=self.tools)
            
            # Handle Function Calling
            if response_msg.tool_calls:
                # Append assistant's function call request to history
                messages.append(response_msg)
                
                for tool_call in response_msg.tool_calls:
                    function_name = tool_call.function.name
                    arguments = json.loads(tool_call.function.arguments)
                    
                    tool_output = None
                    
                    if function_name == "get_location_info":
                        tool_output = self.get_location_info(arguments.get("query"))
                    elif function_name == "search_admin_manual":
                        tool_output = self.search_admin_manual(arguments.get("keywords"))
                    elif function_name == "save_complaint_to_db":
                        tool_output = self.save_complaint_to_db(arguments, db=db) # Pass DB session
                    
                    # Append tool execution result
                    messages.append({
                        "tool_call_id": tool_call.id,
                        "role": "tool",
                        "name": function_name,
                        "content": str(tool_output)
                    })
                
                # Get final response after tool execution
                final_response = await self.service.get_chat_response(messages)
                
                # Update history (Append User and Final Bot response)
                if image_data:
                     # Simplify history
                     history.append({"role": "user", "content": f"[이미지 전송됨] {user_message}"})
                else:
                     history.append({"role": "user", "content": user_message})
                     
                history.append(final_response) 
                
                return final_response.content, [
                    msg.model_dump() if hasattr(msg, "model_dump") else msg 
                    for msg in messages
                ]
            
            # Non-tool response
            messages.append(response_msg)
            
            if image_data:
                 history.append({"role": "user", "content": f"[이미지 전송됨] {user_message}"})
            else:
                 history.append({"role": "user", "content": user_message})
            history.append(response_msg)

            return response_msg.content, [
                msg.model_dump() if hasattr(msg, "model_dump") else msg 
                for msg in messages
            ]

        except Exception as e:
            logger.error(f"Agent Chat Error: {e}")
            return "죄송합니데이, 시스템에 잠시 문제가 생긴 것 같네예. 잠시 뒤에 다시 말해주이소.", history
