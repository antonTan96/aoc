import os
file_path = os.path.join(os.path.dirname(__file__), 'input.in')
with open(file_path, 'r') as file:
    content = file.read()
lines = content.splitlines()
graph = {}
end_state = "fft"
for line in lines:
    key, endpoints = line.split(':')
    graph[key] = endpoints.split() if endpoints else []
start = 'svr'
q = []
q.append(start)
total = 0
while q:
    current = q.pop(0)
    if current == end_state:
        total += 1
    if current not in graph:
        continue
    for neighbor in graph[current]:
        q.append(neighbor)
print(total)