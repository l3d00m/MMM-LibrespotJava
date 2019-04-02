#!/usr/bin/env python3
# This is the python script running on the device with librespot / snapcast installed. It's configured as the --onevent call in librespot
import os
import paho.mqtt.client as mqtt

mqtt_topic = "music/state"

def on_connect(client, userdata, flags, rc):
    if rc > 0:
        raise ConnectionError('Wrong result code from mqtt server {}'.format(rc))
    print("Connected with result code {}".format(rc))
client = mqtt.Client()
client.on_connect = on_connect
client.connect("192.168.0.40",
               1883,
               10)


if os.environ['PLAYER_EVENT'] == "start":
    client.publish(mqtt_topic, os.environ['TRACK_ID'])
elif os.environ['PLAYER_EVENT'] == "change":
    client.publish(mqtt_topic, os.environ['TRACK_ID'])
elif os.environ['PLAYER_EVENT'] == "stop":
    client.publish(mqtt_topic, "STOP")

