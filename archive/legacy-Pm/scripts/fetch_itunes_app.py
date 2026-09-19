#!/usr/bin/env python3
"""Fetch public App Store metadata from Apple's iTunes Lookup API."""

from __future__ import annotations

import csv
import json
import pathlib
import sys
import urllib.parse
import urllib.request

ITUNES_LOOKUP = "https://itunes.apple.com/lookup"
DEFAULT_COUNTRY = "eg"
OUTPUT_DIR = pathlib.Path("feeds/itunes")


def fetch_app(app_id: str, country: str = DEFAULT_COUNTRY) -> dict:
    params = {"id": app_id, "country": country, "entity": "software"}
    url = f"{ITUNES_LOOKUP}?{urllib.parse.urlencode(params)}"
    request = urllib.request.Request(url, headers={"User-Agent": "PM-Cosmetics-iTunes-Feed/1.0"})
    with urllib.request.urlopen(request, timeout=20) as response:
        data = json.load(response)

    if data.get("resultCount", 0) == 0:
        raise ValueError(f"No App Store result for id={app_id!r}, country={country!r}")
    return data["results"][0]


def normalize(result: dict) -> dict:
    return {
        "id": result.get("trackId"),
        "name": result.get("trackName"),
        "bundleId": result.get("bundleId"),
        "primaryGenreName": result.get("primaryGenreName"),
        "price": result.get("price"),
        "currency": result.get("currency"),
        "artworkUrl100": result.get("artworkUrl100"),
        "artworkUrl512": result.get("artworkUrl512") or result.get("artworkUrl100"),
        "trackViewUrl": result.get("trackViewUrl"),
        "screenshotUrls": result.get("screenshotUrls", []),
        "shortDescription": result.get("subtitle") or result.get("shortDescription") or "",
        "description": result.get("description") or "",
        "seller": result.get("sellerName"),
        "version": result.get("version"),
        "releaseDate": result.get("releaseDate"),
        "currentVersionReleaseDate": result.get("currentVersionReleaseDate"),
    }


def save_json(obj: dict, path: pathlib.Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def save_csv(obj: dict, path: pathlib.Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fields = [
        "id", "name", "bundleId", "primaryGenreName", "price", "currency",
        "artworkUrl100", "artworkUrl512", "trackViewUrl", "screenshotUrls",
        "shortDescription", "description", "seller", "version", "releaseDate",
        "currentVersionReleaseDate",
    ]
    row = {
        key: json.dumps(value, ensure_ascii=False) if isinstance(value, (list, dict)) else value
        for key, value in obj.items()
    }
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        writer.writerow(row)


def main() -> int:
    if len(sys.argv) < 2:
        print("Usage: python3 scripts/fetch_itunes_app.py <app_id> [country_code]", file=sys.stderr)
        return 2

    app_id = sys.argv[1]
    country = sys.argv[2].lower() if len(sys.argv) > 2 else DEFAULT_COUNTRY
    result = normalize(fetch_app(app_id, country))

    save_json(result, OUTPUT_DIR / f"{app_id}.json")
    save_csv(result, OUTPUT_DIR / f"{app_id}.csv")
    print(f"Saved {OUTPUT_DIR}/{app_id}.json and {OUTPUT_DIR}/{app_id}.csv")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
