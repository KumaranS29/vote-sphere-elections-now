
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/contexts/AppContext";

const ElectionDetails = () => {
  const { elections, candidates, currentUser } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const electionId = queryParams.get("id");
  
  const [election, setElection] = useState<any | null>(null);
  const [electionCandidates, setElectionCandidates] = useState<any[]>([]);
  
  useEffect(() => {
    if (!electionId) {
      navigate("/elections");
      return;
    }
    
    const foundElection = elections.find((e) => e.id === electionId);
    
    if (!foundElection) {
      navigate("/elections");
      return;
    }
    
    setElection(foundElection);
    
    const relevantCandidates = candidates.filter((c) => c.electionId === electionId);
    setElectionCandidates(relevantCandidates);
    
  }, [electionId, elections, candidates, navigate]);
  
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
  
  if (!election) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg text-gray-500">Loading...</p>
      </div>
    );
  }
  
  const canVote = 
    currentUser?.role === "voter" && 
    election.status === "active";
    
  const canApply = 
    currentUser?.role === "candidate" && 
    election.status === "upcoming" &&
    !candidates.some(c => c.userId === currentUser.id && c.electionId === election.id);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">{election.title}</h1>
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
      
      <Card>
        <CardHeader>
          <CardTitle>Election Details</CardTitle>
          <CardDescription>
            {formatDate(election.startDate)} - {formatDate(election.endDate)}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <p className="text-gray-700 whitespace-pre-line mb-6">
            {election.description}
          </p>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Candidates</h3>
            
            {electionCandidates.length === 0 ? (
              <p className="text-gray-500">No candidates yet for this election.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {electionCandidates.map((candidate) => (
                  <Card key={candidate.id}>
                    <CardContent className="p-4">
                      <div className="font-medium">{candidate.name}</div>
                      <div className="text-sm text-gray-500">{candidate.position}</div>
                      
                      {election.status === "completed" && (
                        <div className="mt-2">
                          <Badge variant="outline">{candidate.votes} votes</Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
          
          <div className="mt-8 flex justify-between">
            <Button variant="outline" onClick={() => navigate("/elections")}>
              Back to Elections
            </Button>
            
            {canVote && (
              <Button 
                className="bg-election-primary"
                onClick={() => navigate(`/vote?id=${election.id}`)}
              >
                Vote Now
              </Button>
            )}
            
            {canApply && (
              <Button 
                className="bg-election-primary"
                onClick={() => navigate(`/elections`)}
              >
                Apply as Candidate
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ElectionDetails;
