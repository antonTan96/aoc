import os
import random
file_path = os.path.join(os.path.dirname(__file__), 'input.in')
with open(file_path, 'r') as file:
    content = file.read()
coords = content.splitlines()
coords = [list(map(int, line.split(','))) for line in coords]
coords.append(coords[0])  # to close the loop

min_x = min(coord[0] for coord in coords) - 1
max_x = max(coord[0] for coord in coords) + 1
min_y = min(coord[1] for coord in coords) - 1
max_y = max(coord[1] for coord in coords) + 1
matrix = [['.' for _ in range(max_x - min_x + 1)] for _ in range(max_y - min_y + 1)]
last_coord = coords[0]
print("Building matrix...")
for coord in coords:
    x = coord[0] - min_x
    y = coord[1] - min_y
    matrix[y][x] = '#'
    if coord[0] == last_coord[0]:
        for fill_y in range(min(coord[1], last_coord[1]) - min_y, max(coord[1], last_coord[1]) - min_y + 1):
            matrix[fill_y][x] = '#'
    elif coord[1] == last_coord[1]:
        for fill_x in range(min(coord[0], last_coord[0]) - min_x, max(coord[0], last_coord[0]) - min_x + 1):
            matrix[y][fill_x] = '#'
    last_coord = coord
print("Matrix built.")
#save matrix to file for debugging
with open('matrix_debug.txt', 'w') as f:
    for row in matrix:
        f.write(''.join(row) + '\n')

def is_good_point(matrix, point):
    point_to_matrix_x = point[0] - min_x
    point_to_matrix_y = point[1] - min_y
    checks = [False,False,False,False]
    while point_to_matrix_x < len(matrix[0]):
        if matrix[point_to_matrix_y][point_to_matrix_x] == '#':
            checks[0] = True
            break
        point_to_matrix_x += 1
    point_to_matrix_x = point[0] - min_x
    point_to_matrix_y = point[1] - min_y
    
    while point_to_matrix_x >= 0:
        if matrix[point_to_matrix_y][point_to_matrix_x] == '#':
            checks[1] = True
            break
        point_to_matrix_x -= 1
    point_to_matrix_x = point[0] - min_x
    point_to_matrix_y = point[1] - min_y
    
    while point_to_matrix_y < len(matrix):
        if matrix[point_to_matrix_y][point_to_matrix_x] == '#':
            checks[2] = True
            break
        point_to_matrix_y += 1
    point_to_matrix_x = point[0] - min_x
    point_to_matrix_y = point[1] - min_y
    
    while point_to_matrix_y >= 0:
        if matrix[point_to_matrix_y][point_to_matrix_x] == '#':
            checks[3] = True
            break
        point_to_matrix_y -= 1
    return all(checks)

def generate_corners(p1,p2):
    return [(p1[0], p1[1]), (p1[0], p2[1]), (p2[0], p1[1]), (p2[0], p2[1])]

def get_area(p1,p2):
    return (1+abs(p1[0]-p2[0])) *(1+abs(p1[1]-p2[1])) 
max_area = 0
print("Starting search... ", len(coords), " points")
for i in range(len(coords)):
    for j in range(i+1, len(coords)):
        if random.random() > 0.99:
            print(i, j)
        p1 = coords[i]
        p2 = coords[j]
        corners = generate_corners(p1,p2)
        if all(is_good_point(matrix, corner) for corner in corners):
            print(p1, p2, get_area(p1, p2))
            max_area = max(max_area, get_area(p1, p2))
print(max_area)

