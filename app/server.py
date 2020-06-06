import asyncio
import websockets
import json
import os
try:
    from .app import checkjson
except:
    from app import checkjson

path1 = os.path.dirname(os.path.abspath(__file__))

async def server(websocket, path):
    data = await websocket.recv() 
    data = json.loads(data)
    ret_data = {
        'name': data['item']['name'], 
        'playing': data['is_playing'],
        'song_uri': data['item']['uri'],
        'artist': data['item']['album']['artists'][0]['name'],
        'cover': data['item']['album']['images'][0]['url'],
        'time': data['progress_ms'],
        'party': data['party_id']
    }
    print(json.dumps(ret_data, indent=2))
    checkjson('parties')
    with open (os.path.join(path1, 'json', 'parties.json'), 'r') as e:
        parties = json.load(e)
    if data['party_id'] in parties:
        if data['party_key'] == parties[data['party_id']]['key']:
            await websocket.send(json.dumps(ret_data))

    

    #
    #print(f"> {playing}")

start_server = websockets.serve(server, "localhost", 8765)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()