"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { userService } from "@/lib/services/user.service";
import { useToast } from "@/components/ui/toast";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();
  
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle profile update directly without OTP verification
  const handleUpdateProfile = async () => {
    // Check if any changes were made
    if (name === user?.name && !password) {
      addToast({
        title: "No changes to save",
        description: "Please make changes before updating your profile",
        type: "warning"
      });
      return;
    }
    
    // Validate name if it was changed
    if (name !== user?.name && !name.trim()) {
      addToast({
        title: "Name cannot be empty",
        type: "error"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Only include changed fields
      const changes: any = {};
      
      if (name !== user?.name) {
        changes.name = name.trim();
      }
      
      if (password) {
        changes.password = password;
      }
      
      // Update profile directly
      const updatedUser = await userService.updateProfile(changes);
      
      // Update auth context with new user data
      updateUser(updatedUser);
      
      addToast({
        title: "Profile updated successfully",
        type: "success"
      });
      
      // Reset form and close modal
      handleClose();
    } catch (error) {
      console.error("Error updating profile:", error);
      addToast({
        title: "Failed to update profile",
        description: error instanceof Error ? error.message : "Please try again",
        type: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset form state
    setName(user?.name || "");
    setPassword("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-[999] bg-black/40 backdrop-blur-[1px]" />
        <DialogContent 
          className="fixed left-[50%] top-[50%] z-[1000] w-full translate-x-[-50%] translate-y-[-50%] rounded-lg border-2 border-gray-200 bg-white p-6 shadow-lg focus:outline-none sm:max-w-[500px] max-h-[90vh] overflow-y-auto"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl font-semibold">Edit Profile</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-10"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                value={email}
                disabled
                className="w-full h-10 bg-muted"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-sm font-medium">
                New Password
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-10"
                placeholder="Leave blank to keep current password"
              />
            </div>

            <div className="mt-3 pt-1">
              <p className="text-sm text-muted-foreground">
                You can change just your name, just your password, or both.
              </p>
            </div>
          </div>
          
          <DialogFooter className="flex justify-end gap-3 pt-4 mt-2">
            <Button variant="outline" onClick={handleClose} className="min-w-[100px]">
              Cancel
            </Button>
            
            <Button 
              onClick={handleUpdateProfile} 
              disabled={isSubmitting}
              className="min-w-[140px]"
            >
              {isSubmitting ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></span>
                  Updating...
                </>
              ) : (
                "Update Profile"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
} 