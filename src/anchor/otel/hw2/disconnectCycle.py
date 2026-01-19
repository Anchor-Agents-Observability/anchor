# Question 12: DisconnectCycle
# Given a singly linked list, disconnect the cycle, if one exists.
'''
time taken : 30 minutes
time : O(n)
space : O(1)
'''
class Node: 
    def __init__(self, data, next= None, prev=None):
        self.data = data
        self.next = next
        self.prev = prev

def disconnectCycle(head : Node) -> Node:

    slow, fast = head, head

    while(fast and fast.next):
        slow = slow.next
        fast = fast.next.next

        if(slow == fast):
            slow = head # reset
            while(slow != fast):
                slow = slow.next
                fast = fast.next

            # find the node before beginning of cycle 
            ptr = slow
            while(ptr.next != slow):
                ptr = ptr.next
            
            ptr.next = None
    return head

def printlist(head : Node):
    if(not head):
        print("|Empty List|")
    
    walker = head
    while(walker):
        print(f"{walker.data}->|", end="")
        walker = walker.next

head = Node(10)
node2 = Node(18)
node3 = Node(12)
node4 = Node(9)
node5 = Node(11)
node6 = Node(4)

head.next = node2
node2.next = node3
node3.next = node4
node4.next = node5
node5.next = node6
node6.next = node3

head = disconnectCycle(head)
printlist(head)
