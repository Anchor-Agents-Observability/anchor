# Question 11: IsPalindrome
# Given a doubly linked list, determine if it is a palindrome.
'''
technique: Doubly linked list forward-backward two-pointer
time taken : 25 minutes 
time : O(n)
space : O(1)
'''
class Node: 
    def __init__(self, data, next= None, prev=None):
        self.data = data
        self.next = next
        self.prev = prev

def isPalindrome(head : Node) -> bool:

    previous = head
    while(previous.next):
        previous = previous.next
    
    curr = head
    while(previous.prev and curr.next):
        if(previous.data != curr.data):
            return False
        previous = previous.prev
        curr = curr.next
    
    return True


def printlist(head : Node):
    if(not head):
        print("|Empty List|")
    
    walker = head
    while(walker):
        print(f"{walker.data}->|", end="")
        walker = walker.next

head = Node(9)

second = Node(2)
head.next = second
second.prev = head

third = Node(4)
second.next = third
third.prev = second

fourth = Node(2)
third.next = fourth
fourth.prev = third


fifth = Node(9)
fourth.next = fifth
fifth.prev = fourth

printlist(head)
print(isPalindrome(head))

head = Node(9)

second = Node(12)
head.next = second
second.prev = head

third = Node(4)
second.next = third
third.prev = second

fourth = Node(2)
third.next = fourth
fourth.prev = third


fifth = Node(9)
fourth.next = fifth
fifth.prev = fourth

printlist(head)
print(isPalindrome(head))