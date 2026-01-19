'''
time taken : 40 minutes

'''

class Node: 
    def __init__(self, data, next=None, prev=None):
        self.data = data
        self.next = next
        self.prev = prev

# creates new Node with data val at front; returns head. O(1) time.
def insertAtFront(head : Node, val : int) -> Node: 
    newNode = Node(val)
    if(not head):
        head = newNode
        return head

    newNode.next = head
    head.prev = newNode
    head = newNode
    return head

# creates new Node with data val at end; returns head. O(1) time.
def insertAtBack(head : Node, tail : Node, val : int) -> Node:
    if(not head):
        return insertAtFront(val)
    
    newNode = Node(val)
    tail.next = newNode
    newNode.prev = tail
    
    return head

# creates new Node with data val after Node loc; returns head. O(1) time.
def insertAfter(head, val, loc):
    if(not head):
        return None
    
    newNode = Node(val)
    walker = head
    while(walker.next):
        walker = walker.next

        if(walker == loc):
            newNode.next = walker.next
            walker.next.prev = newNode
            walker.next = newNode
            newNode.prev = walker


    return head
    
# creates new Node with data val before Node loc; returns head. O(1) time.
def insertBefore(head : Node, val : int, loc : Node):
    if(not head):
        return None    

    newNode = Node(val)
    if(head == loc):
        newNode.next = head
        head.prev = newNode
        head = newNode
        return head

    walker = head
    while(walker.next):
        walker = walker.next
        
        if(walker.next == loc):
            newNode.next = loc
            walker.next = newNode
            walker.next.prev = newNode
            newNode.prev = walker

    return head

# removes first Node; returns head. O(1) time.
def deleteFront(head : Node):
    if(not head):
        return None
    
    head = head.next
    head.prev = None
    return head


# removes last Node; returns head. O(1) time.
def deleteBack(head : Node, tail : Node):
    if(not head):
        return None
    elif(not head.next):
        head = None
        return None
    
    walker = head
    while(walker.next != tail):
        walker = walker.next
    
    tail.prev = None
    walker.next = None

    return head

# deletes Node loc; returns head. O(1) time.
def deleteNode(head : Node, loc : Node):
    if(not head):
        return None    
    elif(head == loc):
        return deleteFront(head)

    walker = head
    while(walker and walker.next):
        if(walker.next == loc):
            walker.next = loc.next
            if(walker.next):
                walker.next.prev = walker
            
            loc.prev = None
            loc.next = None
        walker = walker.next
        
        
    return head

# returns length of the list. O(n) time.
def length(head : Node) -> int:
    _size = 0
    walker = head
    while(walker):
        _size += 1
        walker = walker.next
    return _size

def getTail(head):
    walker = head
    while(walker and walker.next):
        walker = walker.next
    return walker

#  reverses the linked list iteratively. O(n) time.
def reverseIterative(head : Node) -> Node:
    
    if(head is None or head.next is None):
        return None
    
    previousNode = None
    currentNode = head

    # swap next and prev pointers
    while(currentNode is not None):
        previousNode = currentNode.prev
        currentNode.prev = currentNode.next
        currentNode.next = previousNode

        currentNode = currentNode.prev

    # return new head
    return previousNode.prev

# reverses the linked list recursively (Hint: you will need a helper function.)  O(n) time.
def reverseRecursive(head : Node) -> Node:

    # base case
    if(not head):
        return None

    #swap next and prev
    hold = head.prev
    head.prev = head.next
    head.next = hold  


    if(head.prev is None):
        return head
    
    return reverseRecursive(head.prev)

def printlist(head : Node):
    if(not head):
        print("|Empty List|")
    
    walker = head
    while(walker):
        if(walker.prev): print("<-", end=" ")
        print(walker.data, end=" ")
        if(walker.next): print("->", end=" ")

        walker = walker.next
    print("\n")

if __name__ == "__main__":

    head = None
    head = insertAtFront(head, 20)
    head = insertAtFront(head, 10)

    tail = getTail(head)

    head = insertAtBack(head, tail, 30)

    secondNode = head.next
    head = insertAfter(head, 25, secondNode) # insert after second node
    head = insertBefore(head, 0, head) # insert before the first node
    print("Size after inserting: ", length(head))
    printlist(head)

    head = reverseIterative(head)
    print("ReverseIterative: \n")
    printlist(head)

    head = reverseRecursive(head)
    print("ReverseRecursion: \n")
    printlist(head)

    tail = getTail(head)
    head = deleteBack(head, tail)
    print("Size after deleting: ", length(head))

    head = deleteFront(head)
    print("Size after deleting: ", length(head))
    printlist(head)

    second = head.next
    head = deleteNode(head, second)
    
    print("Size after deleting: ", length(head))
    printlist(head)
    print("~~~TEST DONE!~~~")