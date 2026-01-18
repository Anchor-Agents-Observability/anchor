class TreeNode:
    def __init__(self, data, left=None, right=None):
        self.data = data
        self.left = None
        self.right = None
    
class BinarySearchTree:
    def __init__(self):
        self.root = None

    # returns the minimum value in the BST.  O(logn) time.
    def min(self):
        if(not self.root):
            return None
        
        curr = self.root
        while(curr.left):
            curr = curr.left

        return curr.data
    
    # returns the maximum value in the BST.  O(logn) time.
    def max(self):
        if(not self.root):
            return None

        curr = self.root
        while(curr.right):
            curr = curr.right
        
        return curr.data

    # returns a boolean indicating whether val is present in the BST.  O(logn) time.
    def contains(self, val):
        curr = self.root
        while(curr):
            if(curr.data == val):
                return True
            elif(val < curr.data):
                curr = curr.left
            else:
                curr = curr.right
        return False

# creates a new Node with data val in the appropriate location.   
# For simplicity, do not allow duplicates. If val is already 
# present, insert is a no-op. O(logn) time.
    def insert(self, val):
        
        def insert_helper(root, val):
            if(not root):
                return TreeNode(val)
            
            if(val == root.data):
                # do nothing
                return 
            elif(val < root.data):
                root.left = insert_helper(root.left, val) 
            elif(val > root.data):
                root.right = insert_helper(root.right, val)
            return root
        
        self.root = insert_helper(self.root, val)
        
    # deletes the Node with data val, if it exists. O(logn) time
    # case1 : leaf node
    # case2 : single child node
    # case3 : node with both child 
    def delete(self, val):

        def get_successor(root):
            while(root.left):
                root = root.left

            return root
        
        def delete_recursive(root, val):

            if(not root):
                return None
            elif(val < root.data):
                root.left = delete_recursive(root.left, val)
            elif(val > root.data):
                root.right = delete_recursive(root.right, val)
            else:

                # check single child
                if(not root.left):
                    return root.right
                if(not root.right):
                    return root.left
                
                successor = get_successor(root.right) # get leftmostm child of right subtree
                root.data = successor.data # swap 
                root.right = delete_recursive(root.right, successor.data) #delete

            return root


        
        self.root = delete_recursive(self.root, val)
    
    def printTree(self):
        self._printTree(self.root)

    def _printTree(self, root):
        # base case 
        if(not root):
            return 
        
        self._printTree(root.left)
        print(root.data)
        self._printTree(root.right)

if __name__ == "__main__":
    bst = BinarySearchTree()
    bst.insert(10)
    bst.insert(20)
    bst.insert(0)
    bst.insert(5)
    bst.printTree()

    bst.delete(0)
    bst.printTree()


