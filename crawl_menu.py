import requests
from bs4 import BeautifulSoup
import json
import re
from datetime import datetime

DAYS = ['월', '화', '수', '목', '금']
HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

URL_JONGGANG  = 'https://www.suwon.ac.kr/index.html?menuno=1792'
URL_AMARANTH  = 'https://www.suwon.ac.kr/index.html?menuno=1793'


def parse_student_table(soup):
    """학생 식단표 파싱 → {day: {meal_type: [items]}} , corner_name"""
    table = soup.find('table', {'summary': '학생 식단표'})
    result = {}
    corner = ''
    if not table:
        return result, corner
    tbody = table.find('tbody')
    if not tbody:
        return result, corner
    for row in tbody.find_all('tr'):
        tds = row.find_all('td')
        if len(tds) < 7:
            continue
        meal_type = tds[0].get_text(strip=True)   # 중식 / 석식
        corner = tds[1].get_text(strip=True) or corner
        for i, day in enumerate(DAYS):
            text = tds[i + 2].get_text(separator='\n')
            items = [x.strip() for x in text.split('\n') if x.strip()]
            result.setdefault(day, {})[meal_type] = items if items else ['x']
    return result, corner


def parse_faculty_table(soup):
    """교직원 식단표 파싱 → {day: [items]}"""
    table = soup.find('table', {'summary': '교직원 식단표'})
    result = {}
    if not table:
        return result
    tbody = table.find('tbody')
    if not tbody:
        return result
    for row in tbody.find_all('tr'):
        tds = row.find_all('td')
        if len(tds) < 6:
            continue
        for i, day in enumerate(DAYS):
            text = tds[i + 1].get_text(separator='\n')
            items = [x.strip() for x in text.split('\n') if x.strip()]
            result[day] = items
    return result


def crawl():
    res1 = requests.get(URL_JONGGANG, headers=HEADERS, timeout=15)
    res1.encoding = 'utf-8'
    soup1 = BeautifulSoup(res1.text, 'html.parser')

    res2 = requests.get(URL_AMARANTH, headers=HEADERS, timeout=15)
    res2.encoding = 'utf-8'
    soup2 = BeautifulSoup(res2.text, 'html.parser')

    # 주간 날짜 범위
    week_range = ''
    date_tags = soup1.find_all('p', class_='fl tp10')
    if date_tags:
        raw = date_tags[0].get_text(strip=True)
        week_range = re.sub(r'\(.\)', '', raw).strip()

    # 종합강의동
    jong_raw, jong_corner = parse_student_table(soup1)
    jong_menu = {}
    for day in DAYS:
        meals = jong_raw.get(day, {})
        jong_menu[day] = meals.get('중식', ['x'])

    # 아마랜스홀
    ama_raw, ama_corner = parse_student_table(soup2)
    ama_menu = {}
    for day in DAYS:
        meals = ama_raw.get(day, {})
        ama_menu[day] = {
            '중식': meals.get('중식', ['x']),
            '석식': meals.get('석식', ['x']),
        }

    # 교직원
    faculty_raw = parse_faculty_table(soup1)

    result = {
        "updated": datetime.now().strftime('%Y-%m-%d'),
        "weekRange": week_range,
        "jonggang": {
            "corner": jong_corner or "Little Kitchen",
            "price": 6000,
            "menu": jong_menu,
        },
        "amaranth": {
            "corner": ama_corner or "Mom's Cook",
            "price": 6500,
            "menu": ama_menu,
        },
        "faculty": {
            "menu": faculty_raw,
        },
        # 하위 호환
        "student": {
            "corner": jong_corner or "Little Kitchen",
            "price": 6000,
            "menu": jong_menu,
        },
    }

    with open('menu.json', 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"완료: {week_range}")
    return result


if __name__ == '__main__':
    crawl()
