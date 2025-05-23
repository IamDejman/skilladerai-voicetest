import React, { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2, Plus, FileText, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Interface for Typing Text
interface TypingText {
  id: number;
  text: string;
  category: string;
  difficulty: number;
  createdAt: string;
  updatedAt: string;
}

// Interface for form input
interface TypingTextForm {
  text: string;
  category: string;
  difficulty: number;
}

const TypingTexts = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [typingTexts, setTypingTexts] = useState<TypingText[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<TypingTextForm>({
    text: "",
    category: "general",
    difficulty: 1,
  });
  const [currentTextId, setCurrentTextId] = useState<number | null>(null);

  // Fetch typing texts
  const fetchTypingTexts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/typing-texts");
      if (!response.ok) {
        throw new Error("Failed to fetch typing texts");
      }
      const data = await response.json();
      setTypingTexts(data);
    } catch (error) {
      console.error("Error fetching typing texts:", error);
      toast({
        title: "Error",
        description: "Failed to load typing texts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load typing texts on component mount
  useEffect(() => {
    fetchTypingTexts();
  }, []);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "difficulty" ? parseInt(value) : value,
    });
  };

  // Handle category select change
  const handleCategoryChange = (value: string) => {
    setFormData({
      ...formData,
      category: value,
    });
  };

  // Handle difficulty select change
  const handleDifficultyChange = (value: string) => {
    setFormData({
      ...formData,
      difficulty: parseInt(value),
    });
  };

  // Create new typing text
  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const response = await fetch("/api/typing-texts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to create typing text");
      }

      toast({
        title: "Success",
        description: "Typing text created successfully",
      });

      // Reset form and refresh data
      setFormData({
        text: "",
        category: "general",
        difficulty: 1,
      });
      fetchTypingTexts();
    } catch (error) {
      console.error("Error creating typing text:", error);
      toast({
        title: "Error",
        description: "Failed to create typing text. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Edit typing text
  const handleEdit = (text: TypingText) => {
    setCurrentTextId(text.id);
    setFormData({
      text: text.text,
      category: text.category,
      difficulty: text.difficulty,
    });
    setIsEditing(true);
  };

  // Update typing text
  const handleUpdate = async () => {
    if (!currentTextId) return;

    setIsCreating(true);
    try {
      const response = await fetch(`/api/typing-texts/${currentTextId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update typing text");
      }

      toast({
        title: "Success",
        description: "Typing text updated successfully",
      });

      // Reset form and refresh data
      setFormData({
        text: "",
        category: "general",
        difficulty: 1,
      });
      setCurrentTextId(null);
      setIsEditing(false);
      fetchTypingTexts();
    } catch (error) {
      console.error("Error updating typing text:", error);
      toast({
        title: "Error",
        description: "Failed to update typing text. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Delete typing text
  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/typing-texts/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete typing text");
      }

      toast({
        title: "Success",
        description: "Typing text deleted successfully",
      });

      // Refresh data
      fetchTypingTexts();
    } catch (error) {
      console.error("Error deleting typing text:", error);
      toast({
        title: "Error",
        description: "Failed to delete typing text. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Get difficulty label
  const getDifficultyLabel = (difficulty: number) => {
    switch (difficulty) {
      case 1:
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Easy</Badge>;
      case 2:
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Medium</Badge>;
      case 3:
        return <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">Hard</Badge>;
      case 4:
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Expert</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <AdminLayout>
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Typing Texts Management</h1>
            <p className="text-gray-500 dark:text-gray-400">Manage texts used in typing assessments</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-1">
                <Plus className="h-4 w-4" /> Add New Text
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Typing Text</DialogTitle>
                <DialogDescription>
                  Create a new text for typing assessments. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="text">Text Content</Label>
                  <Textarea
                    id="text"
                    name="text"
                    placeholder="Enter typing text content..."
                    rows={5}
                    value={formData.text}
                    onChange={handleInputChange}
                    className="resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={handleCategoryChange}
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="customer_service">Customer Service</SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="difficulty">Difficulty Level</Label>
                    <Select
                      value={formData.difficulty.toString()}
                      onValueChange={handleDifficultyChange}
                    >
                      <SelectTrigger id="difficulty">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Easy</SelectItem>
                        <SelectItem value="2">Medium</SelectItem>
                        <SelectItem value="3">Hard</SelectItem>
                        <SelectItem value="4">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleCreate} disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Please wait
                    </>
                  ) : (
                    "Save"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Dialog */}
          <Dialog open={isEditing} onOpenChange={(open) => !open && setIsEditing(false)}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Edit Typing Text</DialogTitle>
                <DialogDescription>
                  Update the typing text details. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-text">Text Content</Label>
                  <Textarea
                    id="edit-text"
                    name="text"
                    placeholder="Enter typing text content..."
                    rows={5}
                    value={formData.text}
                    onChange={handleInputChange}
                    className="resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={handleCategoryChange}
                    >
                      <SelectTrigger id="edit-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="customer_service">Customer Service</SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-difficulty">Difficulty Level</Label>
                    <Select
                      value={formData.difficulty.toString()}
                      onValueChange={handleDifficultyChange}
                    >
                      <SelectTrigger id="edit-difficulty">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Easy</SelectItem>
                        <SelectItem value="2">Medium</SelectItem>
                        <SelectItem value="3">Hard</SelectItem>
                        <SelectItem value="4">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdate} disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Please wait
                    </>
                  ) : (
                    "Update"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Typing Texts</CardTitle>
            <CardDescription>
              All available texts for typing assessments. You can add, edit, or delete texts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-gray-500">Loading texts...</span>
              </div>
            ) : typingTexts.length === 0 ? (
              <div className="text-center py-8 border rounded-md bg-gray-50 dark:bg-gray-800">
                <FileText className="h-12 w-12 mx-auto text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No typing texts</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Get started by creating a new typing text for assessments.
                </p>
                <div className="mt-6">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" /> Add New Text
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      {/* Form content (duplicate from above) */}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Text Preview</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {typingTexts.map((text) => (
                      <TableRow key={text.id}>
                        <TableCell className="font-medium">{text.id}</TableCell>
                        <TableCell className="max-w-sm truncate">
                          {text.text.substring(0, 60)}...
                        </TableCell>
                        <TableCell className="capitalize">
                          {text.category.replace("_", " ")}
                        </TableCell>
                        <TableCell>
                          {getDifficultyLabel(text.difficulty)}
                        </TableCell>
                        <TableCell>{formatDate(text.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(text)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete this
                                    typing text and remove it from the system.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(text.id)}
                                    className="bg-red-500 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default TypingTexts;