import os
file_path = os.path.join(os.path.dirname(__file__), 'input.in')
with open(file_path, 'r') as file:
    content = file.read()
lines = content.splitlines()
lines = list(map(lambda x: x.split(), lines))
total = 0
for i in range(len(lines[0])):
    symbol = lines[-1][i]
    val1, val2, val3, val4 = lines[0][i], lines[1][i], lines[2][i], lines[3][i]
    if symbol == '+':
        total += int(val1) + int(val2) + int(val3) + int(val4)
    elif symbol == '*':
        total += int(val1) * int(val2) * int(val3) * int(val4)
    print(total)

    