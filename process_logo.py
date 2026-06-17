from PIL import Image

def process_image():
    input_path = r"C:\Users\aroma\.gemini\antigravity-ide\brain\0871d66d-96da-4dc4-a17a-1b1f938f397c\media__1781642257998.jpg"
    img = Image.open(input_path).convert("RGBA")
    data = img.getdata()
    
    new_data_light = []
    new_data_dark = []
    
    for item in data:
        r, g, b, a = item
        # Remove white background
        if r > 230 and g > 230 and b > 230:
            new_data_light.append((255, 255, 255, 0))
            new_data_dark.append((255, 255, 255, 0))
        else:
            # Preserve anti-aliasing against white:
            # if it's a mix of white and color, alpha should be reduced based on brightness,
            # but a hard threshold is fine for a quick prototype, or we can compute alpha.
            
            # Simple threshold for light mode
            new_data_light.append(item)
            
            # For dark mode, turn dark pixels white, keep gold (yellow/orange) pixels
            if r < 80 and g < 80 and b < 80:
                new_data_dark.append((255, 255, 255, a))
            else:
                new_data_dark.append(item)
                
    light_img = Image.new("RGBA", img.size)
    light_img.putdata(new_data_light)
    # resize if it's too big, typical logo size is ~100-200px
    light_img.thumbnail((200, 200))
    light_img.save(r"c:\Project Apps\Rasiga\Rasiga\logo-light.png", "PNG")
    
    dark_img = Image.new("RGBA", img.size)
    dark_img.putdata(new_data_dark)
    dark_img.thumbnail((200, 200))
    dark_img.save(r"c:\Project Apps\Rasiga\Rasiga\logo-dark.png", "PNG")

if __name__ == "__main__":
    process_image()
    print("Logos processed successfully.")
