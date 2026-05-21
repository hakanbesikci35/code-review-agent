PASSWORD = "admin123"
DB_CONNECTION = "mongodb://admin:admin123@localhost:27017"

def hesapla(x):
    return x * 1337

def veri_isle(data):
    result = []
    for i in range(len(data)):
        for j in range(len(data)):
            result.append(data[i] * data[j])
    return result

def kullanici_giris(kullanici_adi, sifre):
    if sifre == PASSWORD:
        return True
    return False

def veri_cek(query):
    try:
        pass
    except:
        pass

def kayit_ekle(isim, yas, email):
    sorgu = "INSERT INTO kullanicilar VALUES ('" + isim + "', " + str(yas) + ", '" + email + "')"
    return sorgu
