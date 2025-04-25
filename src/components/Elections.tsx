
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useApp } from "@/contexts/AppContext";

const Elections = () => {
  const { currentUser, elections, candidates, applyForElection, hasVoted } = useApp();
  const navigate = useNavigate();
  
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [selectedElection, setSelectedElection] = useState<string | null>(null);
  const [position, setPosition] = useState("");

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Check if user has already applied for an election
  const hasApplied = (electionId: string) => {
    return candidates.some(
      (c) => c.userId === currentUser?.id && c.electionId === electionId
    );
  };

  const handleApply = (electionId: string) => {
    setSelectedElection(electionId);
    setApplyDialogOpen(true);
  };

  const submitApplication = () => {
    if (currentUser && selectedElection && position) {
      applyForElection(currentUser.id, selectedElection, position);
      setApplyDialogOpen(false);
      setPosition("");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Elections</h1>
      
      {elections.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-gray-500">
              No elections available at the moment.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {elections.map((election) => (
            <Card key={election.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50 border-b">
                <div className="flex justify-between items-start">
                  <CardTitle>{election.title}</CardTitle>
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
                </div>
                <CardDescription>
                  {formatDate(election.startDate)} - {formatDate(election.endDate)}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-4">
                <p className="text-gray-600">{election.description}</p>
                
                <div className="mt-4 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">
                      Candidates: 
                    </span>
                    <span>
                      {candidates.filter((c) => c.electionId === election.id).length}
                    </span>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="bg-gray-50 border-t p-4 flex justify-between">
                {election.status === "active" && currentUser?.role === "voter" && (
                  <Button
                    className={
                      hasVoted(election.id, currentUser.id)
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-election-primary"
                    }
                    disabled={hasVoted(election.id, currentUser.id)}
                    onClick={() => navigate(`/vote?id=${election.id}`)}
                  >
                    {hasVoted(election.id, currentUser.id) ? "Already Voted" : "Vote Now"}
                  </Button>
                )}
                
                {election.status === "upcoming" && currentUser?.role === "candidate" && (
                  <Button
                    className={
                      hasApplied(election.id)
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-election-primary"
                    }
                    disabled={hasApplied(election.id)}
                    onClick={() => handleApply(election.id)}
                  >
                    {hasApplied(election.id) ? "Applied" : "Apply as Candidate"}
                  </Button>
                )}
                
                {election.status === "completed" && (
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/results?id=${election.id}`)}
                  >
                    View Results
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  onClick={() => navigate(`/election-details?id=${election.id}`)}
                >
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* Application Dialog */}
      <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Apply as Candidate</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="position">Position/Role</Label>
              <Input
                id="position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="Enter position you are applying for"
              />
              <p className="text-xs text-gray-500">
                Specify the position or role you wish to run for in this election.
              </p>
            </div>
            
            <Button 
              className="w-full bg-election-primary" 
              onClick={submitApplication}
              disabled={!position}
            >
              Submit Application
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Elections;
