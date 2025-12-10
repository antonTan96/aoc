class State:
    def __init__(self, state, steps):
        #a string
        self.state = state
        self.goal = None
        self.steps = steps
    
    def set_goal(self, goal):
        self.goal = goal

    def is_goal(self):
        return self.state == self.goal
    def next_state(self, action):
        new_state = list(self.state)
        for i in action:
            new_state[i] = '#' if new_state[i] == '.' else '.'
        new_steps = self.steps + 1
        n = State("".join(new_state), new_steps)
        n.set_goal(self.goal)
        return n
    
import os
file_path = os.path.join(os.path.dirname(__file__), 'input.in')
with open(file_path, 'r') as file:
    content = file.read()
lines = content.splitlines()
lines= list(map(lambda x: x.split()[0:-1], lines))
total = 0
for line in lines:
    goal_state = line[0][1:-1]
    actions = line[1:]
    actions = [list(map(int, action[1:-1].split(','))) for action in actions]
    initial_state = State('.' * len(goal_state), 0)
    initial_state.set_goal(goal_state)
    q = []
    q.append(initial_state)
    visited = set()
    while q:
        current_state = q.pop(0)
        if current_state.state in visited:
            continue
        visited.add(current_state.state)
        if current_state.is_goal():
            total += current_state.steps
            print(current_state.steps)
            break
        for action in actions:
            next_s = current_state.next_state(action)
            q.append(next_s)
print(total)
    