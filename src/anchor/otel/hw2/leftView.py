# Question 13: LeftView
# Given a binary tree, 
# create an array of the left view (leftmost elements in each level) of the tree.

'''
    uses deque and level-order traversal
    push to deque left and right childs
    take the first element in the deque.popleft()

    time taken : 40 minutes
    time : O(n)
    space : O(n) for deque and arraylist
'''

class TreeNode:
    def __init__(self, data, left=None, right=None):
        self.data = data
        self.left = None
        self.right = None

from collections import deque

def leftView(root : TreeNode) -> list:

    result = []

    if(not root):
        return result
    
    que = deque([root]) 

    while(que):
        
        _levels = len(que)
        
        for i in range(_levels):

            curr = que.popleft()    

            # first node
            if(i == 0):
                result.append(curr.data)

            if(curr.left):
                que.append(curr.left)
                
            if(curr.right):
                que.append(curr.right)
    return result

root = TreeNode(7)
root.left = TreeNode(8)
root.right = TreeNode(3)

root.left.left = TreeNode(13)

root.right.left = TreeNode(9)
root.right.left.left = TreeNode(20)

root.right.right = TreeNode(6)
root.right.right.left = TreeNode(14)
root.right.right.left.right = TreeNode(15)

print(leftView(root))


root = TreeNode(7)
root.left = TreeNode(20)
root.right = TreeNode(4)

root.left.left = TreeNode(15)
root.left.right = TreeNode(6)

root.right.right = TreeNode(11)
root.right.left = TreeNode(8)

print(leftView(root))

    