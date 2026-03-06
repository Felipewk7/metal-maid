import sys
from PIL import Image

def process_sprite(input_path, output_path, target_height=48):
    try:
        img = Image.open(input_path).convert("RGBA")
        datas = img.getdata()

        # Remove white background
        newData = []
        for item in datas:
            # White or near white checking
            if item[0] > 240 and item[1] > 240 and item[2] > 240:
                newData.append((255, 255, 255, 0))
            else:
                newData.append(item)

        img.putdata(newData)

        # Crop to bounding box
        bbox = img.getbbox()
        if bbox:
            img = img.crop(bbox)

        # Resize keeping aspect ratio
        width, height = img.size
        target_width = int((target_height / height) * width)
        
        img = img.resize((target_width, target_height), Image.Resampling.LANCZOS)
        
        # Save
        img.save(output_path, "PNG")
        print(f"Processed {input_path} -> {output_path} (Size: {target_width}x{target_height})")

    except Exception as e:
        print(f"Error processing {input_path}: {e}")

if __name__ == "__main__":
    # The files provided by the user in the artifact folder
    # media__1772766119915.png (Idle/Pistol)
    # media__1772766119956.png (Shoot/Aiming with two hands)
    # media__1772766119991.png (Dead)
    
    # Mapping based on visual inspection of the names the user provided:
    # We will just process all three and map them to player_idle, player_shoot, player_dead
    base_dir = r"C:\Users\Felifep\.gemini\antigravity\brain\5e58b705-119e-45f2-ab4c-1d5085f7cac4"
    out_dir = r"C:\Users\Felifep\.gemini\antigravity\scratch\metal-maid\assets\sprites"

    # NOTE: The sizes provided by the user are highly detailed illustrations (approx 600x900). 
    # Our game hitbox is 32x48. Mismatching aspect ratios might look thin if we force 32x48.
    # The script calculates width based on the 48px height.
    
    process_sprite(f"{base_dir}\\media__1772766119915.png", f"{out_dir}\\player_idle.png", target_height=64)
    process_sprite(f"{base_dir}\\media__1772766119956.png", f"{out_dir}\\player_shoot.png", target_height=64)
    process_sprite(f"{base_dir}\\media__1772766119991.png", f"{out_dir}\\player_dead.png", target_height=64) # Dead can be proportional
