import requests
from bs4 import BeautifulSoup
import json
import re
from datetime import datetime

URL = "https://www.suwon.ac.kr/index.html?menuno=762"
DAYS = ['월', '화', '수', '목', '금']

def crawl():
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
    res = requests.get(URL, headers=headers, timeout=15)
    res.encoding = 'utf-8'
    soup = BeautifulSoup(res.text, 'html.parser')

    date_tags = soup.find_all('p', class_='fl tp10')
    week_range = ''
    if date_tags:
        raw = date_tags[0].get_text(strip=True)
        week_range = re.sub(r'\(.\)', '', raw).strip()

    student_table = soup.find('table', {'summary': '학생 식단표'})
    student_menu = {}
    corner_name = 'Little Kitchen'
    if student_table:
        rows = student_table.find('tbody').find_all('tr')
        for row in rows:
            tds = row.find_all('td')
            if len(tds) >= 7:
                corner_name = tds[1].get_text(strip=True)
                for i, day in enumerate(DAYS):
                    text = tds[i + 2].get_text(separator='\n')
                    items = [x.strip() for x in text.split('\n') if x.strip()]
                    student_menu[day] = items

    faculty_table = soup.find('table', {'summary': '교직원 식단표'})
    faculty_menu = {}
    if faculty_table:
        rows = faculty_table.find('tbody').find_all('tr')
        for row in rows:
            tds = row.find_all('td')
            if len(tds) >= 6:
                for i, day in enumerate(DAYS):
                    text = tds[i + 1].get_text(separator='\n')
                    items = [x.strip() for x in text.split('\n') if x.strip()]
                    faculty_menu[day] = items

    result = {
        "updated": datetime.now().strftime('%Y-%m-%d'),
        "weekRange": week_range,
        "student": {
            "corner": corner_name,
            "price": 6000,
            "menu": student_menu
        },
        "faculty": {
            "menu": faculty_menu
        }
    }

    with open('menu.json', 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"완료: {week_range}")
    return result

if __name__ == '__main__':
    crawl()
