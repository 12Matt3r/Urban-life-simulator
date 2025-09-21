Urban Life Simulator – Changelog

This document tracks all significant changes to the project.

[v1.0.0] – Initial Hackathon Build

Date: 2025-09-21

Added

Two-Panel RPG UI with top action bar, left/right panels, and collapsible sim log.

Character Creation System with freeform role input, suggested roles, and role sanitization.

Stats HUD always visible, with hover tooltips for STR, CHA, etc.

Wanted Stars System (0–5 stars) linked to HEAT stat with decay logic.

Objectives Panel with dynamically updating goals.

Storyline Log (persistent and always viewable).

Day/Night Cycle with visual ambience changes and shop open/close mechanics.

Weather System with random atmospheric changes reflected in UI and narrative.

Shop System as a test venue tied to time-of-day logic.

Lottery + Random Fakeouts (occasional yellow ball bounces and surreal events).

Radio System with 12 stations: Lo-Fi, Hip-Hop, Reggaeton, Dubstep, House, Metal, Country, Vaporwave/Slushwave, Trippy, Classical, News, and Mixes.

External Link Support for YouTube, SoundCloud, and direct MP3/OGG/WAV playback.

Supabase Integration with tables for users, saves, stations, and tracks.

Hybrid Save System (cloud saves + localStorage fallback).

Changed

Refactored from prototype to Safari-safe ES5 codebase (no optional chaining, nullish coalescing, or spread).

Fixed

Removed legacy role issues by sanitizing role names (e.g., “Sex Worker” → “Nightlife Performer”).

[Unreleased]

Upcoming Work:

Extended venues beyond shop (e.g., gym, nightclub, office).

NPC system with relationship tracking.

Additional minigames (e.g., dice, backrooms side-quest).

Visual polish and animations.
