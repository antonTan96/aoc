import os
import numpy as np
file_path = os.path.join(os.path.dirname(__file__), 'input.in')
with open(file_path, 'r') as file:
    content = file.read()

lines = content.splitlines()
loc = []
dims = (len(lines) + 2, len(lines[0]) + 2)
print(dims)
loc.append(['.' for _ in range(dims[1])])
for line in lines:
    next_row = []
    for c in line:
        next_row.append(c)
    loc.append(['.'] + next_row + ['.'])
loc.append(['.' for _ in range(dims[1])])
        
total=0
for i in range(dims[0]):
    for j in range(dims[1]):
        if loc[i][j] == '.':
            continue
        count = 0
        for di in [-1, 0, 1]:
            for dj in [-1, 0, 1]:
                if di == 0 and dj == 0:
                    continue
                ni = i + di
                nj = j + dj
                if 0 <= ni < dims[0] and 0 <= nj < dims[1]:                        
                    if loc[ni][nj] == '@':
                        count += 1
                    
        if count < 4:
            total +=1
print(total)
        
