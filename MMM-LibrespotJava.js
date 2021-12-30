'use strict';

let state = "stopped";

Module.register('MMM-LibrespotJava', {

  // default values
  defaults: {
    // Module misc
    name: 'MMM-LibrespotJava',
    hidden: false,

    // user definable
    librespotApiHost: "127.0.0.1", // librespot java API host address (ip)
    librespotApiPort: "24879", // librespot java API port, default is 24789
    updatesEvery: 1,          // How often should the table be updated in s?
    deviceName: ""
  },


  start: function () {
    Log.info('Starting module: ' + this.name);

    this.context = null;
    this.sendSocketNotification('CONNECT_TO_WEBSOCKET', {
      id: this.identifier,
      data: `ws://${this.config.librespotApiHost}:${this.config.librespotApiPort}/events`
    });
    this.startFetchingLoop();
  },

  getDom: function () {
    let domBuilder = new NPOS_DomBuilder(this.config, this.file(''));
    return domBuilder.getDom(this.context);
  },

  getStyles: function () {
    return [
      this.file('css/styles.css'),
      this.file('node_modules/moment-duration-format/lib/moment-duration-format.js'),
      'font-awesome.css'
    ];
  },

  getScripts: function () {
    return [
      this.file('core/NPOS_DomBuilder.js'),
      'moment.js'
    ];
  },

  socketNotificationReceived: function (notification, payload) {
    if (this.identifier !== payload.id) return
    switch (notification) {
      case 'RETRIEVED_SONG_DATA':
        this.updateSongDom(payload.data)
        break;
      case 'UPDATE_STATE':
        state = payload.data;
        if (state != "stopped") break;
      case "FETCH_NEW_SONG_DATA":
        console.log("Updating song data because of changes")
        if (state == "stopped") return this.updateSongDom(null);
        this.fetchSong();
        break;
    }
  },

  fetchSong() {
    this.sendSocketNotification("FETCH_SONG", {
      id: this.identifier,
      data: `http://${this.config.librespotApiHost}:${this.config.librespotApiPort}/player/current`
    });
  },

  startFetchingLoop() {
    // ... and then repeat in the given interval
    setInterval(() => {
      if (state != "stopped") this.fetchSong();
    }, this.config.updatesEvery * 1000);
  },


  updateSongDom: function (songInfo) {
    if (state == "stopped") {
      this.context = { noSong: true };
    } else {
      const payload = {
        imgURL: this.getImgURL(songInfo.track.album.coverGroup.image),
        artist: songInfo.track.artist.map((artist) => artist.name).join(", "),
        album: songInfo.track.album.name,
        songTitle: songInfo.track.name,
        isPlaying: state === "playing",
        titleLength: songInfo.track.duration,
        progress: (songInfo.trackTime < 0 ? 0 : songInfo.trackTime),
        deviceName: this.config.deviceName
      };
      //console.log(payload)
      this.context = payload;
    }
    this.updateDom();
  },

  getImgURL(images) {
    let filtered = images.filter((image) => {
      return image.width >= 240 && image.width <= 350;
    });

    return `https://i.scdn.co/image/${filtered[0].fileId.toLowerCase()}` //todo
  },
});
