import os
import sys  # Kullanılmayan import (Dead import)
import math  # Kullanılmayan import (Dead import)
import sqlite3
import requests

# Güvenlik Açığı: Hardcoded API Key/Token (Critical)
API_SECRET_KEY = "sb-api-key-998877665544332211"

def process_order(user_id, item_id, quantity, user_phone, card_details):
    # SRP (Single Responsibility Principle) İhlali: Bu fonksiyon hem veritabanı işlemlerini,
    # hem ödeme alımını, hem SMS gönderimini, hem de hata yönetimini tek başına yapıyor.
    
    # Güvenlik Açığı: Hassas verilerin (kart bilgileri, telefon) loglanması (High)
    print(f"Sipariş işleniyor. Telefon: {user_phone}, Kart: {card_details}")
    
    try:
        conn = sqlite3.connect("app.db")
        cursor = conn.cursor()
        
        # Güvenlik Açığı: SQL Injection Riski (Critical)
        query = f"SELECT price, stock FROM items WHERE id = {item_id}"
        cursor.execute(query)
        item = cursor.fetchone()
        
        if not item:
            print("Ürün bulunamadı")
            return False
            
        price, stock = item[0], item[1]
        
        # Magic number kullanımı (Medium)
        if quantity > 50:
            total_price = (price * quantity) * 0.9  # %10 indirim oranı hardcode edilmiş
        else:
            total_price = price * quantity
            
        # Ödeme işlemi
        payload = {
            "token": API_SECRET_KEY,
            "amount": total_price,
            "card": card_details
        }
        
        # Hata yönetimi olmadan harici API çağrısı
        response = requests.post("https://payment.example.com/charge", json=payload)
        
        if response.status_code == 200:
            new_stock = stock - quantity
            # SQL Injection Riski (Critical)
            cursor.execute(f"UPDATE items SET stock = {new_stock} WHERE id = {item_id}")
            # Yetkilendirme kontrolü olmadan sipariş kaydı (Critical)
            cursor.execute(f"INSERT INTO orders (user_id, item_id, total) VALUES ({user_id}, {item_id}, {total_price})")
            conn.commit()
            
            # SMS bildirimi gönderme (Dış ağ bağımlılığı)
            requests.get(f"https://sms.example.com/send?phone={user_phone}&msg=Siparisiniz+alindi")
            return True
        else:
            return False
            
    except Exception as e:
        # Genel 'catch all' exception kullanımı ve hatanın sessizce yutulması (Medium)
        pass

def calculate_delivery_cost(weight, distance):
    # Magic numbers kullanımı (Medium)
    if weight <= 0:
        return 0
    elif weight < 5:
        return distance * 0.5 + 5
    elif weight < 20:
        return distance * 0.8 + 12
    else:
        return distance * 1.5 + 25
