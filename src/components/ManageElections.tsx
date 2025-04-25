
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";

const ManageElections = () => {
  const { currentUser, elections, addElection, updateElectionStatus } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
  });

  // Check if user is admin
  if (currentUser?.role !== "admin") {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg text-red-500">
          You do not have permission to access this page.
        </p>
      </div>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title || !formData.description || !formData.startDate || !formData.endDate) {
      toast.error("All fields are required");
      return;
    }
    
    // Validate dates
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const now = new Date();
    
    if (startDate < now) {
      toast.error("Start date cannot be in the past");
      return;
    }
    
    if (endDate <= startDate) {
      toast.error("End date must be after start date");
      return;
    }
    
    addElection(
      formData.title,
      formData.description,
      formData.startDate,
      formData.endDate
    );
    
    // Reset form and close dialog
    setFormData({
      title: "",
      description: "",
      startDate: "",
      endDate: "",
    });
    
    setIsDialogOpen(false);
  };

  const handleStatusUpdate = (electionId: string, status: "upcoming" | "active" | "completed") => {
    updateElectionStatus(electionId, status);
  };

  // Format date string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Manage Elections</h1>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-election-primary hover:bg-election-secondary">
              Create New Election
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Election</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Election Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter election title"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter election description"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <Button type="submit" className="w-full bg-election-primary">
                Create Election
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {elections.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-gray-500">
              No elections created yet. Create your first election.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Elections</CardTitle>
          </CardHeader>
          
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              
              <TableBody>
                {elections.map((election) => (
                  <TableRow key={election.id}>
                    <TableCell className="font-medium">{election.title}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          election.status === "active"
                            ? "bg-election-success"
                            : election.status === "upcoming"
                            ? "bg-election-secondary"
                            : "bg-gray-500"
                        }
                      >
                        {election.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(election.startDate)}</TableCell>
                    <TableCell>{formatDate(election.endDate)}</TableCell>
                    <TableCell className="text-right space-x-2">
                      {election.status === "upcoming" && (
                        <Button
                          size="sm"
                          className="bg-election-success hover:bg-green-600"
                          onClick={() => handleStatusUpdate(election.id, "active")}
                        >
                          Start Election
                        </Button>
                      )}
                      
                      {election.status === "active" && (
                        <Button
                          size="sm"
                          className="bg-gray-500 hover:bg-gray-600"
                          onClick={() => handleStatusUpdate(election.id, "completed")}
                        >
                          End Election
                        </Button>
                      )}
                      
                      {election.status === "completed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.location.href = `/results?id=${election.id}`}
                        >
                          View Results
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ManageElections;
