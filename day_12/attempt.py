import os
file_path = os.path.join(os.path.dirname(__file__), 'input.in')
with open(file_path, 'r') as file:
    content = file.read()
lines = content.splitlines()
total = 0
for line in lines:
    
    area, content = line.split(':')
    
    width, height = map(int, area.split('x'))
    width = width // 3
    height = height // 3
    avail = width * height
    squares = sum(map(int, content.split()))
    if squares <= avail:
        total += 1
print(total)