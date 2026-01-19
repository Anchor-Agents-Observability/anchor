# Question 9: DedupSortedList
# Given a sorted singly linked list, remove any duplicates 
# so that no value appears more than once

'''
technique : linked list
time taken : 20 minutes
time : O(n)
space: O(1)
'''

class Node: 
    def __init__(self, data, next= None):
        self.data = data
        self.next = next

def dedupSortedList(head : Node) -> Node:

    curr = head

    while(curr and curr.next):
        if(curr.data == curr.next.data):
            curr.next = curr.next.next
        curr = curr.next
    
    return head

def printlist(head : Node):
    if(not head):
        print("|Empty List|")
    
    walker = head
    while(walker):
        print(f"{walker.data}->|", end="")
        walker = walker.next


head = Node(1)
head.next = Node(2)
head.next.next = Node(2)
head.next.next.next = Node(4)
head.next.next.next.next = Node(5)
head.next.next.next.next.next = Node(5)
head.next.next.next.next.next.next = Node(5)
head.next.next.next.next.next.next =Node(10)
head.next.next.next.next.next.next.next =Node(10)

printlist(head)
print('\n')
head = dedupSortedList(head)
printlist(head)
