## Run scripts

Start mongo:

```
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

Build the .env file:

```
./bin/setup_local.sh
```

Then run server:

```
npm run dev
```
