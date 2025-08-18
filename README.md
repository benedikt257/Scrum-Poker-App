# ScrumPokerApp

Prerequisites: 
* Install NodeJS (22.18.0 LTS): https://nodejs.org/en/download

After installing, install dependencies:
```
npm install
```

To run the application:

```
ng serve
```

To run the mockserver implementation:

```
cd mockserver
node mockserver.js
```

After changing the openapi.yaml, the client must be regenerated:

```
npm run generate:api
```