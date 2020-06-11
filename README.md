# Spotify Party ![logo](https://raw.githubusercontent.com/GreerPage/spotify-party/master/app/static/images/favicon.png) ![license](https://img.shields.io/github/license/GreerPage/spotify-party) ![contributors](https://img.shields.io/github/contributors/greerpage/spotify-party)

An app to sync Spotify playback between users.

[https://spotify.greerpage.com](https://spotify.greerpage.com) - if people use it I will get a real domain name

## About
This project uses the [Spotify Web API](https://developer.spotify.com/documentation/web-api/) to get and set user playback. It is using [Socket.IO](https://github.com/socketio/socket.io) to sync user playback. Essentially, the host sends requests to the Spotify API and when it detects a change, it sends the updated information to the Socket.IO server which disributes necessary information to the clients. 

## Web Stack
- ### Frontend
    - The frontend is primarily written in [React](https://reactjs.org/)
    - React renders the necessary information for all of the pages
    - The requests to the Spotify API are done in the frontend to prevent my server from getting heavily rate limited
    - As a result, all data bettween the Socket.IO server and the [clients](clients) is done in JavaScript
    - All React files can be found in `app/js/`, when they are compiled (see the build notes) they go to `app/static/js/build/`
- ### Socket.IO Server
    - The Socket.IO server is done in the Python library [flask_socketio](https://github.com/miguelgrinberg/Flask-SocketIO)
    - The server handles all of the syncing between the host of the "party" and all of the members
    - Essentially, when the host sends new information with the update method the server sends the new playback to all members of the corresponding party
    - This code can be found in `app/app.py`
- ### Web Server
    - The web server is written in Python with [Flask](https://palletsprojects.com/p/flask/)
    - The web server handles all of the routing and the rendering of HTML files and such
    - The code for the web server can be found in `app/app.py` along with the Socket.IO server
- ### JSON
    - The "database" I am using is just simply JSON. This stores some Spotify user info and the current running parties
    - This is stored in the `app/json/` directory which is created when you run the app

## Building and Running
- Prerequisites
    - Python >=3.7 (and pip)
    - npm

- Clone the repo and cd into it
```bash
$ git clone https://github.com/GreerPage/spotify-party.git
$ cd spotify-party
```
- Install the dependencies
```bash
$ pip install -r requirements.txt
$ cd app
$ npm install
```
- Transpile the JSX to `app/static/js/build/` (you can keep this running in the background)
```bash
$ cd js
$ npx babel --watch . --out-dir ../static/js/build --presets react-app/prod
```
- Make `app/secrets.py`
```python
# spotify client and secret id (https://developer.spotify.com/dashboard)
client_id = 'your_client_id'
secret = 'your_client_secret'
```
- Run Flask
```bash
$ cd ..
$ python app.py
```
