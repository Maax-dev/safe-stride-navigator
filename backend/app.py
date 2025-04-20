from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from urllib.parse import quote_plus
from flask_cors import CORS
from flask import Flask, request, jsonify
import json
from datetime import datetime, timedelta
import os
from shapely.geometry import Point
import geopandas as gpd
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
import osmnx as ox
import networkx as nx
from geopy.geocoders import Nominatim
import osmnx as ox
import networkx as nx
import geopandas as gpd
import pandas as pd
import numpy as np
from shapely.geometry import Point
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import MinMaxScaler
import os


# # Constants
# GRAPH_PLACE = "Oakland, California, USA"
# EDGE_FILE = "edges_with_scores.parquet"
# INCIDENT_FILE = "incident_reports.json"
# DECAY_HALF_LIFE_MIN = 60

# # Severity scoring map
# severity_map = {
#     'FELONY ASSAULT': 0.9, 'PETTY THEFT': 0.3, 'BURG - RESIDENTIAL': 0.7,
#     'MISDEMEANOR ASSAULT': 0.5, 'ARSON': 0.8, 'BURG - AUTO': 0.5, 'DUI': 0.4,
#     'VANDALISM': 0.4, 'GRAND THEFT': 0.7, 'STOLEN VEHICLE': 0.6, 'WEAPONS': 0.8,
#     'FRAUD': 0.3, 'OTHER': 0.4, 'DISORDERLY CONDUCT': 0.3, 'BURG - COMMERCIAL': 0.6,
#     'FELONY WARRANT': 0.7, 'THREATS': 0.6, 'POSSESSION - STOLEN PROPERTY': 0.5,
#     'ROBBERY': 0.85, 'RECOVERED O/S STOLEN': 0.3, 'DOMESTIC VIOLENCE': 0.75,
#     'NARCOTICS': 0.4, 'KIDNAPPING': 0.95, 'FORGERY & COUNTERFEITING': 0.3,
#     'FORCIBLE RAPE': 1.0, 'HOMICIDE': 1.0, 'STOLEN AND RECOVERED VEHICLE': 0.4,
#     'CURFEW & LOITERING': 0.2, 'OTHER SEX OFFENSES': 0.8, 'BRANDISHING': 0.7,
#     'CHILD ABUSE': 0.85, 'BURG - OTHER': 0.6, 'MISCELLANEOUS TRAFFIC CRIME': 0.2,
#     'EMBEZZLEMENT': 0.3, 'RECOVERED VEHICLE - OAKLAND STOLEN': 0.3, 'GAMBLING': 0.2,
#     'PROSTITUTION': 0.3, 'INCIDENT TYPE': 0.4, 'ENVIRONMENTAL CRIME': 0.3,
#     'MISDEMEANOR WARRANT': 0.4
# }

# # Safety scoring function
# def compute_safety_score(row):
#     w1, w2, w3, w4 = 0.4, 0.2, 0.2, 0.2
#     return (
#         w1 * (1 - row['crime_score']) +
#         w2 * row['foot_traffic'] +
#         w3 * row['lighting'] +
#         w4 * row['institution_score']
#     )


# # Build the graph
# G = ox.graph_from_place(GRAPH_PLACE, network_type='walk')
# edges = ox.graph_to_gdfs(G, nodes=False).reset_index().rename(columns={'index': 'edge_id'})
# nodes = ox.graph_to_gdfs(G, edges=False)

# if os.path.exists(EDGE_FILE):
#     edges = pd.read_parquet(EDGE_FILE)
# else:
#     # Load and preprocess crime data
#     crime_df = pd.read_csv('/Users/sripathisaipranav/Desktop/HackDavis/crime_rate.csv')
#     crime_df['lon'] = crime_df['Location'].str.extract(r'POINT \((-?\d+\.\d+)')[0].astype(float)
#     crime_df['lat'] = crime_df['Location'].str.extract(r'(-?\d+\.\d+)\)')[0].astype(float)
#     crime_df = crime_df.dropna(subset=['lat', 'lon'])

#     crime_gdf = gpd.GeoDataFrame(crime_df, geometry=gpd.points_from_xy(crime_df['lon'], crime_df['lat']), crs="EPSG:4326")
#     crime_gdf = crime_gdf.to_crs(epsg=3857)
#     edges = edges.to_crs(epsg=3857)

#     coords = np.array(list(zip(crime_gdf.geometry.x, crime_gdf.geometry.y)))
#     db = DBSCAN(eps=100, min_samples=2).fit(coords)
#     crime_gdf['cluster'] = db.labels_
#     crime_gdf['severity_score'] = crime_gdf['CRIMETYPE'].map(severity_map).fillna(0.4)

