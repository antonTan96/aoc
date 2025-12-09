import os
file_path = os.path.join(os.path.dirname(__file__), 'input.in')
with open(file_path, 'r') as file:
    content = file.read()
lines = content.splitlines()
source = lines[0].find('S')
lines = [list(line) for line in lines]
memo = {}
def dfs(matrix, x, y, memo):
    if (x, y) in memo:
        print("M", x, y)
        return memo[(x, y)]
    
    # print(x, y)
    
    base = 1
    
    original_x = x  # Store the original position
    
    while x < len(matrix):
        if matrix[x][y] == '^':
            left = dfs(matrix, x + 1, y - 1, memo)
            right = dfs(matrix, x + 1, y + 1, memo)
            result = left + right
            memo[(original_x, y)] = result  # Memoize at the original position
            return result
        else:
            x += 1
    
    memo[(original_x, y)] = base  # Memoize at the original position
    return base
import time
start = time.time()
print(dfs(lines, 0, source, memo))
end = time.time()
print(end - start)
    