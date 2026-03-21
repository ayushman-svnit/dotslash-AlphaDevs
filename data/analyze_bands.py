import pandas as pd
import h3
import json
import os

def process_data():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    file1 = os.path.join(base_dir, "clean_wildlife_data.csv")
    file2 = os.path.join(base_dir, "clean_wildlife_data1.csv")
    
    # Load both CSVs if they exist, else just the first
    dfs = []
    if os.path.exists(file1): dfs.append(pd.read_csv(file1))
    if os.path.exists(file2): dfs.append(pd.read_csv(file2))
    
    if not dfs:
        print("No CSV files found!")
        return
        
    df = pd.concat(dfs, ignore_index=True)
    
    # Map IUCN Status to Danger Levels
    # 6 bands: CR (Red), EN (Orange), VU (Yellow), NT (Yellow-Green), LC (Green), DD (Dark Green / Default)
    iucn_to_danger = {
        'CR': {'level': 6, 'color': '#ff0000'}, # Red (Most Danger)
        'EN': {'level': 5, 'color': '#ffa500'}, # Orange
        'VU': {'level': 4, 'color': '#ffff00'}, # Yellow
        'NT': {'level': 3, 'color': '#9acd32'}, # Yellow-Green
        'LC': {'level': 2, 'color': '#00ff00'}, # Light Green
        'DD': {'level': 1, 'color': '#006400'}  # Dark Green
    }
    
    def get_danger_info(category):
        return iucn_to_danger.get(category, {'level': 1, 'color': '#006400'})

    # Map the level
    df['danger_level'] = df['iucnRedListCategory'].apply(lambda x: get_danger_info(x)['level'])
    
    # Cluster into H3 cells (Resolution 4 is about 22km across - good for minimal country-wide dots)
    RESOLUTION = 4
    df['h3_cell'] = df.apply(lambda row: h3.latlng_to_cell(row['decimalLatitude'], row['decimalLongitude'], RESOLUTION), axis=1)
    
    # Find the maximum danger level in each cell
    idx = df.groupby('h3_cell')['danger_level'].idxmax()
    minimal_df = df.loc[idx].copy()
    
    # Create final dots
    final_dots = []
    for _, row in minimal_df.iterrows():
        danger_info = get_danger_info(row['iucnRedListCategory'])
        final_dots.append({
            "lat": row['decimalLatitude'],
            "lng": row['decimalLongitude'],
            "color": danger_info['color'],
            "category": row['iucnRedListCategory'],
            "level": danger_info['level']
        })
        
    print(f"Reduced from {len(df)} raw rows to {len(final_dots)} minimal map dots.")
    
    # Save directly to the Next.js public directory
    output_path = os.path.abspath(os.path.join(base_dir, "..", "apps", "web", "public", "danger_bands.json"))
    with open(output_path, 'w') as f:
        json.dump(final_dots, f)
    print(f"Data saved to {output_path}")

if __name__ == "__main__":
    process_data()
