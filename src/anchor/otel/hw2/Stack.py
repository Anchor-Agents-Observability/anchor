class Node:
    def __init__(self, data, next=None):
        self.data=data
        self.next=next

class Stack:
    def __init__(self):
        self.top=None

    def top(self) -> int:
        if(not self.top):
            return -1
        return self.top.data
    
    def push(self, x : int) -> None:
        if(not self.top):
            self.top = Node(x)
            return

        addthis = Node(x)
        addthis.next = self.top
        self.top = addthis  
        return
        
    
    def pop(self) -> int:
        assert(self.top)
        hold = self.top.data
        self.top = self.top.next
        return hold
    
    def isEmpty(self) -> bool:
        return not self.top
    
if __name__ == "__main__":

    stack = Stack()
    stack.push(0)
    stack.push(10)
    stack.push(20)
    stack.push(30)
    stack.pop()
    stack.pop()
    stack.pop()
    stack.pop()

    print(stack.isEmpty())
        