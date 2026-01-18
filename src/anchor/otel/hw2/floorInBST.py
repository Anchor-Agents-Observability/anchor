# Question 14: FloorInBST
# Given a target numeric value and a binary search tree, 
# return the floor (greatest element less than or equal to the target) in the BST.

'''
technique : Search binary search tree (BST)
time taken : 30 minutes
time : O(n)
space : O(1)
'''

class TreeNode:
    def __init__(self, data, left=None, right=None):
        self.data = data
        self.left = left
        self.right = right
    
def floorInBST(root : TreeNode, val : int) -> TreeNode:
    if(not root):
        return None

    floor = None
    curr = root

    while(curr):
        if(curr.data == val):
            return val
        elif(val < curr.data): 
            curr = curr.left
        else:
            floor = curr.data
            curr = curr.right

    return floor


root = TreeNode(10)
leveloneleft = TreeNode(8)
leveloneright = TreeNode(16)

leveltwoleftright = TreeNode(9)
leveltworightleft = TreeNode(13)
leveltworightright = TreeNode(17)

levelthreeright = TreeNode(20)

root.left = leveloneleft
root.right = leveloneright
leveloneleft.right = leveltwoleftright
leveloneright.left = leveltworightleft
leveloneright.right = leveltworightright
leveltworightright.right = levelthreeright

print(floorInBST(root, 13))
print(floorInBST(root, 15))