#     edges['geometry_buffered'] = edges.buffer(25)
#     join = gpd.sjoin(crime_gdf, edges[['edge_id', 'geometry_buffered']], how='inner', predicate='within')
#     avg_crime = join.groupby('edge_id')['severity_score'].mean()
#     edges['crime_score'] = edges['edge_id'].map(avg_crime).fillna(0)

#     scaler = MinMaxScaler()
#     edges['crime_score'] = scaler.fit_transform(edges[['crime_score']])
#     edges = edges.set_geometry('geometry')
#     edges.drop(columns='geometry_buffered', inplace=True)

#     np.random.seed(42)
#     edges['foot_traffic'] = np.random.uniform(0.2, 1.0, len(edges))
#     edges['lighting'] = np.random.uniform(0.3, 1.0, len(edges))
#     edges['institution_score'] = np.random.uniform(0.4, 1.0, len(edges))

#     edges['safety_score'] = edges.apply(compute_safety_score, axis=1)
#     edges.to_parquet(EDGE_FILE)

# # Update edge weights in graph
# for u, v, k, data in G.edges(keys=True, data=True):
#     try:
#         row = edges.loc[(edges['u'] == u) & (edges['v'] == v)].iloc[0]
#         data['weight'] = 1 - row['safety_score']
#     except:
#         data['weight'] = 1
# app = Flask(__name__)
# CORS(app)
# # Escape credentials
# username = quote_plus("admin")
# password = quote_plus("Avalon@120")

# # Include the database name in the URI (e.g., "safesteps")
# app.config["MONGO_URI"] = f"mongodb+srv://{username}:{password}@safesteps.qu6vixr.mongodb.net/safesteps?retryWrites=true&w=majority&appName=safesteps"

# # Initialize PyMongo
# mongo = PyMongo(app)

# @app.route("/home", methods=['GET'])
# def home():
#     return jsonify({"message": "Sai Pranav"})

# def get_safest_path(start_lat, start_lon, end_lat, end_lon):
#     data = request.get_json()
#     start_lat, start_lon = data['start_lat'], data['start_lon']
#     end_lat, end_lon = data['end_lat'], data['end_lon']

#     orig = ox.nearest_nodes(G, X=start_lon, Y=start_lat)
#     dest = ox.nearest_nodes(G, X=end_lon, Y=end_lat)
#     path = nx.shortest_path(G, orig, dest, weight='weight')
#     coords = [(G.nodes[n]['y'], G.nodes[n]['x']) for n in path]
#     return jsonify({"route": coords})

# @app.route("/safe_path", methods=["GET"])
# def get_route(): 
#     start_lat = request.args.get("start_lat")
#     start_lon = request.args.get("start_lon")
#     destination = request.args.get("destination")  # get ?destination=xyz from the URL
#     if not destination or start_lat or start_lon:
#         return jsonify({"error": "Missing parameters"}), 400
#     geolocator = Nominatim(user_agent="nav_app")
#     location = geolocator.geocode(destination)
#     end_lat, end_lon = location.latitude, location.longitude
#     get_safest_path(start_lat,start_lon, end_lat, end_lon)
#     # Do something with route_name (like query the DB)
#     steps = []
#     return jsonify({"steps": steps})
#     #return jsonify({"message": f"Requested route: {route_name}"})


# @app.route("/add_user", methods=["POST"])
# def add_user():
#     data = request.get_json()
#     if not data:
#         return jsonify({"error": "No data provided"}), 400

#     try:
#         result = mongo.db.users.insert_one(data)
#         return jsonify({
#             "message": "User added successfully",
#             "inserted_id": str(result.inserted_id)
#         }), 201
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

# if __name__ == "__main__":
#     app.run(debug=True)
# Load Graph

import os
from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from urllib.parse import quote_plus
from flask_cors import CORS
from shapely.geometry import Point
import geopandas as gpd
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
import osmnx as ox
import networkx as nx
from geopy.geocoders import Nominatim
from sklearn.cluster import DBSCAN

# === Setup Graph and Edges ===
GRAPH_PLACE = "Oakland, California, USA"
G = ox.graph_from_place(GRAPH_PLACE, network_type='walk')
edges = ox.graph_to_gdfs(G, nodes=False).reset_index()
edges["edge_id"] = edges.apply(lambda row: f"{row['u']}_{row['v']}_{row['key']}", axis=1)
nodes = ox.graph_to_gdfs(G, edges=False)

