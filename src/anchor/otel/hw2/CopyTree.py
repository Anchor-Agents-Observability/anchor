# Question 7: CopyTree
# Given a binary tree, create a deep copy. 
# Return the root of the new tree.

'''
technique : Depth-first traversal Pre-order
time taken : 20 minutes
time : O(n)
space : O(n) 

copy root, copy left subtree, copy right subtree
'''

class TreeNode:
    def __init__(self, data, left=None, right=None):
        self.data = data
        self.left = None
        self.right = None

def copyTree(root : TreeNode) -> TreeNode:

    # base case
    if(not root):
        return None

    newRoot = TreeNode(root.data)
    newRoot.left = copyTree(root.left)
    newRoot.right = copyTree(root.right)
    return newRoot

def inorder(root : TreeNode):
    if(not root):
        return None
    
    inorder(root.left)
    print(root.data, end=' ')
    inorder(root.right)


root = TreeNode(50)
root.left = TreeNode(40)
root.right = TreeNode(100)
root.left.left = TreeNode(30)
root.left.right = TreeNode(45)
inorder(root)
print("\n")

copyRoot = copyTree(root)
inorder(copyRoot)