(function(global) {
  'use strict';

  function createTitleFromUrl(url) {
    try {
      var filename = url.substring(url.lastIndexOf('/') + 1);
      filename = decodeURIComponent(filename.replace(/\+/g, ' '));
      var title = filename.substring(0, filename.lastIndexOf('.'));
      title = title.replace(/_/g, ' ').replace(/%20/g, ' ').replace(/-/g, ' ').trim();
      return title.split(' ').map(function(word) {
        return word.charAt(0).toUpperCase() + word.substring(1);
      }).join(' ');
    } catch (e) {
      return "Untitled";
    }
  }

  function createTracks(urls) {
    return urls.map(function(url) {
      return { title: createTitleFromUrl(url), url: url };
    });
  }

  const STATIONS_DATA = {
    'cozy-fm': {
      id: 'cozy-fm',
      name: 'Cozy FM',
      tracks: createTracks([
        "https://file.garden/aNQEj1MKyWDQ8eyI/lofi/Nostalgic%20Currents.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/lofi/Wavelengths%20of%20Yesterday.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/lofi/Slow%20Burn%20Waves.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/lofi/Rhythm%20of%20the%20Reef.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/lofi/Lost%20Wave%20Loops.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/lofi/Shimmering%20Shores.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/lofi/Coral%20Chords.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/lofi/Saltwater%20Echoes.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/lofi/Sand%20Between%20the%20Bars.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/lofi/Timeless%20Analog%20Tides.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/lofi/Where%20the%20Ocean%20Ends.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/lofi/Daydreamer%E2%80%99s%20Surf.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/lofi/Vintage%20Currents.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/lofi/Old%20Film%20Filters.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/lofi/Oceanfront%20Oldies.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/lofi/Pier%20to%20Nowhere.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/lofi/Relaxing%20on%20Another%20Plane.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/lofi/Portal%20of%20Peace.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/lofi/The%20Quiet%20Space.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/lofi/infinite%20Peace.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/lofi/Dreamcatcher%20Beats.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/lofi/Subliminal%20Drift.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/lofi/Fractal%20Escape.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/lofi/Golden%20Clouds.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/lofi/journey%20through%20stillness.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/lofi/Floating%20Through%20Sound.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/lofi/Echoes%20of%20the%20Unseen.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/lofi/Kaleidoscope%20Dreams.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/lofi/Sleepwalk%20Through%20the%20Stars.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/lofi/fly%20far%20far%20away.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/lofi/Beyond%20the%20Ordinary.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/lofi/non%20factor.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/lofi/i%20promise.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/lofi/forever%20isnt%20forever.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/lofi/overused.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/lofi/i%20told%20you%20so.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/lofi/last%20one%20to%20know.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/lofi/conditional%20love.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/lofi/Studying%20at%20midnight%20is%20lonely.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/lofi/better%20off%20alone.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/lofi/situationships.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/lofi/memoirs%20of%20a%20broken%20heart.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/lofi/Sunsets%20with%20you%20are%20a%20Vibe.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/lofi/stolen%20memories%20(wasted%20time).mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/lofi/What%20are%20Sweet%20Dreams%20made%20of.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/lofi/The%20Gospel%20of%20Ben%20Workin.mp3"
      ])
    },
    'viva-la-disco': {
      id: 'viva-la-disco',
      name: 'Viva La Disco',
      tracks: createTracks([
        "https://file.garden/aNQEj1MKyWDQ8eyI/latin/Zion%20%26%20Lennox%20-%20Mi%20tesoro%20%28feat.%20Nicky%20Jam%29%20%28Official%20Video%29.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/latin/Dalex%2C%20Lenny%20Tav%C3%A1rez%2C%20Chencho%20Corleone%20-%20Hola%20%28Remix%29%20ft.%20Juhn%2C%20D%C3%ADmelo%20Flow%20%28Video%20Oficial%29.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/latin/Jay%20Wheeler%2C%20DJ%20Nelson%20%26%20Myke%20Towers%20-%20La%20Curiosidad%20%28Blue%20Grand%20Prix%29%20%28Video%29.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/latin/Alex%20Rose%20-%20Toda%20%28Remix%29%20ft.%20Cazzu%2C%20Lenny%20Tavarez%2C%20Lyanno%20%26%20Rauw%20Alejandro%20%28Video%20Oficial%29.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/latin/Ozuna%20-%20S%C3%ADguelo%20Bailando%20%28Video%20Oficial%29.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/latin/Ozuna%20-%20Se%20Prepar%C3%B3%20%28Video%20Oficial%29%20%20Odisea.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/latin/Natti%20Natasha%20%20Ozuna%20-%20Criminal%20%28Official%20Video%29.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/latin/Reik%20-%20Me%20Niego%20ft.%20Ozuna%2C%20Wisin%20%28Official%20Video%29.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/latin/Don%20Omar%20-%20Danza%20Kuduro%20ft.%20Lucenzo.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/latin/Enrique%20Iglesias%20-%20BAILANDO%20%28Espa%C3%B1ol%29%20ft.%20Descemer%20Bueno%2C%20Gente%20De%20Zona.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/latin/Luis%20Fonsi%20-%20Despacito%20ft.%20Daddy%20Yankee.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/latin/Daddy%20Yankee%20-%20Gasolina%20%28Video%20Oficial%29.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/latin/Soltar.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/latin/El%20Malo%20De%20Tu%20Novela.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/latin/El%20Mundo%20Est%C3%A1%20Ardiendo.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/latin/Mismo'%20Lugares.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/latin/Brillo%20del%20Barrio.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/latin/Corona%20En%20Mi%20Cabeza.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/latin/Solo%20Sales.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/latin/Rey%20Digital.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/latin/Contando%20Mi%20Dinero.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/latin/Mismo%20Barrio.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/latin/Sem%C3%A1foro.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/latin/%C2%BFD%C3%B3nde%20Te%20Has%20Ido%20(1).mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/latin/Se%20Quema.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/latin/Esa%20Noche.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/latin/Picante%20Como%20Yo.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/latin/Liberaci%C3%B3n.mp3"
      ])
    },
    'bassface-fm': {
      id: 'bassface-fm',
      name: 'Bassface FM',
      tracks: createTracks([
        "https://file.garden/aNQEj1MKyWDQ8eyI/dubstep/collard%20greens%20with%20a%20side%20of%20brain%20rott.wav", "https://file.garden/aNQEj1MKyWDQ8eyI/dubstep/muahahahaha%20(%20sofa%20sauce).wav", "https://file.garden/aNQEj1MKyWDQ8eyI/dubstep/1damn%20it.wav", "https://file.garden/aNQEj1MKyWDQ8eyI/dubstep/Grind%20On%20Me%20(Sofa%20King%20Sad%20Boi).wav", "https://file.garden/aNQEj1MKyWDQ8eyI/dubstep/oh%20damn.wav", "https://file.garden/aNQEj1MKyWDQ8eyI/dubstep/damnit%20bobby.wav", "https://file.garden/aNQEj1MKyWDQ8eyI/dubstep/in%20romania%20we%20trust.wav", "https://file.garden/aNQEj1MKyWDQ8eyI/dubstep/damn.wav", "https://file.garden/aNQEj1MKyWDQ8eyI/dubstep/Sir%20This%20Is%20a%20Wendy%E2%80%99s%20(Trance%20Mix)%20.wav", "https://file.garden/aNQEj1MKyWDQ8eyI/dubstep/1marshmellos%20are%20a%20gateway%20drug.wav", "https://file.garden/aNQEj1MKyWDQ8eyI/dubstep/damn%20daniel%20.wav", "https://file.garden/aNQEj1MKyWDQ8eyI/dubstep/damn%20get%20fucked.wav", "https://file.garden/aNQEj1MKyWDQ8eyI/dubstep/birds%20be%20chirpin.wav", "https://file.garden/aNQEj1MKyWDQ8eyI/dubstep/1Sofa_king_sad_boi-Cant_trust_nobody_Rebirth.wav", "https://file.garden/aNQEj1MKyWDQ8eyI/dubstep/1damn%20son.wav", "https://file.garden/aNQEj1MKyWDQ8eyI/dubstep/Hair%20Transformation.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/dubstep/8%20Minute%20Smoke%20Break.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/dubstep/Fading%20Phantoms.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/dubstep/Flickering%20Memories.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/dubstep/baby%20siick.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/dubstep/unseen%20fragments%20of%20reality.mp3"
      ])
    },
    'hip-hop-on-the-block': {
      id: 'hip-hop-on-the-block',
      name: 'Hip Hop on the Block',
      tracks: createTracks([
        "https://file.garden/aNQEj1MKyWDQ8eyI/hiphop/Noemotion%20funk%202.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/hiphop/Noemotion%20funk.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/hiphop/Cock%20king%20fu.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/hiphop/noemotion_humble_pie.wav", "https://file.garden/aNQEj1MKyWDQ8eyI/hiphop/Noemotion%20GoldMask%20odyssey.wav", "https://file.garden/aNQEj1MKyWDQ8eyI/hiphop/WGW%20Noemotion%20GoldMask%20(sad).wav", "https://file.garden/aNQEj1MKyWDQ8eyI/hiphop/WGW%20Noemotion%20GoldMask.wav", "https://file.garden/aNQEj1MKyWDQ8eyI/hiphop/Hello%20High%20Hi-%20Noemotion%20Goldmask.m4a", "https://file.garden/aNQEj1MKyWDQ8eyI/hiphop/Midwest%20noemotion.wav", "https://file.garden/aNQEj1MKyWDQ8eyI/hiphop/NoEmotion%20%20Cypher.mp3"
      ])
    },
    'backforty-drip': {
      id: 'backforty-drip',
      name: 'BackFORTYdrip',
      tracks: createTracks([
        "https://file.garden/aNQEj1MKyWDQ8eyI/country/Back%20road%20confessions.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/country/long%20Road%20home.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/country/Long%20way%20home.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/country/Ain%E2%80%99t%20no%20Saints%20in%20this%20bar.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/country/Dirty%20boots%20clink%20conscience.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/country/Living%20fastdying%20slow.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/country/You%E2%80%99re%20cheating%20ass%20is%20on%20Tinder%20again.mp3"
      ])
    },
    'mosh-pit-fm': {
      id: 'mosh-pit-fm',
      name: 'Mosh Pit FM',
      tracks: createTracks([
        "https://file.garden/aNQEj1MKyWDQ8eyI/metal/Whats%20in%20the%20Bowl%20Bitch.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/metal/Machine%20Man%20Future%20Dude.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/metal/Devildriver%20Enemy.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/metal/My%20Megadeth%20Revenge%20Ghost.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/metal/Mobscene%20Kitty.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/metal/The%20Faceless%20Civil%20Unrest.mp3"
      ])
    },
    'notebook-fm': {
      id: 'notebook-fm',
      name: 'Notebook FM',
      tracks: createTracks([
        "https://file.garden/aNQEj1MKyWDQ8eyI/Talk%20radio/Exit%20valley%20episode.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/Talk%20radio/Echoes%20of%20the%20golden%20mask.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/Talk%20radio/The%20mystery%20method.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/Talk%20radio/12matt3r%20unpacking.mp3", "https://file.garden/aNQEj1MKyWDQ8eyI/Talk%20radio/Stabbington%20bear%20stitch%20tape.mp3"
      ])
    }
  };

  global.RADIO_STATIONS = STATIONS_DATA;

})(window);