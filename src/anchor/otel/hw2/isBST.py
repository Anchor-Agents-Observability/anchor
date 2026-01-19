# Question 8: IsBST
# Given a binary tree, determine if it is a binary search tree.

"""
time taken : 25 minutes
time : O(n)
space : O(n) 
"""
class TreeNode:
    def __init__(self, data, left=None, right=None):
        self.data = data
        self.left = None
        self.right = None

def isBST(root : TreeNode) -> bool:

    def validBST(root, low, high):
        
        # base case
        if(not root):
            return True
        
        # check
        if(not (low < root.data < high)):
            return False
        
        # left subtree and right subtree
        return validBST(root.left, low, root.data) and validBST(root.right, root.data, high)

    if(not root):
        return True
    
    return validBST(root, float('-inf'), float('inf'))


root = TreeNode(50)
root.left = TreeNode(40)
root.right = TreeNode(100)
root.left.left = TreeNode(30)
root.left.right = TreeNode(45)
print(isBST(root))