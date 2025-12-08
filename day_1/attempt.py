import os
file_path = os.path.join(os.path.dirname(__file__), 'input.in')
with open(file_path, 'r') as file:
    content = file.read()

lines = content.splitlines()
curnum=50
ans=0
rightbound=99
leftbound=0
for line in lines:
    neg = -1 if line[0] == 'L' else 1
    val = int(line[1:])
    curnum += neg * val
    while curnum < leftbound:
        curnum = curnum + 100
    while curnum > rightbound:
        curnum = curnum - 100
    if curnum == 0:
        ans += 1
print(ans)
