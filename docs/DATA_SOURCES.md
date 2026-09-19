# Data Sources Catalog

## Overview
FULFILL-X Phase 4 integrates four primary open data source adapters. All feeds are classified as **Tier A Free / Keyless Public APIs** with zero financial or API-key requirements for default operations.

---

## 1. Open-Meteo Weather API (`weather-openmeteo`)
* **Category**: Environmental / Weather Severe Conditions
* **Endpoint**: `https://api.open-meteo.com/v1/forecast`
* **Data Types**: Severe wind gust, extreme precipitation, temperature anomalies.
* **Cost Tier**: Free / Open Data (CC BY 4.0).
* **Refresh Interval**: 900 seconds (15 minutes).
* **Target Coordinates**: Rotterdam, Kobe, Shanghai, Los Angeles, Hamburg, Singapore.
* **Offline Fixture**: Seed 42 deterministic severe storm weather observation.

---

## 2. USGS GeoJSON Earthquake API (`earthquake-usgs`)
* **Category**: Seismic / Geophysical Natural Disasters
* **Endpoint**: `https://earthquake.usgs.gov/fdsnws/event/1/query`
* **Data Types**: Magnitude M4.5+ earthquakes, hypocenter depth, epicentral coordinates.
* **Cost Tier**: Free / Public Domain (US Government Work).
* **Refresh Interval**: 600 seconds (10 minutes).
* **Offline Fixture**: Seed 42 deterministic M6.8 earthquake epicenter near Japan/Kobe port network.

---

## 3. OpenStreetMap / Port Infrastructure (`geospatial-osm`)
* **Category**: Maritime Infrastructure / Port Congestion & Status
* **Endpoint**: `https://overpass-api.de/api/interpreter`
* **Data Types**: Major port terminal geometry, berth counts, vessel entry bottlenecks.
* **Cost Tier**: Free / ODbL (Open Database License).
* **Refresh Interval**: 3600 seconds (1 hour).
* **Offline Fixture**: Seed 42 deterministic Port of Rotterdam congestion observation.

---

## 4. RSS Weak-Signal Intelligence Feed (`rss-weak-signals`)
* **Category**: Geopolitical / Labor Strikes / Cyber Incidents
* **Endpoint**: Public Supply Chain RSS Feeds (e.g. Reuters / Port Technology RSS)
* **Data Types**: Unstructured text news alerts, labor strike notices, canal blockage announcements.
* **Cost Tier**: Free / Public RSS.
* **Refresh Interval**: 1800 seconds (30 minutes).
* **Security Control**: Content passed through `UNTRUSTED_DATA` prompt injection defense wrapper.
* **Offline Fixture**: Seed 42 deterministic labor strike alert at Hamburg logistics hub.
