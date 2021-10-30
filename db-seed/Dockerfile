FROM mongo

COPY init-players.json /init-players.json
CMD mongoimport --host mongo_db --db scores_db --collection players --type json --file ./init-players.json --jsonArray
