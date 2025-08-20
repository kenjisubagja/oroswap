
# BOT AUTO SWAP AND AUTO ADD LIQUID DI OROSWAP

Kagak usah basa basi langsung comot jangan lupa bintang nya

```bash 
git clone https://github.com/kenjisubagja/oroswap/
cd oroswap
```
edit file .env nya (MNEMONIC DAN DELAY TX)
```bash 
PRIVATE_KEY_1="your-mnemonic"
PRIVATE_KEY_2="your-mnemonic"
PRIVATE_KEY_3="your-mnemonic"
PRIVATE_KEY_4="your-mnemonic"
PRIVATE_KEY_5="your-mnemonic"
PRIVATE_KEY_6="your-mnemonic"
# delay tx/add liquid 60000 = 60 detik (1 menit)
TX_DELAY=60000
# Delay swap 25000 = 25 detik 
SWAP_DELAY=25000
```
install pendukung script
```bash 
npm install
```
Run buat auto swap (Bisa multi wallet)
```bash 
npm start
```
Run buat add liquid ```( lebih aman swap dulu 1-3 ZIG ke ORO,RWA123,MOON,PUMP,STZIG,STASH,TATTOO )``` Buat apa? biar gak kurang token lu pas add liquid bujang (belum bisa multi wallet)
```bash 
node liq.js
```

## Pertanyaan error 
🤔 kok ada yang error min?

😎 karna pair tidak valid nanti juga bisa

🤔 Enter number of transactions to execute apa?

😎 terserah mau looping/jalanin swap berapa kali swap

🤔 cara nambah biar add liquid ke banyak token? 

😎 bongkar file liq.js nya nanti ada ```// tambahkan pool lain di sini kalau lu mau dan hafal contract_pair nya ``` tambah di atas tulisan ini

🤔 Dapet pair_addr dari mana? 

😎 liat file pair_addr.txt nanti lu cari token yang mau lu add liquid nanti ada variabel ```pair_addr``` lu copy 



## 🔗 follow aing 

[![twitter](https://img.shields.io/badge/twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/kenjisubagja)

