import os
import math
file_path = os.path.join(os.path.dirname(__file__), 'input.in')
with open(file_path, 'r') as file:
    content = file.read()
lines = content.splitlines()
numbers = len(lines) - 1
rightptr = len(lines[0]) - 1
cur_sum = 0
print(numbers)
cur_nums = []
while rightptr >= 0:
    
    cur_num = []
    for i in range(numbers):
        if lines[i][rightptr] != ' ':
            cur_num.append(lines[i][rightptr])
    print(cur_num)    
    if len(cur_num) > 0:
        cur_nums.append(int(''.join(cur_num)))    
    if lines[-1][rightptr] == '+':
        cur_sum += sum(cur_nums)
        cur_nums = []
    elif lines[-1][rightptr] == '*':
        cur_sum += math.prod(cur_nums)
        cur_nums = []

    rightptr -= 1
print(cur_sum)
