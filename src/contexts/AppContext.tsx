import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// Define types
export interface User {
  id: string;
  email: string;
  password?: string;
  name?: string | null;  // Made optional
  role?: "admin" | "voter" | "candidate";  // Made optional
}

export interface Election {
  id: string;
  title: string;
  description: string;
  status: "upcoming" | "active" | "completed";
  startDate: string;
  endDate: string;
  candidates: string[];
}

export interface Candidate {
  id: string;
  userId: string;
  name: string | null;
  electionId: string;
  position: string;
  votes: number;
}

export interface Vote {
  id: string;
  electionId: string;
  candidateId: string;
  voterId: string;
}

// Type for the context
interface AppContextType {
  users: User[];
  currentUser: User | null;
  elections: Election[];
  candidates: Candidate[];
  votes: Vote[];
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string, role: "voter" | "candidate") => Promise<boolean>;
  addElection: (title: string, description: string, startDate: string, endDate: string) => void;
  updateElectionStatus: (id: string, status: "upcoming" | "active" | "completed") => void;
  applyForElection: (userId: string, electionId: string, position: string) => boolean;
  castVote: (electionId: string, candidateId: string, voterId: string) => boolean;
  hasVoted: (electionId: string, voterId: string) => boolean;
  getElectionResults: (electionId: string) => Candidate[];
}

// Create context with default values
const AppContext = createContext<AppContextType>({
  users: [],
  currentUser: null,
  elections: [],
  candidates: [],
  votes: [],
  login: async () => false,
  logout: async () => {},
  register: async () => false,
  addElection: () => {},
  updateElectionStatus: () => {},
  applyForElection: () => false,
  castVote: () => false,
  hasVoted: () => false,
  getElectionResults: () => [],
});

// Admin user data
const adminUser: User = {
  id: "admin-1",
  email: "kumaransenthilarasu@gmail.com",
  password: "SK29@2006",
  name: "Admin",
  role: "admin",
};

// Context provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State management
  const [users, setUsers] = useState<User[]>([adminUser]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const [elections, setElections] = useState<Election[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);

  // Load data from localStorage on initial load
  useEffect(() => {
    const storedUsers = localStorage.getItem("users");
    const storedElections = localStorage.getItem("elections");
    const storedCandidates = localStorage.getItem("candidates");
    const storedVotes = localStorage.getItem("votes");
    const storedCurrentUser = localStorage.getItem("currentUser");

    if (storedUsers) {
      const parsedUsers = JSON.parse(storedUsers);
      // Ensure admin user is always included
      if (!parsedUsers.some((user: User) => user.id === "admin-1")) {
        parsedUsers.push(adminUser);
      }
      setUsers(parsedUsers);
    } else {
      // Initialize with admin user
      setUsers([adminUser]);
    }

    if (storedElections) setElections(JSON.parse(storedElections));
    if (storedCandidates) setCandidates(JSON.parse(storedCandidates));
    if (storedVotes) setVotes(JSON.parse(storedVotes));
    if (storedCurrentUser) setCurrentUser(JSON.parse(storedCurrentUser));
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem("elections", JSON.stringify(elections));
  }, [elections]);

  useEffect(() => {
    localStorage.setItem("candidates", JSON.stringify(candidates));
  }, [candidates]);

  useEffect(() => {
    localStorage.setItem("votes", JSON.stringify(votes));
  }, [votes]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("currentUser");
    }
  }, [currentUser]);

 // Update the auth state listener
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      if (session?.user) {
        const supabaseUser = session.user;
        // Map Supabase user to your User type
        const user: User = {
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          name: supabaseUser.user_metadata?.name || null,
          role: supabaseUser.user_metadata?.role || 'voter'
        };
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    }
  );

  // Check for existing session
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user) {
      const supabaseUser = session.user;
      const user: User = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: supabaseUser.user_metadata?.name || null,
        role: supabaseUser.user_metadata?.role || 'voter'
      };
      setCurrentUser(user);
    }
  });

  return () => subscription.unsubscribe();
}, []);

