(function(global) {
  const sfxPayload = {
    "version": "uls-sfx-v1",
    "routing": {
      "ui": "bus_ui",
      "ambience": "bus_ambience",
      "radio": "bus_music",
      "enhancer": "bus_sfx"
    },
    "sfx_packs": [
      {
        "id": "ui_core_v1",
        "category": "ui",
        "items": [
          {
            "id": "ui_click",
            "path": "https://file.garden/aNQEj1MKyWDQ8eyI/sfx/%F0%9F%8C%86%20Immersion%20Layers/click.wav",
            "loop": false,
            "gain": 1.0,
            "tags": ["ui","click","nav"]
          },
          {
            "id": "ui_back",
            "path": "https://file.garden/aNQEj1MKyWDQ8eyI/sfx/ui/ui%20back.wav",
            "loop": false,
            "gain": 1.0,
            "tags": ["ui","back"]
          },
          {
            "id": "ui_confirm",
            "path": "https://file.garden/aNQEj1MKyWDQ8eyI/sfx/ui/ui%20confirm.wav",
            "loop": false,
            "gain": 1.0,
            "tags": ["ui","confirm","success"]
          },
          {
            "id": "ui_error",
            "path": "https://file.garden/aNQEj1MKyWDQ8eyI/sfx/ui/ui%20error.wav",
            "loop": false,
            "gain": 1.0,
            "tags": ["ui","error","fail"]
          },
          {
            "id": "ui_notify",
            "path": "https://file.garden/aNQEj1MKyWDQ8eyI/sfx/ui/ui%20notify.wav",
            "loop": false,
            "gain": 0.9,
            "tags": ["ui","notify","toast"]
          },
          {
            "id": "ui_tab_switch",
            "path": "https://file.garden/aNQEj1MKyWDQ8eyI/sfx/ui/ui%20tab%20switch.ogg",
            "loop": false,
            "gain": 0.9,
            "tags": ["ui","tab","switch"]
          },
          {
            "id": "ui_pause",
            "path": "https://file.garden/aNQEj1MKyWDQ8eyI/sfx/ui/ui%20pause.flac",
            "loop": false,
            "gain": 0.9,
            "tags": ["ui","pause","menu"]
          }
        ]
      },
      {
        "id": "immersion_layers_v1",
        "category": "ambience",
        "items": [
          {
            "id": "amb_city_street",
            "path": "https://file.garden/aNQEj1MKyWDQ8eyI/sfx/%F0%9F%8C%86%20Immersion%20Layers/city%20street.wav",
            "loop": true,
            "gain": 0.6,
            "tags": ["ambience","city","outdoor","loop"]
          },
          {
            "id": "amb_insects_night",
            "path": "https://file.garden/aNQEj1MKyWDQ8eyI/sfx/%F0%9F%8C%86%20Immersion%20Layers/insects%20at%20night.wav",
            "loop": true,
            "gain": 0.5,
            "tags": ["ambience","night","insects","loop"]
          },
          {
            "id": "amb_apartment_idle",
            "path": "https://file.garden/aNQEj1MKyWDQ8eyI/sfx/%F0%9F%8C%86%20Immersion%20Layers/apartment%20ambience.wav",
            "loop": true,
            "gain": 0.55,
            "tags": ["ambience","indoor","apartment","loop"]
          },
          {
            "id": "notif_phone_vibrate",
            "path": "https://file.garden/aNQEj1MKyWDQ8eyI/sfx/%F0%9F%8C%86%20Immersion%20Layers/phone%20vibration.wav",
            "loop": false,
            "gain": 0.9,
            "tags": ["notif","phone","vibrate"]
          }
        ]
      },
      {
        "id": "enhancers_story_v1",
        "category": "enhancer",
        "items": [
          {
            "id": "tension_riser",
            "path": "https://file.garden/aNQEj1MKyWDQ8eyI/sfx/enhancers/tension%20riser.mp3",
            "loop": false,
            "gain": 0.95,
            "tags": ["tension","riser","story"]
          },
          {
            "id": "tension_stab",
            "path": "https://file.garden/aNQEj1MKyWDQ8eyI/sfx/enhancers/tension%20stab.mp3",
            "loop": false,
            "gain": 0.95,
            "tags": ["tension","sting","reveal"]
          },
          {
            "id": "failure",
            "path": "https://file.garden/aNQEj1MKyWDQ8eyI/sfx/enhancers/failure.mp3",
            "loop": false,
            "gain": 1.0,
            "tags": ["fail","result"]
          },
          {
            "id": "success",
            "path": "https://file.garden/aNQEj1MKyWDQ8eyI/sfx/enhancers/succsess.wav",
            "loop": false,
            "gain": 1.0,
            "tags": ["success","result"]
          }
        ]
      },
      {
        "id": "radio_fx_v1",
        "category": "radio",
        "items": [
          {
            "id": "radio_on_off",
            "path": "https://file.garden/aNQEj1MKyWDQ8eyI/sfx/Radio/radio%20on%20off.wav",
            "loop": false,
            "gain": 1.0,
            "tags": ["radio","power"]
          },
          {
            "id": "radio_off_click",
            "path": "https://file.garden/aNQEj1MKyWDQ8eyI/sfx/Radio/radio%20off.wav",
            "loop": false,
            "gain": 1.0,
            "tags": ["radio","power","off"]
          },
          {
            "id": "radio_tune_sweep",
            "path": "https://file.garden/aNQEj1MKyWDQ8eyI/sfx/Radio/switching%20stations.mp3",
            "loop": false,
            "gain": 0.95,
            "tags": ["radio","tune","sweep"]
          },
          {
            "id": "radio_between",
            "path": "https://file.garden/aNQEj1MKyWDQ8eyI/sfx/Radio/radio%20in%20between.wav",
            "loop": false,
            "gain": 0.9,
            "tags": ["radio","static","blip"]
          },
          {
            "id": "radio_bg_noise",
            "path": "https://file.garden/aNQEj1MKyWDQ8eyI/sfx/Radio/radio%20background%20ambience.wav",
            "loop": true,
            "gain": 0.4,
            "tags": ["radio","ambience","loop"]
          },
          {
            "id": "radio_interference",
            "path": "https://file.garden/aNQEj1MKyWDQ8eyI/sfx/Radio/weird%20signal%20interference.wav",
            "loop": false,
            "gain": 0.9,
            "tags": ["radio","glitch","noise"]
          },
          {
            "id": "radio_sign_off",
            "path": "https://file.garden/aNQEj1MKyWDQ8eyI/sfx/Radio/radio%20sign%20off.wav",
            "loop": false,
            "gain": 1.0,
            "tags": ["radio","signoff","ending"]
          }
        ]
      }
    ]
  };

  global.SFX_PAYLOAD = sfxPayload;

})(window);