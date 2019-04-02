'use strict';

const NodeHelper = require('node_helper');
const SpotifyConnector = require('./core/SpotifyConnector');
const mqtt = require('mqtt');
var client = mqtt.connect('mqtt://192.168.0.40');


module.exports = NodeHelper.create({

    start: function () {
        var that = this; // ugly
        this.connector = undefined;
        client.on('connect', function () {
            client.subscribe('music/state', function (err) {
                if (!err) {
                    //Log.info('Subscribed to MQTT topic');
                }
            })
        });
        client.on('message', function (topic, message) {
            // message is Buffer
            that.retrieveCurrentSong(message.toString());
        });
    },


    socketNotificationReceived: function (notification, payload) {
        switch (notification) {
            case 'CONNECT_TO_SPOTIFY':
                this.connector = new SpotifyConnector(payload);
                //this.retrieveCurrentSong();
                break;
        }
    },


    retrieveCurrentSong: function (track_id) {
        if (track_id.toLowerCase() === "stop") {
            this.sendRetrievedNotification({noSong: true});
        } else {
            this.connector.retrieveCurrentlyPlaying(track_id)
                .then((response) => {
                    if (response) {
                        this.sendRetrievedNotification(response);
                    } else {
                        this.sendRetrievedNotification({noSong: true});
                    }
                })
                .catch((error) => {
                    console.error('Can’t retrieve current song. Reason: ');
                    console.error(error);
                });
        }

    },


    sendRetrievedNotification: function (songInfo) {
        let payload = songInfo;

        if (!songInfo.noSong) {
            payload = {
                imgURL: this.getImgURL(songInfo.album.images),
                songTitle: songInfo.name,
                artist: this.getArtistName(songInfo.artists),
                album: songInfo.album.name
            };
        }

        this.sendSocketNotification('RETRIEVED_SONG_DATA', payload);
    },


    getArtistName: function (artists) {
        return artists.map((artist) => {
            return artist.name;
        }).join(', ');
    },


    getImgURL(images) {
        let filtered = images.filter((image) => {
            return image.width >= 240 && image.width <= 350;
        });

        return filtered[0].url;
    }
});
