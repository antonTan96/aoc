import os
file_path = os.path.join(os.path.dirname(__file__), 'input.in')
with open(file_path, 'r') as file:
    content = file.read()
coords = content.splitlines()
coords = [list(map(int, line.split(','))) for line in coords]

def get_area(p1,p2):
    return (1+abs(p1[0]-p2[0])) *(1+abs(p1[1]-p2[1])) 
max_area = 0
for i in range(len(coords)):
    for j in range(len(coords)):
        if i != j:
            area = get_area(coords[i], coords[j])
            max_area = max(max_area, area)
print(max_area)