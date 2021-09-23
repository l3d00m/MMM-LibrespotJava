# MMM-LibrespotJava

A module for the [MagicMirror](https://github.com/MichMich/MagicMirror) project displaying the song currently playing on Spotify via the [librespot-java](https://github.com/librespot-org/librespot-java) API.

## Screenshots

<img src=".github/example1.png" alt="drawing" width="350px"/>
<img src=".github/example2.png" alt="drawing" width="350px"/>

## This fork

I've modified [MMM-NowPlayingOnSpotify](https://github.com/raywo/MMM-NowPlayingOnSpotify) so I could integrate it with the [librespot-java](https://github.com/librespot-org/librespot-java) API.

I've also modified a few other things to my liking. I removed some options (cover art not configurable) to reduce maintainance burden for me.

## Install the module

In your MagicMirror directory:

```bash
cd MagicMirror/modules
git clone https://github.com/l3d00m/MMM-LibrespotJava.git
cd MMM-LibrespotJava
npm install
```

## Configuring

Here is an example for an entry in `config.js`

```javascript
{
    module: "MMM-LibrespotJava",
    position: "top_right",

    config: {
        librespotApiHost: "localhost", // librespot java API host address (ip)
        librespotApiPort: "24879", // librespot java API port, default is 24789
        updatesEvery: 1          // How often should the song be fetched from librespot API in s?
    }
}
```

### Librespot java configuration

Make sure your librespot java is build with API support and the `config.toml` contains the following:

```toml
### API ###
[api]
        # API port (`api` module only)
        port = 24879
        # API listen interface (`api` module only)
        host = "0.0.0.0"
```

## Troubleshooting

If it doesn't display anything after start, simply skip at least one song (or pause/play) and it'll probably work. Also note that there's no display at all when no song is playing.

## Special Thanks

- To the original [MMM-NowPlayingOnSpotify](https://github.com/raywo/MMM-NowPlayingOnSpotify) <3
- [Michael Teeuw](https://github.com/MichMich) for inspiring me and many others to build a MagicMirror module.
- The community of magicmirror.builders for help in the development process and all contributors for finding and fixing errors in this module.
