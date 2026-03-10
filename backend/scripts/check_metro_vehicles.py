#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script to fetch real vehicle_ids from Golemio API for Prague Metro.
Uses JSON API endpoint (not GTFS-RT protobuf).
"""

import os
import sys
import json
from pathlib import Path

# Load .env
from dotenv import load_dotenv
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

import httpx

API_KEY = os.getenv("GOLEMIO_API_KEY", "")
API_URL = "https://api.golemio.cz/v2/vehiclepositions"

# Metro route IDs mapping
METRO_ROUTES = {
    "L990": "A",  # Line A (green)
    "L991": "C",  # Line C (red)
    "L992": "B",  # Line B (yellow)
}

def fetch_vehicles():
    """Fetch vehicle positions and filter metro vehicles."""
    
    print("=" * 70)
    print("GOLEMIO API - Metro Vehicle Positions")
    print("=" * 70)
    print(f"API Key: {API_KEY[:30]}..." if API_KEY else "API Key: NOT SET!")
    print(f"URL: {API_URL}")
    print("-" * 70)
    
    headers = {"X-Access-Token": API_KEY}
    
    try:
        with httpx.Client(timeout=30) as client:
            # Fetch with high limit to get all vehicles
            response = client.get(f"{API_URL}?limit=5000", headers=headers)
            
            print(f"HTTP Status: {response.status_code}")
            
            if response.status_code != 200:
                print(f"Error: {response.text[:500]}")
                return
            
            data = response.json()
            features = data.get("features", [])
            
            print(f"Total vehicles in response: {len(features)}")
            print("-" * 70)
            
            # Count by route_type
            route_types = {}
            metro_vehicles = {"A": [], "B": [], "C": []}
            
            for f in features:
                props = f.get("properties", {})
                trip = props.get("trip", {})
                gtfs = trip.get("gtfs", {})
                last_pos = props.get("last_position", {})
                
                route_type = gtfs.get("route_type")
                route_id = gtfs.get("route_id", "")
                route_name = gtfs.get("route_short_name", "")
                
                # Count types
                type_name = {0: "tram", 1: "metro", 2: "train", 3: "bus", 11: "trolleybus"}.get(route_type, f"type_{route_type}")
                route_types[type_name] = route_types.get(type_name, 0) + 1
                
                # Check if metro (route_type=1 or route_id L990/L991/L992)
                line = None
                if route_type == 1:
                    # Map by route_short_name (A, B, C)
                    line = route_name if route_name in ["A", "B", "C"] else None
                if not line and route_id:
                    line = METRO_ROUTES.get(route_id)
                
                if line:
                    vehicle_reg = trip.get("vehicle_registration_number")
                    trip_id = gtfs.get("trip_id", "N/A")
                    headsign = gtfs.get("trip_headsign", "N/A")
                    
                    # Pro metro použijeme trip_id jako identifikátor (vehicle_reg je None)
                    # trip_id má formát: 993_3875_251222 (route_tripnum_date)
                    identifier = str(vehicle_reg) if vehicle_reg else trip_id
                    
                    # Position info
                    coords = f.get("geometry", {}).get("coordinates", [])
                    state = last_pos.get("state_position", "unknown")
                    next_stop = last_pos.get("next_stop", {})
                    last_stop = last_pos.get("last_stop", {})
                    
                    metro_vehicles[line].append({
                        "vehicle_id": identifier,
                        "vehicle_reg": vehicle_reg,
                        "route_id": route_id,
                        "route_name": route_name,
                        "trip_id": trip_id,
                        "headsign": headsign,
                        "state": state,
                        "next_stop_id": next_stop.get("id", "N/A"),
                        "last_stop_id": last_stop.get("id", "N/A"),
                        "coordinates": coords
                    })
            
            # Print route type summary
            print("\nVehicle types in response:")
            for t, count in sorted(route_types.items(), key=lambda x: -x[1]):
                marker = " <-- METRO" if t == "metro" else ""
                print(f"  {t}: {count}{marker}")
            
            # Print metro vehicles
            total_metro = sum(len(v) for v in metro_vehicles.values())
            print(f"\n{'=' * 70}")
            print(f"METRO VEHICLES FOUND: {total_metro}")
            print("=" * 70)
            
            for line in ["A", "B", "C"]:
                vehicles = metro_vehicles[line]
                line_colors = {"A": "green", "B": "yellow", "C": "red"}
                print(f"\n>>> LINE {line} ({line_colors[line]}) - {len(vehicles)} vehicles:")
                print("-" * 50)
                
                if not vehicles:
                    print("  No vehicles found")
                    continue
                
                for i, v in enumerate(vehicles[:15], 1):  # Max 15 per line
                    print(f"  [{i}] ID: {v['vehicle_id']}")
                    print(f"      headsign: {v['headsign']}")
                    print(f"      state: {v['state']}")
                    print(f"      next_stop: {v['next_stop_id']}")
                    if v['vehicle_reg']:
                        print(f"      vehicle_reg: {v['vehicle_reg']}")
                    print()
            
            # Usage examples
            if total_metro > 0:
                print("=" * 70)
                print("EXAMPLE URLs FOR TRAIN-LOCKED DISPLAY:")
                print("=" * 70)
                for line in ["A", "B", "C"]:
                    if metro_vehicles[line]:
                        v = metro_vehicles[line][0]
                        print(f"\nLine {line}:")
                        print(f"  http://localhost:5000/metro-train-locked.html?train={v['vehicle_id']}&line={line}")
                        print(f"  (vehicle going to: {v['headsign']})")
            else:
                print("\n" + "!" * 70)
                print("NO METRO VEHICLES FOUND!")
                print("This could mean:")
                print("  1. Metro is not running right now (night time, maintenance)")
                print("  2. API doesn't include metro data")
                print("  3. Different route_type or route_id format")
                print("!" * 70)
                
                # Debug: show some sample vehicles
                print("\nSample vehicles from API (first 5):")
                for f in features[:5]:
                    props = f.get("properties", {})
                    trip = props.get("trip", {})
                    gtfs = trip.get("gtfs", {})
                    print(f"  route_id={gtfs.get('route_id')}, "
                          f"route_type={gtfs.get('route_type')}, "
                          f"name={gtfs.get('route_short_name')}")
                        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    fetch_vehicles()
