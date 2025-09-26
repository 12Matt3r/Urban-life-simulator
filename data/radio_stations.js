(function(global) {
  // Helper function to create a clean title from a URL
  function createTitleFromUrl(url) {
    try {
      let filename = url.substring(url.lastIndexOf('/') + 1);
      // Decode URL encoding and replace plus signs with spaces
      filename = decodeURIComponent(filename.replace(/\+/g, ' '));
      // Remove file extension
      let title = filename.substring(0, filename.lastIndexOf('.'));
      // Basic cleaning for some common artifacts
      title = title.replace(/_/g, ' ').replace(/%20/g, ' ').replace(/-/g, ' ').trim();
      // Capitalize first letter of each word
      return title.split(' ').map(word => word.charAt(0).toUpperCase() + word.substring(1)).join(' ');
    } catch (e) {
      return "Untitled"; // Fallback
    }
  }

  // Function to process a list of URLs into track objects
  function createTracks(urls) {
    return urls.map(url => ({ title: createTitleFromUrl(url), url: url }));
  }

  const STATIONS_DATA = {
    'cozy-fm': {
      id: 'cozy-fm',
      name: 'Cozy FM',
      tracks: createTracks([
        "https://file.garden/aNQEj1MKyWDQ8eyI/lofi/Nostalgic%20Currents.mp3",
        "https://file.garden/aNQEj1MKyWDQ8eyI/lofi/Wavelengths%20of%20Yesterday.mp3",
        "https://file.garden/aNQEj1MKyWDQ8eyI/lofi/Slow%20Burn%20Waves.mp3",
        "https://file.garden/aNQEj1MKyWDQ8eyI/lofi/Rhythm%20of%20the%20Reef.mp3",
        "https://file.garden/aNQEj1MKyWDQ8eyI/lofi/Lost%20Wave%20Loops.mp3",
        "https://file.garden/aNQEj1MKyWDQ8eyI/lofi/Shimmering%20Shores.mp3",
        "https://file.garden/aNQEj1MKyWDQ8eyI/lofi/Coral%20Chords.mp3",
        "https://file.garden/aNQEj1MKyWDQ8eyI/lofi/Saltwater%20Echoes.mp3",
        "https://file.garden/aNQEj1MKyWDQ8eyI/lofi/Sand%20Between%20the%20Bars.mp3",
        "https://file.garden/aNQEj1MKyWDQ8eyI/lofi/Timeless%20Analog%20Tides.mp3",
        "https://file.garden/aNQEj1MKyWDQ8eyI/lofi/Where%20the%20Ocean%20Ends.mp3",
        "https://file.garden/aNQEj1MKyWDQ8eyI/lofi/Daydreamer%E2%80%99s%20Surf.mp3",
        "https://file.garden/aNQEj1MKyWDQ8eyI/lofi/Vintage%20Currents.mp3",
        "https://file.garden/aNQEj1MKyWDQ8eyI/lofi/Old%20Film%20Filters.mp3",
        "https://file.garden/aNQEj1MKyWDQ8eyI/lofi/Oceanfront%20Oldies.mp3",
        "https://file.garden/aNQEj1MKyWDQ8eyI/lofi/Pier%20to%20Nowhere.mp3",
        "https://file.garden/aNQEj1MKyWDQ8eyI/lofi/Relaxing%20on%20Another%20Plane.mp3",
        "https://file.garden/aNQEj1MKyWDQ8eyI/lofi/Portal%20of%20Peace.mp3",
        "https://file.garden/aNQEj1MKyWDQ8eyI/lofi/The%20Quiet%20Space.mp3",
        "https://file.garden/aNQEj1MKyWDQ8eyI/lofi/infinite%20Peace.mp3"
      ])
    },
    'viva-la-disco': {
      id: 'viva-la-disco',
      name: 'Viva La Disco',
      tracks: createTracks([
        "https://file.garden/aNQEj1MKyWDQ8eyI/latin/Soltar.mp3",
        "https://file.garden/aNQEj1MKyWDQ8eyI/latin/El%20Malo%20De%20Tu%20Novela.mp3",
        "https://file.garden/aNQEj1MKyWDQ8eyI/latin/El%20Mundo%20Est%C3%A1%20Ardiendo.mp3",
        "https://file.garden/aNQEj1MKyWDQ8eyI/latin/Mismo'%20Lugares.mp3",
        "https://file.garden/aNQEj1MKyWDQ8eyI/latin/Brillo%20del%20Barrio.mp3",
        "https://file.garden/aNQEj1MKyWDQ8eyI/latin/Corona%20En%20Mi%20Cabeza.mp3",
        "https://file.garden/aNQEj1MKyWDQ8eyI/latin/Solo%20Sales.mp3",
        "https://file.garden/aNQEj1MKyWDQ8eyI/latin/Rey%20Digital.mp3",
        "https://file.garden/aNQEj1MKyWDQ8eyI/latin/Contando%20Mi%20Dinero.mp3"
      ])
    },
    'bassface-fm': {
      id: 'bassface-fm',
      name: 'Bassface FM',
      tracks: createTracks([
        "https://file.garden/aNQEj1MKyWDQ8eyI/dubstep/collard%20greens%20with%20a%20side%20of%20brain%20rott.wav",
        "https://file.garden/aNQEj1MKyWDQ8eyI/dubstep/muahahahaha%20(%20sofa%20sauce).wav",
        "https://file.garden/aNQEj1MKyWDQ8eyI/dubstep/1damn%20it.wav"
      ])
    },
    'hip-hop-on-the-block': {
      id: 'hip-hop-on-the-block',
      name: 'Hip Hop on the Block',
      tracks: createTracks([
        "https://file.garden/aNQEj1MKyWDQ8eyI/hiphop/Noemotion%20funk%202.mp3",
        "https://file.garden/aNQEj1MKyWDQ8eyI/hiphop/Noemotion%20funk.mp3",
        "https://file.garden/aNQEj1MKyWDQ8eyI/hiphop/Cock%20king%20fu.mp3"
      ])
    },
    'backforty-drip': {
        id: 'backforty-drip',
        name: 'BackFORTYdrip',
        tracks: createTracks([
            "https://file.garden/aNQEj1MKyWDQ8eyI/country/Back%20road%20confessions.mp3",
            "https://file.garden/aNQEj1MKyWDQ8eyI/country/long%20Road%20home.mp3",
            "https://file.garden/aNQEj1MKyWDQ8eyI/country/Long%20way%20home.mp3"
        ])
    },
    'mosh-pit-fm': {
        id: 'mosh-pit-fm',
        name: 'Mosh Pit FM',
        tracks: createTracks([
            "https://file.garden/aNQEj1MKyWDQ8eyI/metal/Whats%20in%20the%20Bowl%20Bitch.mp3",
            "https://file.garden/aNQEj1MKyWDQ8eyI/metal/Machine%20Man%20Future%20Dude.mp3",
            "https://file.garden/aNQEj1MKyWDQ8eyI/metal/Devildriver%20Enemy.mp3"
        ])
    },
    'notebook-fm': {
        id: 'notebook-fm',
        name: 'Notebook FM',
        tracks: createTracks([
            "https://file.garden/aNQEj1MKyWDQ8eyI/Talk%20radio/Exit%20valley%20episode.mp3",
            "https://file.garden/aNQEj1MKyWDQ8eyI/Talk%20radio/Echoes%20of%20the%20golden%20mask.mp3",
            "https://file.garden/aNQEj1MKyWDQ8eyI/Talk%20radio/The%20mystery%20method.mp3"
        ])
    }
  };

  global.RADIO_STATIONS = STATIONS_DATA;

})(window);