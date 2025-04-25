
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/contexts/AppContext";

const CandidateApplications = () => {
  const { currentUser, elections, candidates } = useApp();
  
  if (!currentUser || currentUser.role !== "candidate") {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg text-red-500">
          You do not have permission to access this page.
        </p>
      </div>
    );
  }
  
  const userApplications = candidates.filter((c) => c.userId === currentUser.id);
  
  // Get election details for each application
  const applicationsWithDetails = userApplications.map((application) => {
    const election = elections.find((e) => e.id === application.electionId);
    return {
      ...application,
      electionTitle: election ? election.title : "Unknown Election",
      electionStatus: election ? election.status : "unknown",
    };
  });
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">My Applications</h1>
      
      {applicationsWithDetails.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-gray-500">
              You haven't applied for any elections yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Your Election Applications</CardTitle>
          </CardHeader>
          
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Election</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Votes</TableHead>
                </TableRow>
              </TableHeader>
              
              <TableBody>
                {applicationsWithDetails.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell className="font-medium">
                      {application.electionTitle}
                    </TableCell>
                    <TableCell>{application.position}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          application.electionStatus === "active"
                            ? "bg-election-success"
                            : application.electionStatus === "upcoming"
                            ? "bg-election-secondary"
                            : "bg-gray-500"
                        }
                      >
                        {application.electionStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {application.electionStatus === "completed"
                        ? `${application.votes} votes`
                        : "-"}
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

export default CandidateApplications;
