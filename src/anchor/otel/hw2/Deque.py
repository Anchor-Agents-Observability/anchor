class Node:
    def __init__(self, data, next=None, prev=None):
        self.data= data
        self.next= next
        self.prev= prev

class Deque:
    def __init__(self, _front=None, _back=None):
        self._front = _front
        self._back = _back

    # returns the first item in the deque. O(1) time.
    def getfront(self) -> int:
        return self._front.data
    
    # returns the last item in the deque. O(1) time.
    def getback(self) -> int:
        return self._back.data
    
    # adds x to the back of the deque. O(1) time.
    def pushBack(self, x : int) -> None:
        newNode = Node(x)

        if(self._back):
            self._back.next = newNode
            newNode.prev = self._back
            self._back = newNode
            return
        else:
            self._front = newNode
            self._back = newNode
            return 
        
    
    # adds x to the front of the deque. O(1) time.
    def pushFront(self, x : int):

        newNode = Node(x)

        if(self._front):
            newNode.next = self._front
            self._front.prev = newNode
            self._front = newNode
            return
        else:   
            self._front = newNode
            self._back = newNode
            return 

    # removes and returns the first item in the deque. O(1) time.
    def popFront(self) -> int:
        if(not self._front):
            return None
        elif(self._front == self._back):
            self._front = None
            self._back = None
            return -1
        else:
            hold = self._front.data
            self._front = self._front.next
            self._front.prev = None
            return hold
    
    # removes and returns the last item in the deque. O(1) time.
    def popBack(self) -> int:
        if(not self._front):
            return None
        elif(self._front == self._back):
            self._front = None
            self._back = None
            return -1
        else:
            hold = self._back.data
            self._back = self._back.prev
            self._back.next = None
            return hold
    
    # returns a boolean indicating whether the deque is empty. O(1) time.
    def isEmpty(self) -> bool:
        return (self._front is None)
        
if __name__ == "__main__":

    deque = Deque()
    deque.pushBack(10)
    deque.pushFront(0)
    deque.pushBack(20)
    deque.pushBack(30)
    print(deque.getfront())
    print(deque.getback())
    deque.popBack()
    deque.popFront()
    deque.popFront()
    deque.popBack()
    print(deque.isEmpty())