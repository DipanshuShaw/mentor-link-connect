
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User } from "@/contexts/AuthContext";
import { getUsers } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Edit, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import AddUserDialog from "./AddUserDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ManageUsers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  
  const queryClient = useQueryClient();
  
  const { data: usersResponse, isLoading, error } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers
  });

  const users = usersResponse?.data || [];
  
  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mock mutation for adding a user
  const addUserMutation = useMutation({
    mutationFn: (newUser: Omit<User, "id">) => {
      // In a real app, this would be an API call to your backend
      const mockNewUser = {
        ...newUser,
        id: (users.length + 1).toString()
      };
      
      // Here we're just returning the mockNewUser as if it was from an API
      return Promise.resolve({ data: mockNewUser, success: true });
    },
    onSuccess: (response) => {
      // Update the cache with new user
      queryClient.setQueryData(["users"], (oldData: any) => ({
        ...oldData,
        data: [...(oldData?.data || []), response.data]
      }));
      toast.success(`User ${response.data.name} added successfully`);
    }
  });

  // Mock mutation for deleting a user
  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => {
      // In a real app, this would be an API call to your backend
      return Promise.resolve({ success: true });
    },
    onSuccess: (_, userId) => {
      // Update the cache by removing deleted user
      queryClient.setQueryData(["users"], (oldData: any) => ({
        ...oldData,
        data: (oldData?.data || []).filter((user: User) => user.id !== userId)
      }));
      const deletedUser = users.find(u => u.id === userId);
      toast.success(`User ${deletedUser?.name || ''} deleted successfully`);
    }
  });

  const handleAddUser = (newUser: Omit<User, "id">) => {
    addUserMutation.mutate(newUser);
  };

  const handleEditUser = (user: User) => {
    toast.info(`Edit user functionality for ${user.name} will be implemented soon`);
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
  };

  const confirmDeleteUser = () => {
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete.id);
      setUserToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p>Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-red-500">Error loading users</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Users</h1>
        <Button onClick={() => setAddUserDialogOpen(true)} className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          <span>Add User</span>
        </Button>
      </div>
      
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="border rounded-md">
        <Table>
          <TableCaption>List of all users in the system</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === "admin" 
                        ? "bg-purple-100 text-purple-800" 
                        : user.role === "mentor"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                    }`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditUser(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteUser(user)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add User Dialog */}
      <AddUserDialog 
        open={addUserDialogOpen} 
        onOpenChange={setAddUserDialogOpen} 
        onAddUser={handleAddUser}
      />

      {/* Delete User Confirmation */}
      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user
              "{userToDelete?.name}" and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteUser} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManageUsers;
