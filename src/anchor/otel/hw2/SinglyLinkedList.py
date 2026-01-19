'''
time taken : 30 minutes
assumed val as int and loc as node not an int value
'''

class Node: 
    def __init__(self, data, next= None):
        self.data = data
        self.next = next

# creates new Node with data val at front; returns head. O(1) time.
def insertAtFront(head : Node, val : int) -> Node:
    newNode = Node(val)
    if(not head):
        head = newNode
        return head

    newNode.next = head
    head = newNode
    return head

# creates new Node with data val at end; returns head. O(n) time.
def insertAtBack(head : Node, val : int) -> Node:
    if(not head):
        return insertAtFront(val)

    walker = head
    while(walker.next):
        walker = walker.next
    
    newNode = Node(val)
    walker.next = newNode
    return head

# creates new Node with data val after Node loc; returns head. O(1) time.
def insertAfter(head : Node, val : int, loc : Node) -> Node:
    if(not head):
        return None
    
    newNode = Node(val)
    walker = head
    while(walker.next):
        walker = walker.next

        if(walker == loc):
            newNode.next = walker.next
            walker.next = newNode

    return head
    
# creates new Node with data val before Node loc; returns head. O(n) time.
def insertBefore(head : Node, val : int, loc : Node):
    if(not head):
        return None    

    newNode = Node(val)
    if(head == loc):
        newNode.next = head
        head = newNode
        return head

    walker = head
    while(walker.next):
        walker = walker.next
        
        if(walker.next == loc):
            newNode.next = loc
            walker.next = newNode
    return head

# removes first Node; returns head. O(1) time.
def deleteFront(head : Node):
    if(not head):
        return None
    
    return head.next

# removes last Node; returns head. O(n) time.
def deleteBack(head : Node):
    if(not head):
        return None
    elif(not head.next):
        head = None
        return None
    
    walker = head
    prev = None
    while(walker.next):
        prev = walker
        walker = walker.next
    
    prev.next = None
    return head

# deletes Node loc; returns head. O(n) time.
def deleteNode(head : Node, loc : Node):
    if(not head):
        return None
    elif(head == loc):
        return deleteFront(head)

    walker = head
    while(walker.next):
        if(walker.next == loc):
            walker.next = walker.next.next
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

# reverses the linked list iteratively. O(n) time.
def reverseIterative(head : Node) -> Node:
    if(not head):
        return None
    prev = None
    curr = head
    while(curr):
        hold = curr.next
        curr.next = prev
        prev = curr
        curr = hold
    return prev

# reverses the linked list recursively (Hint: you will need a helper function.) O(n) time.
def reverseRecursive(head : Node) -> Node:
    
    # base case
    if(head is None or head.next is None):
        return head

    answer = reverseRecursive(head.next)
    
    head.next.next = head
    head.next = None

    return answer

def printlist(head : Node):
    if(not head):
        print("|Empty List|")
    
    walker = head
    while(walker):
        print(f"{walker.data}->|", end="")
        walker = walker.next


if __name__ == "__main__":

    head = None
    head = insertAtFront(head, 20)
    head = insertAtFront(head, 10)
    head = insertAtBack(head, 30)
    print("Size after inserting: ", length(head))
    printlist(head)

    print("\nTESTING REVERSE")
    head = reverseIterative(head)
    printlist(head)
    print("\nTESTING REVERSE")
    head = reverseRecursive(head)
    printlist(head)

    secondNode = head.next
    head = insertAfter(head, 25, secondNode) # insert after second node
    head = insertBefore(head, 0, head) # insert before the first node

    head = deleteBack(head)
    secondNode = head.next
    first = head 
    head = deleteNode(head, secondNode)
    head = deleteNode(head, first)
    head = deleteFront(head)
    head = deleteFront(head)
    print("\nSize after deleting: ", length(head))

    printlist(head)
    print("~~~TEST DONE!~~~")

