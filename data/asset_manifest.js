(function(global) {
  'use strict';

  const ASSET_MANIFEST = {
    version: "uls-assets-v1",
    assets: {
      ui: {
        hud: {
          stats_bars: "assets/ui/hud/stats-bars.png",
          warning_overlay: "assets/ui/hud/warning-overlay.png",
          pause_overlay: "assets/ui/hud/pause-overlay.png"
        }
      },
      backgrounds: {
        city: {
          night: {
            glass_garden: "assets/backgrounds/city/Glass Garden.png",
            crystal_market: "assets/backgrounds/city/crystal-market.png",
            rust_belt_alley: "assets/backgrounds/city/rust-belt-alley.png",
            neon_heights: "assets/backgrounds/city/neon-heights.png"
          },
          day: {
            glass_garden: "assets/backgrounds/city/daytime/glass-garden-day.png",
            crystal_market: "assets/backgrounds/city/daytime/crystal-market-day.png",
            rust_alley: "assets/backgrounds/city/daytime/rust-alley-day.png",
            neon_core: "assets/backgrounds/city/daytime/neon-core-day.png"
          }
        }
      },
      locations: {
        apartments: {
          player_default: "assets/apartments/character-apartment.png",
          low_end: "assets/apartments/low-end-apartment.png",
          mid_range: "assets/apartments/mid-range-apartment.png",
          high_rise_penthouse: "assets/apartments/high-rise-penthouse.png"
        },
        dreamworld: {
          entry_portal: "assets/dreamworld/entry-portal.png",
          floating_landscape: "assets/dreamworld/floating-landscape.png",
          nightmare: "assets/dreamworld/nightmare.png"
        },
        backrooms: {
          yellow_hallway: "assets/backrooms/yellow-hallway.png",
          flooded: "assets/backrooms/flooded-backroom.png",
          office: "assets/backrooms/office.png"
        },
        living_hell: {
          exterior: "assets/living-hell/exterior.png",
          living_room: "assets/living-hell/Living Room.png",
          basement: "assets/living-hell/basement.png"
        }
      }
    }
  };

  global.ASSET_MANIFEST = ASSET_MANIFEST;
  console.log('Asset Manifest loaded.');

})(window);