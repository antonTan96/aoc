import os
file_path = os.path.join(os.path.dirname(__file__), 'input.in')
with open(file_path, 'r') as file:
    content = file.read()
lines = content.splitlines()
graph = {}
end_state = "out"
for line in lines:
    key, endpoints = line.split(':')
    graph[key] = endpoints.split() if endpoints else []
start = 'svr'
checkpoints = ['fft', 'dac']
q = []
q.append([start, [start]])
total = 0
while q:
    current,path = q.pop(0)
    if current == end_state:
        if all(cp in path for cp in checkpoints):
            total += 1
    if current not in graph:
        continue
    for neighbor in graph[current]:
        new_path = path + [neighbor]
        q.append([neighbor, new_path])
print(total)