# Load and preprocess crime data
crime_df = pd.read_csv('safe-stride-navigator/backend/crime_rate.csv')
crime_df['lon'] = crime_df['Location'].str.extract(r'POINT \((-?\d+\.\d+)')[0].astype(float)
crime_df['lat'] = crime_df['Location'].str.extract(r'(-?\d+\.\d+)\)')[0].astype(float)
crime_df.dropna(subset=['lat', 'lon'], inplace=True)

crime_gdf = gpd.GeoDataFrame(crime_df, geometry=gpd.points_from_xy(crime_df['lon'], crime_df['lat']), crs="EPSG:4326").to_crs(epsg=3857)
edges = edges.to_crs(epsg=3857)

# Cluster crimes
coords = np.array(list(zip(crime_gdf.geometry.x, crime_gdf.geometry.y)))
crime_gdf['cluster'] = DBSCAN(eps=100, min_samples=2).fit(coords).labels_

# Severity scores
severity_map = {
    'FELONY ASSAULT': 0.9, 'PETTY THEFT': 0.3, 'BURG - RESIDENTIAL': 0.7,
    'MISDEMEANOR ASSAULT': 0.5, 'ARSON': 0.8, 'ROBBERY': 0.85,
    'NARCOTICS': 0.4, 'KIDNAPPING': 0.95, 'FORCIBLE RAPE': 1.0, 'HOMICIDE': 1.0,
    'CHILD ABUSE': 0.85, 'OTHER': 0.4
}
crime_gdf['severity_score'] = crime_gdf['CRIMETYPE'].map(severity_map).fillna(0.4)

# Join crime to edges
edges['geometry_buffered'] = edges.buffer(25)
edges = edges.set_geometry('geometry_buffered')
join = gpd.sjoin(crime_gdf, edges[['edge_id', 'geometry_buffered']], how='inner', predicate='within')
avg_crime = join.groupby('edge_id')['severity_score'].mean()
edges['crime_score'] = edges['edge_id'].map(avg_crime).fillna(0)
scaler = MinMaxScaler()
edges['crime_score'] = scaler.fit_transform(edges[['crime_score']])
edges = edges.set_geometry('geometry')
edges.drop(columns='geometry_buffered', inplace=True)

# Mock extra features + compute safety score
np.random.seed(42)
edges['foot_traffic'] = np.random.uniform(0.2, 1.0, len(edges))
edges['lighting'] = np.random.uniform(0.3, 1.0, len(edges))
edges['institution_score'] = np.random.uniform(0.4, 1.0, len(edges))

def compute_safety_score(row):
    return 0.4 * (1 - row['crime_score']) + 0.2 * row['foot_traffic'] + 0.2 * row['lighting'] + 0.2 * row['institution_score']

edges['safety_score'] = edges.apply(compute_safety_score, axis=1)

# Apply weights to graph
for u, v, k, data in G.edges(keys=True, data=True):
    try:
        row = edges.loc[(edges['u'] == u) & (edges['v'] == v)].iloc[0]
        data['weight'] = 1 - row['safety_score']
    except:
        data['weight'] = 1

# === Flask Setup ===
app = Flask(__name__)
CORS(app)

username = quote_plus("admin")
password = quote_plus("Avalon@120")
app.config["MONGO_URI"] = f"mongodb+srv://{username}:{password}@safesteps.qu6vixr.mongodb.net/safesteps?retryWrites=true&w=majority&appName=safesteps"
mongo = PyMongo(app)

@app.route("/home", methods=['GET'])
def home():
    return jsonify({"message": "Sai Pranav"})

@app.route("/safe_path", methods=["GET"])
def get_route(): 
    start_lat = request.args.get("start_lat", type=float)
    start_lon = request.args.get("start_lon", type=float)
    destination = request.args.get("destination")
    print(destination)

    if not (start_lat and start_lon and destination):
        return jsonify({"error": "Missing parameters"}), 400

    geolocator = Nominatim(user_agent="nav_app")
    location = geolocator.geocode(destination)
    if not location:
        return jsonify({"error": "Destination not found"}), 404

    end_lat, end_lon = location.latitude, location.longitude

    try:
        orig = ox.nearest_nodes(G, X=start_lon, Y=start_lat)
        dest = ox.nearest_nodes(G, X=end_lon, Y=end_lat)
        path = nx.shortest_path(G, orig, dest, weight='weight')
        coords = [(G.nodes[n]['y'], G.nodes[n]['x']) for n in path]
        return jsonify({"route": coords})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/add_user", methods=["POST"])
def add_user():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400
    try:
        result = mongo.db.users.insert_one(data)
        return jsonify({
            "message": "User added successfully",
            "inserted_id": str(result.inserted_id)
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
    