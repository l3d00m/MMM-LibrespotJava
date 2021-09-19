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
                this.connectWs(payload)
                break;
            case 'FETCH_SONG':
                this.fetchSong(payload)
                break;
        }
    },

    connectWs: function (websocketUrl) {
        console.log("Connecting to websocket: " + websocketUrl)
        var that = this;
        const ws = new WebSocket(websocketUrl);
        ws.onopen = function () {
            console.log("connected to librespot api WS")
            setInterval(() => ws.send(JSON.stringify({ event: "ping" })), 10000);
        };

        ws.onmessage = function (msg) {
            const wsEvent = JSON.parse(msg.data);
            const eventName = wsEvent["event"];
            //console.log(eventName);
            switch (eventName) {
                case "playbackPaused":
                    that.sendSocketNotification("UPDATE_STATE", "paused");
                    break;
                case "trackChanged":
                case "playbackResumed":
                    that.sendSocketNotification("UPDATE_STATE", "playing");
                    break;
                case "playbackStopped":
                case "panic":
                case "sessionCleared":
                case "inactiveSession":
                case "connectionDropped":
                    that.sendSocketNotification("UPDATE_STATE", "stopped");
                    break;
                case "trackSeeked":
                case "metadataAvailable":
                case "sessionChanged":
                    that.sendSocketNotification("FETCH_NEW_SONG_DATA");
                    break;
                case "contextChanged":
                default:
                    return;
            }

        };

        ws.onclose = function (e) {
            console.error("Socket is closed. Reconnect will be attempted.", e.reason);
            setTimeout(function () {
                that.connectWs(websocketUrl);
            }, 100);
        };

        ws.onerror = function (err) {
            console.error(
                "Socket encountered error: ",
                err.message,
                "Closing socket and reopening shortly"
            );
            ws.close();
            setTimeout(function () {
                that.connectWs(websocketUrl);
            }, 100);
        };
    },
    fetchSong: function (apiUrl) {
        var that = this; // ugly
        request.post(
            apiUrl,
            function (error, _response, body) {
                if (error) return console.error("error with librespot java api");
                let data = JSON.parse(body)
                if (data["msg"] != null) {
                    console.info(data["msg"])
                } else {
                    that.sendSocketNotification("RETRIEVED_SONG_DATA", data);
                }

            }
        );
    },
});
