from flask import Flask, render_template, request, abort, make_response, redirect
from flask_socketio import SocketIO, emit, join_room, leave_room, send
from werkzeug.exceptions import HTTPException
import os
import json
import requests
import random
try:
    from .secrets import client_id, secret
except:
    from secrets import client_id, secret

app = Flask(__name__, static_folder="static")
path = os.path.dirname(os.path.abspath(__file__))
socketio = SocketIO(app)
scopes  = 'user-read-playback-state user-modify-playback-state user-read-currently-playing app-remote-control user-read-playback-position user-read-private user-read-email'
user_json = os.path.join(path, 'json', 'userdata.json')
party_json = os.path.join(path, 'json', 'parties.json')

debug = True

if __name__ =='__main__':
    debug = False

def checkjson(name):
    name  = '{}.json'.format(name)
    if 'json' not in os.listdir(path):
        os.mkdir(os.path.join(path, 'json'))
    if name not in os.listdir(os.path.join(path, 'json')):
        with open(os.path.join(path, 'json', name), 'w') as e:
            json.dump({}, e)

def readjson(file):
    with open(file, 'r') as e:
        return json.load(e)

def writejson(file, data):
    with open(file, 'w') as e:
        json.dump(data, e)

def randomchars(n):
    return ''.join([random.choice('abcedfghijklmnopqrstuywxzABCDEFGHIJKLMNOPQRSTUVWXZ1234567') for i in range(n)])

@app.route('/')
def home():
    redirect = 'http://' + request.host+ '/logged-in'
    link = 'https://accounts.spotify.com/authorize?response_type=code&client_id={}&scope={}&redirect_uri={}'.format(client_id, scopes, redirect)  
    resp = make_response(render_template('home.html', host=request.host))
    resp.set_cookie('link', link)
    return resp

@app.route('/login')
def login():
    redirect = 'http://' + request.host+ '/logged-in'
    link = 'https://accounts.spotify.com/authorize?response_type=code&client_id={}&scope={}&redirect_uri={}'.format(client_id, scopes, redirect)  
    resp = make_response(render_template('login.html', host=request.host))
    resp.set_cookie('link', link)
    return resp

@app.route('/logged-in')
def logged_in():
    code = request.args.get('code')
    if not code:
        abort(404)    
    redirect_url = 'http://' + request.host+ '/logged-in'
    response = requests.post('https://accounts.spotify.com/api/token', data = {
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': redirect_url,
        'client_id': client_id,
        'client_secret': secret
    }).json()
    print(code)
    if 'access_token' in response:
        token, refresh = response['access_token'], response['refresh_token']
        user_info = requests.get('https://api.spotify.com/v1/me', headers = {'Authorization': 'Bearer {}'.format(token)}).json()
        user, link = user_info['display_name'], user_info['external_urls']['spotify']
        if user_info['product'] == 'premium':
            premium = True
        else:
            premium = False
        user_id = randomchars(40)
        checkjson('userdata')
        data = readjson(user_json)
        if user not in data:    
            data[user] = {'token': token, 'refresh': refresh, 'id': user_id, 'link': link, 'premium': premium}
        else:
            user_id = data[user]['id']
        writejson(user_json, data)
        resp = make_response('<script src="/static/js/globals.js"></script><script src="/static/js/loggedin.js"></script>')
        resp.set_cookie('user_id', user_id)
        resp.set_cookie('username', user)
        resp.set_cookie('token', token)
        return resp
    return redirect('/')
        
@app.route('/logout')
def logout():
    return '<script src="/static/js/globals.js"></script><script src="/static/js/logout.js"></script>'

@app.route('/create')
def create():
    owner = request.cookies.get('username')
    if not owner: 
        return redirect('/login?redirect=create')
    party_id, party_key = randomchars(10), randomchars(40)
    checkjson('parties')
    checkjson('userdata')
    users, data = readjson(user_json), readjson(party_json)
    for party in data:
        if data[party]['owner'] == owner:
            return redirect('/party/{}'.format(party))
    data[party_id] = {
        'owner': owner, 'owner_id': request.cookies.get('user_id'), 
        'key': party_key, 
        "members": {owner: {'link': users[owner]['link'], 'owner': True}}
    }
    writejson(party_json, data)
    resp = make_response(redirect('/party/{}'.format(party_id)))
    resp.set_cookie('party_key', party_key)
    resp.set_cookie('party_id', party_id)
    return resp

