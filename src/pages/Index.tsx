
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Vote, CheckCircle, UserCheck } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="bg-election-primary text-white">
        <div className="container mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 md:pr-8 mb-8 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              VoteSphere - Modern Election Platform
            </h1>
            <p className="text-lg mb-8">
              A secure and transparent platform for organizing and participating in elections.
              Register as a voter or candidate and take part in the democratic process.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg" 
                className="bg-white text-election-primary hover:bg-gray-100"
                onClick={() => navigate("/register")}
              >
                Register Now
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-election-secondary"
                onClick={() => navigate("/login")}
              >
                Login
              </Button>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="rounded-lg bg-election-secondary p-4 md:p-8">
              <Vote size={200} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 border rounded-lg shadow-sm text-center">
            <div className="flex justify-center mb-4">
              <Vote className="h-12 w-12 text-election-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Secure Voting</h3>
            <p className="text-gray-600">
              Cast your vote securely in active elections with a
              simple and transparent process.
            </p>
          </div>
          
          <div className="p-6 border rounded-lg shadow-sm text-center">
            <div className="flex justify-center mb-4">
              <UserCheck className="h-12 w-12 text-election-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Candidate Registration</h3>
            <p className="text-gray-600">
              Apply as a candidate for upcoming elections and reach out to voters.
            </p>
          </div>
          
          <div className="p-6 border rounded-lg shadow-sm text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-election-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Instant Results</h3>
            <p className="text-gray-600">
              View election results immediately after an election concludes.
            </p>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="bg-gray-50">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Join our platform today and be part of the democratic process.
          </p>
          <div className="flex justify-center gap-4">
            <Button 
              size="lg" 
              className="bg-election-primary hover:bg-election-secondary"
              onClick={() => navigate("/register")}
            >
              Register Now
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate("/login")}
            >
              Login
            </Button>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 VoteSphere. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
