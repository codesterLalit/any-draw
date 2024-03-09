# any-draw

## Pre-requisite
1. Docker
2. Docker compose
3. Redis(locally not on docker.)

## running process
1. First clone:   
```bash
git clone https://github.com/codesterLalit/any-draw.git
``
2. First go to "any-draw". Which contains frontend code.  
```bash
cd any-draw
npm install
npm start
```
3. Then navigate to root folder.
``bash
cd ..
``
4. Then first start docker for kafka.
```bash
cd anydraw-backend
docker-compose up
```
5. Then install dependencies and start backend server
```
npm install && npm start
```
