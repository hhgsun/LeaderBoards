## LEADERBOARDS - SERVER
### NODEJS, MONGODB, REDIS


# .ENV FILE
```
# mongo
# MONGO ATLAS URL "mongodb+srv://hhgsun:hhgsun@cluster0.yllgz.mongodb.net/scores_db?retryWrites=true&w=majority"
MONGODB_URL="mongodb+srv://hhgsun:hhgsun@cluster0.yllgz.mongodb.net/scores_db?retryWrites=true&w=majority"

# redis
REDIS_HOST="localhost"
REDIS_PORT=6379

# loops

# hergün olması için: "0 0 * * *" // https://crontab.guru/every-day
# test için her 1 dk da tekrarlama: "*/1 * * * *"
GAME_CYCLE_TIME="*/1 * * * *"

# puanların toplanıp dağıtılması için toplan döngü sayısı
GAME_FINISH_ROUND=7
```

## DUMMY TEMPLATE
https://www.json-generator.com/
```js
[
  '{{repeat(10,15000)}}',
  {
    country: '{{random("Turkey", "England", "USA", "Brasil", "China", "Germany")}}',
    username: '{{firstName().toLowerCase()}}_{{surname().toLowerCase()}}',
    money: '{{integer(0, 1000)}}'
  }
]
```

## TODO
- günlük skor tabloları zaman damgası ile tutulmalı.
- ilk başlangıçta lider tablosu sıralaması olmamalı ki para dağıtımı adil olsun yoksa veritabanının sıralamasına göre ilk oyuncuya ödül gidiyor.
- client ile socket alışverişi iyileştirilmeli.