"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { userService } from "@/lib/services/user.service";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomModal } from "@/components/ui/custom-modal";

interface CustomEditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CustomEditProfileModal({ isOpen, onClose }: CustomEditProfileModalProps) {
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
      
      // Don't proceed if there are no changes
      if (Object.keys(changes).length === 0) {
        addToast({
          title: "No changes to save",
          description: "Please make changes before updating your profile",
          type: "warning"
        });
        setIsSubmitting(false);
        return;
      }
      
      // Update profile directly without OTP
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
      
      // More descriptive error message based on error type
      let errorMessage = "Please try again later";
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Handle specific error cases
        if (errorMessage.includes("password")) {
          errorMessage = "Password doesn't meet requirements. It should be at least 8 characters.";
        }
      }
      
      addToast({
        title: "Failed to update profile",
        description: errorMessage,
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
    <CustomModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Profile"
      width="500px"
    >
      <div className="space-y-5">
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
        
        <div className="flex justify-end gap-3 pt-4 mt-6">
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
        </div>
      </div>
    </CustomModal>
  );
} 