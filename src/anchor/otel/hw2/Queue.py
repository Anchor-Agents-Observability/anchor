

class Node:
    def __init__(self, data, next=None):
        self.data=data
        self.next=next

class Queue:
    def __init__(self, front=None, rear=None):
        self.front = front
        self.rear = rear
    
    # returns the first item in the queue. O(1) time.
    def peek(self) -> int: 
        if(not self.front):
            return -1
        return self.front.data
    
    # adds x to the back of the queue. O(1) time.
    def enqueue(self, x : int) -> None:
        if(self.front is None):
            self.front = Node(x)
            self.rear = self.front
            return
        
        addThis = Node(x)
        self.rear.next = addThis
        self.rear = addThis 


    # removes and returns the first item in the queue. O(1) time.
    def dequeue(self) -> int:
        if(not self.front):
            return -1
        elif(self.front == self.rear):
            hold = self.front.data
            self.front = None
            self.rear = None
            return hold
        else:
            self.front = self.front.next
            return self.front.data
                
    # returns a boolean indicating whether the queue is empty. O(1) time.
    def isEmpty(self) -> bool:
        return (self.front is None)

if __name__ == "__main__":
    queue = Queue()
    queue.enqueue(0)
    queue.enqueue(10)
    queue.enqueue(20)
    queue.enqueue(30)

    print("peeking : ", queue.peek())
    print("Dequeued : ", queue.dequeue())
    print("Dequeued : ", queue.dequeue())
    print("Dequeued : ", queue.dequeue())
    print("Dequeued : ", queue.dequeue())

    print("isEmpty : ", queue.isEmpty())