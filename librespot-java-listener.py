#!/usr/bin/env python3
import asyncio
import json

import paho.mqtt.client as mqtt
import websockets
import requests

mqtt_topic = "music/state"


def on_connect(client, userdata, flags, rc):
    if rc > 0:
        raise ConnectionError('Bad result code from mqtt server {}'.format(rc))
    print("Connected with result code {}".format(rc))


client = mqtt.Client()
client.on_connect = on_connect
client.connect("192.168.0.40",
               1883,
               10)

last_uri = ''


async def consumer(event):
    if "event" in event:
        event_name = event["event"]
        print(event_name)
        global last_uri
        if event_name == 'trackChanged':
            last_uri = event['uri']
        if event_name == "playbackResumed":
            print(last_uri)
            r = requests.post(f"http://192.168.0.150:24879/metadata/{last_uri}")
            print(r.text)
            client.publish(mqtt_topic, last_uri, retain=True)
        if event_name in ['playbackEnded', "playbackPaused"]:
            client.publish(mqtt_topic, "STOP", retain=True)


async def hello():
    while True:
        async with websockets.connect('ws://192.168.0.150:24879/events') as websocket:
            while True:
                try:
                    message = await websocket.recv()
                except websockets.ConnectionClosed:
                    break  # just reconnect
                event = json.loads(message)
                await consumer(event)

loop = asyncio.get_event_loop()
while True:
    asyncio.run(hello())
