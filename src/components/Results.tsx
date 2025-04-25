
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useApp } from "@/contexts/AppContext";

const Results = () => {
  const { elections, getElectionResults } = useApp();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const preSelectedId = queryParams.get("id");
  
  const [selectedElection, setSelectedElection] = useState<string | null>(preSelectedId || null);
  const [results, setResults] = useState<any[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  
  const completedElections = elections.filter((e) => e.status === "completed");
  
  useEffect(() => {
    if (selectedElection) {
      const electionResults = getElectionResults(selectedElection);
      setResults(electionResults);
      
      const votesSum = electionResults.reduce((sum, candidate) => sum + candidate.votes, 0);
      setTotalVotes(votesSum);
    } else {
      setResults([]);
      setTotalVotes(0);
    }
  }, [selectedElection, getElectionResults]);
  
  // If an election ID was provided in URL but it's not in the completed list
  useEffect(() => {
    if (preSelectedId && !completedElections.some(e => e.id === preSelectedId)) {
      setSelectedElection(null);
    }
  }, [preSelectedId, completedElections]);
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Election Results</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Results</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="election-select">Select Election</Label>
            <Select 
              value={selectedElection || ""} 
              onValueChange={setSelectedElection}
            >
              <SelectTrigger id="election-select">
                <SelectValue placeholder="Select an election" />
              </SelectTrigger>
              <SelectContent>
                {completedElections.length === 0 ? (
                  <SelectItem value="" disabled>
                    No completed elections
                  </SelectItem>
                ) : (
                  completedElections.map((election) => (
                    <SelectItem key={election.id} value={election.id}>
                      {election.title}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          {selectedElection ? (
            results.length > 0 ? (
              <div className="space-y-6">
                <div className="text-sm text-gray-500">
                  Total votes: {totalVotes}
                </div>
                
                {results.map((candidate, index) => {
                  const percentage = totalVotes > 0 
                    ? Math.round((candidate.votes / totalVotes) * 100) 
                    : 0;
                  
                  return (
                    <div key={candidate.id} className="space-y-2">
                      <div className="flex justify-between">
                        <div>
                          <span className="font-medium">{candidate.name}</span>
                          <span className="text-sm text-gray-500 ml-2">
                            ({candidate.position})
                          </span>
                        </div>
                        <div className="font-medium">
                          {candidate.votes} votes ({percentage}%)
                        </div>
                      </div>
                      
                      <Progress 
                        value={percentage} 
                        className={
                          index === 0 ? "bg-election-success h-3" : "bg-election-primary h-3"
                        }
                      />
                    </div>
                  );
                })}
                
                {results.length > 0 && (
                  <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Winner</h3>
                    <div className="flex items-center">
                      <div className="h-4 w-4 rounded-full bg-election-success mr-2" />
                      <span className="font-bold text-xl">{results[0].name}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {results[0].votes} votes ({Math.round((results[0].votes / totalVotes) * 100)}%)
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No candidates found for this election.</p>
              </div>
            )
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {completedElections.length === 0
                  ? "No completed elections available yet."
                  : "Select an election to view results."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Results;
