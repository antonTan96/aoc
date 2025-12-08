import os
file_path = os.path.join(os.path.dirname(__file__), 'input.in')
with open(file_path, 'r') as file:
    content = file.read()


ranges, _ = content.split('\n\n')
ranges = list(map(lambda x: x.split('-'), ranges.splitlines()))
ranges = sorted(ranges, key=lambda x: int(x[0]))
merged = [] 
leftptr = 0
rightptr = 0
while leftptr < len(ranges):
    curhead = int(ranges[leftptr][0])
    curtail = int(ranges[leftptr][1])
    rightptr = leftptr + 1
    while rightptr < len(ranges):
        nexthead = int(ranges[rightptr][0])
        nexttail = int(ranges[rightptr][1])
        if nexthead <= curtail:
            curtail = max(curtail, nexttail)
            rightptr += 1
        else:
            break
    merged.append((curhead, curtail))
    leftptr = rightptr
total = 0
for head, tail in merged:
    total += tail - head + 1
print(total)