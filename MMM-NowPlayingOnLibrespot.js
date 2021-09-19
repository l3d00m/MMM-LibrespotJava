'use strict';

let state = "stopped";

Module.register('MMM-NowPlayingOnLibrespot', {

  // default values
  defaults: {
    // Module misc
    name: 'MMM-NowPlayingOnLibrespot',
    hidden: false,

    // user definable
    librespotApiHost: "192.168.0.150", // librespot java API host address (ip)
    librespotApiPort: "24789", // librespot java API port, default is 24789
    updatesEvery: 1,          // How often should the table be updated in s?
    showCoverArt: false       // Do you want the cover art to be displayed?
  },


  start: function () {
    Log.info('Starting module: ' + this.name);

    this.initialized = false;
    this.context = {};
    this.sendSocketNotification('CONNECT_TO_WEBSOCKET', `ws://${this.config.librespotApiHost}:${this.config.librespotApiPort}/events`);
    this.startFetchingLoop();
  },

  getDom: function () {
    let domBuilder = new NPOS_DomBuilder(this.config, this.file(''));

    if (this.initialized) {
      return domBuilder.getDom(this.context);
    } else {
      return domBuilder.getInitDom(this.translate('LOADING'));
    }
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
    switch (notification) {
      case 'RETRIEVED_SONG_DATA':
        this.updateSongDom(payload)
        break;
      case 'UPDATE_STATE':
        state = payload;
        if (state != "stopped" ) break;
      case "FETCH_NEW_SONG_DATA":
        if (state == "stopped") return this.updateSongDom(null);
        this.sendSocketNotification("FETCH_SONG", `http://${this.config.librespotApiHost}:${this.config.librespotApiPort}/player/current`);
        break;
    }
  },

  startFetchingLoop() {
    // ... and then repeat in the given interval
    setInterval(() => {
      if (state != "stopped" ) this.sendSocketNotification("FETCH_SONG", `http://${this.config.librespotApiHost}:${this.config.librespotApiPort}/player/current`);
    }, this.config.updatesEvery * 1000);
  },
  

  updateSongDom: function (songInfo) {
    this.initialized = true;
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
        progress: (songInfo.trackTime < 0 ? 0 : songInfo.trackTime)
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

    return filtered[0].fileId; //todo
  },
});
