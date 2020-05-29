# vuttr
[Small App - Code Challenge](https://vuttr-b86f1.web.app/user)

### Short description
This is a small app specified as a code challenge for [BossaBox](https://bossabox.com) contracting process.
It allows the user to create and update a list of tools, and persists this list in a NoSQL (MongoDB) database.

### Technical stack
The app uses the MERN stack:
- frontend: React.js
- backend: Node.js, Espress, and MongoDB (through mongoose)

The database is hosted on a cloud cluster in the [Atlas Cloud Database](https://www.mongodb.com/cloud/atlas).

### How to install the app
The App is deployed on firebase (frontend) and Heroku (backend), and hence you don't need to install it at all. Just type https://vuttr-b86f1.web.app/user on your browser and you're ready to go.

Nevertheless, if you want to download the code, run it on your machine, or use it as a starting point for another app, just:

1. Clone the full https://github.com/jaimetcf/vuttr.git repo
2. After cloning, go to the 'backend' folder and type:
```
   npm install
```
This will install all the dependencies needed for running the backend.

3. Then, in the 'frontend' folder, type:
```
   npm install
```
This will install all the dependencies needed for running the frontend.


### How to run the app
4. In the 'backend' folder, type:
```
   npm start
```
The server will connect to the database in the remote Atlas Cluster, what may take some seconds.
When you see the message: 
```
Listening on port 4000!
```
that means the webserver is ready to receive and process the http API calls 
comming from the frontend.


5. In the 'frontend' folder, type:
```
   npm start
```
This will be enough to start the react.js development server, and open a new tab in your 
web browser where the app user interface will appear. 
This may take some time also.

6. And, that's all. Have fun!

7. You can reach me thru: jaimetcf@gmail.com




