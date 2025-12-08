import os
file_path = os.path.join(os.path.dirname(__file__), 'input.in')
with open(file_path, 'r') as file:
    content = file.read()
lines = content.splitlines()
total = 0
source = lines[0].find('S')
lines = [list(line) for line in lines]
lines[1][source] = '|'
splits = 0
for i in range(1, len(lines) - 1):
    for j in range(len(lines[i])):
        if lines[i-1][j] == '|':
            if lines[i][j] == '^':
                lines[i][j-1] = '|'
                lines[i][j+1] = '|'
                splits += 1
            else:
                lines[i][j] = '|'

print(splits)

