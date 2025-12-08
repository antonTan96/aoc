import os
import re
file_path = os.path.join(os.path.dirname(__file__), 'input.in')
with open(file_path, 'r') as file:
    content = file.read()
ranges = re.split(',|\n', content)
invalids = []

def get_factors(n):
    factors = set()
    for i in range(1, int(n**0.5) + 1):
        if n % i == 0:
            factors.add(i)
            factors.add(n // i)
    return factors

for s in ranges:
    if s == '':
        continue
    head, tail = s.split('-')
    for i in range(int(head), int(tail) + 1):
        strlen = len(str(i))
        factors = get_factors(strlen)
        factors.remove(strlen)
        is_invalid = False
        for factor in factors:
            substr = str(i)[:factor]
            
            if substr * (strlen // factor) == str(i):
                invalids.append(i)
                is_invalid = True
                break

print(sum(invalids))
            
        