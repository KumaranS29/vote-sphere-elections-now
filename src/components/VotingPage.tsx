
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";

const VotingPage = () => {
  const { currentUser, elections, candidates, castVote, hasVoted } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const electionId = queryParams.get("id");
  
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [election, setElection] = useState<any | null>(null);
  const [electionCandidates, setElectionCandidates] = useState<any[]>([]);
  
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    
    if (!electionId) {
      navigate("/elections");
      return;
    }
    
    const foundElection = elections.find((e) => e.id === electionId);
    
    if (!foundElection) {
      toast.error("Election not found");
      navigate("/elections");
      return;
    }
    
    setElection(foundElection);
    
    if (foundElection.status !== "active") {
      toast.error("This election is not currently active for voting");
      navigate("/elections");
      return;
    }
    
    if (currentUser.role !== "voter") {
      toast.error("Only voters can cast votes");
      navigate("/elections");
      return;
    }
    
    if (hasVoted(electionId, currentUser.id)) {
      toast.error("You have already voted in this election");
      navigate("/elections");
      return;
    }
    
    const relevantCandidates = candidates.filter(
      (c) => c.electionId === electionId
    );
    setElectionCandidates(relevantCandidates);
    
  }, [currentUser, electionId, elections, candidates, navigate, hasVoted]);
  
  const handleVote = () => {
    if (!selectedCandidate) {
      toast.error("Please select a candidate");
      return;
    }
    
    if (currentUser && electionId) {
      const success = castVote(electionId, selectedCandidate, currentUser.id);
      
      if (success) {
        navigate("/elections");
      }
    }
  };
  
  if (!election || electionCandidates.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg text-gray-500">Loading...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Cast Your Vote</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>{election.title}</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Select a Candidate</h2>
            
            <RadioGroup value={selectedCandidate || ""} onValueChange={setSelectedCandidate}>
              {electionCandidates.length === 0 ? (
                <p className="text-gray-500">No candidates available for this election.</p>
              ) : (
                electionCandidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="flex items-center space-x-2 border p-4 rounded-md mb-3 hover:bg-gray-50"
                  >
                    <RadioGroupItem value={candidate.id} id={candidate.id} />
                    <div className="flex-1">
                      <Label htmlFor={candidate.id} className="text-base font-medium">
                        {candidate.name}
                      </Label>
                      <p className="text-sm text-gray-500">{candidate.position}</p>
                    </div>
                  </div>
                ))
              )}
            </RadioGroup>
          </div>
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => navigate("/elections")}>
              Cancel
            </Button>
            
            <Button
              className="bg-election-primary"
              disabled={!selectedCandidate}
              onClick={handleVote}
            >
              Submit Vote
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VotingPage;
