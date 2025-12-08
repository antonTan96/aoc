import os
import re
file_path = os.path.join(os.path.dirname(__file__), 'input.in')
with open(file_path, 'r') as file:
    content = file.read()
ranges = re.split(',|\n', content)
invalids = []
for s in ranges:
    if s == '':
        continue
    head, tail = s.split('-')
    for i in range(int(head), int(tail) + 1):
        strlen = len(str(i))
        if strlen % 2 == 1:
            continue
        firsthalf = str(i)[:strlen // 2]
        secondhalf = str(i)[strlen // 2:]
        if firsthalf == secondhalf:
            invalids.append(i)
            
print(sum(invalids))
        