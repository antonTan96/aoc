import os
file_path = os.path.join(os.path.dirname(__file__), 'input.in')
with open(file_path, 'r') as file:
    content = file.read()

lines = content.splitlines()
total = 0
for line in lines:
    choice = 11
    last_chosen = -1
    while choice >= 0:
        curmax = "0"
        for char in line[last_chosen+1:(len(line) - choice)]:
            if char > curmax:
                curmax = char
                last_chosen = line.index(char, last_chosen+1, len(line) - choice)
        total += int(curmax) * (10 ** choice)
        choice -= 1
print(total)