const login = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    if (data.user) {
      const user: User = {
        id: data.user.id,
        email: data.user.email || '',
        name: data.user.user_metadata?.name || null,
        role: data.user.user_metadata?.role || 'voter'
      };
      setCurrentUser(user);
    }

    toast.success('Login successful');
    return true;
  } catch (error: any) {
    toast.error(error.message);
    return false;
  }
};
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setCurrentUser(null);
      navigate('/login');
      toast.success('Logged out successfully');
    } catch (error: any) {
      toast.error(error.message);
    }
  };
const register = async (email: string, password: string, name: string, role: "voter" | "candidate") => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role
        }
      }
    });

    if (error) throw error;

    // Add to local users array
    if (data.user) {
      const newUser: User = {
        id: data.user.id,
        email,
        name,
        role
      };
      setUsers(prev => [...prev, newUser]);
    }

    toast.success('Registration successful. Please check your email for verification.');
    return true;
  } catch (error: any) {
    toast.error(error.message);
    return false;
  }
};

  // Election management functions
  const addElection = (title: string, description: string, startDate: string, endDate: string) => {
    const newElection: Election = {
      id: `election-${Date.now()}`,
      title,
      description,
      status: "upcoming",
      startDate,
      endDate,
      candidates: [],
    };

    setElections((prevElections) => [...prevElections, newElection]);
    toast.success("Election created successfully");
  };

  const updateElectionStatus = (id: string, status: "upcoming" | "active" | "completed") => {
    setElections((prevElections) =>
      prevElections.map((election) =>
        election.id === id ? { ...election, status } : election
      )
    );
    
    toast.success(`Election status updated to ${status}`);
  };

  // Candidate functions
  const applyForElection = (userId: string, electionId: string, position: string): boolean => {
    const user = users.find((u) => u.id === userId);
    const election = elections.find((e) => e.id === electionId);
    
    if (!user || !election) {
      toast.error("Invalid user or election");
      return false;
    }

    if (candidates.some((c) => c.userId === userId && c.electionId === electionId)) {
      toast.error("You have already applied for this election");
      return false;
    }

    const newCandidate: Candidate = {
      id: `candidate-${Date.now()}`,
      userId,
      name: user.name,
      electionId,
      position,
      votes: 0,
    };

    setCandidates((prevCandidates) => [...prevCandidates, newCandidate]);
    
    // Update the election with the new candidate
    setElections((prevElections) =>
      prevElections.map((e) =>
        e.id === electionId
          ? { ...e, candidates: [...e.candidates, newCandidate.id] }
          : e
      )
    );
    
    toast.success("Applied for election successfully");
    return true;
  };

  // Voting functions
  const castVote = (electionId: string, candidateId: string, voterId: string): boolean => {
    // Check if user has already voted
    if (hasVoted(electionId, voterId)) {
      toast.error("You have already voted in this election");
      return false;
    }

    // Record the vote
    const newVote: Vote = {
      id: `vote-${Date.now()}`,
      electionId,
      candidateId,
      voterId,
    };

    setVotes((prevVotes) => [...prevVotes, newVote]);

    // Increment candidate's vote count
    setCandidates((prevCandidates) =>
      prevCandidates.map((c) =>
        c.id === candidateId ? { ...c, votes: c.votes + 1 } : c
      )
    );

    toast.success("Vote cast successfully");
    return true;
  };

  const hasVoted = (electionId: string, voterId: string): boolean => {
    return votes.some((v) => v.electionId === electionId && v.voterId === voterId);
  };

  // Results function
  const getElectionResults = (electionId: string): Candidate[] => {
    return candidates
      .filter((c) => c.electionId === electionId)
      .sort((a, b) => b.votes - a.votes);
  };

  // Provide the context value
  const contextValue: AppContextType = {
    users,
    currentUser,
    elections,
    candidates,
    votes,
    login,
    logout,
    register,
    addElection,
    updateElectionStatus,
    applyForElection,
    castVote,
    hasVoted,
    getElectionResults,
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

// Custom hook for using the context
export const useApp = () => useContext(AppContext);
