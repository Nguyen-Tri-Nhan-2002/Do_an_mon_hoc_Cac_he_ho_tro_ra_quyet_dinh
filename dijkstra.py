import heapq
class Graph:
    def __init__(self):
        self.graph = {}

    def add_vertex(self, vertex):
        if vertex not in self.graph:
            self.graph[vertex] = {}

    def add_edge(self, from_vertex, to_vertex, weight):
        if from_vertex not in self.graph:
            self.add_vertex(from_vertex)
        if to_vertex not in self.graph:
            self.add_vertex(to_vertex)
        self.graph[from_vertex][to_vertex] = weight
        self.graph[to_vertex][from_vertex] = weight  # Nếu đồ thị vô hướng

    # Thuật toán Dijkstra để tìm đường đi ngắn nhất
    def dijkstra(self, start):

        distances = {vertex: float('infinity') for vertex in self.graph}
        distances[start] = 0

        priority_queue = [(0, start)]  # (distance, vertex)

        while priority_queue:
            current_distance, current_vertex = heapq.heappop(priority_queue)
            
            if current_distance > distances[current_vertex]:
                continue
                
            for neighbor, weight in self.graph[current_vertex].items():
                distance = current_distance + weight

                if distance < distances[neighbor]:
                    distances[neighbor] = distance
                    heapq.heappush(priority_queue, (distance, neighbor))
        return distances

# Khởi tạo đồ thị và thêm các đỉnh, cạnh
graph = Graph()
graph.add_edge('A', 'B', 1)
graph.add_edge('A', 'C', 4)
graph.add_edge('B', 'C', 2)
graph.add_edge('B', 'D', 5)
graph.add_edge('C', 'D', 1)

# Tính toán đường đi ngắn nhất từ đỉnh 'A'
start_vertex = 'A'
distances = graph.dijkstra(start_vertex)

print(f"Khoảng cách từ đỉnh {start_vertex} đến các đỉnh khác:")
for vertex, distance in distances.items():
    print(f"{start_vertex} -> {vertex}: {distance}")
