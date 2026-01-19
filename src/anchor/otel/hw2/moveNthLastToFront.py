# Question 10: MoveNthLastToFront
# Given a singly linked list, 
# move the nth from the last element to the front of the list.


'''
technique : Linked list fast-slow two-pointer
time taken : 15 minutes
time : O(n)
space : O(1)
'''

class Node: 
    def __init__(self, data, next= None):
        self.data = data
        self.next = next

def moveNthLastToFront(head : Node, k : int) -> Node:
   
    slow,fast = head,head
    for _ in range(k):
        fast = fast.next

    while(fast and fast.next):
        slow = slow.next
        fast = fast.next
    
    newHead = slow.next
    slow.next = slow.next.next
    newHead.next = head
    head = newHead

    return head


def printlist(head : Node):
    if(not head):
        print("|Empty List|")
    
    walker = head
    while(walker):
        print(f"{walker.data}->|", end="")
        walker = walker.next


head = Node(15)
head.next = Node(2)
head.next.next = Node(8)
head.next.next = Node(7)
head.next.next.next = Node(20)
head.next.next.next.next = Node(9)
head.next.next.next.next.next = Node(11)
head.next.next.next.next.next.next = Node(6)
head.next.next.next.next.next.next.next = Node(19)

head = moveNthLastToFront(head, 2)
printlist(head)

# 15, 2, 8, 7, 20, 9, 11, 6, 19
