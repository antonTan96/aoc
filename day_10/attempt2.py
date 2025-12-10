class State:
    def __init__(self, state, steps):
        #an array
        self.state = state
        self.goal = None
        self.steps = steps
    
    def set_goal(self, goal):
        self.goal = goal

    def is_goal(self):
        return self.state == self.goal
    
    def is_bad_state(self):
        for i in range(len(self.state)):
            if self.state[i] > self.goal[i]:
                return True
        return False

    def next_state(self, action):
        new_state = self.state.copy()
        for i in action:
            new_state[i] += 1
        new_steps = self.steps + 1
        n = State(new_state, new_steps)
        n.set_goal(self.goal)
        return n
    
import os
file_path = os.path.join(os.path.dirname(__file__), 'input.in')
with open(file_path, 'r') as file:
    content = file.read()
lines = content.splitlines()
lines= list(map(lambda x: x.split()[1:], lines))
total = 0
for line in lines:
    goal_state = list(map(int, line[-1][1:-1].split(',')))
    actions = line[0:-1]
    actions = [list(map(int, action[1:-1].split(','))) for action in actions]
    initial_state = State([0] * len(goal_state), 0)
    initial_state.set_goal(goal_state)
    print(goal_state, actions)
    q = []
    q.append(initial_state)
    visited = set()
    while q:
        current_state = q.pop(0)
        if tuple(current_state.state) in visited or current_state.is_bad_state():
            continue
        visited.add(tuple(current_state.state))
        print("Visiting:", current_state.state)
        if current_state.is_goal():
            total += current_state.steps
            print(current_state.steps)
            # append result into cache.txt file
            with open("cache.txt", "a") as cache_file:
                cache_file.write(f"{','.join(map(str, goal_state))}:{current_state.steps}\n")
             
            break
        for action in actions:
            next_s = current_state.next_state(action)
            q.append(next_s)
print(total)
    