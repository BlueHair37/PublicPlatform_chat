
# Seed Mock Data for Busan Civil Complaints
import sys
import os
import random
from datetime import datetime
from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models

# Ensure tables exist
models.Base.metadata.drop_all(bind=engine)
models.Base.metadata.create_all(bind=engine)

def seed_data():
    db = SessionLocal()
    
    # 3 Main Clusters: Seomyeon (Trafffic/Safety), Gwangalli (Env/Noise), Haeundae (Construction/Damage)
    
    complaints = [
        # --- Gwangalli (Beach, Environment, Noise) ---
        {
            "summary": "민락 수변공원 쓰레기 악취 심각",
            "original_text": "수변공원에서 밤새 술마시고 버린 쓰레기가 산더미처럼 쌓여있습니다. 아침 운동 나왔다가 냄새 때문에 머리가 아플 지경입니다. 파리도 너무 많이 꼬이고 위생상 정말 안좋아 보이네요. 아이들도 많이 지나다니는데 빠른 수거 부탁드립니다.",
            "location": "부산 수영구 민락수변로 129",
            "lat": 35.1532, "lng": 129.1186,
            "category": "환경",
            "urgency": 8, "safety": 6,
            "sentiment": 2
        },
        {
            "summary": "광안리 해변 폭죽 소음 신고",
            "original_text": "새벽 2시인데 폭죽 터뜨리는 소리에 잠을 잘 수가 없습니다. 매일 밤마다 전쟁 난 것 같아요. 숙박업소들이 밀집해 있는데 관광객들 통제가 전혀 안되는 것 같습니다. 단속 좀 강력하게 해주세요.",
            "location": "부산 수영구 광안해변로 219",
            "lat": 35.1554, "lng": 129.1225,
            "category": "소음",
            "urgency": 7, "safety": 3,
            "sentiment": 1
        },
        {
            "summary": "광안대교 뷰포인트 쓰레기 투기",
            "original_text": "사진 찍기 좋은 곳이라 사람들이 많이 몰리는데, 먹다 남은 음료수 컵이랑 담배꽁초가 화단에 가득합니다. CCTV를 설치하든 벌금을 물리든 대책이 필요합니다.",
            "location": "부산 수영구 민락동 181-223",
            "lat": 35.1540, "lng": 129.1190,
            "category": "환경",
            "urgency": 5, "safety": 2,
            "sentiment": 3
        },
        {
            "summary": "해변가 버스킹 소음",
            "original_text": "버스킹 구역이 아닌데도 앰프 크게 틀어놓고 노래하는 사람들이 있습니다. 바로 앞 카페에 있는데 대화가 안 될 정도예요. 지정된 구역에서만 하게 해주세요.",
            "location": "부산 수영구 광안해변로 200",
            "lat": 35.1535, "lng": 129.1180,
            "category": "소음",
            "urgency": 4, "safety": 1,
            "sentiment": 4
        },
         {
            "summary": "광안리 공중화장실 파손",
            "original_text": "해변 끝쪽 공중화장실 문짝이 부서져서 닫히질 않습니다. 이용하기 너무 불편하고 민망하네요. 수리 바랍니다.",
            "location": "부산 수영구 민락동 110-14",
            "lat": 35.1560, "lng": 129.1240,
            "category": "시설",
            "urgency": 6, "safety": 4,
            "sentiment": 3
        },
        {
            "summary": "수변공원 입구 불법 주차",
            "original_text": "공원 들어가는 입구 양쪽에 불법 주차된 차들 때문에 차가 한 대밖에 못 지나갑니다. 주말마다 주차장이 되네요. 횡단보도까지 가려져서 위험합니다.",
            "location": "부산 수영구 민락수변로 100",
            "lat": 35.1525, "lng": 129.1170,
            "category": "교통",
            "urgency": 7, "safety": 8,
            "sentiment": 2
        },
        {
            "summary": "광안리 해수욕장 유리조각 위험",
            "original_text": "모래사장에 깨진 소주병 조각들이 널려있습니다. 맨발로 걷다가 다칠 뻔했어요. 아침에 청소차 돌 때 더 꼼꼼히 봐주셔야 할 것 같습니다.",
            "location": "부산 수영구 광안해변로 190",
            "lat": 35.1530, "lng": 129.1160,
            "category": "안전",
            "urgency": 9, "safety": 9,
            "sentiment": 1
        },
        {
            "summary": "민락 회센터 악취",
            "original_text": "회센터 뒷길 하수구에서 생선 비린내 섞인 악취가 너무 심하게 올라옵니다. 여름 되니까 더 심해지는 것 같네요. 준설 작업이 필요해 보입니다.",
            "location": "부산 수영구 민락수변로 1",
            "lat": 35.1545, "lng": 129.1210,
            "category": "환경",
            "urgency": 6, "safety": 3,
            "sentiment": 2
        },

        # --- Seomyeon (Traffic, Safety, Infrastructure) ---
        {
            "summary": "서면 교차로 꼬리물기 단속 요청",
            "original_text": "출퇴근 시간마다 서면 교차로에서 꼬리물기 하는 차들 때문에 신호가 바껴도 지나갈 수가 없습니다. 경찰관분이 나와서 정리 좀 해주세요. 매일 지옥입니다.",
            "location": "부산 부산진구 중앙대로 730",
            "lat": 35.1578, "lng": 129.0600,
            "category": "교통",
            "urgency": 8, "safety": 7,
            "sentiment": 1
        },
        {
            "summary": "쥬디스태화 앞 보도블록 파손",
            "original_text": "사람들이 엄청 많이 다니는 길인데 보도블록이 다 깨져서 덜컹거립니다. 어제 힐 신은 분이 걸려서 넘어지는 거 봤어요. 정비가 시급합니다.",
            "location": "부산 부산진구 서면로 10",
            "lat": 35.1565, "lng": 129.0590,
            "category": "시설",
            "urgency": 7, "safety": 8,
            "sentiment": 3
        },
        {
            "summary": "전포 카페거리 가로등 고장",
            "original_text": "골목 안쪽 가로등이 깜빡거리다가 이제 아예 나갔습니다. 밤에 너무 어두워서 다니기 무서워요. 요즘 세상도 흉흉한데 빨리 고쳐주세요.",
            "location": "부산 부산진구 전포대로209번길 15",
            "lat": 35.1550, "lng": 129.0630,
            "category": "안전",
            "urgency": 9, "safety": 9,
            "sentiment": 2
        },
        {
            "summary": "서면 지하상가 누수",
            "original_text": "지하상가 롯데백화점 연결 통로 천장에서 물이 똑똑 떨어집니다. 바닥이 미끄러워서 넘어질 뻔했습니다. 양동이만 받쳐두지 말고 근본적인 수리를 해주세요.",
            "location": "부산 부산진구 가야대로 772",
            "lat": 35.1570, "lng": 129.0585,
            "category": "시설",
            "urgency": 6, "safety": 7,
            "sentiment": 3
        },
        {
            "summary": "서면 2번가 오토바이 인도 주행",
            "original_text": "배달 오토바이들이 인도로 막 다녀서 걸어 다닐 수가 없습니다. 너무 위협적이에요. 단속 카메라를 설치하든지 해주세요.",
            "location": "부산 부산진구 중앙대로692번길 30",
            "lat": 35.1560, "lng": 129.0610,
            "category": "안전",
            "urgency": 8, "safety": 9,
            "sentiment": 1
        },
        {
            "summary": "부전도서관 앞 벤치 파손",
            "original_text": "도서관 앞 벤치 나무가 썩어서 부러졌습니다. 모르고 앉았다가 다칠 뻔했네요.",
            "location": "부산 부산진구 동천로 79",
            "lat": 35.1555, "lng": 129.0625,
            "category": "시설",
            "urgency": 4, "safety": 5,
            "sentiment": 4
        },
        {
            "summary": "NC백화점 앞 불법 유턴",
            "original_text": "여기서 불법 유턴하는 택시들 때문에 사고 날 뻔한 적이 한두 번이 아닙니다. 중앙분리대를 설치해 주세요.",
            "location": "부산 부산진구 동천로 92",
            "lat": 35.1585, "lng": 129.0635,
            "category": "교통",
            "urgency": 7, "safety": 8,
            "sentiment": 2
        },
        {
            "summary": "서면역 환기구 소음",
            "original_text": "지하철 환기구에서 웅웅거리는 소리가 너무 크게 들립니다. 근처 가게 운영하는데 손님들이 시끄럽다고 나가요.",
            "location": "부산 부산진구 서면로 25",
            "lat": 35.1572, "lng": 129.0595,
            "category": "소음",
            "urgency": 5, "safety": 2,
            "sentiment": 3
        },

        # --- Haeundae (Construction, Road, Safety) ---
        {
            "summary": "해운대 구남로 공사 자재 방치",
            "original_text": "도로 공사하다가 남은 자재들을 인도에 그대로 쌓아두고 갔습니다. 통행에도 방해되고 밤엔 잘 안 보여서 걸려 넘어질 것 같아요.",
            "location": "부산 해운대구 구남로 20",
            "lat": 35.1620, "lng": 129.1595,
            "category": "안전",
            "urgency": 7, "safety": 7,
            "sentiment": 2
        },
        {
            "summary": "해운대 시장 입구 악취",
            "original_text": "하수구 냄새가 너무 심합니다. 관광객들도 코 막고 지나가요. 부산 이미지 망치겠습니다.",
            "location": "부산 해운대구 구남로41번길 10",
            "lat": 35.1625, "lng": 129.1610,
            "category": "환경",
            "urgency": 6, "safety": 3,
            "sentiment": 3
        },
        {
            "summary": "마린시티 방파제 안전 펜스 녹",
            "original_text": "영화의 거리 쪽 펜스가 녹이 슬어서 보기 흉하고 손대면 부스러질 것 같습니다. 태풍 오기 전에 보수해야 할 것 같아요.",
            "location": "부산 해운대구 마린시티1로 51",
            "lat": 35.1548, "lng": 129.1435,
            "category": "시설",
            "urgency": 5, "safety": 6,
            "sentiment": 4
        },
        {
            "summary": "달맞이길 가로등 미점등",
            "original_text": "달맞이길 산책로 중간쯤 가로등이 3개 연속으로 안 들어옵니다. 너무 어둡습니다.",
            "location": "부산 해운대구 달맞이길 117",
            "lat": 35.1590, "lng": 129.1750,
            "category": "시설",
            "urgency": 6, "safety": 7,
            "sentiment": 3
        },
        {
            "summary": "센텀시티 벡스코 앞 신호등 고장",
            "original_text": "보행자 신호등이 초록불로 안 바뀝니다. 한참 기다리다가 눈치 보고 건넜어요. 아이들도 많이 오는 곳인데 위험합니다.",
            "location": "부산 해운대구 APEC로 55",
            "lat": 35.1690, "lng": 129.1360,
            "category": "교통",
            "urgency": 9, "safety": 9,
            "sentiment": 1
        },
        {
            "summary": "장산역 주변 불법 현수막",
            "original_text": "분양 광고 현수막이 사거리를 도배해서 운전할 때 시야를 가립니다. 바람에 날려서 떨어질 것 같기도 하고요. 철거 부탁드립니다.",
            "location": "부산 해운대구 해운대로 813",
            "lat": 35.1700, "lng": 129.1765,
            "category": "안전",
            "urgency": 6, "safety": 7,
            "sentiment": 3
        },
        {
            "summary": "동백섬 산책로 파손",
            "original_text": "나무 데크가 솟아올라서 발이 걸립니다. 어르신들 많이 다니시는데 큰일 나겠어요.",
            "location": "부산 해운대구 동백로 52",
            "lat": 35.1520, "lng": 129.1500,
            "category": "시설",
            "urgency": 8, "safety": 8,
            "sentiment": 2
        },
        {
            "summary": "해운대 해수욕장 쓰레기 수거 요청",
            "original_text": "파라솔 꽂혀 있는 쪽에 먹다 남은 치킨 박스가 그대로 있습니다. 갈매기들이 쪼아먹고 난리 났어요.",
            "location": "부산 해운대구 해운대해변로 264",
            "lat": 35.1595, "lng": 129.1630,
            "category": "환경",
            "urgency": 5, "safety": 2,
            "sentiment": 3
        },
    ]

    import uuid
    for data in complaints:
        complaint = models.MockComplaint(
            id=str(uuid.uuid4()),
            summary=data["summary"],
            original_text=data["original_text"],
            location=data["location"],
            lat=data["lat"],
            lng=data["lng"],
            category=data["category"],
            
            urgency_score=data["urgency"],
            safety_risk_score=data["safety"],
            inconvenience_score=random.randint(4, 9),
            visual_impact_score=random.randint(4, 9),
            sentiment_score=data["sentiment"],
            
            status="접수완료",
            created_at=datetime.now(),
            estimated_cost=random.choice(["Low", "Medium", "High"]),
            legal_risk=random.choice(["None", "Low"]),
            department_in_charge="민원팀"
        )
        db.add(complaint)
    
    db.commit()
    print(f"Successfully seeded {len(complaints)} detailed Mock Complaints.")

if __name__ == "__main__":
    seed_data()
