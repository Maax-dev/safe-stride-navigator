import google.generativeai as genai
from dotenv import load_dotenv
import os
import json
from shapely.geometry import Point
import geopandas as gpd

# Load environment variables
load_dotenv()

# Configure Gemini API
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel(model_name="models/gemini-1.5-flash")

def classify_incident(transcript: str) -> str:
    crime_categories = [
        "FELONY ASSAULT", "PETTY THEFT", "BURG - RESIDENTIAL", "MISDEMEANOR ASSAULT", "ARSON",
        "BURG - AUTO", "DUI", "VANDALISM", "GRAND THEFT", "STOLEN VEHICLE", "WEAPONS", "FRAUD",
        "OTHER", "DISORDERLY CONDUCT", "BURG - COMMERCIAL", "FELONY WARRANT", "THREATS",
        "POSSESSION - STOLEN PROPERTY", "ROBBERY", "RECOVERED O/S STOLEN", "DOMESTIC VIOLENCE",
        "NARCOTICS", "KIDNAPPING", "FORGERY & COUNTERFEITING", "FORCIBLE RAPE", "HOMICIDE",
        "STOLEN AND RECOVERED VEHICLE", "CURFEW & LOITERING", "OTHER SEX OFFENSES", "BRANDISHING",
        "CHILD ABUSE", "BURG - OTHER", "MISCELLANEOUS TRAFFIC CRIME", "EMBEZZLEMENT",
        "RECOVERED VEHICLE - OAKLAND STOLEN", "GAMBLING", "PROSTITUTION", "INCIDENT TYPE",
        "ENVIRONMENTAL CRIME", "MISDEMEANOR WARRANT"
    ]

    prompt = f"""
You are an incident classification expert. Given this voice transcript:

"{transcript}"

Your job is to classify it using the following categories:
{', '.join(crime_categories)}

Respond in JSON format like this:
{{ "CATEGORY1": confidence_score, "CATEGORY2": confidence_score, ... }}

Only include categories relevant to the content.
Confidence score must be between 0.0 and 1.0.
"""

    try:
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        print("Gemini Raw Response:", response_text)

        if response_text.startswith("```json"):
            response_text = response_text.replace("```json", "").replace("```", "").strip()

        try:
            result = json.loads(response_text)
        except json.JSONDecodeError as json_error:
            print("JSON parse error:", json_error)
            return "UNKNOWN"

        if not isinstance(result, dict):
            raise ValueError("Model output is not a valid dictionary")

        top_category = max(result.items(), key=lambda x: x[1])[0]
        return top_category

    except Exception as e:
        print("Error:", e)
        return "UNKNOWN"

def update_graph_with_report(crime_type, lat, lon, edges, G, severity_map, compute_safety_score):
    print("DEBUG: Updating graph for", crime_type, lat, lon)

    if edges.crs is None:
        print("DEBUG: edges had no CRS, setting to EPSG:3857")
        edges.set_crs("EPSG:3857", inplace=True)

    if edges.geometry.name != "geometry":
        edges = edges.set_geometry("geometry")

    try:
        pt = Point(lon, lat)
        pt_gdf = gpd.GeoDataFrame(geometry=[pt], crs="EPSG:4326")
        pt_gdf = pt_gdf.to_crs(edges.crs)
    except Exception as e:
        raise ValueError(f"Error transforming point to CRS: {e}")

    if pt_gdf.geometry.is_empty.any():
        raise ValueError("Transformed point geometry is empty")

    print("DEBUG: Transformed point geometry:", pt_gdf.geometry.iloc[0])
    print("DEBUG: Calculating distance from edges...")

    nearby = edges[edges.geometry.distance(pt_gdf.geometry.iloc[0]) < 30]
    print("DEBUG: Nearby edges found:", len(nearby))

    base_score = severity_map.get(crime_type, 0.4)
    learning_rate = 0.2

    for idx in nearby.index:
        current = edges.loc[idx, 'crime_score']
        bump = learning_rate * base_score
        edges.loc[idx, 'crime_score'] = min(current + bump, 1.0)

    edges['safety_score'] = edges.apply(compute_safety_score, axis=1)

    for u, v, k, data in G.edges(keys=True, data=True):
        try:
            row = edges.loc[(edges['u'] == u) & (edges['v'] == v)].iloc[0]
            data['weight'] = 1 - row['safety_score']
        except Exception as e:
            print(f"DEBUG: Failed to update edge ({u}, {v}, {k}): {e}")
            data['weight'] = 1

    # Create a copy of the dataframe to avoid modifying the original
    edges_to_save = edges.copy()
    
    def handle_list_value(x, col_name):
        if not isinstance(x, list):
            return x
            
        # Special handling for specific columns
        if col_name == 'osmid':
            return x[0] if len(x) > 0 else None
        elif col_name == 'reversed':
            return x[0] if len(x) > 0 else False
        elif col_name == 'highway':
            return x[0] if len(x) > 0 else None
        elif col_name == 'name':
            return x[0] if len(x) > 0 else None
        elif col_name == 'oneway':
            return x[0] if len(x) > 0 else False
        elif col_name == 'lanes':
            return x[0] if len(x) > 0 else None
        elif col_name == 'maxspeed':
            return x[0] if len(x) > 0 else None
        elif col_name == 'length':
            return x[0] if len(x) > 0 else None
        elif col_name == 'bridge':
            return x[0] if len(x) > 0 else False
        elif col_name == 'tunnel':
            return x[0] if len(x) > 0 else False
        elif col_name == 'access':
            return x[0] if len(x) > 0 else None
        elif col_name == 'service':
            return x[0] if len(x) > 0 else None
        elif col_name == 'junction':
            return x[0] if len(x) > 0 else None
        elif col_name == 'ref':
            return x[0] if len(x) > 0 else None
        elif col_name == 'surface':
            return x[0] if len(x) > 0 else None
        elif col_name == 'width':
            return x[0] if len(x) > 0 else None
        elif col_name == 'area':
            return x[0] if len(x) > 0 else False
        elif col_name == 'landuse':
            return x[0] if len(x) > 0 else None
        elif col_name == 'boundary':
            return x[0] if len(x) > 0 else None
        elif col_name == 'admin_level':
            return x[0] if len(x) > 0 else None
        elif col_name == 'natural':
            return x[0] if len(x) > 0 else None
        elif col_name == 'waterway':
            return x[0] if len(x) > 0 else None
        elif col_name == 'aerialway':
            return x[0] if len(x) > 0 else None
        elif col_name == 'barrier':
            return x[0] if len(x) > 0 else None
        elif col_name == 'man_made':
            return x[0] if len(x) > 0 else None
        elif col_name == 'z_order':
            return x[0] if len(x) > 0 else None
        elif col_name == 'other_tags':
            return str(x) if len(x) > 0 else None
        else:
            # For any other column, convert to string
            return str(x)

    # Apply the list handling function to all object-type columns
    for col in edges_to_save.columns:
        if edges_to_save[col].dtype == 'object':
            edges_to_save[col] = edges_to_save[col].apply(lambda x: handle_list_value(x, col))

    # Ensure geometry column is properly handled
    if 'geometry' in edges_to_save.columns:
        edges_to_save = edges_to_save.set_geometry('geometry')

    try:
        edges_to_save.to_parquet("edges_updated.parquet")
    except Exception as e:
        print(f"Error saving to parquet: {e}")
        # Fallback to saving without geometry
        edges_to_save.drop(columns=['geometry']).to_parquet("edges_updated.parquet")

    return len(nearby)
