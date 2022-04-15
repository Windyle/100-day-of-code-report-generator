# 100 Days of Code Tracker

Steps to make the application work:

1. Clone the repository
2. Run `npm install` in the root directory
3. Create `.env` file in the root directory with the following structure:

```
OWNER=<your github username>
REPO=<github repository used for the challenge>
TOPIC=<custom title for your challenge>
```

4. Run `npx tsc --build`
5. Create a .bat or .sh file that execute one of the following commands:
   - `node ./dist/Daily.js`
   - `node ./dist/Weekly.js`
   - `node ./dist/Monthly.js`
6. Schedule the executables using Windows Task Scheduer or Crontab

The reports will be generated in Markdown format and will be saved in the `report` directory.
