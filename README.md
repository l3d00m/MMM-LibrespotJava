# MMM-NowPlayingOnLibrespot

A module for the [MagicMirror](https://github.com/MichMich/MagicMirror) project displaying the song currently playing on Spotify.

## This fork

I've modified the original MMM-NowPlayingOnSpotify so I could integrate it with Librespot Java API. It now has two extra options `librespotApiHost` and `librespotApiPort`. It will fetch all metadata from that librespot Java instance.

I've also modified a few minor things to my liking.

## Preconditions

- MagicMirror<sup>2</sup> instance
- Node.js version >= 7
- npm

Make sure your librespot java is build with API support and the `config.toml` contains the following:

```toml
### API ###
[api]
        # API port (`api` module only)
        port = 24879
        # API listen interface (`api` module only)
        host = "0.0.0.0"
```

## Install the module

In your MagicMirror directory:

```bash
cd modules
git clone https://github.com/l3d00m/MMM-NowPlayingOnLibrespot.git
cd MMM-NowPlayingOnLibrespot
npm install
```

## Configuring

Here is an example for an entry in `config.js`

```javascript
{
    module: "MMM-NowPlayingOnLibrespot",
    position: "top_right",

    config: {
        librespotApiHost: "localhost", // librespot java API host address (ip)
        librespotApiPort: "24789", // librespot java API port, default is 24789
        updatesEvery: 1,          // How often should the song be fetched from librespot API in s?
        showCoverArt: false       // Do you want the cover art to be displayed?
    }
}
```

## Troubleshooting

If it doesn't display directly after start, simply skip at least one song and it'll probably.

## Special Thanks

- To the original MMM-NowPlayingOnSpotify <3
- [Michael Teeuw](https://github.com/MichMich) for inspiring me and many others to build a MagicMirror module.
- The community of magicmirror.builders for help in the development process and all contributors for finding and fixing errors in this module.
