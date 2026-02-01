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
        너는 부산광역시의 민원 상담 전문 AI 어시스턴트 '부기(Boogi)'야.
        사용자의 말을 경청하고, **친절하고 정중한 표준어**로 응대해야 해.

        **핵심 임무: 심층 맥락 파악 (Deep Context Inquiry)**
        단순히 위치나 사진만 묻는 기계적인 설문조사를 하지 마. **탐정처럼** 문제의 본질과 원인을 파악하기 위해 **상황에 맞는 구체적인 질문**을 던져야 해.

        **대화 가이드라인**:
        0. **기억하기 (Memory Check)**: 대화를 시작하기 전에 반드시 **이전 대화 기록(History)**을 확인해. 이미 사용자가 위치나 증상을 말했으면 **절대로** 다시 묻지 마. 기억한 정보를 바탕으로 다음 질문을 이어가.
        1. **초기 분석**: 사용자의 첫 마디를 듣고, 어떤 유형의 문제인지 파악해.
        2. **심층 질문 (Context Finding)**: '무엇(What)'을 넘어 '왜(Why)', '어떻게(How)', '얼마나(Severity)'를 파악해.
           - *예시 (악취)*: "냄새가 시궁창 냄새인가요, 아니면 화학 약품 냄새인가요? 비가 올 때 더 심해지나요?"
           - *예시 (소음)*: "소음이 주로 야간에 발생하나요? 쿵쿵거리는 진동도 느껴지시나요?"
           - *예시 (도로파손)*: "구멍의 크기가 차량 바퀴가 빠질 정도인가요? 보행자 통행이 많은 곳인가요?"
        3. **정보 수집**: 대화 흐름 속에 자연스럽게 **위치, 현장 사진** 요청을 섞어. 질문을 한 번에 하나씩만 해.
        4. **전문가적 공감**: 사용자의 불편에 공감하며, 네가 문제 해결을 위해 이 구체적인 정보가 왜 필요한지 설명해.

        **주의사항**:
        1. **내부 데이터 숨김**: 함수 호출 코드나 JSON 데이터를 절대 노출하지 마.
        2. **종료 조건**: 모든 정보(위치, 사진, 상황 맥락)가 충분히 모였다고 판단되면 `save_complaint_to_db`를 호출하고, "민원이 상세하게 접수되었습니다."라고 안내해.
        3. **사진 분석**: 사진이 제공되면 반드시 시각적 심각성(균열 크기, 위험도)을 언급하며 질문을 이어가.

        **개인정보**: 전화번호/주민번호는 마스킹 처리.
        """
        
        # Tools Definition
        self.tools = [
            {
                "type": "function",
                "function": {
                    "name": "get_location_info",
                    "description": "사용자가 제공한 위치의 상세 정보를 조회 (예: 행정동, 관할 구청)",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "query": {"type": "string", "description": "위치/장소 검색어"}
                        },
                        "required": ["query"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "search_admin_manual",
                    "description": "부산시 행정 매뉴얼이나 관련 법규를 검색",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "keywords": {"type": "string", "description": "검색 키워드 (예: 도로 파손 보수 규정)"}
                        },
                        "required": ["keywords"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "save_complaint_to_db",
                    "description": "민원 내용을 최종 정리하여 시스템에 등록/저장",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "summary": {"type": "string", "description": "민원 내용 요약 (표준어)"},
                            "original_text": {"type": "string", "description": "사용자 원문"},
                            "location": {"type": "string", "description": "민원 발생 위치 (주소)"},
                            "lat": {"type": "number", "description": "위도 (Latitude), 없을 경우 null"},
                            "lng": {"type": "number", "description": "경도 (Longitude), 없을 경우 null"},
                            "category": {"type": "string", "description": "민원 카테고리 (교통, 환경, 안전 등)"},
                            
                            "urgency_score": {"type": "integer", "description": "AI가 판단한 조치 시급성 (1~10)"},
                            "safety_risk_score": {"type": "integer", "description": "AI가 판단한 시민 안전 위협도 (1~10)"},
                            "inconvenience_score": {"type": "integer", "description": "AI가 판단한 시민 불편도 (1~10)"},
                            "visual_impact_score": {"type": "integer", "description": "AI가 판단한 도시 미관 저해 정도 (1~10)"},
                            "sentiment_score": {"type": "integer", "description": "대화에서 느껴지는 민원인의 감정 격앙 정도 (1~10)"},
                            
                            "estimated_cost": {"type": "string", "enum": ["Low", "Medium", "High"], "description": "예상 조치 비용"},
                            "required_personnel": {"type": "string", "description": "필요 인력 및 장비 추정"},
                            "legal_risk": {"type": "string", "enum": ["Low", "High"], "description": "법적 분쟁 가능성"},
                            "probability_of_escalation": {"type": "integer", "description": "방치 시 문제 확산 확률 (%)"},
                            "department_in_charge": {"type": "string", "description": "담당 부서 추천"}
                        },
                        "required": [
                            "summary", "original_text", "location", "category"
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
            
            # Simple PII Masking (Regex could be used here)
            original_text = args.get("original_text", "")
            if "010" in original_text: # Very basic example
                original_text = original_text.replace("010", "***")
            
            # Handle aliases/misinterpretation by AI (Robustness)
            summary = args.get("summary") or args.get("issue") or "내용 없음"
            
            # Create/Map fields
            # Mock Coordinates if missing (For Demo Visualization)
            lat = args.get("lat")
            lng = args.get("lng")
            if not lat or not lng:
                import random
                # Busan Center roughly 35.179, 129.075
                # Random offset to scatter them
                lat = 35.179 + random.uniform(-0.02, 0.02)
                lng = 129.075 + random.uniform(-0.02, 0.02)

            complaint = MockComplaint(
                id=c_id,
                status="접수완료",
                # Map specific fields from args
                summary=summary,
                original_text=original_text,
                location=args.get("location"),
                lat=lat,
                lng=lng,
                category=args.get("category"),
                
                urgency_score=args.get("urgency_score", 5),
                safety_risk_score=args.get("safety_risk_score", 5),
                inconvenience_score=args.get("inconvenience_score", 5),
                visual_impact_score=args.get("visual_impact_score", 5),
                sentiment_score=args.get("sentiment_score", 5),
                
                estimated_cost=args.get("estimated_cost", "Low"),
                required_personnel=args.get("required_personnel"),
                legal_risk=args.get("legal_risk", "Low"),
                probability_of_escalation=args.get("probability_of_escalation", 0),
                department_in_charge=args.get("department_in_charge", "민원팀")
            )
            
            db.add(complaint)
            db.commit()
            
            return json.dumps({"status": "success", "message": f"민원(ID: {c_id})이 정상적으로 접수되었습니다."})
        except Exception as e:
            import traceback
            logger.error(f"DB Save Error: {traceback.format_exc()}")
            return json.dumps({"status": "error", "message": f"DB 저장 중 오류 발생: {str(e)}"})

    async def generate_report(self, complaint_data: dict):
        """
        Generate a comprehensive AI report for a specific complaint.
        """
        prompt = f"""
        당신은 부산광역시 민원 분석 전문가입니다. 아래 민원 데이터에 대한 종합 분석 리포트를 작성해주세요.

        [민원 데이터]
        - 요약: {complaint_data.get('summary')}
        - 원문: {complaint_data.get('original_text')}
        - 카테고리: {complaint_data.get('category')}
        - 위치: {complaint_data.get('location')}
        - 시급성점수: {complaint_data.get('urgency_score')}/10
        - 안전위협점수: {complaint_data.get('safety_risk_score')}/10
        
        [작성 요청사항]
        1. **종합 의견**: 이 민원의 심각성과 우선순위에 대한 전문가적 소견 (2~3문장).
        2. **조치 제안**: 구체적으로 어떤 조치가 필요한지 (담당 부서가 해야 할 일).
        3. **예상 효과**: 조치 시 기대되는 시민 편의나 안전 개선 효과.
        
        전문적인 공공기관 보고서 말투로 작성해주세요.
        """
        
        try:
            response = await self.service.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are a helpful AI assistant for city administration."},
                    {"role": "user", "content": prompt}
                ]
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"리포트 생성 실패: {str(e)}"

    async def chat(self, user_message: str, history: list = [], db=None, image_data=None):
        # Build messages history
        logger.info(f"DEBUG: Chat History Length: {len(history)}")
        # print(f"DEBUG: Full History: {history}") # Uncomment for deep debug
        
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
            # Check for location data in text (e.g. from frontend Location Button)
            # Frontend sends: "현재 위치 전송: 35.xxx, 129.xxx"
            # We can instruct AI to parse this in system prompt or pre-process here.
            # Let's rely on LLM parsing since we added lat/lng to tools.
            messages.append({"role": "user", "content": user_message})

        try:
            # Call OpenAI Service
            response_msg = await self.service.get_chat_response(messages, tools=self.tools)
            
            # Check for tool calls
            if response_msg.tool_calls:
                # Append assistant's tool call message
                messages.append(response_msg)
                
                for tool_call in response_msg.tool_calls:
                    function_name = tool_call.function.name
                    arguments = json.loads(tool_call.function.arguments)
                    
                    logger.info(f"Executing Tool: {function_name} with args: {arguments}")
                    
                    if function_name == "get_location_info":
                        result = self.get_location_info(arguments.get("query"))
                    elif function_name == "search_admin_manual":
                        result = self.search_admin_manual(arguments.get("keywords"))
                    elif function_name == "save_complaint_to_db":
                        result = self.save_complaint_to_db(arguments, db=db)
                    else:
                        result = "Unknown Tool"
                        
                    messages.append({
                        "tool_call_id": tool_call.id,
                        "role": "tool",
                        "name": function_name,
                        "content": result
                    })
                
                # Get final response after tool execution
                final_response = await self.service.get_chat_response(messages)
                
                # Update history (User msg + Assistant Tool Call + Tool Result + Final Response)
                history.append({"role": "user", "content": user_message}) # Note: Simplified history management
                history.append({"role": "assistant", "content": final_response.content})
                
                return final_response.content, history
            
            else:
                # Normal response
                history.append({"role": "user", "content": user_message})
                history.append({"role": "assistant", "content": response_msg.content})
                return response_msg.content, history

        except Exception as e:
            import traceback
            error_msg = traceback.format_exc()
            logger.error(f"Agent Chat Error: {error_msg}")
            
            # Standard Korean Error Messages
            if "invalid_image_format" in str(error_msg) or "unsupported image" in str(error_msg) or "invalid_base64" in str(error_msg):
                 return "죄송합니다. 보내주신 사진 형식을 시스템에서 지원하지 않습니다 😅.\n**JPG, PNG, GIF** 파일로 다시 보내주시겠습니까?", history

            with open("error.log", "w") as f:
                f.write(error_msg)
            return "죄송합니다. 시스템에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.", history
