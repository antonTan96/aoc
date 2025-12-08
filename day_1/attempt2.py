import os
file_path = os.path.join(os.path.dirname(__file__), 'test.in')
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
    triggered = False
    while curnum > rightbound:
        print(line)
        triggered = True
        ans += 1
        curnum = curnum - 100

    while curnum < leftbound:
        print(line)
        triggered = True
        ans += 1
        curnum = curnum + 100
    if not triggered and curnum == 0:
        print(line)
        ans += 1
    
print(ans)