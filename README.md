# Spotify Party

An app to sync Spotify playback between users

## About
This project uses the [Spotify Web API](https://developer.spotify.com/documentation/web-api/) to get and set user playback. It is using [Socket.IO](https://github.com/socketio/socket.io) to sync user playback. Essentially, the host sends requests to the Spotify API and when it detects a change, it sends the updated information to the Socket.IO server which disributes necessary information to the clients. 

## Web Stack
### Frontend
- The frontend is primarily written in [React](https://reactjs.org/)
- React renders the necessary information for all of the pages
- The requests to the Spotify API are done in the frontend to prevent my server from getting heavily rate limited
- As a result, all data bettween the Socket.IO server and the [clients](clients) is done in JavaScript
- All React files can be found in `app/js/`, whe they are compiled (see the build notes) they go to `app/static/js/build`
### Socket.IO Server
- The Socket.IO server is done in the Python library [flask_socketio](https://github.com/miguelgrinberg/Flask-SocketIO)
- The server handles all of the syncing between the host of the "party" and all of the members
- Essentially, when the host sends new information with the update method the server sends the new playback to all members of the corresponding party
- This code can be found in `app/app.py`
### Web Server
- The web server is written in [Flask](https://palletsprojects.com/p/flask/)
- The web server handles all of the routing and the rendering of HTML files and such
- The code for the web server can be found in `app/app.py` along with the Socket.IO server
### JSON
- The "database" I am using is just simply JSON. This stores some Spotify user info and the current running parties
- This is stored in the `app/json` directory which is created when you run the app

## Building and Running
- `cd` into the repository and run `pip install -r requirements.txt` to install the Python dependencies
- Then `cd` into `app/` and run `npm install` in order to install the JavaScript library for compiling React
- Then `cd` into `app/js/` and run `npx babel --watch . --out-dir ../static/js/build --presets react-app/prod`, this will transpile the React files and store the new files in `app/static/js/build/`
- That command will run forever so you can either stop it after everything is transpiled or keep it open in order for the code to be transpiled as you edit it
- Finally, `cd` to back into `app/` and run `python app.py` to start the web server on `<your local ip>:5000`
