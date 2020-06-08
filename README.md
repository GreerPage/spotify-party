# Spotify Party

an app to sync spotify playbakc between users

## About
This project uses the [Spotify Web Api](https://developer.spotify.com/documentation/web-api/) to get and set user playback. It is using [socket io](https://github.com/socketio/socket.io) to sync user playback. Essentially, the host send requests to the Spotify api and when It detects a change, it send the updated infomration to the sokcet io server which disributes necessary information to the clients. 

## Web Stack
### Frontend
- The frontend is written in primarily [reactjs](https://reactjs.org/)
- React renders the necessary information for all of the pages
- The requests to the Spotify Api are done in the front end to prevent my server from getting heavily rate limited
- As a result all data bettween the Socket Io server and the clients is done in javascript.
- All react files can be found in `app/js/`, whe they are compiled (see the build notes) they go to app/static/js/build
### Socket Io Server
- The socket io server is done in the python library [flask socketio](https://github.com/miguelgrinberg/Flask-SocketIO)
- The server handles all of the syncing between the host of the "party" and all of the members
- Essentially, when the host sends new information with the update method the server sends the new playback to all members of the corresponding party
- This code can be found in `app/app.py` in this file the webserver can also be found as the flask socket io is jsut a wrapper around flask
### Webserver
- The webserver is written in [flask](https://palletsprojects.com/p/flask/)
- The webserver handles all of the routing 
- and the rendering of HTML files and such
- The code for the webserver can be found in `app/app.py`
### JSON
- The "database" I am using is jsut simply JSON. This stores some spotify user info and the current running parties
- THis is stored in the `app/json` directory which is created when you run the app

## Building/Running
- cd into the root directory and run `pip install -r requirements.txt` to install python dependencies
- then cd into `app` and rum `npm install` in order to install the javascript library for compiling react.
- then cd into `app/js` and run `npx babel --watch . --out-dir ../static/js/build --presets react-app/prod`
- this will transpile the react files and store the new files in `app/static/js/build/`
- That command will run foreve so you can either stop it after everything in transpiled or keep it open in order for then to be transpiled as you edit them. 
- Finally, cd to `app` and run `python app.py` to start the web server on `<your local ip>:5000`
