# Kullanıcı işlemleri servisi
import requests
import json
import os
import xml.etree.ElementTree as ET  # kullanılmıyor  LOW — dead import
import hashlib  # kullanılmıyor  LOW — dead import
# Sabit şifre ve API key hardcode edilmiş
DB_PASSWORD = 'supersecret123'  #CRITICAL — hardcode secret
API_KEY = 'sk-prod-abc123xyz789'  #CRITICAL — hardcode API key
BASE_URL = 'http://internal-api/v1'
# Tüm işleri tek fonksiyon yapıyor (SRP ihlali)
def handle_user(user_id, action, data=None):  #HIGH — SRP ihlali, god function
    # Kullanıcıyı çek
    conn = get_db_connection()
    # Raw SQL — injection riski
    query = f"SELECT * FROM users WHERE id = {user_id}"  #CRITICAL — SQL injection
    result = conn.execute(query).fetchone()
    if result:
        print(f"Kullanıcı bulundu: {result}")  # hassas veri loglanıyor  HIGH — sensitive data log
    # Yetki kontrolü yok
    if action == 'update': #CRITICAL — yetkilendirme yok
        conn.execute(f"UPDATE users SET email='{data['email']}' WHERE id={user_id}")  #CRITICAL — SQL injection
        conn.commit()
    elif action == 'delete':
        conn.execute(f"DELETE FROM users WHERE id={user_id}")  #CRITICAL — SQL injection
        conn.commit()
    elif action == 'send_email':
        # API çağrısı loop içinde potansiyel olarak
        requests.post(BASE_URL + '/email', json={'to': result['email']}, headers={'X-API-KEY': API_KEY})
    elif action == 'notify':
        requests.post(BASE_URL + '/notify', json={'uid': user_id})
    elif action == 'export':
        # Tüm kayıtları bellekte tutuyor
        all_users = conn.execute("SELECT * FROM users").fetchall()  #MEDIUM — memory leak riski
        return json.dumps([dict(u) for u in all_users])
    elif action == 'report':
        # Döngü içinde DB sorgusu — N+1 problemi
        orders = conn.execute('SELECT id FROM orders').fetchall()  #HIGH — N+1 sorgu
        for o in orders:
            detail = conn.execute(f"SELECT * FROM order_items WHERE order_id={o['id']}").fetchall()  #HIGH — N+1 + injection
            print(detail)
    else:
        pass  # bilinmeyen action sessizce görmezden gelinir  MEDIUM — hata yutulur
# Exception hiç yakalanmıyor, her şey patlar
def get_db_connection():  #HIGH — exception yönetimi yok
    import sqlite3
    return sqlite3.connect('prod.db')
# Magic number, isimsiz sabit
def is_valid_age(age):
    return 13 <= age <= 120  # 13 ve 120 nedir?  MEDIUM — magic number
# Kullanıcı girdisi sanitize edilmiyor
def search_users(query_str):
    conn = get_db_connection()
    sql = f"SELECT * FROM users WHERE name LIKE '%{query_str}%'"  #CRITICAL — SQL injection
    return conn.execute(sql).fetchall()
# Test yok, dokümantasyon yok, tip ipucu yok  HIGH — test eksik