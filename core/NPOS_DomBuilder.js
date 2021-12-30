
class NPOS_DomBuilder {

  constructor(config, pathPrefix) {
    this.config = config;
    this.pathPrefix = pathPrefix + '/';
  }

  getDom(context) {
    console.log(context)
    if (!context || context.noSong) {
      // don't show anything
      return document.createElement('div');
    } else {
      return this.getWrapper(this.getPlayingContent(context));
    }
  }

  getWrapper(content) {
    let wrapper = document.createElement('div');
    wrapper.className = 'small';
    wrapper.appendChild(content);

    return wrapper;
  }

  /**
   * Returns a div configured for the given context.
   *
   * context = {
   *   imgURL: *an url*,
   *   songTitle: *string*,
   *   artist: *string*,
   *   album: *string*,
   *   isPlaying,
   *   progress,
   *   titleLength
   * }
   *
   * @param context
   * @returns {HTMLDivElement}
   */
  getPlayingContent(context) {
    let content = document.createElement('div');

    content.appendChild(this.getCoverArtDiv(context.imgURL));

    content.appendChild(this.getInfoDiv('fa fa-music', context.songTitle));
    content.appendChild(this.getInfoDiv('fa fa-user', context.artist));
    content.appendChild(this.getInfoDiv('fa fa-record-vinyl', context.album));
    let additionalInfo = this.getTimeInfo(context)
    if (context.deviceName) additionalInfo += " (" + context.deviceName + ")"
    content.appendChild(this.getInfoDiv(context.isPlaying ? 'fa fa-play' : 'fa fa-pause', additionalInfo));
    content.appendChild(this.getProgressBar(context));

    return content;
  }

  getProgressBar(context) {
    let progressBar = document.createElement('progress');
    progressBar.className = 'NPOS_progress';
    progressBar.value = context.progress;
    progressBar.max = context.titleLength;

    return progressBar;
  }

  getTimeInfo(context) {
    let currentPos = moment.duration(context.progress);
    let length = moment.duration(context.titleLength);

    return `${currentPos.format("m:ss", { trim: false })} / ${length.format("m:ss", { trim: false })}`;
  }

  getInfoDiv(symbol, text) {
    let infoDiv = document.createElement('div');
    infoDiv.className = 'NPOS_infoText';

    if (symbol) {
      let icon = document.createElement('i');
      icon.className = 'NPOS_icon ' + symbol;
      infoDiv.appendChild(icon);
    }

    infoDiv.appendChild(document.createTextNode(text));

    return infoDiv;
  }

  getCoverArtDiv(coverURL) {
    let cover = document.createElement('img');
    cover.src = coverURL;
    cover.className = 'NPOS_albumCover';
    return cover;
  }

}
