import os
file_path = os.path.join(os.path.dirname(__file__), 'input.in')
with open(file_path, 'r') as file:
    content = file.read()


ranges, queries = content.split('\n\n')
queries = list(map(int, queries.splitlines()))
ranges = list(map(lambda x: x.split('-'), ranges.splitlines()))
total = 0
for query in queries:
    for head, tail in ranges:
        if int(head) <= query <= int(tail):
            total += 1
            break
print(total)
    
