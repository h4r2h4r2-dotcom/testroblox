# Discord Bot Kurulum Rehberi

## Bot İzinleri ve Davet Linki

### Gerekli İzinler
Botun düzgün çalışması için aşağıdaki izinlere ihtiyacı var:

**Temel İzinler:**
- `Send Messages` - Mesaj gönderme
- `Use Slash Commands` - Slash komutları kullanma
- `Embed Links` - Embed mesajları gönderme
- `Read Message History` - Mesaj geçmişini okuma

**İzin Değeri:** `274877926400`

### Davet Linki Oluşturma

1. **Discord Developer Portal'a git:** https://discord.com/developers/applications
2. **Botunu seç**
3. **OAuth2 > URL Generator** sayfasına git
4. **Scopes** bölümünde:
   - ✅ `bot`
   - ✅ `applications.commands`
5. **Bot Permissions** bölümünde:
   - ✅ `Send Messages`
   - ✅ `Use Slash Commands` 
   - ✅ `Embed Links`
   - ✅ `Read Message History`

### Örnek Davet Linki
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=274877926400&scope=bot%20applications.commands
```

**YOUR_CLIENT_ID** yerine kendi Client ID'nizi yazın.

## Bot Nasıl Kullanılır

### Komutlar

#### 1. Sunucu Listesi (Sayfalama ile)
```
/jobid [gameid]
```

#### 2. Anlık Oyuncu İstatistikleri  
```
/anlikoyuncu [gameid]
```

#### 3. Attack Komutları Listesi
```
/attack gameid:[gameid]
```

#### 4. CrashGame Komutları Listesi
```
/crashgame gameid:[gameid]
```

### Örnek Kullanım
```
/jobid 606849621
/anlikoyuncu 606849621
/attack gameid:18281137448
/crashgame gameid:18281137448
```

### Kullanım Yerleri
✅ **Discord sunucularında** - Herhangi bir kanalda  
✅ **DM'lerde (Özel mesaj)** - Botla direkt mesajlaşırken  
✅ **Tüm Discord sunucularında** - Botun ekli olduğu her yerde  

### Çıktı

#### /jobid komutu:
- Sayfalama sistemi ile sunucu listesi (10 sunucu/sayfa)
- Önceki/Sonraki butonları ile navigasyon
- Her sunucunun Job ID'si ve oyuncu bilgileri
- Emoji durum göstergeleri (🟢 BOŞ, 🟡 ORTA, 🔴 DOLU)
- Sunucu durumu etiketleri (BOŞ, NEREDEYSE DOLU, DOLU)
- FPS ve ping verileri
- Maksimum 100 sunucu gösterimi

#### /anlikoyuncu komutu:
- Oyun durum emojisi ve durumu (🟢 İYİ, 🟡 ORTA, 🔴 YOĞUN)
- Emoji'li kategoriler (👥 oyuncu, 🖥️ sunucu, 📊 doluluk vb.)
- Toplam aktif oyuncu sayısı
- Toplam sunucu sayısı  
- Ortalama sunucu doluluk oranı
- En dolu sunucu bilgisi
- Toplam kapasite bilgileri

#### /attack komutu:
- ⚔️ Oyundaki tüm sunucular için attack komutları listeler
- Sayfalama sistemi ile sunucu başına komut
- Her sunucu için: `/attack game placeid:X jobid:Y seconds:25 power:8`
- Oyuncu sayısı gösterimi ile birlikte
- Kopyalamaya hazır kod blokları

#### /crashgame komutu:
- 💥 Oyundaki tüm sunucular için crashgame komutları listeler  
- Sayfalama sistemi ile sunucu başına komut
- Her sunucu için: `/crashgame GAMEID`
- Oyuncu sayısı gösterimi ile birlikte
- Kopyalamaya hazır kod blokları

## DM'de Kullanım

✅ **Bot DM'lerde çalışıyor!** DM'de kullanım için:

### Adım 1: Botla DM Aç
1. Discord'da botu arkadaş olarak ekle  
2. Bota DM (özel mesaj) aç
3. `/` yazıp komutları gör

### Adım 2: Komutları Kullan
**DM'de kullanılabilir tüm komutlar:**
- `/jobid gameid` - Sunucu listesi ve detayları
- `/anlikoyuncu gameid` - Oyuncu istatistikleri  
- `/attack gameid` - Attack komutları listesi
- `/crashgame gameid` - CrashGame komutları listesi

**Not:** Bot global olarak deploy edildi, DM'lerde anında kullanılabilir.

## Özellikler

✅ **Herkese açık cevaplar** - Tüm kullanıcılar görebilir  
✅ **Türkçe arayüz** - Tüm mesajlar Türkçe  
✅ **Gerçek zamanlı veriler** - Roblox API'den anlık bilgiler  
✅ **Renkli göstergeler** - Sunucu durumuna göre renk kodları  
✅ **Detaylı bilgiler** - Oyuncu sayısı, FPS, ping vb.  
✅ **Çoklu sayfa desteği** - Çok sunucu varsa sayfalara böler  

## Destek

Bot ile ilgili sorunlar için konsol loglarını kontrol edin veya geliştiriciye ulaşın.