"use strict";
const NodeHelper = require('node_helper');
const WebSocket = require('ws');
const request = require("request");


module.exports = NodeHelper.create({
    start: function () {
        this.connector = undefined;
    },

    socketNotificationReceived: function (notification, payload) {
        switch (notification) {
            case 'CONNECT_TO_WEBSOCKET':
                this.connectWs(payload.data, payload.id)
                break;
            case 'FETCH_SONG':
                this.fetchSong(payload.data, payload.id)
                break;
        }
    },

    connectWs: function (websocketUrl, identifier) {
        console.log("Connecting to websocket: " + websocketUrl)
        var that = this;
        const ws = new WebSocket(websocketUrl);
        ws.onopen = function () {
            console.log("connected to librespot api WS with identifier " + identifier);
            setInterval(() => ws.send(JSON.stringify({ event: "ping" })), 10000);
        };

        ws.onmessage = function (msg) {
            const wsEvent = JSON.parse(msg.data);
            const eventName = wsEvent["event"];
            switch (eventName) {
                case "playbackPaused":
                    that.sendSocketNotification("UPDATE_STATE", { id: identifier, data: "paused" });
                    break;
                case "trackChanged":
                case "playbackResumed":
                    that.sendSocketNotification("UPDATE_STATE", { id: identifier, data: "playing" });
                    break;
                case "playbackStopped":
                case "panic":
                case "sessionCleared":
                case "inactiveSession":
                case "connectionDropped":
                    that.sendSocketNotification("UPDATE_STATE", { id: identifier, data: "stopped" });
                    break;
                case "trackSeeked":
                case "metadataAvailable":
                case "sessionChanged":
                    that.sendSocketNotification("FETCH_NEW_SONG_DATA", { id: identifier });
                    break;
                case "contextChanged":
                default:
                    return;
            }

        };

        ws.onclose = function () {
            that.sendSocketNotification("SOCKET_CLOSED", { id: identifier });
        };

        ws.onerror = function (err) {
            console.error('Socket encountered error: ', err.message, 'Closing socket');
            ws.close();
        };
    },
    fetchSong: function (apiUrl, identifier) {
        var that = this; // ugly
        request.post(
            apiUrl,
            function (error, _response, body) {
                if (error) return console.error("error with librespot java api");
                if (!body || body == "") return //console.error("empty librespot api body?")
                let data = JSON.parse(body)
                if (data["msg"] != null) {
                    console.info(data["msg"])
                } else {
                    that.sendSocketNotification("RETRIEVED_SONG_DATA", { id: identifier, data: data });
                }

            }
        );
    },
});
