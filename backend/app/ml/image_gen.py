import numpy as np
import cv2
import os
import math

class MalwareImageGenerator:
    def __init__(self, output_dir: str = "datasets/images"):
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)

    def generate_image(self, binary_path: str, filename: str) -> str:
        """
        Converts a malware binary into a grayscale image.
        """
        if not os.path.exists(binary_path):
            raise FileNotFoundError(f"Binary not found: {binary_path}")
            
        with open(binary_path, 'rb') as f:
            data = f.read()
            
        # 1. Determine dimensions based on file size
        file_size = len(data)
        if file_size < 10240:
            width = 32
        elif file_size < 30720:
            width = 64
        elif file_size < 61440:
            width = 128
        elif file_size < 102400:
            width = 256
        elif file_size < 204800:
            width = 384
        elif file_size < 512000:
            width = 512
        elif file_size < 1024000:
            width = 768
        else:
            width = 1024
            
        height = math.ceil(file_size / width)
        
        # 2. Convert to numpy array
        # Pad with zeros if necessary to make it a perfect rectangle
        padded_size = width * height
        padded_data = bytearray(data) + bytearray(padded_size - file_size)
        
        image_array = np.frombuffer(padded_data, dtype=np.uint8)
        image_matrix = np.reshape(image_array, (height, width))
        
        # 3. Resize to a standard size (e.g., 224x224 for standard CNNs)
        standard_size = (224, 224)
        resized_image = cv2.resize(image_matrix, standard_size, interpolation=cv2.INTER_AREA)
        
        # 4. Save image
        output_path = os.path.join(self.output_dir, f"{filename}.png")
        cv2.imwrite(output_path, resized_image)
        
        return output_path
