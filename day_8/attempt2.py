import os
file_path = os.path.join(os.path.dirname(__file__), 'input.in')
with open(file_path, 'r') as file:
    content = file.read()
lines = content.splitlines()
def straight_line_dist_3d(p1,p2):
    return ((p1[0]-p2[0])**2 + (p1[1]-p2[1])**2 + (p1[2]-p2[2])**2)**0.5
lines = [list(map(int, line.split(','))) for line in lines]
clusters = set()
point_to_cluster = {}
for line in lines:
    clusters.add((tuple(line),))
    # line is a tuple, a cluster is a tuple of tuples 
    point_to_cluster[tuple(line)] = (tuple(line),)

connections = []
for i in range(len(lines)):
    for j in range(i+1, len(lines)):
        connections.append((straight_line_dist_3d(lines[i], lines[j]), tuple(lines[i]), tuple(lines[j])))
connections.sort()
    
for i in range(len(connections)):
    dist, p1, p2 = connections[i]
    # check if clusters are different
    if point_to_cluster[p1] != point_to_cluster[p2]:
        cluster_1 = point_to_cluster[p1]
        cluster_2 = point_to_cluster[p2]
        merged_cluster = tuple(set(cluster_1).union(set(cluster_2)))
        
        clusters.remove(cluster_1)
        clusters.remove(cluster_2)
        
        clusters.add(merged_cluster)
        for point in merged_cluster:
            point_to_cluster[point] = merged_cluster
        if len(clusters) == 1:
            print(p1[0] * p2[0])
            break

    