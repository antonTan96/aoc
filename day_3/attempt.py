import os
file_path = os.path.join(os.path.dirname(__file__), 'input.in')
with open(file_path, 'r') as file:
    content = file.read()

lines = content.splitlines()
total = 0
for line in lines:
    curmax = 0
    for i in range(len(line)):
        for j in range(i + 1, len(line)):
            curmax = max(curmax, int(line[i])*10 + int(line[j]))
    total += curmax
print(total)