from database import engine, SessionLocal, Base
from models import WordCloudItem, ComplaintPattern, HighRiskComplaint, InsightData, DashboardStat

def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Clear existing data (optional for dev)
    db.query(WordCloudItem).delete()
    db.query(ComplaintPattern).delete()
    db.query(HighRiskComplaint).delete()
    db.query(InsightData).delete()
    
    # 1. Word Cloud Items (from MapArea.jsx)
    items = [
        { "text": '도로 파손', "position": [35.185, 129.075], "size": '3.5rem', "class_name": 'text-primary font-black opacity-95', "style": { "textShadow": '0 4px 12px rgba(0,0,0,0.15)' } },
        { "text": '소음 민원', "position": [35.165, 129.055], "size": '2.2rem', "class_name": 'text-slate-600 dark:text-slate-300 font-bold opacity-80', "style": {} },
        { "text": '교통 정체', "position": [35.195, 129.095], "size": '3rem', "class_name": 'text-slate-700 dark:text-slate-200 font-extrabold opacity-80', "style": {} },
        { "text": '불법 주차', "position": [35.175, 129.115], "size": '1.8rem', "class_name": 'text-slate-500 dark:text-slate-400 font-semibold opacity-70', "style": {} },
        { "text": '쓰레기 투기', "position": [35.215, 129.065], "size": '2.4rem', "class_name": 'text-slate-600 dark:text-slate-300 font-bold opacity-85', "style": {} },
        { "text": '가로등 고장', "position": [35.155, 129.085], "size": '1.4rem', "class_name": 'text-slate-500 dark:text-slate-400 font-medium opacity-65', "style": {} },
        { "text": '수질 오염', "position": [35.225, 129.045], "size": '2rem', "class_name": 'text-slate-500 dark:text-slate-400 font-bold opacity-75', "style": {} },
    ]

    for item in items:
        db_item = WordCloudItem(
            text=item['text'],
            lat=item['position'][0],
            lng=item['position'][1],
            size=item['size'],
            class_name=item['class_name'],
            style=item['style']
        )
        db.add(db_item)

    # 2. Complaint Patterns (from RightPanel.jsx)
    # "야간 시간대(22시-02시) <span class=\"text-primary font-bold\">대형 오토바이</span> 주행 소음이 전체의 72%를 차지합니다. 단속 카메라 추가 설치가 제안됩니다."
    p1 = ComplaintPattern(
        title="수영구 소음 민원 패턴",
        description="야간 시간대(22시-02시) <span class=\"text-primary font-bold\">대형 오토바이</span> 주행 소음이 전체의 72%를 차지합니다. 단속 카메라 추가 설치가 제안됩니다."
    )
    db.add(p1)

    # 3. High Risk Complaints (from RightPanel.jsx)
    h1 = HighRiskComplaint(
        title="싱크홀 징후 포착",
        time_text="방금 전",
        location="중구 중앙동 4가 도로 균열 심화",
        category="warning", # warning icon
        description="중구 중앙동 4가 도로 균열 심화"
    )
    h2 = HighRiskComplaint(
        title="수도관 파열 의심",
        time_text="12분 전",
        location="진구 부전동 일대 도로 침수 신고",
        category="water_drop", # water_drop icon
        description="진구 부전동 일대 도로 침수 신고"
    )
    db.add(h1)
    db.add(h2)

    # 4. Insight (from RightPanel.jsx logic)
    # The default insight text or last generated one.
    # Note: RightPanel fetches /api/dashboard/insight.
    # We can seed a default one.
    insight_text = """
    <p class='mb-2'>최근 24시간 동안 <strong>부산진구</strong>와 <strong>해운대구</strong>에서 <span class='text-primary font-bold'>불법 주차</span> 및 <span class='text-primary font-bold'>소음 신고</span>가 급증하고 있습니다.</p>
    <ul class='list-disc list-inside space-y-1 text-slate-500'>
        <li>서면 교차로 일대 교통 체증 심화</li>
        <li>광안리 해변가 야간 소음 민원 15건 접수</li>
    </ul>
    """
    db.add(InsightData(content=insight_text))
    
    # 5. Dashboard Stats (General)
    db.query(DashboardStat).delete()
    db.add(DashboardStat(key="work_completion_rate", value="65", description="오늘의 AI 업무 추천 완료율"))
    db.add(DashboardStat(key="avg_road_severity", value="88", description="평균 도로 파손 심각도"))
    db.add(DashboardStat(key="pending_complaints_count", value="124", description="대기 중인 민원 건수 (선택 영역 예시)"))

    db.commit()

    db.commit()
    db.close()
    print("Database seeded successfully.")

if __name__ == "__main__":
    init_db()