@app.route('/party/<name>')
def party(name):
    checkjson('parties')
    parties = readjson(party_json)
    if not name in parties:
        abort(404)
    username = request.cookies.get('username')
    party_key = request.cookies.get('party_key')
    if not username:
        return redirect('/login?redirect=/party/{}'.format(name))
    if username==parties[name]['owner'] and party_key==parties[name]['key']:
        return render_template('party_owner.html', host=request.host)
    resp = make_response(render_template('party_member.html', host=request.host, party_host=parties[name]['owner']))
    if not readjson(user_json)[username]['premium']:
        resp = make_response(render_template('not_premium.html', host=request.host))
    return resp

@app.route('/end/<name>')
def end(name):
    checkjson('parties')
    parties = readjson(party_json)
    if not name in parties:
        abort(404)
    owner = request.cookies.get('username')
    party_key = request.cookies.get('party_key')
    if parties[name]['owner'] != owner or parties[name]['key'] != party_key:
        abort(404)
    del parties[name]
    writejson(party_json, parties)
    resp = make_response(redirect('/'))
    resp.delete_cookie('party_key')
    resp.delete_cookie('party_id')
    return resp

@app.route('/refresh/<name>/<uid>')
def refresh(name, uid):
    checkjson('userdata')
    data = readjson(user_json)
    if name not in data:
        abort(404)
    if data[name]['id'] != uid:
        abort(404)
    refresh = data[name]['refresh']
    response = requests.post('https://accounts.spotify.com/api/token', data = {
        'grant_type': 'refresh_token',
        'refresh_token': refresh,
        'client_id': client_id,
        'client_secret': secret
    }).json()
    return response['access_token']

if debug:
    @app.errorhandler(Exception)
    def error(e):
        code = 500
        name = "Internal Server Error"
        if isinstance(e, HTTPException):
            code = e.code
            name = " " + e.name
        return render_template("error.html", host=request.host, errno=str(code), name=name)

@socketio.on('join')
def join(data):
    username = data['username']
    party = data['party_id']
    user_data, parties = readjson(user_json), readjson(party_json) 
    owner = False
    if party in parties:
        members = parties[party]['members']
        if username not in members:
            members[username] = {'link': user_data[username]['link'], 'owner': owner}
        else: 
            owner = members[username]['owner']
        parties[party]['members'] = members
        writejson(party_json, parties)
        print(username + ' joined ' + party)
        join_room(party)
        emit('join', {'username': username, 'members': members, 'owner': owner}, room=party)

@socketio.on('leave')
def leave_socket(data):
    username = data['username']
    party = data['party_id']
    if party:
        parties = readjson(party_json)
        if party in parties:
            members = parties[party]['members']
            del members[username]
            parties[party]['members'] = members
            writejson(party_json, parties)
            print(username + ' left ' + party)
            leave_room(party)
            emit('leave',  {'username': username, 'action': 'left', 'members': members, 'owner': parties[party]['owner']}, room=party)

@socketio.on('end')
def end_party(data):
    parties = readjson(party_json)
    party_id = data['party_id']
    key = data['key']
    party = parties[party_id]
    if party['key'] == key:
        emit('end', '{} has ended this party'.format(party['owner']), room=party_id)

@socketio.on('update')
def update(data):
    artists = [{'name': a['name'], 'link': a['external_urls']['spotify']} for a in data['item']['artists']]
    ret_data = {
        'song': {'name': data['item']['name'], 'link': data['item']['album']['external_urls']['spotify'] + '?highlight=' + data['item']['uri'],}, 
        'playing': data['is_playing'],
        'song_uri': data['item']['uri'],
        'artists': artists,
        'cover': {'img': data['item']['album']['images'][1]['url'], 'link': data['item']['album']['external_urls']['spotify']},
        'time': data['progress_ms'],
    }
    print(json.dumps(ret_data, indent=2))
    emit('update', ret_data, room=data['party_id'])


if __name__ == '__main__':
    socketio.run(app, debug=True)
