from flask import Flask, render_template, request, abort, make_response, redirect
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
scopes  = 'user-read-playback-state user-modify-playback-state user-read-currently-playing app-remote-control user-read-playback-position'
@app.route('/')
def home():
    return render_template('home.html', host=request.host)

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
    checkjson('userdata')
    redirect = 'http://' + request.host+ '/logged-in'
    file = os.path.join(path, 'json', 'userdata.json')
    response = requests.post('https://accounts.spotify.com/api/token', data = {
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': redirect,
        'client_id': client_id,
        'client_secret': secret
    }).json()
    if 'access_token' in response:
        token = response['access_token']
        refresh = response['refresh_token']
        user = requests.get('https://api.spotify.com/v1/me', headers = {'Authorization': 'Bearer {}'.format(token)}).json()['display_name']
        user_id = ''.join([random.choice('abcedfghijklmnopqrstuywxzABCDEFGHIJKLMNOPQRSTUVWXZ1234567!@*') for i in range(40)])
        with open(file, 'r') as e:
            data = json.load(e)
        if user in data:
            del data[user]
        data[user] = {'token': token, 'refresh': refresh, 'id': user_id}
        with open(file, 'w') as e:
            json.dump(data, e)
        resp = make_response('<script src="/static/js/globals.js"></script><script src="/static/js/loggedin.js"></script>')
        resp.set_cookie('user_id', user_id)
        resp.set_cookie('username', user)
        resp.set_cookie('token', token)
        resp.set_cookie('refresh', refresh)
        return resp
@app.route('/logout')
def logout():
    return '<script src="/static/js/globals.js"></script><script src="/static/js/logout.js"></script>'

@app.route('/create')
def create():
    owner = request.cookies.get('username')
    if not owner: 
        return redirect('/login?redirect=create')
    if request.cookies.get('party_id') != None:
        return redirect('/party/{}'.format(request.cookies.get('party_id')))
    party_id = ''.join([random.choice('abcedfghijklmnopqrstuywxzABCDEFGHIJKLMNOPQRSTUVWXZ1234567') for i in range(10)])
    party_key = ''.join([random.choice('abcedfghijklmnopqrstuywxzABCDEFGHIJKLMNOPQRSTUVWXZ1234567!') for i in range(40)])
    checkjson('parties')
    file = os.path.join(path, 'json', 'parties.json')
    with open(file, 'r') as e:
        data = json.load(e)
    data[party_id] = {'owner': owner, 'owner_id': request.cookies.get('user_id'), 'key': party_key}
    with open(file, 'w') as e:
        json.dump(data, e)
    resp = make_response(redirect('/party/{}'.format(party_id)))
    resp.set_cookie('party_key', party_key)
    resp.set_cookie('party_id', party_id)
    return resp

@app.route('/party/<name>')
def party(name):
    checkjson('parties')
    file = os.path.join(path, 'json', 'parties.json')
    with open(file, 'r') as e:
        parties = json.load(e)
    if not name in parties:
        abort(404)
    username = request.cookies.get('username')
    party_key = request.cookies.get('party_key')
    if not username:
        return redirect('/login?redirect=/party/{}'.format(name))
    if username==parties[name]['owner'] and party_key==parties[name]['key']:
        return render_template('party_owner.html', host=request.host)
    resp = make_response(render_template('party_member.html', host=request.host, party_host=parties[name]['owner']))
    #resp.set_cookie('party_id', name)
    return resp

@app.route('/end/<name>')
def end(name):
    checkjson('parties')
    file = os.path.join(path, 'json', 'parties.json')
    with open(file, 'r') as e:
        parties = json.load(e)
    if not name in parties:
        abort(404)
    owner = request.cookies.get('username')
    party_key = request.cookies.get('party_key')
    if parties[name]['owner'] != owner or parties[name]['key'] != party_key:
        abort(404)
    del parties[name]
    file = os.path.join(path, 'json', 'parties.json')
    with open(file, 'w') as e:
        json.dump(parties, e)
    resp = make_response(redirect('/'))
    resp.delete_cookie('party_key')
    resp.delete_cookie('party_id')
    return resp

@app.route('/leave/<name>')
def leave(name):
    checkjson('parties')
    file = os.path.join(path, 'json', 'parties.json')
    with open(file, 'r') as e:
        parties = json.load(e)
    if not name in parties:
        abort(404)
    file = os.path.join(path, 'json', 'parties.json')
    #resp = make_response(redirect('/'))
    resp = make_response('e')
    resp.delete_cookie('party_id')
    return resp

@app.route('/refresh/<refresh>')
def refresh(refresh):
    response = requests.post('https://accounts.spotify.com/api/token', data = {
        'grant_type': 'refresh_token',
        'refresh_token': refresh,
        'client_id': client_id,
        'client_secret': secret
    }).json()
    return response['access_token']


def checkjson(name):
    name  = '{}.json'.format(name)
    if 'json' not in os.listdir(path):
        os.mkdir(os.path.join(path, 'json'))
    if name not in os.listdir(os.path.join(path, 'json')):
        with open(os.path.join(path, 'json', name), 'w') as e:
            json.dump({}, e)

if __name__=='__main__':
    app.run(debug=True)