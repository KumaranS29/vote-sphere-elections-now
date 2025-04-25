
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";

const Dashboard = () => {
  const { currentUser, elections } = useApp();
  const navigate = useNavigate();
  
  // Count active and upcoming elections
  const activeElections = elections.filter((e) => e.status === "active").length;
  const upcomingElections = elections.filter((e) => e.status === "upcoming").length;
  const completedElections = elections.filter((e) => e.status === "completed").length;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">
        Welcome, {currentUser?.name}
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stats cards */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Active Elections</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-election-primary">{activeElections}</p>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate("/elections")}
            >
              View Elections
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Upcoming Elections</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-election-secondary">{upcomingElections}</p>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate("/elections")}
            >
              View Elections
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Completed Elections</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-election-success">{completedElections}</p>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate("/results")}
            >
              View Results
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Quick actions based on user role */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-700">Quick Actions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {currentUser?.role === "admin" && (
            <Card>
              <CardHeader>
                <CardTitle>Administration</CardTitle>
                <CardDescription>Manage elections and monitor results</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  className="w-full bg-election-primary"
                  onClick={() => navigate("/manage-elections")}
                >
                  Manage Elections
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate("/results")}
                >
                  View All Results
                </Button>
              </CardContent>
            </Card>
          )}
          
          {currentUser?.role === "candidate" && (
            <Card>
              <CardHeader>
                <CardTitle>Candidate Actions</CardTitle>
                <CardDescription>Manage your election applications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  className="w-full bg-election-primary"
                  onClick={() => navigate("/my-applications")}
                >
                  My Applications
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate("/elections")}
                >
                  Apply for Elections
                </Button>
              </CardContent>
            </Card>
          )}
          
          {currentUser?.role === "voter" && (
            <Card>
              <CardHeader>
                <CardTitle>Voter Actions</CardTitle>
                <CardDescription>Cast your votes in active elections</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full bg-election-primary"
                  onClick={() => navigate("/elections")}
                >
                  Vote Now
                </Button>
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle>Election Results</CardTitle>
              <CardDescription>View results of completed elections</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate("/results")}
              >
                View Results
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
