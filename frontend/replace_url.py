import os

def replace_in_dir(directory):
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.jsx') or file.endswith('.js'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                if 'http://localhost:8000' in content:
                    content = content.replace('http://localhost:8000', 'http://127.0.0.1:8000')
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"Updated {filepath}")

replace_in_dir(r"n:\RealVeritas AI\frontend\src")
